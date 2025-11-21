<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-card">
        <div class="card-header">
          <h2 class="signup-title">Buat Akun Baru</h2>
          <p class="signup-subtitle">
            Bergabunglah dengan komunitas pemancing terbesar. <br />
            Sudah punya akun?
            <span class="link-login" @click="$router.push('/login')"
              >Masuk di sini</span
            >
          </p>
        </div>

        <div class="form-wrapper">
          <div class="form-row">
            <div class="form-group">
              <label>Nama Depan</label>
              <input
                v-model="formData.firstName"
                type="text"
                placeholder="Contoh: Budi"
                :class="['form-input', { 'input-error': errors.firstName }]"
                @input="clearError('firstName')"
              />
              <span v-if="errors.firstName" class="error-text">{{
                errors.firstName
              }}</span>
            </div>

            <div class="form-group">
              <label>Nama Belakang</label>
              <input
                v-model="formData.lastName"
                type="text"
                placeholder="Contoh: Santoso"
                :class="['form-input', { 'input-error': errors.lastName }]"
                @input="clearError('lastName')"
              />
              <span v-if="errors.lastName" class="error-text">{{
                errors.lastName
              }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Alamat Email</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="nama@email.com"
              :class="['form-input', { 'input-error': errors.email }]"
              @input="clearError('email')"
            />
            <span v-if="errors.email" class="error-text">{{
              errors.email
            }}</span>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-password-wrapper">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimal 6 karakter"
                :class="['form-input', { 'input-error': errors.password }]"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="showPassword = !showPassword"
              >
                <font-awesome-icon
                  :icon="
                    showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
                  "
                />
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{
              errors.password
            }}</span>
          </div>

          <div class="form-group">
            <label>Konfirmasi Password</label>
            <div class="input-password-wrapper">
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Ulangi password"
                :class="[
                  'form-input',
                  { 'input-error': errors.confirmPassword },
                ]"
                @input="clearError('confirmPassword')"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <font-awesome-icon
                  :icon="
                    showConfirmPassword
                      ? 'fa-solid fa-eye-slash'
                      : 'fa-solid fa-eye'
                  "
                />
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-text">{{
              errors.confirmPassword
            }}</span>
          </div>

          <button
            @click="handleSubmit"
            class="btn-submit"
            :disabled="isLoading"
          >
            {{ isLoading ? "Memproses..." : "Daftar Sekarang" }}
          </button>
        </div>

        <div class="card-footer">
          <p>
            Dengan mendaftar, Anda menyetujui
            <a href="#">Syarat & Ketentuan</a> kami.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Pastikan FontAwesome sudah diinstall/diimport di main.js
// Jika belum, ganti icon dengan SVG atau emoji sementara.

export default {
  name: "SignUp",
  data() {
    return {
      isLoading: false, // Untuk efek loading tombol
      formData: {
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      showPassword: false,
      showConfirmPassword: false,
      errors: {},
    };
  },
  methods: {
    clearError(field) {
      if (this.errors[field]) {
        this.errors = { ...this.errors, [field]: "" };
      }
    },
    validateForm() {
      const newErrors = {};

      if (!this.formData.firstName.trim())
        newErrors.firstName = "Nama depan wajib diisi";
      if (!this.formData.lastName.trim())
        newErrors.lastName = "Nama belakang wajib diisi";

      if (!this.formData.email.trim()) {
        newErrors.email = "Email wajib diisi";
      } else if (!/\S+@\S+\.\S+/.test(this.formData.email)) {
        newErrors.email = "Format email tidak valid";
      }

      if (!this.formData.password) {
        newErrors.password = "Password wajib diisi";
      } else if (this.formData.password.length < 8) {
        newErrors.password = "Password minimal 8 karakter";
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak sama";
      }

      return newErrors;
    },
    async handleSubmit() {
      const newErrors = this.validateForm();

      if (Object.keys(newErrors).length === 0) {
        this.isLoading = true;

        try {
          const generatedUsername =
            `${this.formData.firstName}_${this.formData.lastName}`
              .toLowerCase()
              .replace(/\s+/g, "");
          const payload = {
            username: generatedUsername,
            first_name: this.formData.firstName,
            last_name: this.formData.lastName,
            email: this.formData.email,
            password: this.formData.password,
          };

          const response = await fetch("http://localhost:3000/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Gagal mendaftar");
          }

          alert("Registrasi Berhasil! Silahkan login.");

          this.$router.push("/login");
        } catch (err) {
          console.error(err);

          alert(err.message);
        } finally {
          this.isLoading = false;
        }
      } else {
        this.errors = newErrors;
      }
    },
  },
};
</script>

<style scoped>
/* --- Layout Utama --- */
.signup-page {
  min-height: 100vh;
  /* Background Gradient Biru Laut yang Tenang */
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Poppins", sans-serif;
}

.signup-container {
  width: 100%;
  max-width: 520px;
  /* Lebar card ideal */
}

/* --- Card Style --- */
.signup-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(2, 62, 138, 0.08);
  /* Shadow biru tipis */
  border: 1px solid #f1f5f9;
}

/* --- Header Section --- */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-title {
  font-size: 2rem;
  font-weight: 800;
  color: #023e8a;
  /* Warna Primary Brand */
  margin-bottom: 8px;
}

.signup-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
}

.link-login {
  color: #0077b6;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.link-login:hover {
  color: #023e8a;
}

/* --- Form Elements --- */
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.form-input::placeholder {
  color: #94a3b8;
}

/* Error State */
.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.input-error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: 500;
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
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #0077b6;
}

/* --- Button --- */
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

/* --- Footer --- */
.card-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
}

.card-footer a {
  color: #0077b6;
  text-decoration: none;
}

.card-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .signup-card {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    /* Stack vertikal di HP */
  }

  .signup-title {
    font-size: 1.75rem;
  }
}
</style>
