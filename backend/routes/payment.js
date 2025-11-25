// backend/routes/payment.js

async function paymentRoutes(fastify, options) {
  // 1. CREATE PAYMENT
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

        // --- PERBAIKAN MAPPING ---
        // Frontend kirim: 'bca', 'mandiri', 'cod-jne', 'qris', dll.
        // Database ENUM: 'transfer_bca', 'qris', 'cod', 'other'

        let dbMethod = "other";

        const transferMethods = [
          "bca",
          "mandiri",
          "bri",
          "bni",
          "cimb",
          "permata",
          "seabank",
          "bsi",
          "other-bank",
        ];

        if (payment_method === "qris") {
          dbMethod = "qris";
        } else if (payment_method === "cod") {
          dbMethod = "cod";
        } else {
          // Selain QRIS dan COD, kita anggap semuanya adalah TRANSFER
          // Contoh: 'seabank' jadi 'transfer_seabank'
          dbMethod = `transfer_${payment_method}`;
        }

        // INSERT
        const [res] = await connection.query(
          `INSERT INTO payments (user_id, metode_pembayaran, jumlah_bayar, status_pembayaran) 
         VALUES (?, ?, ?, 'menunggu_verifikasi')`,
          [user_id, dbMethod, total_amount],
        );
        const paymentId = res.insertId;

        // UPDATE BOOKING & ORDER
        if (booking_ids && booking_ids.length > 0) {
          await connection.query(
            "UPDATE bookings SET payment_id = ? WHERE id IN (?)",
            [paymentId, booking_ids],
          );
        }
        if (order_ids && order_ids.length > 0) {
          await connection.query(
            "UPDATE orders SET payment_id = ? WHERE id IN (?)",
            [paymentId, order_ids],
          );
        }

        await connection.commit();
        connection.release();

        return reply.send({ payment_id: paymentId });
      } catch (err) {
        if (connection) {
          await connection.rollback();
          connection.release();
        }
        reply.status(500).send(err);
      }
    },
  );

  // 2. GET DETAIL
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

  // 3. PAY (Simulasi Bayar Berhasil)
  fastify.post(
    "/:id/pay",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paymentId = request.params.id;
      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        await connection.beginTransaction();

        await connection.query(
          "UPDATE payments SET status_pembayaran = 'berhasil' WHERE id = ?",
          [paymentId],
        );
        await connection.query(
          "UPDATE bookings SET status = 'paid' WHERE payment_id = ?",
          [paymentId],
        );
        await connection.query(
          "UPDATE orders SET status = 'paid' WHERE payment_id = ?",
          [paymentId],
        );

        await connection.commit();
        connection.release();
        return reply.send({ message: "Pembayaran Berhasil" });
      } catch (err) {
        if (connection) await connection.rollback();
        reply.status(500).send(err);
      }
    },
  );
}

module.exports = paymentRoutes;
