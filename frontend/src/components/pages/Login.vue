<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h2 class="login-title">Selamat Datang Kembali</h2>
          <p class="login-subtitle">
            Masuk untuk mulai petualangan mancingmu. <br>
            Belum punya akun? <span class="link-signup" @click="$router.push('/signup')">Daftar di sini</span>
          </p>
        </div>

        <div class="form-wrapper">
          <div v-if="errorMessage" class="error-alert">
            <span>{{ errorMessage }}</span>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="nama@email.com" class="form-input"
              @keyup.enter="handleLogin" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-password-wrapper">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan password"
                class="form-input" @keyup.enter="handleLogin" />
              <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
              </button>
            </div>
            <div class="forgot-password">
              <span @click="$router.push('/forgot-password')" style="cursor:pointer;">
                <a href="#">Lupa Password?</a>
              </span>
            </div>
          </div>

          <button class="btn-submit" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? 'Memproses...' : 'Masuk' }}
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      errorMessage: null,
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = null;

      // Validasi Frontend Sederhana
      if (!this.email || !this.password) {
        this.errorMessage = "Email dan Password wajib diisi";
        this.isLoading = false;
        return;
      }

      try {
        // Telepon Backend
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email atau password salah");
        }

        // console.log("Login Berhasil:", data);

        // Simpan Tiket (Token)
        localStorage.setItem("kailku_token", data.token);

        // Pindah ke Home
        this.$router.push("/");

      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* --- Layout Utama --- */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Poppins', sans-serif;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

/* --- Card Style --- */
.login-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(2, 62, 138, 0.08);
  border: 1px solid #f1f5f9;
}

/* --- Header --- */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #023e8a;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.link-signup {
  color: #0077b6;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.link-signup:hover {
  color: #023e8a;
}

/* --- Form Elements --- */
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #0077b6;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.1);
}

/* Error Alert */
.error-alert {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #fee2e2;
}

/* Password Toggle */
.input-password-wrapper {
  position: relative;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
}

.toggle-btn:hover {
  color: #0077b6;
}

.forgot-password {
  text-align: right;
  margin-top: 8px;
}

.forgot-password a {
  font-size: 0.8rem;
  color: #64748b;
  text-decoration: none;
}

.forgot-password a:hover {
  color: #0077b6;
}

/* Buttons */
.btn-submit {
  margin-top: 10px;
  width: 100%;
  padding: 14px;
  background-color: #023e8a;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(2, 62, 138, 0.15);
}

.btn-submit:hover {
  background-color: #00509d;
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(2, 62, 138, 0.25);
}

.btn-submit:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    padding: 24px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
