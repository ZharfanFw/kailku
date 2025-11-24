// backend/routes/bookings.js

/**
 * Mendefinisikan rute untuk modul Booking (Pemesanan Tempat).
 */
async function bookingRoutes(fastify, options) {
  // --- Helper: Hitung Jam Selesai ---
  function calculateEndTime(startTime, duration) {
    if (!startTime || !duration) return "00:00:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + Number(duration);
    return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // ==================================================
  // 1. Endpoint: Buat Booking Baru (LENGKAP DENGAN JAM)
  // ==================================================
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      // Ambil semua data dari Frontend
      const { tempat_id, tanggal_booking, no_kursi, start_time, duration } =
        request.body;
      const user_id = request.user.id;

      // Validasi Kelengkapan Data
      if (
        !tempat_id ||
        !tanggal_booking ||
        !no_kursi ||
        !start_time ||
        !duration
      ) {
        return reply
          .status(400)
          .send({ message: "Data booking tidak lengkap (Jam/Durasi/Kursi)" });
      }

      // Hitung jam selesai otomatis
      const end_time = calculateEndTime(start_time, duration);

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        const [tempatRows] = await connection.query(
          "SELECT harga_per_jam FROM tempat_mancing WHERE id = ?",
          [tempat_id],
        );

        if (tempatRows.length === 0) {
          connection.release();
          return reply.status(404).send({ message: "Tempat tidak ditemukan" });
        }

        const hargaPerJam = Number(tempatRows[0].harga_per_jam);
        const totalHarga = hargaPerJam * duration;

        // Cek Bentrok Terakhir (Safety Net - Biar ga tabrakan pas submit barengan)
        const [existing] = await connection.query(
          `SELECT id FROM bookings 
             WHERE tempat_id = ? AND no_kursi = ? AND tanggal_booking = ?
             AND (start_time < ? AND end_time > ?)`,
          [tempat_id, no_kursi, tanggal_booking, end_time, start_time],
        );

        if (existing.length > 0) {
          connection.release();
          return reply.status(409).send({
            message: `Kursi ${no_kursi} sudah terisi di jam tersebut.`,
          });
        }

        // INSERT LENGKAP (Dengan start_time & end_time)
        const [result] = await connection.query(
          "INSERT INTO bookings (user_id, tempat_id, no_kursi, tanggal_booking, start_time, end_time, total_harga, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
          [
            user_id,
            tempat_id,
            no_kursi,
            tanggal_booking,
            start_time,
            end_time,
            totalHarga,
          ],
        );

        connection.release();

        return reply.status(201).send({
          id: result.insertId,
        });
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Gagal menyimpan booking" });
      }
    },
  );

  // ==================================================
  // 2. Endpoint: Riwayat Booking Saya
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
        const [rows] = await connection.query(
          `SELECT
            b.*,
            t.nama AS nama_tempat,
            t.lokasi AS lokasi_tempat
           FROM bookings AS b
           JOIN tempat_mancing AS t ON b.tempat_id = t.id
           WHERE b.user_id = ? 
           ORDER BY b.id DESC`, // Urutkan dari yang terbaru
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
        const [results] = await connection.query(
          "DELETE FROM bookings WHERE id = ? AND user_id = ?",
          [booking_id, user_id],
        );
        connection.release();

        if (results.affectedRows === 0) {
          return reply.status(404).send({
            message: "Booking tidak ditemukan atau Anda tidak memiliki izin",
          });
        }
        return reply.status(204).send();
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );

  // ==================================================
  // 4. Endpoint: Cek Kursi Sibuk (Global Filter)
  // ==================================================
  fastify.get("/check-seats", async (request, reply) => {
    // Frontend kirim 'tanggal' (bukan tanggal_booking), kita mapping di query SQL
    const { tempat_id, tanggal, start, durasi } = request.query;

    if (!tempat_id || !tanggal) return { bookedSeats: [] };

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Base Query
      let query =
        "SELECT no_kursi FROM bookings WHERE tempat_id = ? AND tanggal_booking = ?";
      const params = [tempat_id, tanggal]; // Pakai 'tanggal' dari query string

      // Filter bentrok jam (jika parameter jam dikirim)
      if (start && durasi) {
        const [h, m] = start.split(":").map(Number);
        const endH = h + Number(durasi);
        const reqStart = start;
        const reqEnd = calculateEndTime(start, durasi);

        // Logika: (StartDB < RequestEnd) AND (EndDB > RequestStart)
        query += " AND (start_time < ? AND end_time > ?)";
        params.push(reqEnd, reqStart);
      }

      const [rows] = await connection.query(query, params);
      connection.release();

      return { bookedSeats: rows.map((r) => r.no_kursi) };
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send(err);
    }
  });

  // ==================================================
  // 5. Endpoint: Ambil Jadwal Spesifik (Smart Dropdown)
  // ==================================================
  fastify.get("/schedule", async (request, reply) => {
    const { tempat_id, no_kursi, tanggal } = request.query;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Ambil jam mulai & selesai dari kursi yang sedang dicek
      const [rows] = await connection.query(
        "SELECT start_time, end_time FROM bookings WHERE tempat_id = ? AND no_kursi = ? AND tanggal_booking = ?",
        [tempat_id, no_kursi, tanggal],
      );

      connection.release();

      // Balikin array jadwal: [{start_time: '10:00', end_time: '12:00'}, ...]
      return rows;
    } catch (err) {
      if (connection) connection.release();
      reply.status(500).send(err);
    }
  });
}

module.exports = bookingRoutes;
