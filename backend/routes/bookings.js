// backend/routes/bookings.js

/**
 * Mendefinisikan rute untuk modul Booking (Pemesanan Tempat).
 * Modul ini menangani pembuatan, pengambilan riwayat, dan pembatalan booking.
 */
async function bookingRoutes(fastify, options) {
  // ==================================================
  // 1. Endpoint: Buat Booking Baru
  // Method: POST
  // URL Akses: http://localhost:3000/bookings/
  // Syarat: Memerlukan Token JWT
  // ==================================================
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate], // Middleware: Cek Token
    },
    async (request, reply) => {
      const { tempat_id, tanggal_booking } = request.body;
      const user_id = request.user.id; // Ambil ID dari token

      // Validasi Input
      if (!tempat_id || !tanggal_booking) {
        return reply
          .status(400)
          .send({ message: "Tempat dan tanggal wajib diisi " });
      }

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        // Eksekusi Query Insert
        const [result] = await connection.query(
          "INSERT INTO bookings (user_id, tempat_id, tanggal_booking) VALUES (?, ?, ?)",
          [user_id, tempat_id, tanggal_booking],
        );

        connection.release();

        // Mengembalikan data booking yang baru dibuat beserta ID-nya
        return reply.status(201).send({
          id: result.insertId,
          user_id: user_id,
          tempat_id: tempat_id,
          tanggal_booking: tanggal_booking,
        });
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );

  // ==================================================
  // 2. Endpoint: Riwayat Booking Saya
  // Method: GET
  // URL Akses: http://localhost:3000/bookings/my
  // Deskripsi: Mengambil daftar booking milik user yang sedang login.
  // ==================================================
  fastify.get(
    "/my",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        // Menggunakan JOIN untuk menggabungkan tabel 'bookings' dan 'tempat_mancing'.
        // Tujuannya agar frontend mendapatkan Nama Tempat & Lokasi, bukan cuma ID-nya.
        const [rows] = await connection.query(
          `SELECT
            b.*,
            t.nama AS nama_tempat,
            t.lokasi AS lokasi_tempat
           FROM bookings AS b
           JOIN tempat_mancing AS t ON b.tempat_id = t.id
           WHERE b.user_id = ?`,
          [user_id],
        );

        connection.release();

        return rows;
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );

  // ==================================================
  // 3. Endpoint: Batalkan Booking
  // Method: DELETE
  // URL Akses: http://localhost:3000/bookings/my/:id
  // Deskripsi: Menghapus booking spesifik, hanya jika milik user tersebut.
  // ==================================================
  fastify.delete(
    "/my/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;
      const booking_id = request.params.id;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        // Menghapus data dengan validasi ganda:
        // 1. ID Booking harus sesuai (id = ?)
        // 2. Pemilik harus user yang login (user_id = ?)
        const [results] = await connection.query(
          "DELETE FROM bookings WHERE id = ? AND user_id = ?",
          [booking_id, user_id],
        );

        connection.release();

        // Jika affectedRows 0, berarti data tidak ditemukan atau bukan milik user
        if (results.affectedRows === 0) {
          return reply.status(404).send({
            message: "Booking tidak ditemukan atau Anda tidak memiliki izin",
          });
        }

        // Status 204 (No Content) menandakan penghapusan berhasil
        return reply.status(204).send();
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );
}

module.exports = bookingRoutes;
