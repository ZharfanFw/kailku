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

        if (payment_method === "qris") {
          dbMethod = "qris";
        } else if (payment_method && payment_method.includes("cod")) {
          dbMethod = "cod"; // Handle 'cod-jne' jadi 'cod'
        } else {
          // Asumsi sisanya transfer
          // Cek apakah stringnya valid di database enum kalau mau strict,
          // tapi untuk aman kita mapping manual yang umum:
          if (["bca", "mandiri", "bri"].includes(payment_method)) {
            dbMethod = `transfer_${payment_method}`;
          } else {
            // Bank lain (seabank, bsi, dll) masuk ke 'other' atau paksa format jika DB support
            // Karena di SQL Dump enumnya terbatas, kita masukkan ke 'other'
            // ATAU ubah kolom di DB jadi VARCHAR biar fleksibel.
            // Sesuai SQL Dump kamu: enum('transfer_bca','transfer_mandiri','transfer_bri','qris','cod','other')
            dbMethod = "other";
          }
        }

        // INSERT
        const [res] = await connection.query(
          `INSERT INTO payments (user_id, metode_pembayaran, jumlah_bayar, status_pembayaran) 
         VALUES (?, ?, ?, 'menunggu_verifikasi')`,
          [user_id, dbMethod, total_amount]
        );
        const paymentId = res.insertId;

        // UPDATE BOOKING & ORDER
        if (booking_ids && booking_ids.length > 0) {
          await connection.query(
            "UPDATE bookings SET payment_id = ? WHERE id IN (?)",
            [paymentId, booking_ids]
          );
        }
        if (order_ids && order_ids.length > 0) {
          await connection.query(
            "UPDATE orders SET payment_id = ? WHERE id IN (?)",
            [paymentId, order_ids]
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
    }
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
          [paymentId]
        );
        connection.release();
        if (rows.length === 0)
          return reply.status(404).send({ message: "Not found" });
        return rows[0];
      } catch (err) {
        reply.status(500).send(err);
      }
    }
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
          [paymentId]
        );
        await connection.query(
          "UPDATE bookings SET status = 'paid' WHERE payment_id = ?",
          [paymentId]
        );
        await connection.query(
          "UPDATE orders SET status = 'paid' WHERE payment_id = ?",
          [paymentId]
        );

        await connection.commit();
        connection.release();
        return reply.send({ message: "Pembayaran Berhasil" });
      } catch (err) {
        if (connection) await connection.rollback();
        reply.status(500).send(err);
      }
    }
  );
}

module.exports = paymentRoutes;
