<template>
  <div class="memancing-section">
    <div class="header-section">
      <h1 class="page-title">Temukan Spot Terbaik</h1>
      <p class="page-subtitle">
        Jelajahi berbagai lokasi pemancingan favorit di sekitarmu
      </p>
    </div>

    <div class="controls-wrapper">
      <div class="search-container">
        <div class="search-box">
          <font-awesome-icon
            icon="fa-solid fa-magnifying-glass"
            class="search-icon"
          />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama tempat atau lokasi..."
            class="search-input"
          />
        </div>
      </div>

      <div class="filter-tabs">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-tab', { active: selectedFilter === filter.id }]"
          @click="selectFilter(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data tempat...</p>
    </div>

    <div v-else-if="paginatedPlaces.length === 0" class="empty-state">
      <img
        src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
        alt="Kosong"
        width="80"
      />
      <h3>Tidak ada tempat ditemukan</h3>
      <p>Coba ubah kata kunci pencarian atau filter kotamu.</p>
      <button @click="resetFilters" class="btn-reset">Lihat Semua</button>
    </div>

    <div v-else class="fishing-grid">
      <div
        v-for="place in paginatedPlaces"
        :key="place.id"
        class="fishing-card"
        @click="goToReview(place)"
      >
        <div class="card-image">
          <img :src="place.image" :alt="place.name" loading="lazy" />
          <div class="category-badge">
            <font-awesome-icon icon="fa-solid fa-location-dot" />
            {{ place.city }}
          </div>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">{{ place.name }}</h3>
            <div class="card-rating">
              <font-awesome-icon icon="fa-solid fa-star" class="star-icon" />
              <span class="rating-value">{{ place.rating }}</span>
            </div>
          </div>

          <div class="card-location">
            <span>{{ place.location }}</span>
          </div>

          <div class="card-facilities">
            <span
              v-for="(facility, index) in place.facilities.slice(0, 3)"
              :key="index"
              class="facility-badge"
            >
              {{ facility.trim() }}
            </span>
            <span v-if="place.facilities.length > 3" class="facility-more">
              +{{ place.facilities.length - 3 }}
            </span>
          </div>

          <div class="card-footer">
            <div class="price-info">
              <span class="price-label">Mulai dari</span>
              <span class="price-value">{{ formatCurrency(place.price) }}</span>
            </div>
            <button class="btn-detail">Detail</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        :class="['pagination-btn', { active: currentPage === page }]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// --- STATE ---
const searchQuery = ref("");
const selectedFilter = ref(null);
const currentPage = ref(1);
const itemsPerPage = 9;
const isLoading = ref(false);
const fishingPlaces = ref([]);

// Filter default
const filters = ref([{ id: null, label: "Semua Lokasi" }]);

// --- COMPUTED PROPERTIES ---
const filteredPlaces = computed(() => {
  let places = fishingPlaces.value;

  // Filter by City
  if (selectedFilter.value) {
    places = places.filter(
      (place) => place.city.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }

  // Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    places = places.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.location.toLowerCase().includes(query) ||
        (place.facilities &&
          place.facilities.some((f) => f.toLowerCase().includes(query)))
    );
  }
  return places;
});

const paginatedPlaces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPlaces.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredPlaces.value.length / itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// --- METHODS ---

