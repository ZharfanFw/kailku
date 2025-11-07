<script setup>
import HeaderPage from './HeaderPage.vue'
import FooterPage from './FooterPage.vue'
import UserProfil from '../pages/UserProfil.vue'
</script>

<template>
  <div class="layout">
    <HeaderPage />

    <main>
      <!-- <UserProfil /> -->
      <RouterView />
    </main>

    <FooterPage />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* biar footer selalu di bawah layar */
}

main {
  padding-top: 80px;
  flex: 1; /* isi tengah akan mengisi sisa ruang di antara header dan footer */
}
</style>
