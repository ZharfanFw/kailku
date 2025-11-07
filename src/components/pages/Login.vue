<template>
  <!-- Login Card -->
  <main class="login-container">
    <div class="login-card">
      <h2>Login</h2>

      <!-- Input Email -->
      <div class="input-group">
        <input type="email" placeholder="Email" />
      </div>

      <!-- Input Password -->
      <div class="input-group">
        <input type="password" placeholder="Password" />
      </div>

      <!-- Lupa Password -->
      <div class="forgot">
        <a href="#">Forget Password?</a>
      </div>

      <!-- Tombol Login -->
      <button class="login-btn">Login</button>

      <!-- Atau Login dengan Google -->
      <p class="or">Or Sign Up</p>
      

      <!-- Dekorasi bulatan -->
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

/* ===== Navbar ===== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: #0d3be0;
}

.logo span {
  color: #000000;
}

.navbar nav {
  display: flex;
  align-items: center;
  gap: 15px;
}

.navbar a {
  text-decoration: none;
  color: #000;
  font-size: 14px;
}

.navbar span {
  color: #000000;
}

.daftar-btn {
  background-color: #000b67;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 15px;
  cursor: pointer;
  transition: 0.3s;
}

.daftar-btn:hover {
  background-color: #001080;
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
}

.login-card h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

/* ===== Input ===== */
.input-group {
  margin-bottom: 15px;
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
}

/* ===== Link Lupa Password ===== */
.forgot {
  text-align: right;
  margin-bottom: 15px;
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
}

.login-btn:hover {
  background-color: #001080;
}

/* ===== Teks Or dan Logo Google ===== */
.or {
  margin-top: 20px;
  font-size: 12px;
  color: #000;
}

.google-logo {
  width: 28px;
  margin-top: 10px;
  cursor: pointer;
}

/* ===== Dekorasi bulatan ===== */
.bubble {
  position: absolute;
  background-color: #b0ecff;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 0;
}

.bubble1 {
  width: 20px;
  height: 20px;
  top: 10px;
  left: 20px;
}

.bubble2 {
  width: 30px;
  height: 30px;
  bottom: 25px;
  left: 35px;
}

.bubble3 {
  width: 40px;
  height: 40px;
  bottom: 25px;
  right: 40px;
}

.bubble4 {
  width: 25px;
  height: 25px;
  top: 15px;
  right: 40px;
}

.bubble5 {
  width: 35px;
  height: 35px;
  bottom: 15px;
  right: 120px;
}
</style>
e
