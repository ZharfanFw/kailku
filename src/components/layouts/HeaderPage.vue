<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";
const router = useRouter();

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header>
    <nav class="navbar">
      <!-- Kiri -->
      <div class="nav-left">
        <h1>
          <RouterLink to="/"><span>Kail</span>Ku</RouterLink>
        </h1>
      </div>

      <!-- Tengah (Desktop Only) -->
      <div class="nav-middle">
        <a href="#home">Beranda</a>
        <a href="#tempat-section">Tempat Pemancingan</a>
        <a href="#tips-section">Tips & Trick</a>
        <a href="#lomba-section">Lomba</a>
      </div>

      <!-- Kanan (Desktop Only) -->
      <div class="nav-right">
        <RouterLink to="/login" class="login-btn">Masuk</RouterLink>
        <RouterLink to="/signup" class="signup-btn">Daftar</RouterLink>
      </div>

      <!-- Tombol Hamburger (Mobile Only) -->
      <button class="hamburger" @click="toggleMenu">
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
      </button>
    </nav>

    <!-- Menu Dropdown (Mobile) -->
    <transition name="fade">
      <div v-if="isMenuOpen" class="mobile-menu">
        <a href="#home" @click="toggleMenu">Beranda</a>
        <a href="#tempat-section" @click="toggleMenu">Tempat Pemancingan</a>
        <a href="#tips-section" @click="toggleMenu">Tips & Trick</a>
        <a href="#lomba-section" @click="toggleMenu">Lomba</a>
        <RouterLink to="/login" class="login-btn" @click="toggleMenu">Masuk</RouterLink>
        <RouterLink to="/signup" class="signup-btn" @click="toggleMenu">Daftar</RouterLink>
      </div>
    </transition>
  </header>
</template>

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
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
}

/* Logo */
.nav-left h1 {
  font-size: 1.75rem;
  margin-left: 0.5rem;
  color: var(--color-black);
}
.nav-left h1 a span {
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
  transition: color var(--transition), transform var(--transition);
}
.nav-middle a:hover {
  color: var(--color-primary-dark);
}

/* Kanan (Tombol Login/Signup) */
.nav-right {
  display: flex;
  align-items: center;
}
.nav-right a {
  margin: 0 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 15px;
  transition: background-color var(--transition), transform var(--transition);
}
.login-btn {
  color: var(--color-primary-deep);
  border: 1px solid var(--color-primary-deep);
}
.login-btn:hover {
  color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}
.signup-btn {
  border: 1px solid var(--color-primary-deep);
  color: var(--color-white);
  background-color: var(--color-primary-deep);
}
.signup-btn:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
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

/* Animasi buka hamburger jadi "X" */
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
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  padding: 1rem 0;
  z-index: 1001;
}

.mobile-menu a {
  margin: 0.5rem 0;
  color: var(--color-black);
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
  padding: 0.5rem 1rem;
  width: 80%;
  text-align: center;
}

.mobile-menu a:hover {
  color: var(--color-primary-dark);
}

.mobile-menu .signup-btn:hover {
  color: var(--color-white);
}

/* Button styles untuk mobile menu */
.mobile-menu .login-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 15px;
}

.mobile-menu .signup-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 15px;
  color: var(--color-white);
}

/* --- Animasi Transisi --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
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

  .nav-left h1 {
    font-size: 1.5rem;
  }
}
</style>
