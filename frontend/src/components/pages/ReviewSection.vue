<template>
  <div class="review-page-container">
    <header class="place-header">
      <img :src="place.image_url || placeholderImg" :alt="place.nama" class="header-image" />
      <div class="header-overlay">
        <h1 class="title">{{ place.nama || 'Memuat...' }}</h1>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Sedang mengambil data...</p>
    </div>

    <main v-else class="content-layout">
      <div class="details-column">
        <div class="details-card">
          <h2>Deskripsi Tempat</h2>
          <p>{{ place.deskripsi || 'Tidak ada deskripsi.' }}</p>

          <div class="extra-info">
            <div class="info-item">
              <strong>Harga:</strong> {{ formatCurrency(place.harga_per_jam) }} / jam
            </div>
            <div class="info-item">
              <strong>Jam Buka:</strong> {{ formatTime(place.jam_buka) }} - {{ formatTime(place.jam_tutup) }}
            </div>
          </div>

          <div class="facilities-tags">
            <span v-for="(item, index) in place.fasilitasArray" :key="index" class="facility-tag">
              {{ item.trim() }}
            </span>
          </div>

          <button class="btn blue" @click="goToBooking">Booking
            Sekarang</button>
        </div>

        <div class="details-card">
          <h2>Lokasi</h2>
          <p>
            📍 {{ place.lokasi || 'Lokasi belum tersedia' }} ({{ place.kota }})
          </p>

          <a :href="getGoogleMapsLink(place.lokasi, place.kota)" target="_blank" class="btn-maps">
            <font-awesome-icon icon="fa-solid fa-map-location-dot" />
            Buka di Google Maps
          </a>
        </div>
      </div>

      <div class="reviews-column">
        <div class="review-section-header">
          <h2>Ulasan Pengguna ({{ reviews.length }})</h2>

          <button v-if="isLoggedIn && !showReviewForm" class="btn-small-outline" @click="showReviewForm = true">
            + Tulis Ulasan
          </button>
          <button v-else-if="!isLoggedIn" class="btn-small-text" @click="$router.push('/login')">
            Login untuk mengulas
          </button>
        </div>

        <div v-if="showReviewForm" class="write-review-card">
          <div class="rating-input">
            <font-awesome-icon v-for="n in 5" :key="n" icon="fa-solid fa-star"
              :class="['star-input', { active: newReview.rating >= n }]" @click="newReview.rating = n" />
          </div>
          <textarea v-model="newReview.komentar" placeholder="Bagikan pengalamanmu..." rows="3"></textarea>
          <div class="form-actions">
            <button class="btn-cancel" @click="showReviewForm = false">Batal</button>
            <button class="btn-submit" @click="submitReview" :disabled="isSubmitting">
              {{ isSubmitting ? 'Mengirim...' : 'Kirim' }}
            </button>
          </div>
        </div>

        <div v-if="reviews.length > 0">
          <div class="review-card" v-for="review in reviews" :key="review.id">
            <div class="review-header">
              <div class="reviewer-info">
                <img :src="review.avatar_url || 'https://placehold.co/40x40/0077b6/fff?text=U'" class="avatar-small" />
                <span class="reviewer-name">{{ review.full_name || review.username }}</span>
              </div>

              <div class="stars">
                <font-awesome-icon v-for="n in 5" :key="'star-' + n" icon="fa-solid fa-star"
                  :class="n <= review.rating ? 'star-filled' : 'star-empty'" />
              </div>
            </div>
            <p class="comment-text">"{{ review.komentar }}"</p>
            <small class="review-date">{{ formatDate(review.created_at) }}</small>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Belum ada ulasan. Jadilah yang pertama!</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const placeId = route.params.id;

// State Data
const place = ref({});
const reviews = ref([]);
const isLoading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('kailku_token'));
const placeholderImg = 'https://via.placeholder.com/1200x500?text=Loading+Image';

// State Form
const showReviewForm = ref(false);
const isSubmitting = ref(false);
const newReview = ref({ rating: 5, komentar: '' });

function goToBooking() {
  if (place.value && place.value.id) {
    router.push({ name: "BookingSection", params: { id: place.value.id } });
  } else {
    router.push({ name: "BookingSection", params: { id: placeId } });
  }
}

// --- FUNGSI FETCH DATA ---
async function fetchPlaceDetail() {
  try {
    const res = await fetch(`http://localhost:3000/tempat_mancing/${placeId}`);
    if (!res.ok) throw new Error("Gagal load tempat");
    const data = await res.json();

    // Format fasilitas
    data.fasilitasArray = data.fasilitas ? data.fasilitas.split(',') : [];
    place.value = data;
  } catch (err) {
    console.error(err);
    // router.push('/memancing-section'); // Redirect jika error (opsional)
  }
}

