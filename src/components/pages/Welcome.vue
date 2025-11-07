<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import { ref } from "vue"
import { useRouter } from "vue-router";

const router = useRouter();

const showOverlay = ref(false)

// Search Field
const tempatList = [
  {
    nama: "Alaska Fishing",
    lokasi: "Jakarta Selatan",
    gambar: new URL('@/assets/img/tempat-pemancingan/tempat1.avif', import.meta.url).href
  },
  {
    nama: "Zyia Fishing",
    lokasi: "Bandung",
    gambar: new URL('@/assets/img/tempat-pemancingan/tempat2.avif', import.meta.url).href
  },
  {
    nama: "ArcaMancing",
    lokasi: "Surabaya",
    gambar: new URL('@/assets/img/tempat-pemancingan/tempat3.avif', import.meta.url).href
  },
  {
    nama: "Danau Biru Fishing Spot",
    lokasi: "Bogor",
    gambar: new URL('@/assets/img/tempat-pemancingan/lomba1.avif', import.meta.url).href
  },
]

// Hamburger Menu
const toggleOverlay = (value) => {
  showOverlay.value = value
}

// Carousel (Data ini akan kita pakai lagi untuk section tips)
const slides = [
  {
    title: 'Tips Memilih Umpan',
    desc: 'Gunakan umpan sesuai jenis ikan yang ditarget, misalnya cacing untuk lele.',
    img: '../../assets/img/tips/umpan.avif'
  },
  {
    title: 'Ikan Mujair',
    desc: 'Ikan air tawar yang sering ditemukan di kolam pemancingan.',
    img: '../../assets/img/ikan/mujair.avif'
  },
  {
    title: 'Teknik Menarik Ikan Besar',
    desc: 'Tarik perlahan sambil kendurkan tali agar tidak putus.',
    img: '../../assets/img/tips/narik.avif'
  },
  {
    title: 'Ikan Nila',
    desc: 'Ikan populer di kolam pemancingan, mudah ditangkap dan lezat.',
    img: '../../assets/img/ikan/nila.avif'
  },
  {
    title: 'Gunakan Joran yang Tepat',
    desc: 'Joran karbon lebih ringan dan kuat, cocok untuk pemancingan harian.',
    img: '../../assets/img/tips/joran.avif'
  }
]
</script>

