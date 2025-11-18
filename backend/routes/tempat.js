// backend/routes/tempat.js

/**
 * Mendefinisikan rute untuk modul Tempat Pemancingan (Venues).
 * Modul ini menangani pengambilan data lokasi pemancingan (Katalog).
 */
async function tempatRoutes(fastify, options) {
  // ==================================================
  // 1. Endpoint: Ambil Seluruh Tempat Mancing
  // Method: GET
  // URL Akses: http://localhost:3000/tempat_mancing/
  // Deskripsi: Mengambil daftar semua tempat pemancingan yang tersedia.
  // ==================================================
  fastify.get("/", async (request, reply) => {
    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Eksekusi query untuk mengambil semua data
      const [rows, fields] = await connection.query(
        "SELECT * FROM tempat_mancing",
      );

      connection.release();

      // Mengembalikan array data ke frontend
      return rows;
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });

  // ==================================================
  // 2. Endpoint: Ambil Detail Tempat Spesifik
  // Method: GET
  // URL Akses: http://localhost:3000/tempat_mancing/:id
  // Deskripsi: Mengambil detail satu tempat pemancingan berdasarkan ID.
  // ==================================================
  fastify.get("/:id", async (request, reply) => {
    const id = request.params.id;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Query dengan parameter ID (aman dari SQL Injection)
      const [rows, fields] = await connection.query(
        "SELECT * FROM tempat_mancing WHERE id = ?",
        [id],
      );

      connection.release();

      // Validasi: Jika data tidak ditemukan
      if (rows.length === 0) {
        return reply
          .status(404)
          .send({ message: "Tempat mancing tidak ditemukan" });
      }

      // Mengembalikan objek data pertama
      return rows[0];
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });
}

module.exports = tempatRoutes;
