<template>
  <div class="page-wrapper">

    <section id="home" class="hero-section">
      <div class="hero-overlay"></div>

      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Temukan Spot Mancing <br> <span class="highlight">Terbaikmu</span></h1>
          <p class="hero-subtitle">Jelajahi ribuan kolam dan spot mancing di seluruh Indonesia</p>

          <div class="search-wrapper">
            <div class="search-box">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="search-icon" />
              <input type="text" placeholder="Cari nama tempat atau kota..." class="search-field" v-model="searchQuery"
                @focus="showOverlay = true" @blur="handleBlur" />

              <transition name="fade">
                <div v-if="showOverlay && filteredList.length > 0" class="search-dropdown">
                  <div v-for="item in filteredList.slice(0, 4)" :key="item.id" class="dropdown-item"
                    @mousedown="goToDetail(item.id)">
                    <img :src="item.image" class="thumb">
                    <div class="item-info">
                      <strong>{{ item.nama }}</strong>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="container">
        <div class="section-header">
          <h2>Tempat Populer</h2>
          <p>Spot pilihan terbaru yang wajib kamu coba</p>
        </div>

        <div v-if="isLoading" class="loading-text">Memuat tempat...</div>

        <div v-else class="grid-3">
          <div v-for="place in tempatList.slice(0, 3)" :key="place.id" class="card" @click="goToDetail(place.id)">
            <div class="card-img-wrap">
              <img :src="place.image" :alt="place.nama">
              <span class="badge">{{ place.kota }}</span>
            </div>
            <div class="card-body">
              <h3>{{ place.nama }}</h3>
              <div class="rating">
                <font-awesome-icon icon="fa-solid fa-star" style="color: #ffb703;" />
                {{ place.rating }} / 5.0
              </div>
              <p class="location">
                <font-awesome-icon icon="fa-solid fa-location-dot" /> {{ place.lokasi }}
              </p>
            </div>
          </div>
        </div>

        <div class="center-btn">
          <button class="btn-main" @click="router.push('/memancing-section')">Lihat Semua Tempat</button>
        </div>
      </div>
    </section>

    <section class="section-container bg-tips">
      <div class="container">
        <div class="section-header">
          <h2>Tips & Trik Jitu</h2>
          <p>Tingkatkan skill memancingmu dengan panduan ahli</p>
        </div>

        <Carousel :items-to-show="carouselItemsToShow" :wrap-around="true" :autoplay="3000">
          <Slide v-for="(tip, i) in tipsList" :key="i">
            <div class="tip-card-carousel">
              <div class="tip-img-box">
                <span class="tip-emoji">{{ tip.icon }}</span>
              </div>
              <div class="tip-content">
                <h3>{{ tip.title }}</h3>
                <p>{{ tip.desc }}</p>
              </div>
            </div>
          </Slide>

          <template #addons>
            <Navigation />
            <Pagination />
          </template>
        </Carousel>
      </div>
    </section>

    <section class="section-container">
      <div class="container">
        <div class="section-header">
          <h2>Turnamen Mendatang</h2>
          <p>Kompetisi bergengsi dengan hadiah fantastis</p>
        </div>

        <div class="lomba-grid">
          <div class="lomba-card-pro">
            <div class="lomba-header">
              <img src="../../assets/img/tempat-pemancingan/lomba1.avif" alt="Lomba">
              <span class="lomba-badge nasional">NASIONAL</span>
            </div>
            <div class="lomba-body">
              <h3>Fishing Challenge Pangandaran 2025</h3>
              <p class="desc">
                Kompetisi mancing laut lepas pantai terbesar tahun ini. Target ikan Marlin dan Tuna.
              </p>

              <div class="lomba-details-grid">
                <div class="detail-box">
                  <span class="label">📅 Tanggal</span>
                  <strong>14 Juli 2025</strong>
                </div>
                <div class="detail-box">
                  <span class="label">📍 Lokasi</span>
                  <strong>Pantai Pangandaran</strong>
                </div>
                <div class="detail-box">
                  <span class="label">💰 Pendaftaran</span>
                  <strong>Rp 150.000</strong>
                </div>
                <div class="detail-box highlight">
                  <span class="label">🏆 Hadiah Utama</span>
                  <strong>Rp 10.000.000</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="lomba-card-pro">
            <div class="lomba-header">
              <img src="../../assets/img/tempat-pemancingan/lomba2.avif" alt="Lomba">
              <span class="lomba-badge regional">REGIONAL</span>
            </div>
            <div class="lomba-body">
              <h3>Jakarta Galatama Masters 2025</h3>
              <p class="desc">
                Adu strategi dan kesabaran di kolam Galatama Ikan Mas. Sistem poin terberat.
              </p>

              <div class="lomba-details-grid">
                <div class="detail-box">
                  <span class="label">📅 Tanggal</span>
                  <strong>21 Agustus 2025</strong>
                </div>
                <div class="detail-box">
                  <span class="label">📍 Lokasi</span>
                  <strong>Jakarta Selatan</strong>
                </div>
                <div class="detail-box">
                  <span class="label">💰 Pendaftaran</span>
                  <strong>Rp 200.000</strong>
                </div>
                <div class="detail-box highlight">
                  <span class="label">🏆 Hadiah Utama</span>
                  <strong>Rp 20.000.000</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from "vue-router";
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const router = useRouter();
const showOverlay = ref(false);
const isLoading = ref(true);
const searchQuery = ref("");
const tempatList = ref([]);

