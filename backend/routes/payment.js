// backend/routes/payment.js

async function paymentRoutes(fastify, options) {
  // 1. BUAT TAGIHAN (Status: Menunggu Verifikasi)
  fastify.post(
    "/create",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user_id = request.user.id;
      const { booking_ids, order_ids, payment_method, total_amount } =
        request.body;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        await connection.beginTransaction();

        // Mapping Method
        let dbMethod = "other";
        if (
          [
            "bca",
            "mandiri",
            "bri",
            "bni",
            "cimb",
            "permata",
            "seabank",
            "bsi",
            "other-bank",
          ].includes(payment_method)
        )
          dbMethod = `transfer_${payment_method}`;
        else if (payment_method === "qris") dbMethod = "qris";
        else if (payment_method === "cod") dbMethod = "cod";

        // A. Insert ke tabel payments (Status: MENUNGGU)
        const [res] = await connection.query(
          `INSERT INTO payments (user_id, metode_pembayaran, jumlah_bayar, status_pembayaran) 
           VALUES (?, ?, ?, 'menunggu_verifikasi')`,
          [user_id, dbMethod, total_amount],
        );
        const paymentId = res.insertId;

        // B. Link Payment ID ke Booking & Order (Status TETAP PENDING)
        if (booking_ids?.length) {
          await connection.query(
            `UPDATE bookings SET payment_id = ? WHERE id IN (?)`,
            [paymentId, booking_ids],
          );
        }
        if (order_ids?.length) {
          await connection.query(
            `UPDATE orders SET payment_id = ? WHERE id IN (?)`,
            [paymentId, order_ids],
          );
        }

        await connection.commit();
        connection.release();

        return reply.send({ payment_id: paymentId });
      } catch (err) {
        if (connection) await connection.rollback();
        reply.status(500).send(err);
      }
    },
  );

  // 2. GET DETAIL PEMBAYARAN
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paymentId = request.params.id;
      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        const [rows] = await connection.query(
          "SELECT * FROM payments WHERE id = ?",
          [paymentId],
        );
        connection.release();
        if (rows.length === 0)
          return reply.status(404).send({ message: "Not found" });
        return rows[0];
      } catch (err) {
        reply.status(500).send(err);
      }
    },
  );

  // 3. KONFIRMASI BAYAR (Action: Set Lunas)
  fastify.post(
    "/:id/pay",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paymentId = request.params.id;
      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        await connection.beginTransaction();

        // A. Update Payment jadi BERHASIL
        await connection.query(
          "UPDATE payments SET status_pembayaran = 'berhasil' WHERE id = ?",
          [paymentId],
        );

        // B. Update Bookings jadi PAID
        await connection.query(
          "UPDATE bookings SET status = 'paid' WHERE payment_id = ?",
          [paymentId],
        );

        // C. Update Orders jadi PAID
        await connection.query(
          "UPDATE orders SET status = 'paid' WHERE payment_id = ?",
          [paymentId],
        );

        await connection.commit();
        connection.release();
        return reply.send({ message: "Lunas" });
      } catch (err) {
        if (connection) await connection.rollback();
        reply.status(500).send(err);
      }
    },
  );
}

module.exports = paymentRoutes;
