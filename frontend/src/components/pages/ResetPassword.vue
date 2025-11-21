<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Password Baru</h2>

      <div class="form-group">
        <input v-model="newPassword" type="password" placeholder="Password Baru" class="form-input" />
      </div>
      <div class="form-group">
        <input v-model="confirmPassword" type="password" placeholder="Ulangi Password" class="form-input" />
      </div>

      <button @click="handleReset" class="btn-submit">Ubah Password</button>
    </div>
  </div>
</template>

<script>
export default {
  data() { return { newPassword: '', confirmPassword: '' } },
  methods: {
    async handleReset() {
      if (this.newPassword !== this.confirmPassword) return alert("Password tidak sama");

      // Ambil token dari URL (?token=...)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) return alert("Token tidak valid/hilang");

      try {
        const res = await fetch('http://localhost:3000/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: this.newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("Berhasil! Silakan login.");
        this.$router.push('/login');
      } catch (err) {
        alert(err.message);
      }
    }
  }
}
</script>
<style scoped>
/* Copy style sama kayak di atas */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f9ff;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #023e8a;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
}
</style>
