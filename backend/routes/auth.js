// backend/routes/auth.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { asyncWrapProviders } = require("async_hooks");
const { connected } = require("process");
const { log } = require("console");
const { registerHooks } = require("module");

/**
 * Mendefinisikan rute untuk modul Autentikasi dan Profil Pengguna.
 * Modul ini menangani registrasi, login, dan manajemen profil.
 */
async function authRoutes(fastify, options) {
  // ==================================================
  // Decorator: Authenticate
  // Deskripsi: Middleware global untuk memverifikasi token JWT pada header request.
  // Fungsi ini dapat digunakan di rute manapun dengan opsi 'preHandler'.
  // ==================================================
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      // Mengembalikan status 401 (Unauthorized) jika token tidak valid atau tidak ada
      reply.status(401).send(err);
    }
  });

  // ==================================================
  // 1. Endpoint: Registrasi Pengguna Baru (Sign Up)
  // Method: POST
  // URL Akses: http://localhost:3000/auth/signup
  // ==================================================
  fastify.post("/signup", async (request, reply) => {
    const { username, first_name, last_name, email, password } = request.body;

    // Validasi Input: Pastikan semua field wajib diisi
    if (!first_name || !last_name || !email || !password) {
      return reply.status(400).send({
        message: "Nama depan, nama belakang, email, dan password wajib diisi",
      });
    }

    let connection;
    try {
      // Hashing Password: Mengamankan password menggunakan algoritma bcrypt
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      connection = await fastify.mysql.getConnection();

      // Eksekusi Query Insert: Menyimpan data pengguna baru ke database
      const [result] = await connection.query(
        "INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
        [username, first_name, last_name, email, password_hash]
      );

      connection.release();

      // Mengembalikan respons sukses dengan ID pengguna baru (tanpa password)
      return reply.status(201).send({
        id: result.insertId,
        username: username,
        first_name: first_name,
        last_name: last_name,
        email: email,
      });
    } catch (err) {
      // Penanganan Error Database
      if (connection) connection.release();

      // Menangani kasus duplikasi data (username atau email sudah ada)
      if (err.code === "ER_DUP_ENTRY") {
        return reply
          .status(409)
          .send({ message: "Username atau email sudah terdaftar" });
      }

      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi error pada server" });
    }
  });

  // ==================================================
  // 2. Endpoint: Login Pengguna
  // Method: POST
  // URL Akses: http://localhost:3000/auth/login
  // ==================================================
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply
        .status(400)
        .send({ message: "Email dan password wajib diisi" });
    }

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      // Mencari pengguna berdasarkan email
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      connection.release();

      // Jika email tidak ditemukan
      if (rows.length === 0) {
        return reply.status(401).send({ message: "Email atau Password salah" });
      }

      const user = rows[0];

      // Verifikasi Password: Membandingkan password input dengan hash di database
      const passwordCocok = await bcrypt.compare(password, user.password_hash);

      if (!passwordCocok) {
        return reply.status(401).send({ message: "Email atau Password salah" });
      }

      // Pembuatan Token JWT: Membuat token akses yang berlaku selama 1 jam
      const token = fastify.jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        { expiresIn: "1h" }
      );

      // Mengirimkan token ke klien
      return reply.send({ token: token });
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Terjadi error pada server" });
    }
  });

  // ==================================================
  // 3. Endpoint: Ambil Data Profil (Terproteksi)
  // Method: GET
  // URL Akses: http://localhost:3000/auth/profile
  // Syarat: Memerlukan Header Authorization: Bearer <token>
  // ==================================================
  fastify.get(
    "/profile",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      let connection;
      try {
        // 1. Ambil ID user dari Token JWT (request.user)
        const userId = request.user.id;

        connection = await fastify.mysql.getConnection();

        // 2. Query ke database untuk ambil data lengkap berdasarkan ID
        const [rows] = await connection.query(
          "SELECT id, username, first_name, last_name, email, phone, address, avatar_url FROM users WHERE id = ?",
          [userId]
        );

        connection.release();

        // 3. Jika user tidak ditemukan di DB (kasus langka tapi mungkin terjadi jika user dihapus)
        if (rows.length === 0) {
          return reply.status(404).send({ message: "User tidak ditemukan" });
        }

        // 4. Kembalikan data baris pertama dari database
        return rows[0];
      } catch (err) {
        if (connection) connection.release();
        fastify.log.error(err);
        return reply.status(500).send({ message: "Gagal mengambil profil" });
      }
    }
  );

  // ==================================================
  // 4. Endpoint: Update Data Profil (Terproteksi)
  // Method: PATCH
  // URL Akses: http://localhost:3000/auth/my-profile
  // ==================================================
  fastify.patch(
    "/my-profile",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user_id = request.user.id;
      const {
        username,
        first_name,
        last_name,
        email,
        full_name,
        phone,
        address,
      } = request.body;

      // Validasi: Minimal ada satu data yang ingin diubah
      if (
        !username &&
        !first_name &&
        !last_name &&
        !email &&
        !full_name &&
        !phone &&
        !address
      ) {
        return reply
          .status(400)
          .send({ message: "Minimal kirim satu data (username atau email)" });
      }

      // Membangun query UPDATE secara dinamis
      let query = "UPDATE users SET ";
      const fieldsToUpdate = [];
      const values = [];
      if (username) {
        fieldsToUpdate.push("username = ?");
        values.push(username);
      }
      if (first_name) {
        fieldsToUpdate.push("first_name = ?");
        values.push(first_name);
      }
      if (last_name) {
        fieldsToUpdate.push("last_name = ?");
        values.push(last_name);
      }
      if (email) {
        fieldsToUpdate.push("email = ?");
        values.push(email);
      }
      if (full_name) {
        fieldsToUpdate.push("full_name = ?");
        values.push(full_name);
      }
      if (phone) {
        fieldsToUpdate.push("phone = ?");
        values.push(phone);
      }
      if (address) {
        fieldsToUpdate.push("address = ?");
        values.push(address);
      }

      query += fieldsToUpdate.join(", ");
      query += " WHERE id = ?";
      values.push(user_id);

      let connection;
      try {
        connection = await fastify.mysql.getConnection();

        const [result] = await connection.query(query, values);
        connection.release();

        // Jika tidak ada baris yang terupdate (user id tidak ditemukan)
        if (result.affectedRows === 0) {
          return reply.status(400).send({ message: "User tidak ditemukan" });
        }

        return reply.send({ message: "Profil berhasil diupdate" });
      } catch (err) {
        if (connection) connection.release();

        // Menangani error jika username/email baru ternyata sudah dipakai orang lain
        if (err.code === "ER_DUP_ENTRY") {
          return reply
            .status(409)
            .send({ message: "Username atau email baru sudah terdaftar" });
        }
        fastify.log.error(err);
        reply.status(500).send({ message: "Terjadi error pada server" });
      }
    }
  );

  fastify.post("/forgot-password", async (request, reply) => {
    const { email } = request.body;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      const [rows] = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        connection.release();
        return reply.status(404).send({ message: "Email tidak terdaftar" });
      }

      const token = crypto.randomBytes(20).toString("hex");

      const expireDate = new Date(Date.now() + 3600000);

      await connection.query(
        "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
        [token, expireDate, email]
      );

      connection.release();

      console.log(
        `Link Reset: http://localhost:5173/reset-password?token=${token}`
      );
      return reply.send({
        message:
          "Link reset password telah dikirim ke email (Cek Console Backend!)",
        debug_token: token,
      });
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Gagal memproses permintaan" });
    }
  });

  fastify.post("/reset-password", async (request, reply) => {
    const { token, newPassword } = request.body;

    let connection;
    try {
      connection = await fastify.mysql.getConnection();

      const [rows] = await connection.query(
        "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
        [token]
      );

      if (rows.length === 0) {
        connection.release();
        return reply
          .status(404)
          .send({ message: "Token tidak valid atau sudah kadaluarsa" });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await connection.query(
        "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
        [password_hash, rows[0].id]
      );

      connection.release();

      return reply.send({
        message: "Password berhasil diubah! Silahkan login.",
      });
    } catch (err) {
      if (connection) connection.release();
      fastify.log.error(err);
      reply.status(500).send({ message: "Gagal mereset password" });
    }
  });
}

module.exports = authRoutes;