// =========================
// FIXED RESPONSIVE CAROUSEL
// =========================
const screenWidth = ref(window.innerWidth);

const updateWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWidth);
  fetchTempatMancing();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth);
});

// Jumlah slide berdasarkan width live
const carouselItemsToShow = computed(() => {
  if (screenWidth.value < 768) return 1;
  if (screenWidth.value < 1024) return 2;
  return 3;
});

// Data Tips
const tipsList = ref([
  { title: 'Umpan Jitu Lele', desc: 'Gunakan cacing tanah atau usus ayam yang sudah diperam selama 2 hari.', icon: '🪱' },
  { title: 'Teknik Casting', desc: 'Lempar umpan sejauh mungkin dan tarik perlahan.', icon: '🎣' },
  { title: 'Waktu Terbaik', desc: 'Paling aktif makan saat pagi & sore.', icon: '⏰' },
  { title: 'Merawat Reel', desc: 'Bilas dengan air tawar setelah digunakan.', icon: '⚙️' },
  { title: 'Simpul Pancing', desc: 'Gunakan simpul Palomar untuk kekuatan maksimal.', icon: '🪢' },
]);

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

async function fetchTempatMancing() {
  try {
    const response = await fetch('http://localhost:3000/tempat_mancing');
    const data = await response.json();
    tempatList.value = data.map(item => ({
      id: item.id,
      nama: item.nama,
      lokasi: item.lokasi,
      kota: capitalizeWords(item.kota || 'Indonesia'),
      rating: 4.5,
      image: item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'
    }));
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

const filteredList = computed(() => {
  if (!searchQuery.value) return tempatList.value;
  return tempatList.value.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.kota.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const goToDetail = (id) => router.push({ name: 'ReviewSection', params: { id } });

const handleBlur = () => {
  setTimeout(() => (showOverlay.value = false), 200);
};
</script>

<style scoped>
/* --- GLOBAL --- */
.page-wrapper {
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-container {
  padding: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.2rem;
  color: #023e8a;
  font-weight: 800;
  margin-bottom: 10px;
}

.section-header p {
  color: #666;
  font-size: 1.1rem;
}

/* --- HERO SECTION --- */
.hero-section {
  height: 90vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  background-image: url('../../assets/img/search-section-bg.svg');
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #023e8a;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  text-shadow: 3px 3px 0px #fff, 0 0 25px rgba(255, 255, 255, 0.9);
}

.hero-title .highlight {
  color: #0077b6;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #333;
  font-weight: 700;
  margin-bottom: 3rem;
  text-shadow: 1px 1px 0px #fff;
  background: rgba(255, 255, 255, 0.7);
  display: inline-block;
  padding: 8px 20px;
  border-radius: 30px;
}

.search-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 15px 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid transparent;
  transition: 0.3s;
}

.search-box:focus-within {
  transform: scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(2, 62, 138, 0.1);
}

.search-icon {
  font-size: 1.2rem;
  color: #023e8a;
  margin-right: 15px;
}

.search-field {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: #333;
}

/* Suggestion Dropdown */
.search-dropdown {
  position: absolute;
  top: 115%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  text-align: left;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: 0.2s;
}

.dropdown-item:hover {
  background: #f0f9ff;
}

.dropdown-item .thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-right: 15px;
  object-fit: cover;
}

/* --- TEMPAT POPULER --- */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
  border: 1px solid #eee;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-img-wrap {
  position: relative;
  height: 220px;
}

.card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #023e8a;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 24px;
}

.card-body h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 1.3rem;
}

.rating {
  color: #ffb703;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 0.9rem;
}