<template>
  <section id="home">
    <img src="../../assets/img/search-section-bg.svg" alt="Search Section Background" class="background">
    <div class="home-container">
      <form>
        <div class="search-box" @click.self="toggleOverlay(false)">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
          <input 
            type="text" 
            name="tempat" 
            placeholder="Mau memancing dimana hari ini?" 
            class="search-field"
            @focus="toggleOverlay(true)"
          />

          <!-- Overlay muncul di bawah search -->
          <div v-if="showOverlay" class="overlay-suggestion">
            <h3>Rekomendasi Tempat Memancing</h3>
            <div class="overlay-grid">
              <div 
                v-for="(item, index) in tempatList" 
                :key="index" 
                class="overlay-card"
              >
                <img :src="item.gambar" :alt="item.nama">
                <div class="info">
                  <h4>{{ item.nama }}</h4>
                  <p>{{ item.lokasi }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <img src="../../assets/img/separator/wave-1.svg" alt="Separator 1" class="sep-1">
  </section>

  <section id="tempat-section">
    <!-- Konten Utama -->
    <div class="content-wrapper">
      <!-- Judul -->
      <h1 class="main-title">
        Tempat Pemancingan
      </h1>

      <!-- Grid untuk Kartu -->
      <div class="card-grid">
        <!-- Kartu 1 -->
        <div class="card">
          <img src="../../assets/img/tempat-pemancingan/tempat1.avif" alt="Alaska Fishing">
          <div class="card-content">
            <h2><font-awesome-icon icon="fa-solid fa-location-dot" style="color: #48cae4;" size="sm" />Alaska Fishing</h2>
            <!-- Rating Bintang -->
            <div class="rating">
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
            </div>
            <p>
              Jalan Elang Perkasa No. 45, Jakarta Selatan
            </p>
          </div>
        </div>

        <!-- Kartu 2 -->
        <div class="card">
          <img src="../../assets/img/tempat-pemancingan/tempat2.avif" alt="Zyia Fishing">
          <div class="card-content">
            <h2><font-awesome-icon icon="fa-solid fa-location-dot" style="color: #48cae4;" size="sm" />Zyia Fishing</h2>
            <!-- Rating Bintang -->
            <div class="rating">
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
            </div>
            <p>
              Komp. Mawar Indah Blok B7/12, Bandung
            </p>
          </div>
        </div>

        <!-- Kartu 3 -->
        <div class="card">
          <img src="../../assets/img/tempat-pemancingan/tempat3.avif" alt="ArcaMancing">
          <div class="card-content">
            <h2><font-awesome-icon icon="fa-solid fa-location-dot" style="color: #48cae4;" size="sm" />ArcaMancing</h2>
            <!-- Rating Bintang -->
            <div class="rating">
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #48cae4;" />
              <font-awesome-icon icon="fa-solid fa-star" style="color: #a9a9a9;" />
            </div>
            <p>
              Jl. Pahlawan Seribu Kav. 1A, Surabaya
            </p>
          </div>
        </div>
      </div>

      <!-- Tombol "Lihat Selengkapnya" -->
      <div class="button-container">
        <button class="button-primary" @click="router.push('/memancing-section')">
          Lihat Selengkapnya
        </button>
      </div>
    </div>
    <img src="../../assets/img/separator/wave-2.svg" alt="Separator 2" class="sep-2">
  </section>

  <!-- Tips Section -->
  <section id="tips-section">
    <img src="../../assets/img/separator/wave-2.svg" alt="Separator Atas" class="sep-top">
    <div class="content-wrapper">
      <h1 class="main-title">
        Tips & Trick
      </h1>

      <div class="tips-grid">
        <!-- Card di-loop dari data 'slides' -->
        <div v-for="tip in slides" :key="tip.title" class="tip-card">
          <h3>{{ tip.title }}</h3>
          <p>{{ tip.desc }}</p>
        </div>
      </div>
    </div>
    <img src="../../assets/img/separator/wave-3.svg" alt="Separator Bawah" class="sep-bottom">
  </section>
 
  <!-- Section Lomba -->
  <section id="lomba-section">
    <div class="content-wrapper">
      <!-- Section Title -->
      <h1 class="main-title">Lomba Memancing</h1>

      <!-- Competition Card 1 -->
      <div class="lomba-card">
        <div class="lomba-image">
          <img 
            src="../../assets/img/tempat-pemancingan/lomba1.avif" 
            alt="Suasana lomba memancing 1"
          >
        </div>
        <div class="lomba-details">
          <span class="lomba-badge">LOMBA 1</span>
          <h2 class="lomba-title">Fishing Challenge Pangandaran 2025</h2>
          <p class="lomba-description">
            Lomba mancing skala nasional dengan target ikan laut di salah satu pantai terbaik Indonesia.
          </p>
          <ul class="detail-list">
            <li>
              <font-awesome-icon icon="fa-solid fa-calendar-days" class="icon" />
              <span>14 Juli 2025</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-location-dot" class="icon" />
              <span>Pantai Pangandaran, Jawa Barat</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-coins" class="icon" />
              <span>Biaya pendaftaran: Rp150.000/orang</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-trophy" class="icon" />
              <span>Hadiah utama: Rp10.000.000 + Trophy</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-scale-balanced" class="icon" />
              <span>Penilaian: Ikan terberat (1 ekor)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Competition Card 2 -->
      <div class="lomba-card">
        <div class="lomba-image">
          <img 
            src="../../assets/img/tempat-pemancingan/lomba2.avif" 
            alt="Suasana lomba memancing 2"
          >
        </div>
        <div class="lomba-details">
          <span class="lomba-badge">LOMBA 2</span>
          <h2 class="lomba-title">Jakarta Galatama Masters 2025</h2>
          <p class="lomba-description">
            Kompetisi galatama ikan mas di pemancingan eksklusif Jakarta Selatan.
          </p>
          <ul class="detail-list">
            <li>
              <font-awesome-icon icon="fa-solid fa-calendar-days" class="icon" />
              <span>21 Agustus 2025</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-location-dot" class="icon" />
              <span>Jalan Elang Perkasa No. 45, Jakarta Selatan</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-coins" class="icon" />
              <span>Biaya pendaftaran: Rp150.000/orang</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-trophy" class="icon" />
              <span>Hadiah utama: Rp20.000.000 + Trophy</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-scale-balanced" class="icon" />
              <span>Penilaian: Total berat 3 ekor ikan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
#home {
  height: 85vh;
  position: relative; 
  overflow: hidden; 
}

.background {
  width: 100%;
  height: 100%; 
  position: absolute;
  object-fit: cover;
  z-index: -9999;
}

.home-container {
  display: flex;
  justify-content: center;
  position: relative; 
  z-index: 1;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.overlay-suggestion {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.overlay-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .overlay-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.overlay-card {
  display: flex;
  background: #f9f9f9;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.overlay-card:hover {
  transform: scale(1.03);
}

.overlay-card img {
  width: 70px;
  height: 70px;
  object-fit: cover;
}

.overlay-card .info {
  padding: 0.5rem 0.75rem;
}

.overlay-card h4 {
  font-size: 0.95rem;
  color: #023e8a;
  margin: 0;
}

.overlay-card p {
  font-size: 0.8rem;
  color: #6b7280;
}

.search-box {
  margin-top: 15rem;
  background: var(--color-white);
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  border: 2px solid #023e8a;
  border-radius: 25px;
  width: 90%;
  box-sizing: border-box;
  position: relative;
}

.search-field {
  border: none;
  outline: none;
  padding: 0 0.5rem;
  margin-left: 0.5rem;
  flex-grow: 1;
  width: 100%;
  background: transparent;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  #home {
    height: 100vh;
  }
  
  .home-container {
    padding: 0 2rem;
  }

  .search-box {
    margin-top: 20rem;
    padding: 1rem 9rem;
    width: auto;
  }

  .search-field {
    font-size: 1rem;
  }
}

.sep-1 {
  position: absolute; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  z-index: 1; 
  display: block; 
}

#tempat-section {
  width: 100%;
  min-height: 120vh;
  padding: 5rem 1rem; 
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  margin-left: auto;
  margin-right: auto;
  max-width: 1152px; 
  padding-left: 1rem;
  padding-right: 1rem;
}