function formatCurrency(amount) {
  if (amount == null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function fetchTempatMancing() {
  isLoading.value = true;
  try {
    const response = await fetch("http://localhost:3000/tempat_mancing");
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const dataDariDatabase = await response.json();

    // Mapping Data
    const dataSiapTampil = dataDariDatabase.map((db_tempat) => {
      // --- LOGIKA GAMBAR BARU ---
      // 1. Cek apakah ada nama file di database
      // 2. Jika ada, gabungkan dengan path folder public
      let finalImage;
      if (db_tempat.image_url) {
        // Hasil: /img/tempat-pemancingan/nama_file.jpg
        finalImage = `/img/tempat-pemancingan/${db_tempat.image_url}`;
      } else {
        // Jika null, pakai gambar placeholder
        finalImage = "https://via.placeholder.com/400x250.png?text=No+Image";
      }

      return {
        id: db_tempat.id,
        name: db_tempat.nama,
        location: db_tempat.lokasi,
        price: db_tempat.harga_per_jam,
        image: finalImage, // <--- Masukkan variabel yang sudah diolah tadi
        city: db_tempat.kota || "Lainnya",
        facilities: db_tempat.fasilitas ? db_tempat.fasilitas.split(",") : [],
        rating: 4.5,
      };
    });

    fishingPlaces.value = dataSiapTampil;

    // Generate Filter Kota Otomatis
    const cities = [...new Set(dataSiapTampil.map((item) => item.city))];
    filters.value = [
      { id: null, label: "Semua Lokasi" },
      ...cities.map((city) => ({
        id: city.toLowerCase(),
        label: city.charAt(0).toUpperCase() + city.slice(1),
      })),
    ];
  } catch (err) {
    console.error("Gagal ambil data:", err);
  } finally {
    isLoading.value = false;
  }
}

// --- NAVIGASI ---
function goToReview(place) {
  // Pindah ke halaman review dengan membawa ID tempat
  router.push({ name: "ReviewSection", params: { id: place.id } });
}

function selectFilter(filterId) {
  selectedFilter.value = filterId;
  currentPage.value = 1;
}

function resetFilters() {
  searchQuery.value = "";
  selectedFilter.value = null;
}

function goToPage(page) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// --- LIFECYCLE & WATCH ---
onMounted(() => {
  fetchTempatMancing();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
/* ===== STYLE TETAP SAMA ===== */
/* Biar ga kepanjangan, saya tidak paste ulang style CSS-nya. 
   Gunakan STYLE yang SAMA persis dengan yang saya kasih sebelumnya 
   (yang ada pill buttons, hover card, dll). 
   
   Hanya bagian <script> di atas yang berubah total jadi <script setup>. 
*/

/* ===== VARIABLES ===== */
:root {
  --primary: #023e8a;
  --primary-light: #48cae4;
  --accent: #ffb703;
  --bg: #f8f9fa;
  --text: #333;
  --text-light: #666;
}

.memancing-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-top: 100px;
  /* Spacer untuk navbar fixed */
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
}

/* --- HEADER & CONTROLS --- */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #023e8a;
  font-weight: 800;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.controls-wrapper {
  margin-bottom: 40px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-box {
  position: relative;
  background: white;
  border: 2px solid #023e8a;
  border-radius: 50px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 20px rgba(2, 62, 138, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.search-box:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(2, 62, 138, 0.2);
}

.search-icon {
  color: #023e8a;
  font-size: 1.2rem;
  margin-right: 15px;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: #333;
}

/* --- FILTER TABS (PILL STYLE) --- */
.filter-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tab {
  padding: 10px 24px;
  border: none;
  border-radius: 50px;
  background-color: #e9ecef;
  color: #555;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background-color: #dee2e6;
  transform: translateY(-2px);
}

.filter-tab.active {
  background-color: #023e8a;
  color: white;
  box-shadow: 0 4px 12px rgba(2, 62, 138, 0.3);
}

/* --- GRID SYSTEM --- */
.fishing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

/* --- CARD DESIGN --- */
.fishing-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.fishing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  height: 220px;
  width: 100%;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(255, 255, 255, 0.95);
  color: #023e8a;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
}

.card-content {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fff9c4;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: bold;
  color: #fbc02d;
  font-size: 0.85rem;
}

.card-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Facilities */
.card-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.facility-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.facility-more {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px;
}

/* Footer Card */
.card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.75rem;
  color: #999;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #023e8a;
}

.btn-detail {
  background: #e0f2fe;
  color: #0284c7;
  border: none;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.fishing-card:hover .btn-detail {
  background: #023e8a;
  color: white;
}

/* --- PAGINATION --- */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 60px;
}

.pagination-btn {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #023e8a;
  color: #023e8a;
}

.pagination-btn.active {
  background: #023e8a;
  color: white;
  border-color: #023e8a;
  box-shadow: 0 4px 10px rgba(2, 62, 138, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- STATES --- */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #023e8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.btn-reset {
  margin-top: 15px;
  padding: 10px 20px;
  background: #023e8a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 10px;
    flex-wrap: nowrap;
  }

  .filter-tab {
    white-space: nowrap;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>
