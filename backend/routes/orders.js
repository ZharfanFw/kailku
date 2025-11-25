// backend/routes/alat.js

/**
 * Modul Routes untuk Alat Pancing.
 * Mengambil data dari tabel 'tempat_alat' (Stok alat per lokasi).
 */
async function alatRoutes(fastify, options) {
  // ==================================================
  // 1. Endpoint: Ambil Daftar Alat
  // Method: GET
  // URL: /alat_pancing
  // Opsional: /alat_pancing?tempat_id=1,2 (Filter berdasarkan lokasi)
  // ==================================================
  fastify.get("/", async (request, reply) => {
    // Mengambil parameter query 'tempat_id' dari URL
    const { tempat_id } = request.query;

    let connection;
    try {
      // Membuka koneksi ke database
      connection = await fastify.mysql.getConnection();

      // Query dasar (ambil semua data)
      let sql = "SELECT * FROM tempat_alat";
      let params = [];

      // LOGIKA FILTER: Jika ada parameter 'tempat_id'
      if (tempat_id) {
        // Konversi ke string untuk keamanan parsing
        const idString = String(tempat_id);

        // Proses string "1, 6, a" menjadi array angka bersih [1, 6]
        const ids = idString
          .split(",") // Pisahkan berdasarkan koma
          .map((id) => parseInt(id.trim())) // Ubah jadi integer dan hapus spasi
          .filter((id) => !isNaN(id)); // Hapus yang bukan angka (NaN)

        // Jika ada ID yang valid setelah disaring
        if (ids.length > 0) {
          // Buat placeholder tanya (?) sejumlah ID. Contoh: "?, ?"
          const placeholders = ids.map(() => "?").join(", ");

          // Tambahkan klausa WHERE ke query SQL
          // Menjadi: SELECT * FROM tempat_alat WHERE tempat_id IN (?, ?)
          sql += ` WHERE tempat_id IN (${placeholders})`;

          // Simpan nilai ID ke dalam array params untuk disisipkan aman
          params = ids;
        }
      }

      // Jalankan query ke database dengan parameter yang sudah disiapkan
      const [rows] = await connection.query(sql, params);

      // PENTING: Kembalikan koneksi ke pool agar tidak macet
      connection.release();

      // Kirim hasil data ke frontend
      return rows;
    } catch (err) {
      // Jika error, pastikan koneksi dilepas dulu
      if (connection) connection.release();

      // Catat error di terminal backend
      fastify.log.error(err);

      // Kirim pesan error ke frontend
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });

  // ==================================================
  // 2. Endpoint: Ambil Detail Satu Alat
  // Method: GET
  // URL: /alat_pancing/:id (Contoh: /alat_pancing/5)
  // ==================================================
  fastify.get("/:id", async (request, reply) => {
    // Ambil ID dari parameter URL
    const id = request.params.id;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Cari alat spesifik berdasarkan ID
      const [rows] = await connection.query(
        "SELECT * FROM tempat_alat WHERE id = ?",
        [id],
      );

      connection.release();

      // Jika array kosong, berarti ID tidak ada
      if (rows.length === 0)
        return reply.status(404).send({ message: "Alat tidak ditemukan" });

      // Kembalikan data pertama (karena ID pasti unik)
      return rows[0];
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send({ message: "Server Error" });
    }
  });
}

module.exports = alatRoutes;
