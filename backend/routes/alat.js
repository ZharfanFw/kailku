// backend/routes/alat.js

async function alatRoutes(fastify, options) {
  // GET ALL (Dengan Filter tempat_id)
  fastify.get("/", async (request, reply) => {
    const { tempat_id } = request.query;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      let sql = "SELECT * FROM tempat_alat";
      let params = [];

      // LOGIKA AMAN: Cek jika tempat_id ada isinya
      if (tempat_id) {
        // Paksa jadi string dulu biar method .split() tidak error
        const idString = String(tempat_id);

        // Pecah string "1,6" jadi array angka [1, 6]
        const ids = idString
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id)); // Hapus yang bukan angka

        if (ids.length > 0) {
          // Buat placeholder (?, ?) sesuai jumlah ID
          const placeholders = ids.map(() => "?").join(", ");

          sql += ` WHERE tempat_id IN (${placeholders})`;
          params = ids;
        }
      }

      // Eksekusi Query
      const [rows] = await connection.query(sql, params);
      connection.release();
      return rows;
    } catch (err) {
      // Jika error, lepaskan koneksi & kirim status 500 biar Frontend tidak menunggu
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });

  // GET BY ID (Tetap sama)
  fastify.get("/:id", async (request, reply) => {
    const id = request.params.id;
    let connection;
    try {
      connection = await fastify.mysql.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM tempat_alat WHERE id = ?",
        [id]
      );
      connection.release();

      if (rows.length === 0)
        return reply.status(404).send({ message: "Alat tidak ditemukan" });
      return rows[0];
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send({ message: "Server Error" });
    }
  });
}

module.exports = alatRoutes;
