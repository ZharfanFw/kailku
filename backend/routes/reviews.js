// backend/routes/reviews.js

async function reviewRoutes(fastify, options) {
  // 1. GET: Ambil Review per Tempat
  // URL: /reviews?tempat_id=1
  fastify.get("/", async (request, reply) => {
    const { tempat_id } = request.query;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      // Join dengan tabel users biar kelihatan siapa yang komen
      const [rows] = await connection.query(
        `SELECT r.*, u.username, u.full_name, u.avatar_url 
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.tempat_id = ?
         ORDER BY r.created_at DESC`,
        [tempat_id],
      );
      connection.release();
      return rows;
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send(err);
    }
  });

  // 2. POST: Kirim Review Baru (Butuh Login)
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { tempat_id, rating, komentar } = request.body;
      const user_id = request.user.id;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();
        const [result] = await connection.query(
          "INSERT INTO reviews (user_id, tempat_id, rating, komentar) VALUES (?, ?, ?, ?)",
          [user_id, tempat_id, rating, komentar],
        );
        connection.release();
        return reply.status(201).send({ message: "Review berhasil dikirim" });
      } catch (err) {
        if (connection) connection.release();
        reply.status(500).send(err);
      }
    },
  );
}

module.exports = reviewRoutes;
