<template>
  <div class="dev-nav-page">
    <h1>Halaman Navigasi (Dev)</h1>
    <p>Gunakan link di bawah untuk pindah halaman:</p>
    <div class="nav-grid">
      <router-link to="/kelompok" class="nav-button">0. Nama dan Nomor Kelompok</router-link>
      <router-link to="/home" class="nav-button">1. Home Page</router-link>
      <router-link to="/signup" class="nav-button">2. Sign Up</router-link>
      <router-link to="/login" class="nav-button">3. Login</router-link>
      <router-link to="/memancing-section" class="nav-button">4. Memancing Section</router-link>
      <router-link to="/review" class="nav-button">5. Review Section</router-link>
      <router-link to="/booking" class="nav-button">6. Booking Section</router-link>
      <router-link to="/cart" class="nav-button">7. Cart</router-link>
      <router-link to="/payment" class="nav-button">8. Payment</router-link>
      <router-link to="/method-payment" class="nav-button">9. Method Payment</router-link>
      <router-link to="/profil" class="nav-button">10. Profile</router-link>
    </div>
  </div>
</template>

<style scoped>
.dev-nav-page {
  font-family: Arial, sans-serif;
  padding: 40px;
  max-width: 800px;
  margin: 40px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
h1 {
  text-align: center;
  color: #333;
  border-bottom: 2px solid #0d1a4d;
  padding-bottom: 10px;
}
p {
  text-align: center;
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
}
.nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.nav-button {
  display: block;
  padding: 15px 20px;
  background-color: #0d1a4d;
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 5px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.2s;
}
.nav-button:hover {
  background-color: #1a2f8b;
  transform: translateY(-2px);
}
@media (max-width: 600px) {
  .nav-grid {
    grid-template-columns: 1fr; }
}
</style>
