<template>
  <main class="login-container">
    <div class="login-card">
      <h2>Login</h2>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="input-group">
        <input 
          type="email" 
          placeholder="Email" 
          v-model="email" 
        />
      </div>

      <div class="input-group">
        <input 
          type="password" 
          placeholder="Password" 
          v-model="password"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="forgot">
        <a href="#">Forget Password?</a>
      </div>

      <button 
        class="login-btn" 
        @click="handleLogin"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Loading...' : 'Login' }}
      </button>

      <p class="or">Or Sign Up</p>
      
      <div class="bubble bubble1"></div>
      <div class="bubble bubble2"></div>
      <div class="bubble bubble3"></div>
      <div class="bubble bubble4"></div>
      <div class="bubble bubble5"></div>
    </div>
  </main>
</template>

<script>
export default {
  name: "LoginPage",

  data() {
    return {
      email: "",
      password: "",
      errorMessage: null, // Menyimpan pesan error
      isLoading: false,   // Status loading tombol
    };
  },

  methods: {
    async handleLogin() {
      // Reset state
      this.isLoading = true;
      this.errorMessage = null;

      try {
        // 1. Kirim request ke Backend
        // Pastikan URL sesuai dengan prefix '/auth' yang sudah kita refactor
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();

        // 2. Cek jika gagal (status bukan 200-299)
        if (!response.ok) {
          throw new Error(data.message || "Gagal login");
        }

        // 3. Jika Sukses
        console.log("Login Berhasil:", data);

        // Simpan Token di LocalStorage
        localStorage.setItem("kailku_token", data.token);

        // Pindah ke halaman utama (atau halaman lain)
        this.$router.push("/");

      } catch (err) {
        console.error(err);
        this.errorMessage = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* ===== Reset dan font dasar ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

body {
  background-color: #f8f9fb;
}

/* ===== Error Message Style ===== */
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #ef9a9a;
}

/* ===== Kontainer Login ===== */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 85vh;
}

/* ===== Kartu Login ===== */
.login-card {
  position: relative;
  background: white;
  width: 340px;
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow: hidden; /* Agar bubble tidak keluar */
}

.login-card h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  position: relative;
  z-index: 2;
}

/* ===== Input ===== */
.input-group {
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #4ac8eb;
  color: white;
  font-weight: 600;
  outline: none;
}

.input-group input::placeholder {
  color: white;
  opacity: 0.8;
}

/* ===== Link Lupa Password ===== */
.forgot {
  text-align: right;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
}

.forgot a {
  font-size: 12px;
  color: #000;
  text-decoration: none;
  font-weight: 500;
}

/* ===== Tombol Login ===== */
.login-btn {
  width: 100%;
  background-color: #000b67;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  position: relative;
  z-index: 2;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #001080;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ===== Teks Or ===== */
.or {
  margin-top: 20px;
  font-size: 12px;
  color: #000;
  position: relative;
  z-index: 2;
}

/* ===== Dekorasi bulatan ===== */
.bubble {
  position: absolute;
  background-color: #b0ecff;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
}

.bubble1 { width: 20px; height: 20px; top: 10px; left: 20px; }
.bubble2 { width: 30px; height: 30px; bottom: 25px; left: 35px; }
.bubble3 { width: 40px; height: 40px; bottom: 25px; right: 40px; }
.bubble4 { width: 25px; height: 25px; top: 15px; right: 40px; }
.bubble5 { width: 35px; height: 35px; bottom: 15px; right: 120px; }
</style>
