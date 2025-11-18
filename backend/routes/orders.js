// backend/routes/orders.js

/**
 * Mendefinisikan rute untuk modul Order (Pemesanan Alat Pancing).
 * Modul ini menangani pembuatan pesanan (beli/sewa) dan riwayat transaksi.
 */
async function orderRoutes(fastify, options) {
  // ==================================================
  // 1. Endpoint: Buat Pesanan Baru (Checkout)
  // Method: POST
  // URL Akses: http://localhost:3000/orders/
  // Deskripsi: Membuat record di tabel 'orders' dan 'order_details' dalam satu transaksi atomik.
  // ==================================================
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { items } = request.body; // Array barang: [{id: 1, tipe: 'beli', jumlah: 2}, ...]
      const user_id = request.user.id;

      // Validasi Input
      if (!items || items.length === 0) {
        return reply
          .status(400)
          .send({ message: "Daftar barang (items) tidak boleh kosong" });
      }

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        // MEMULAI TRANSAKSI DATABASE
        // Penting: Memastikan data konsisten. Jika insert detail gagal, order utama dibatalkan.
        await connection.beginTransaction();

        // 1. Insert ke tabel 'orders' (Header Struk)
        const [orderResults] = await connection.query(
          "INSERT INTO orders (user_id, status) VALUES (?, ?)",
          [user_id, "pending"],
        );

        const order_id = orderResults.insertId; // ID order yang baru dibuat

        // 2. Insert ke tabel 'order_details' (Isi Barang)
        for (const item of items) {
          await connection.query(
            "INSERT INTO order_details (order_id, alat_id, tipe, jumlah) VALUES (?, ?, ?, ?)",
            [order_id, item.id, item.tipe, item.jumlah],
          );
          // TODO: Di masa depan, tambahkan logika pengurangan stok di sini
        }

        // KOMIT TRANSAKSI
        // Simpan semua perubahan secara permanen jika tidak ada error
        await connection.commit();
        connection.release();

        return reply
          .status(201)
          .send({ message: "Order berhasil dibuat", order_id: order_id });
      } catch (err) {
        // ROLLBACK TRANSAKSI
        // Batalkan semua perubahan jika terjadi error di tengah jalan
        if (connection) {
          await connection.rollback();
          connection.release();
        }

        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );

  // ==================================================
  // 2. Endpoint: Riwayat Order Saya (List)
  // Method: GET
  // URL Akses: http://localhost:3000/orders/my
  // Deskripsi: Mengambil daftar ringkasan order milik user.
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
          "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
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
  // 3. Endpoint: Detail Order Spesifik
  // Method: GET
  // URL Akses: http://localhost:3000/orders/my/:id
  // Deskripsi: Mengambil rincian barang dari satu order tertentu.
  // ==================================================
  fastify.get(
    "/my/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;
      const order_id = request.params.id;

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        // Menggunakan JOIN untuk mendapatkan nama alat pancing
        // dan memastikan order tersebut benar-benar milik user yang login (AND o.user_id = ?)
        const [rows] = await connection.query(
          `SELECT
            ap.nama,
            od.tipe,
            od.jumlah,
            od.harga_saat_transaksi
           FROM order_details AS od
           JOIN alat_pancing AS ap ON od.alat_id = ap.id
           JOIN orders AS o ON od.order_id = o.id
           WHERE od.order_id = ? AND o.user_id = ?`,
          [order_id, user_id],
        );

        connection.release();

        if (rows.length === 0) {
          return reply.status(404).send({
            message: "Detail order tidak ditemukan atau bukan milik Anda",
          });
        }

        return rows;
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi kesalahan pada server" });
      }
    },
  );
}

module.exports = orderRoutes;
