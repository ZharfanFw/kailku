// backend/routes/alat.js

/**
 * Mendefinisikan rute untuk modul Alat Pancing.
 * Fungsi ini akan diekspor dan didaftarkan di file utama (index.js).
 */
async function alatRoutes(fastify, options) {
  // ==================================================
  // 1. Endpoint: Ambil Seluruh Data (GET /)
  // Deskripsi: Mengambil semua daftar alat pancing dari database.
  // URL Akses: http://localhost:3000/alat_pancing/
  // ==================================================
  fastify.get("/", async (request, reply) => {
    let connection;
    try {
      // Mengambil koneksi aktif dari connection pool
      connection = await fastify.mysql.getConnection();

      // Eksekusi query SQL untuk mengambil seluruh baris data
      const [rows] = await connection.query("SELECT * FROM alat_pancing");

      // PENTING: Melepaskan koneksi kembali ke pool agar bisa digunakan request lain.
      // Jika tidak di-release, aplikasi bisa hang karena kehabisan koneksi.
      connection.release();

      // Mengirimkan hasil data (array) sebagai respons JSON
      return rows;
    } catch (err) {
      // Penanganan Error:
      // Pastikan koneksi dilepas jika terjadi error sebelum baris release() di atas
      if (connection) connection.release();

      // Mencatat log error di sisi server untuk debugging
      fastify.log.error(err);

      // Mengirim respons error generik ke klien (Status 500 - Internal Server Error)
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });

  // ==================================================
  // 2. Endpoint: Ambil Data Spesifik (GET /:id)
  // Deskripsi: Mengambil satu data alat pancing berdasarkan ID.
  // URL Akses: http://localhost:3000/alat_pancing/:id
  // ==================================================
  fastify.get("/:id", async (request, reply) => {
    // Mengambil parameter 'id' dari URL
    const id = request.params.id;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Eksekusi query dengan Prepared Statement (menggunakan tanda tanya '?').
      // Ini adalah praktik keamanan standar untuk mencegah SQL Injection.
      const [rows] = await connection.query(
        "SELECT * FROM alat_pancing WHERE id = ?",
        [id],
      );

      connection.release();

      // Validasi: Memeriksa apakah data ditemukan
      if (rows.length === 0) {
        // Jika array kosong, kirim status 404 (Not Found)
        return reply
          .status(404)
          .send({ message: "Alat pancing tidak ditemukan" });
      }

      // Jika data ditemukan, kembalikan objek pertama dari array (index 0)
      return rows[0];
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi kesalahan pada server" });
    }
  });
}

// Ekspor fungsi agar dapat digunakan oleh `fastify.register` di file utama
module.exports = alatRoutes;
