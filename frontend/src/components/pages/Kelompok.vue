<template>
  <div class="kelompok-page">
    <div class="kelompok-card">
      <h1 class="title">Informasi Kelompok</h1>
      <div class="info-item">
        <span class="label">Kelompok: 8</span>
        <span class="value">KailKu</span>
      </div>
      <div class="info-item">
        <span class="label">Anggota :</span>
        <span class="value">Muhammad Maulana Adrian - 2408647</span>
        <span class="value">Muhammad Fittra Novria Rizky - 2411481</span>
        <span class="value">Zufar Ahmad Maulidy - 2400285</span>
        <span class="value">Zharfan Faza Wibawa - 2403995</span>
      </div>

      <button @click="router.push('/')">Kembali</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped>
.kelompok-page {
  font-family: "Poppins", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.kelompok-card {
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border-top: 5px solid #0d1a4d; /* Aksen biru tua */
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0d1a4d;
  margin-bottom: 2rem;
}

.info-item {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.label {
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}

.value {
  display: block;
  font-weight: 600;
  font-size: 1.25rem;
  color: #023e8a; /* Biru */
}

.note {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
}
</style>
