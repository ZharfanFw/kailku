async function paymentRoutes(fastify, options) {
  fastify.post(
    "/confirm",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;

      const { booking_ids, order_ids } = request.body;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        await connection.beginTransaction();

        if (booking_ids && booking_ids.length > 0) {
          await connection.query(
            `UPDATE bookings SET status = 'paid' WHERE user_id = ? AND id IN (?)`,
            [user_id, booking_ids],
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
