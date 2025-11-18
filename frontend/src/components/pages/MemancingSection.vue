<template>
  <div class="memancing-section">
    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-box">
        <svg
          class="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Mau memancing dimana hari ini?"
          class="search-input"
        />
      </div>
    </div>

    <!-- Filter Tabs -->
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

    <!-- Fishing Places Grid -->
    <div class="fishing-grid">
      <div
        v-for="place in paginatedPlaces"
        :key="place.id"
        class="fishing-card"
        @click="selectPlace(place)"
      >
        <!-- Image -->
        <div class="card-image">
          <img :src="place.image" :alt="place.name" />
          <div class="favorite-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="card-content">
          <!-- Title & Rating -->
          <div class="card-header">
            <h3 class="card-title">{{ place.name }}</h3>
            <div class="card-rating">
              <svg
                class="star-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              <span class="rating-value">{{ place.rating }}</span>
            </div>
          </div>

          <!-- Location -->
          <div class="card-location">
            <svg
              class="location-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ place.location }}</span>
          </div>

          <!-- Facilities -->
          <div class="card-facilities">
            <span
              v-for="(facility, index) in place.facilities.slice(0, 3)"
              :key="index"
              class="facility-badge"
            >
              {{ facility }}
            </span>
            <span v-if="place.facilities.length > 3" class="facility-more">
              +{{ place.facilities.length - 3 }}
            </span>
          </div>

          <!-- Price -->
          <div class="card-price">
            <span class="price-label">Mulai dari</span>
            <span class="price-value">{{ formatCurrency(place.price) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button
        class="pagination-btn pagination-prev"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
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
        class="pagination-btn pagination-next"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MemancingSection",

  data() {
    return {
      searchQuery: "",
      selectedFilter: null,
      currentPage: 1,
      itemsPerPage: 12,

      filters: [
        { id: null, label: "All" },
        { id: "bandung", label: "Bandung" },
        { id: "garut", label: "Garut" },
        { id: "tasikmalaya", label: "Tasikmalaya" },
        { id: "pangandaran", label: "Pangandaran" },
        { id: "semarang", label: "Semarang" },
        { id: "amol", label: "Amol" },
        { id: "karimunjawa", label: "Karimunjawa" },
        { id: "cilacap", label: "Cilacap" },
      ],

      fishingPlaces: [], // <-- Error #1: Tanda ']' ekstra DIHAPUS
    };
  },

  created() {
    this.fetchTempatMancing();
  },

  computed: {
    filteredPlaces() {
      let places = this.fishingPlaces; 

      if (this.selectedFilter) {
        places = places.filter((place) => place.city === this.selectedFilter);
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        places = places.filter(
          (place) =>
            place.name.toLowerCase().includes(query) ||
            place.location.toLowerCase().includes(query) ||
            (place.facilities && place.facilities.some((f) => f.toLowerCase().includes(query))) // Tambahkan pengecekan 'place.facilities'
        );
      }

      return places;
    },

    paginatedPlaces() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPlaces.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredPlaces.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  methods: {
    formatCurrency(amount) {
      if (amount == null) return "Rp 0"; // Tambahkan penjagaan
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },

    async fetchTempatMancing() {
      console.log("Mulai memanggil backend...");
      try {
        const response = await fetch('http://localhost:3000/tempat_mancing');

        if(!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const dataDariDatabase = await response.json();
        console.log("Data diterima: ", dataDariDatabase);

        const dataSiapTampil = dataDariDatabase.map(db_tempat => {
          return {
            id: db_tempat.id,
            name: db_tempat.nama,
            location: db_tempat.lokasi,
            price: db_tempat.harga_per_jam,
            
            // Data "palsu" untuk jaga-jaga
            rating: 4.2, 
            image: 'https://via.placeholder.com/300x200.png?text=Gambar+Tempat', // Perlu perbaikan gambar
            facilities: ["Gazebo", "Toilet"], // Typo: 'facilites' -> 'facilities'
            city: db_tempat.lokasi ? db_tempat.lokasi.toLowerCase().split(',')[0] : 'bandung' // Perbaikan filter kota
          };
        });

        this.fishingPlaces = dataSiapTampil;
      } catch (err) {
        console.error("Gagal mengambil data dari backend: ", err);
      }
    }, // <-- Error #3: KOMA DITAMBAHKAN DI SINI

    selectFilter(filterId) {
      this.selectedFilter = filterId;
      this.currentPage = 1;
    },

    selectPlace(place) {
      this.$emit("place-selected", place);
      console.log("Selected place:", place);
      // Panggil goToReview dari sini
      this.goToReview(place);
    },

    // Error #2: Fungsi "tersesat" DIPINDAHKAN KE DALAM 'methods'
    goToReview(tempat) {
      // Gunakan 'this.$router'
      this.$router.push({ name: "ReviewSection", params: { id: tempat.nama } });
    },

    goToPage(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
  },
};

// Error #2: SEMUA KODE DI BAWAH INI DIHAPUS
// import { useRouter } from "vue-router";
// const router = useRouter();
// function goToReview(tempat) {
//   router.push({ name: "ReviewSection", params: { id: tempat.nama } });
// }
</script>
<style scoped>
/* ===== VARIABEL WARNA ===== */
:root {
  --color-primary: #48cae4;
  --color-secondary: #ffa200;
  --color-dark: #03045e;
  --color-light-bg: #f0f8ff;
  --color-white: #ffffff;
  --color-border: #e0e0e0;
  --color-text-secondary: #666666;
}

/* ===== CONTAINER ===== */
.memancing-section {
  max-width: 1280px;
  margin: 0 auto;
  /* Tingkatkan padding atas untuk memberi ruang di bawah header */
  padding: 24px; /* Ganti atau tambahkan baris di bawah */
  padding-top: 100px; /* Nilai contoh. Sesuaikan sesuai tinggi header Anda, misalnya 80px atau 100px */
  min-height: 100vh;
}

/* ===== SEARCH BAR ===== */
.search-container {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid var(--color-border);
  border-radius: 50px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(72, 202, 228, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

/* ===== FILTER TABS ===== */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-tabs::-webkit-scrollbar {
  height: 4px;
}

.filter-tabs::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 2px;
}

.filter-tab {
  padding: 10px 24px;
  border: 2px solid var(--color-border);
  border-radius: 50px;
  background-color: var(--color-white);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-tab.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

/* ===== FISHING GRID ===== */
.fishing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.fishing-card {
  background-color: var(--color-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.fishing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* ===== CARD IMAGE ===== */
.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.fishing-card:hover .card-image img {
  transform: scale(1.1);
}

.favorite-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.fishing-card:hover .favorite-badge {
  transform: scale(1.1);
}

/* ===== CARD CONTENT ===== */
.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-dark);
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #fff3cd;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.star-icon {
  color: #ffc107;
}

.rating-value {
  font-size: 14px;
  font-weight: 700;
  color: #856404;
}

/* ===== LOCATION ===== */
.card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.location-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

/* ===== FACILITIES ===== */
.card-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  min-height: 28px;
}

.facility-badge {
  padding: 4px 10px;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  white-space: nowrap;
}

.facility-more {
  padding: 4px 10px;
  background-color: #f5f5f5;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
}

/* ===== PRICE ===== */
.card-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.price-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary);
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
}

.pagination-btn {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-white);
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}

.pagination-btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-prev,
.pagination-next {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.pagination-prev:hover:not(:disabled),
.pagination-next:hover:not(:disabled) {
  background-color: #3aa8c1;
  transform: scale(1.1);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .fishing-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .memancing-section {
    padding: 16px;
  }

  .fishing-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .fishing-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    gap: 4px;
  }

  .pagination-btn {
    min-width: 40px;
    height: 40px;
    font-size: 14px;
  }
}
</style>
