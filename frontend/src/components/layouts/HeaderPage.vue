<template>
  <header>
    <nav class="navbar" :class="{ 'scrolled': isScrolled }">
      <div class="nav-left">
        <h1 @click="router.push('/')" style="cursor: pointer;">
          <span>Kail</span>Ku
        </h1>
      </div>

      <div class="nav-middle">
        <router-link to="/">Beranda</router-link>
        <router-link to="/memancing-section">Tempat Pemancingan</router-link>
        <router-link to="/#tips-section">Tips & Trick</router-link>
        <router-link to="/#lomba-section">Lomba</router-link>
      </div>

      <div class="nav-right">

        <div v-if="isLoggedIn" class="user-menu-desktop">
          <div class="user-info" @click="router.push('/profil')">
            <span class="greeting">Halo, <b>{{ username }}</b></span>
            <img :src="avatar" alt="Avatar" class="user-avatar">
          </div>
          <button @click="handleLogout" class="logout-btn-desktop" title="Keluar">
            <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
          </button>
        </div>

        <div v-else class="guest-menu-desktop">
          <RouterLink to="/login" class="login-btn">Masuk</RouterLink>
          <RouterLink to="/signup" class="signup-btn">Daftar</RouterLink>
        </div>

      </div>

      <button class="hamburger" @click="toggleMenu">
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
      </button>
    </nav>

    <transition name="fade">
      <div v-if="isMenuOpen" class="mobile-menu">
        <router-link to="/" @click="toggleMenu">Beranda</router-link>
        <router-link to="/memancing-section" @click="toggleMenu">Tempat Pemancingan</router-link>
        <a href="#tips-section" @click="toggleMenu">Tips & Trick</a>
        <a href="#lomba-section" @click="toggleMenu">Lomba</a>

        <div v-if="isLoggedIn" class="mobile-user-section">
          <div class="mobile-user-info" @click="goToProfileMobile">
            <img :src="avatar" alt="Avatar">
            <span>{{ username }}</span>
          </div>
          <button @click="handleLogout" class="mobile-logout-btn">Keluar</button>
        </div>

        <div v-else class="mobile-guest-section">
          <RouterLink to="/login" class="login-btn" @click="toggleMenu">Masuk</RouterLink>
          <RouterLink to="/signup" class="signup-btn" @click="toggleMenu">Daftar</RouterLink>
        </div>

      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

// State UI
const isMenuOpen = ref(false);
const isScrolled = ref(false);

// State Auth
const isLoggedIn = ref(false);
const username = ref('User');
const avatar = ref('https://placehold.co/100x100/0077b6/ffffff?text=U');

// --- Fungsi UI ---
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function goToProfileMobile() {
  router.push('/user-profile');
  toggleMenu();
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// --- Fungsi Auth ---
const checkLoginStatus = () => {
  const token = localStorage.getItem('kailku_token');
  if (token) {
    isLoggedIn.value = true;
    // (Opsional: Bisa fetch nama user dari backend di sini jika mau)
  } else {
    isLoggedIn.value = false;
  }
};

const handleLogout = () => {
  if (confirm("Yakin ingin keluar?")) {
    localStorage.removeItem('kailku_token');
    isLoggedIn.value = false;
    isMenuOpen.value = false;
    router.push('/login');
  }
};

// --- Lifecycle ---
onMounted(() => {
  checkLoginStatus();
  window.addEventListener('scroll', handleScroll);
});

// Cek login setiap pindah halaman
watch(() => route.path, () => {
  checkLoginStatus();
});
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

/* --- Navbar Utama --- */
.navbar {
  background-color: var(--color-white);
  padding: 1.25rem 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  padding: 0.8rem 1rem;
  /* Mengecil saat discroll */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Logo */
.nav-left h1 {
  font-size: 1.75rem;
  margin-left: 0.5rem;
  color: var(--color-black);
  margin: 0;
  /* Reset margin */
}

.nav-left h1 span {
  color: #023e8a;
}

/* Tengah (Link) */
.nav-middle {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-middle a {
  margin: 0 1rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-middle a:hover,
.nav-middle .router-link-active {
  color: #023e8a;
}

/* Kanan (Auth) */
.nav-right {
  display: flex;
  align-items: center;
}

/* Guest Menu Desktop */
.guest-menu-desktop {
  display: flex;
  align-items: center;
}

.guest-menu-desktop a {
  margin: 0 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.login-btn {
  color: #023e8a;
  border: 1px solid #023e8a;
}

.login-btn:hover {
  background-color: #f0f9ff;
}

.signup-btn {
  border: 1px solid #023e8a;
  color: white;
  background-color: #023e8a;
}

.signup-btn:hover {
  background-color: #002855;
  border-color: #002855;
  box-shadow: 0 4px 10px rgba(2, 62, 138, 0.2);
}

/* User Menu Desktop (Logged In) */
.user-menu-desktop {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 30px;
  transition: background 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.greeting {
  font-size: 0.9rem;
  color: #333;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #023e8a;
}

.logout-btn-desktop {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn-desktop:hover {
  background: #fecaca;
  transform: scale(1.05);
}

/* --- Tombol Hamburger --- */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 30px;
  height: 25px;
  background: none;
  border: none;
  cursor: pointer;
  gap: 5px;
  position: relative;
  z-index: 1002;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #023e8a;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* --- Menu Mobile --- */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 0;
  z-index: 1001;
  border-top: 1px solid #eee;
}

.mobile-menu a {
  margin: 0.5rem 0;
  color: #333;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  width: 80%;
  text-align: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.mobile-menu a:hover {
  background-color: #f0f9ff;
  color: #023e8a;
}

/* Mobile User Section */
.mobile-user-section {
  margin-top: 1rem;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.mobile-user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.mobile-user-info span {
  font-weight: 700;
  color: #023e8a;
}

.mobile-logout-btn {
  width: 100%;
  padding: 10px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* Mobile Guest Section */
.mobile-guest-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

/* --- Animasi Transisi --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* --- Responsive --- */
@media (max-width: 768px) {

  .nav-middle,
  .nav-right {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}

/* JAMINAN: Menu Mobile Gak Boleh Muncul di Desktop */
@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }

  .hamburger {
    display: none !important;
  }
}
</style>
