// backend/index.js

// 1. LOAD ENVIRONMENT VARIABLES
// Memuat variabel rahasia dari file .env ke dalam process.env
// Ini wajib ditaruh paling atas agar konfigurasi terbaca sebelum kode lain jalan.
require("dotenv").config();

// 2. INISIALISASI FRAMEWORK
// Membuat instance aplikasi Fastify dengan logger aktif untuk melihat log request/response di terminal.
const fastify = require("fastify")({ logger: true });
const jwt = require("@fastify/jwt");

// ==================================================
// 3. REGISTER PLUGIN (ALAT-ALAT UTAMA)
// ==================================================

// A. CORS (Cross-Origin Resource Sharing)
// Mengizinkan Frontend (Vue.js) yang berjalan di port berbeda (misal 5173)
// untuk mengakses Backend ini (port 3000). Tanpa ini, browser akan memblokir akses.
fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// B. DATABASE (MySQL)
// Mengatur koneksi ke database menggunakan kredensial dari file .env.
// 'promise: true' memungkinkan kita menggunakan async/await saat query database.
fastify.register(require("@fastify/mysql"), {
  promise: true,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// C. JWT (JSON Web Token)
// Mengatur kunci rahasia untuk menandatangani dan memverifikasi token login.
fastify.register(jwt, { secret: process.env.JWT_SECRET });

// ==================================================
// 4. DECORATOR (MIDDLEWARE GLOBAL)
// ==================================================

// Menambahkan fungsi 'authenticate' ke instance Fastify.
// Fungsi ini bertindak sebagai "Satpam" yang bisa dipanggil di rute manapun
// untuk memastikan pengguna memiliki token yang valid sebelum mengakses endpoint.
fastify.decorate("authenticate", async function(request, reply) {
  try {
    // Memverifikasi token yang dikirim di header Authorization
    await request.jwtVerify();
  } catch (err) {
    // Jika token tidak valid atau kadaluarsa, kirim error ke user
    reply.send(err);
  }
});

// ==================================================
// 5. REGISTER ROUTES (DAFTAR DEPARTEMEN)
// ==================================================
// Mendaftarkan file-file rute modular dari folder 'routes'.
// Setiap file menangani fitur spesifik dengan awalan URL (prefix) masing-masing.

// Menangani Login, Register, Profile -> URL: /auth/...
fastify.register(require("./routes/auth"), { prefix: "/auth" });

// Menangani Data Tempat Mancing -> URL: /tempat_mancing/...
fastify.register(require("./routes/tempat"), { prefix: "/tempat_mancing" });

// Menangani Data Alat Pancing -> URL: /alat_pancing/...
fastify.register(require("./routes/alat"), { prefix: "/alat_pancing" });

// Menangani Transaksi Booking -> URL: /bookings/...
fastify.register(require("./routes/bookings"), { prefix: "/bookings" });

// Menangani Transaksi Order Alat -> URL: /orders/...
fastify.register(require("./routes/orders"), { prefix: "/orders" });

// Menangani Review Tempat -> URL: /reviews/...
fastify.register(require("./routes/reviews"), { prefix: "/reviews" });

// Menangani Confirmation Payment -> URL: /payment/...
fastify.register(require("./routes/payment"), { prefix: "/payment" });

fastify.register(require("./routes/content"), { prefix: "/content" });

// ==================================================
// 6. JALANKAN SERVER
// ==================================================
const start = async () => {
  try {
    // Menjalankan server di port 3000 (atau sesuai setting hosting nanti)
    await fastify.listen({ port: 3000 });
    console.log("Server backend berjalan di http://localhost:3000");
  } catch (err) {
    // Jika server gagal start, catat errornya dan hentikan proses
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