.location {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.center-btn {
  text-align: center;
  margin-top: 40px;
}

.btn-main {
  background: #023e8a;
  color: white;
  padding: 14px 35px;
  border-radius: 30px;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn-main:hover {
  background: #00509d;
  transform: translateY(-3px);
}

/* --- TIPS & TRICK CAROUSEL --- */
/* ===========================
   TIPS & TRICK CAROUSEL — FIX
   =========================== */
.bg-tips {
  background: #eef7ff;
}

/* Wajib: bungkus slide biar tidak ngaco */
:deep(.carousel__slide) {
  display: flex;
  justify-content: center;
}

/* ===========================
   DESKTOP VERSION (asli)
   =========================== */

.tip-card-carousel {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  transition: 0.3s;
  text-align: center;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.tip-img-box {
  width: 80px;
  height: 80px;
  background: #e0f2fe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.tip-emoji {
  font-size: 2.5rem;
}

.tip-content h3 {
  font-size: 1.3rem;
}

.tip-content p {
  font-size: 0.95rem;
}

/* Pagination spacing desktop */
:deep(.carousel) {
  padding-bottom: 40px;
}

:deep(.carousel__pagination) {
  margin-top: 40px;
}





/* ===========================
   MOBILE VERSION (fix penuh)
   =========================== */
@media (max-width: 768px) {

  /* slide center */
  :deep(.carousel__slide) {
    display: flex;
    justify-content: center;
  }

  /* Card mobile */
  .tip-card-carousel {
    padding: 22px !important;
    margin: 10px;
    width: 100%;
    max-width: 240px;
    /* ⬅️ supaya tidak melebar */
    min-height: 240px;
    height: auto !important;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
    border-radius: 20px;
  }

  .tip-img-box {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .tip-emoji {
    font-size: 2rem;
  }

  .tip-content h3 {
    font-size: 1.1rem;
  }

  .tip-content p {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* Pagination mobile */
  :deep(.carousel) {
    padding-bottom: 20px !important;
  }

  :deep(.carousel__pagination) {
    margin-top: 15px !important;
  }

  /* Dot style mobile */
  :deep(.carousel__pagination-button::after) {
    width: 7px;
    height: 7px;
  }

  :deep(.carousel__pagination-button--active::after) {
    transform: scale(1.3);
  }

  /* Hide navigation di mobile (supaya rapi) */
  :deep(.carousel__prev),
  :deep(.carousel__next) {
    display: none !important;
  }
}

/* --- LOMBA SECTION --- */
.lomba-grid {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.lomba-card-pro {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.lomba-header {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.lomba-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.5s;
}

.lomba-card-pro:hover .lomba-header img {
  transform: scale(1.05);
}

.lomba-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: white;
}

.nasional {
  background: #e11d48;
}

.regional {
  background: #0284c7;
}

.lomba-body {
  padding: 30px;
}

.lomba-body h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.lomba-body .desc {
  color: #64748b;
  margin-bottom: 25px;
  line-height: 1.6;
}

.lomba-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.detail-box {
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid #e2e8f0;
}

.detail-box.highlight {
  background: #fff7ed;
  border-color: #ffedd5;
}

.detail-box .label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.detail-box strong {
  font-size: 1rem;
  color: #334155;
}

.highlight strong {
  color: #d97706;
}

/* --- DESKTOP LAYOUT LOMBA --- */
@media (min-width: 992px) {
  .lomba-card-pro {
    flex-direction: row;
    height: 400px;
  }

  .lomba-header {
    width: 40%;
    height: 100%;
  }

  .lomba-body {
    width: 60%;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/* --- RESPONSIVE MOBILE FIXES (≤ 480px) --- */
@media (max-width: 480px) {

  /* HERO SECTION */
  .hero-section {
    height: 75vh;
    min-height: 500px;
    padding: 0 20px;
  }

  .hero-title {
    font-size: 2rem;
    line-height: 1.3;
  }

  .hero-subtitle {
    font-size: 0.9rem;
    padding: 6px 14px;
  }

  .search-box {
    padding: 12px 18px;
  }

  .search-icon {
    font-size: 1rem;
    margin-right: 10px;
  }

  .search-field {
    font-size: 0.9rem;
  }

  /* GRID TEMPAT POPULER */
  .grid-3 {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .card-img-wrap {
    height: 180px;
  }

  .card-body h3 {
    font-size: 1.1rem;
  }

  .rating,
  .location {
    font-size: 0.85rem;
  }

  /* CAROUSEL */
  .tip-card-carousel {
    height: auto;
    padding: 20px;
    margin: 10px;
  }

  .tip-img-box {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .tip-emoji {
    font-size: 2rem;
  }

  .tip-content h3 {
    font-size: 1.1rem;
  }

  .tip-content p {
    font-size: 0.9rem;
  }

  :deep(.carousel__pagination) {
    margin-top: 20px;
  }

  /* LOMBA SECTION */
  .lomba-header {
    height: 180px;
  }

  .lomba-body {
    padding: 20px;
  }

  .lomba-body h3 {
    font-size: 1.3rem;
  }

  .lomba-body .desc {
    font-size: 0.9rem;
  }

  .lomba-details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
