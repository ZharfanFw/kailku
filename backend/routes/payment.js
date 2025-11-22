// backend/routes/payment.js

async function paymentRoutes(fastify, options) {
  fastify.post(
    "/confirm",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;
      const { booking_ids, order_ids } = request.body; // Ambil kedua ID

      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        await connection.beginTransaction();

        // 1. UPDATE BOOKINGS (Ini sudah ada)
        if (booking_ids && booking_ids.length > 0) {
          await connection.query(
            `UPDATE bookings SET status = 'paid' WHERE user_id = ? AND id IN (?)`,
            [user_id, booking_ids],
          );
        }

        // 2. UPDATE ORDERS (INI YANG HILANG!) -> TAMBAHKAN INI
        if (order_ids && order_ids.length > 0) {
          await connection.query(
            `UPDATE orders SET status = 'paid' WHERE user_id = ? AND id IN (?)`,
            [user_id, order_ids],
          );
        }

        await connection.commit();
        connection.release();

        return reply.send({ message: "Pembayaran Berhasil" });
      } catch (err) {
        if (connection) {
          await connection.rollback();
          connection.release();
        }
        fastify.log.error(err);
        reply.status(500).send({ message: "Gagal memproses pembayaran" });
      }
    },
  );
}

module.exports = paymentRoutes;
