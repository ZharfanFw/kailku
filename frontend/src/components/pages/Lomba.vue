<template>
  <section id="lomba-section">
    <div class="content-wrapper">
      <!-- Section Title -->
      <h1 class="main-title">Lomba Memancing</h1>

      <!-- Competition Card 1 -->
      <div class="lomba-card">
        <div class="lomba-image">
          <img
            src="../../assets/img/lomba/lomba1.avif"
            alt="Suasana lomba memancing 1"
          />
        </div>
        <div class="lomba-details">
          <span class="lomba-badge">LOMBA 1</span>
          <h2 class="lomba-title">Fishing Challenge Pangandaran 2025</h2>
          <p class="lomba-description">
            Lomba mancing skala nasional dengan target ikan laut di salah satu
            pantai terbaik Indonesia.
          </p>
          <ul class="detail-list">
            <li>
              <font-awesome-icon
                icon="fa-solid fa-calendar-days"
                class="icon"
              />
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
              <font-awesome-icon
                icon="fa-solid fa-scale-balanced"
                class="icon"
              />
              <span>Penilaian: Ikan terberat (1 ekor)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Competition Card 2 -->
      <div class="lomba-card">
        <div class="lomba-image">
          <img
            src="../../assets/img/lomba/lomba2.avif"
            alt="Suasana lomba memancing 2"
          />
        </div>
        <div class="lomba-details">
          <span class="lomba-badge">LOMBA 2</span>
          <h2 class="lomba-title">Alaska Salmon Hunt 2025</h2>
          <p class="lomba-description">
            Kompetisi memancing salmon di sungai terbesar Alaska dengan
            pemandangan alam yang spektakuler.
          </p>
          <ul class="detail-list">
            <li>
              <font-awesome-icon
                icon="fa-solid fa-calendar-days"
                class="icon"
              />
              <span>21 Agustus 2025</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-location-dot" class="icon" />
              <span>Anchorage, Alaska</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-coins" class="icon" />
              <span>Biaya pendaftaran: $100/orang</span>
            </li>
            <li>
              <font-awesome-icon icon="fa-solid fa-trophy" class="icon" />
              <span>Hadiah utama: $20.000 + Trophy Emas</span>
            </li>
            <li>
              <font-awesome-icon
                icon="fa-solid fa-scale-balanced"
                class="icon"
              />
              <span>Penilaian: Total berat 3 ekor ikan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No script needed
</script>

<style scoped>
/* ========================================
   SECTION LAYOUT
   ======================================== */
#lomba-section {
  width: 100%;
  min-height: 100vh;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 100%);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========================================
   MAIN TITLE
   ======================================== */
.main-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  color: #023e8a;
  margin-bottom: 60px;
  letter-spacing: -0.5px;
}

/* ========================================
   COMPETITION CARD
   ======================================== */
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

/* ========================================
   IMAGE CONTAINER
   ======================================== */
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

/* ========================================
   DETAILS CONTAINER
   ======================================== */
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

/* ========================================
   DETAIL LIST
   ======================================== */
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

/* ========================================
   RESPONSIVE - TABLET
   ======================================== */
@media (min-width: 768px) {
  .main-title {
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

/* ========================================
   RESPONSIVE - DESKTOP
   ======================================== */
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

  /* Custom scrollbar untuk details */
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
