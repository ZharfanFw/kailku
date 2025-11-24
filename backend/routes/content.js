// backend/routes/content.js

async function contentRoutes(fastify, options) {
  // GET /tips
  fastify.get("/tips", async (request, reply) => {
    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM tips ORDER BY id ASC LIMIT 6",
      );
      connection.release();
      return rows;
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send(err);
    }
  });

  // GET /lomba
  fastify.get("/lomba", async (request, reply) => {
    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      // Ambil lomba yang tanggalnya belum lewat
      const [rows] = await connection.query(
        "SELECT * FROM lomba WHERE tanggal_pelaksanaan > NOW() ORDER BY tanggal_pelaksanaan ASC LIMIT 3",
      );
      connection.release();
      return rows;
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send(err);
    }
  });
}

module.exports = contentRoutes;