#tempat-section .main-title {
  font-size: 2.25rem; 
  font-weight: 500; 
  text-align: center;
  color: var(--color-primary-dark);
  margin-bottom: 4rem; 
}

@media (min-width: 768px) {
  #tempat-section .main-title {
    font-size: 3rem;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
}

.card img {
  width: 100%;
  height: 13rem;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.rating {
  display: flex;
  color: #0077b6;
  margin-bottom: 0.75rem;
}

.rating svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}

.card-content p {
  font-size: 0.875rem;
  color: #718096;
}

.button-container {
  text-align: center;
}

.button-primary {
  background-color: var(--color-primary-deep);
  color: #ffffff;
  font-weight: 600; 
  padding: 1rem 1.5rem; 
  border-radius: 15px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.button-primary:hover {
  background-color: var(--color-primary-dark);
  transform: scale(1.05);
}

.sep-2 {
  position: absolute; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  z-index: 1; 
  display: block; 
}

#tips-section {
  position: relative;
  width: 100%;
  min-height: 120vh;
  background-color: #ade8f4; 
  padding: 10rem 1rem; 
  overflow: hidden;
}

#tips-section .sep-top, 
#tips-section .sep-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 1;
  display: block;
}

#tips-section .sep-top {
  top: 0;
}

#tips-section .sep-bottom {
  bottom: 0;
}

#tips-section .main-title {
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
  color: #023e8a;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  #tips-section .main-title {
    font-size: 3rem;
  }
}

.tips-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

@media (min-width: 640px) {
  .tips-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tips-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tip-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 1.5rem;
  border-left: 5px solid var(--color-primary-deep);
}

.tip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.tip-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #023e8a;
  margin-bottom: 0.75rem;
}

.tip-card p {
  font-size: 0.9rem;
  color: #5a5a5a;
  line-height: 1.6;
}

#lomba-section {
  width: 100%;
  min-height: 100vh;
  padding: 80px 20px;
}

#lomba-section .main-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  color: #023e8a;
  margin-bottom: 60px;
  letter-spacing: -0.5px;
}

.lomba-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(2, 62, 138, 0.08);
  margin-bottom: 40px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.lomba-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(2, 62, 138, 0.15);
}

.lomba-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.lomba-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.lomba-card:hover .lomba-image img {
  transform: scale(1.05);
}

.lomba-details {
  padding: 32px;
  overflow-y: auto;
  max-height: 600px;
}

.lomba-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0077b6;
  background-color: #e3f2fd;
  padding: 6px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}

.lomba-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.3;
}

.lomba-description {
  font-size: 1rem;
  color: #5a5a5a;
  line-height: 1.7;
  margin-bottom: 24px;
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-list li {
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #333333;
  margin-bottom: 14px;
  line-height: 1.6;
}

.detail-list li:last-child {
  margin-bottom: 0;
}

.detail-list .icon {
  width: 20px;
  height: 20px;
  color: #0077b6;
  flex-shrink: 0;
  margin-right: 14px;
  margin-top: 2px;
}

@media (min-width: 768px) {
  #lomba-section .main-title {
    font-size: 3rem;
    margin-bottom: 80px;
  }

  .lomba-details {
    padding: 40px;
  }

  .lomba-title {
    font-size: 2rem;
  }

  .lomba-description {
    font-size: 1.05rem;
  }

  .detail-list li {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  #lomba-section {
    padding: 100px 40px;
  }

  .lomba-card {
    flex-direction: row;
    height: 420px;
  }

  .lomba-image {
    width: 45%;
    height: 100%;
  }

  .lomba-details {
    width: 55%;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 420px;
  }
  
  .lomba-details::-webkit-scrollbar {
    width: 8px;
  }
  
  .lomba-details::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .lomba-details::-webkit-scrollbar-thumb {
    background: #0077b6;
    border-radius: 10px;
  }
  
  .lomba-details::-webkit-scrollbar-thumb:hover {
    background: #023e8a;
  }

  .lomba-title {
    font-size: 2.25rem;
    margin-bottom: 20px;
  }

  .lomba-description {
    margin-bottom: 32px;
  }

  .detail-list li {
    margin-bottom: 16px;
  }
}
</style>