async function fetchReviews() {
  try {
    const res = await fetch(`http://localhost:3000/reviews?tempat_id=${placeId}`);
    if (res.ok) reviews.value = await res.json();
  } catch (err) { console.error(err); }
}

async function submitReview() {
  if (!newReview.value.komentar) return alert("Isi komentar dulu ya!");

  const token = localStorage.getItem('kailku_token');
  isSubmitting.value = true;

  try {
    const res = await fetch('http://localhost:3000/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tempat_id: placeId,
        rating: newReview.value.rating,
        komentar: newReview.value.komentar
      })
    });

    if (!res.ok) throw new Error("Gagal kirim");

    // Reset Form & Reload Review
    newReview.value.komentar = "";
    showReviewForm.value = false;
    await fetchReviews();

  } catch (err) {
    alert("Gagal mengirim ulasan.");
  } finally {
    isSubmitting.value = false;
  }
}

// Helpers
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);
const formatTime = (time) => time ? time.slice(0, 5) : '--:--';
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { dateStyle: 'medium' });

const getGoogleMapsLink = (lokasi, kota) => {
  const query = `${lokasi}, ${kota}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// Init
onMounted(async () => {
  await fetchPlaceDetail();
  await fetchReviews();
  isLoading.value = false;
});
</script>

<style scoped>
/* --- GLOBAL & RESET --- */
.review-page-container {
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  background-color: var(--color-white);
  color: #333;
}

/* --- HERO HEADER SECTION --- */
.place-header {
  position: relative;
  width: 100%;
  height: 60vh;
  /* Tinggi header 60% layar */
  min-height: 400px;
  background-color: #222;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

.header-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 60px 5% 30px;
  color: white;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* --- CONTENT LAYOUT (GRID SYSTEM) --- */
.content-layout {
  display: grid;
  grid-template-columns: 1fr;
  /* Default Mobile: 1 Kolom */
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

/* Desktop: 2 Kolom (Kiri: Detail, Kanan: Review) */
@media (min-width: 992px) {
  .content-layout {
    grid-template-columns: 1.5fr 1fr;
    /* Kiri lebih lebar dikit */
    align-items: start;
    /* Biar kolom gak melar ke bawah */
  }
}

/* --- CARDS GENERIC STYLE --- */
.details-card,
.reviews-wrapper {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
}

/* --- KOLOM KIRI: DESKRIPSI --- */
.details-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.details-card h2 {
  font-size: 1.4rem;
  color: #023e8a;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 10px;
}

.details-card p {
  line-height: 1.8;
  color: #555;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

/* Info Box (Harga & Jam) */
.extra-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background: #f8fbff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  margin-bottom: 20px;
}

.info-item {
  font-size: 0.95rem;
  color: #334155;
}

.info-item strong {
  color: #023e8a;
}

/* Fasilitas Tags */
.facilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.facility-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Tombol Booking */
.btn.blue {
  background: linear-gradient(135deg, #023e8a 0%, #0077b6 100%);
  color: white;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(2, 62, 138, 0.2);
}

.btn.blue:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(2, 62, 138, 0.3);
}

/* Peta Placeholder */
.map-placeholder {
  background-color: #f1f5f9;
  height: 200px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-style: italic;
  border: 2px dashed #cbd5e1;
}

/* --- KOLOM KANAN: REVIEWS --- */
.review-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.review-section-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* Tombol Tulis Review */
.btn-small-outline {
  font-size: 0.85rem;
  padding: 6px 12px;
  border: 1px solid #023e8a;
  background: transparent;
  color: #023e8a;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-small-outline:hover {
  background: #e3f2fd;
}

/* Form Tulis Review */
.write-review-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.rating-input {
  margin-bottom: 15px;
  display: flex;
  gap: 5px;
}

.star-input {
  font-size: 1.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s;
}

.star-input.active {
  color: #fbbf24;
}

.write-review-card textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.write-review-card textarea:focus {
  border-color: #023e8a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.btn-cancel {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit {
  background: #023e8a;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Card Review List */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.review-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.stars {
  font-size: 0.85rem;
}

.star-filled {
  color: #fbbf24;
}

.star-empty {
  color: #e2e8f0;
}

.comment-text {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 8px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  font-style: normal;
  /* Hapus italic biar lebih modern */
}

.review-date {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* State Kosong/Loading */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #023e8a;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsif Mobile */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }

  .place-header {
    height: 40vh;
  }

  .content-layout {
    margin-top: 0;
  }

  .reviews-wrapper {
    padding: 20px;
  }
}

.btn-maps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #e3f2fd;
  /* Biru muda banget */
  color: #023e8a;
  text-decoration: none;
  padding: 15px;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 15px;
  border: 1px solid #023e8a;
  transition: all 0.2s;
}

.btn-maps:hover {
  background-color: #023e8a;
  color: white;
}
</style>
