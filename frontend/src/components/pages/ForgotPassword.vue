<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Lupa Password?</h2>
      <p>Masukkan emailmu, kami akan kirim link reset.</p>

      <div class="form-group">
        <input v-model="email" type="email" placeholder="Email Kamu" class="form-input" />
      </div>

      <button @click="handleRequest" class="btn-submit">Kirim Link</button>
    </div>
  </div>
</template>

<script>
export default {
  data() { return { email: '' } },
  methods: {
    async handleRequest() {
      try {
        const res = await fetch('http://localhost:3000/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("Cek console backend kamu untuk lihat token (Simulasi Email)!");
        console.log("Token Debug:", data.debug_token);
      } catch (err) {
        alert(err.message);
      }
    }
  }
}
</script>
<style scoped>
/* Copy style container/card/input/button dari Login.vue biar konsisten */
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
  margin: 20px 0;
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
}
</style>
