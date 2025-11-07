<template>
  <div class="review-page-container">
    <!-- HEADER GAMBAR -->
    <header class="place-header">
      <img :src="place.image" :alt="place.name" class="header-image" />
      <div class="header-overlay">
        <h1 class="title">{{ place.name }}</h1>
      </div>
    </header>

    <!-- KONTEN UTAMA (DESKRIPSI & REVIEW) -->
    <main class="content-layout">
      <!-- KOLOM KIRI: DESKRIPSI & BOOKING -->
      <div class="details-column">
        <div class="details-card">
          <h2>Deskripsi Tempat</h2>
          <p>
            {{ place.description }}
          </p>
          <button class="btn blue" @click="router.push('/booking')">Booking Sekarang</button>
        </div>

        <div class="details-card">
          <h2>Lokasi</h2>
          <p>
            📍 Jalan Elang Perkasa No. 45, Jakarta Selatan
          </p>
          <div class="map-placeholder">
            <p>Peta akan ditampilkan di sini</p>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: DAFTAR REVIEW -->
      <div class="reviews-column">
        <h2>Ulasan Pengguna ({{ reviews.length }})</h2>

        <!-- Card untuk setiap review -->
        <div class="review-card" v-for="review in reviews" :key="review.id">
          <div class="review-header">
            <span class="reviewer-name">{{ review.name }}</span>
            <div class="stars">
              <!-- Render bintang FONT AWESOME (konsisten dengan Home) -->
              <font-awesome-icon
                v-for="n in review.rating"
                :key="'filled-' + n"
                icon="fa-solid fa-star"
              />
              <font-awesome-icon
                v-for="n in 5 - review.rating"
                :key="'empty-' + n"
                icon="fa-regular fa-star"
              />
            </div>
          </div>
          <p class="comment-text">"{{ review.comment }}"</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

// Memisahkan data dari template agar lebih rapi
const place = ref({
  name: "Alaska Fishing",
  // Ganti path gambar sesuai struktur Anda. Asumsi masih sama.
  image: new URL("../../assets/img/tempat-pemancingan/tempat1.avif", import.meta.url).href,
  description:
    "Alaska Fishing adalah pengalaman memancing di perairan Alaska yang terkenal dengan pemandangan alam liar, sungai yang jernih, dan berbagai jenis ikan seperti salmon serta halibut. Cocok untuk pemancing pemula maupun profesional.",
});

const reviews = ref([
  { id: 1, name: "Dodi", rating: 5, comment: "Spotnya indah banget!" },
  { id: 2, name: "Andi", rating: 5, comment: "Ikannya besar dan segar!" },
  { id: 3, name: "Budi", rating: 4, comment: "Cukup menantang, tapi seru. Bawa jaket tebal!" },
]);

// Anda mungkin perlu import icon Font Awesome jika belum global
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
// import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'
</script>

<style scoped>
/* --- FONT & GLOBAL --- */
.review-page-container {
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
}

/* --- HEADER GAMBAR BARU --- */
.place-header {
  position: relative;
  width: 100%;
  height: 40vh; /* 40% tinggi layar */
  background-color: #333; /* Fallback */
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2));
  display: flex;
  align-items: flex-end;
  padding: 2rem 5%;
}

.title {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* --- LAYOUT KONTEN UTAMA --- */
.content-layout {
  display: grid;
  grid-template-columns: 1fr; /* 1 kolom di mobile */
  gap: 24px;
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
}

/* Layout 2 kolom di desktop */
@media (min-width: 992px) {
  .content-layout {
    grid-template-columns: 2fr 1fr; /* Kolom kiri lebih besar */
  }
}

/* --- KOLOM KIRI (DESKRIPSI) --- */
.details-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.details-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #023e8a; /* Biru tua (dari tema) */
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ade8f4; /* Aksen biru muda */
}

.details-card p {
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
}

.map-placeholder {
  background-color: #e9ecef;
  border-radius: 8px;
  text-align: center;
  padding: 3rem 1rem;
  margin-top: 16px;
  color: #6c757d;
  font-style: italic;
  border: 1px dashed #ced4da;
}

/* --- KOLOM KANAN (REVIEW) --- */
.reviews-column {
  text-align: left;
}

.reviews-column h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #023e8a;
  margin-bottom: 16px;
}

.review-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  border-left: 5px solid #0077b6; /* Aksen biru (dari tema) */
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.stars {
  color: #f8b400; /* Warna kuning/gold untuk bintang */
  font-size: 0.9rem;
}

.comment-text {
  font-size: 1rem;
  color: #555;
  font-style: italic;
  line-height: 1.6;
}

/* --- TOMBOL --- */
.btn {
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%; /* Lebar penuh di dalam card */
  margin-top: 24px;
}

.btn.blue {
  background-color: #0d1a4d; /* Biru navy (dari tema) */
  color: white;
}

.btn:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}
</style>
