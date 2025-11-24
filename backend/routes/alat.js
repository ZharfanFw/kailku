// backend/routes/alat.js

async function alatRoutes(fastify, options) {
  // GET ALL
  fastify.get("/", async (request, reply) => {
    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      // PERBAIKAN: Nama tabel disesuaikan dengan database (tempat_alat)
      const [rows] = await connection.query("SELECT * FROM tempat_alat");
      connection.release();
      return rows;
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });

  // GET BY ID
  fastify.get("/:id", async (request, reply) => {
    const id = request.params.id;
    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      // PERBAIKAN: Nama tabel disesuaikan dengan database (tempat_alat)
      const [rows] = await connection.query(
        "SELECT * FROM tempat_alat WHERE id = ?",
        [id]
      );
      connection.release();

      if (rows.length === 0) {
        return reply.status(404).send({ message: "Alat pancing tidak ditemukan" });
      }
      return rows[0];
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });
}

module.exports = alatRoutes;