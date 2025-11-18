<template>
  <footer id="footer">
    <div class="line"></div>

    <div class="footer-content">
      <div class="footer-left">
        <p>© KailKu 2025</p>
        <a href="">Privacy Policy</a>
        <a href="">Terms & Condition</a>
      </div>

      <div class="footer-right">
        <p>Made by KailKu</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
/* --- Desktop --- */
#footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  background: var(--color-white);
  color: var(--color-primary-deep);
  margin: 1rem 2rem;
}

.line {
  height: 1px;
  width: 98%;
  background: var(--color-primary-deep);
  margin-bottom: 1rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.footer-left p,
.footer-left a {
  margin: 0.5rem 1rem;
  text-decoration: none;
  color: var(--color-primary-deep);
  transition: color 0.3s;
}

.footer-left a:hover {
  color: var(--color-primary-dark);
}

.footer-right p {
  margin: 0.5rem 1rem;
}

/* --- Mobile --- */
@media (max-width: 768px) {
  #footer {
    font-size: 1rem; /* Font lebih kecil */
    margin: 0.5rem 1rem;
  }

  .footer-left p,
  .footer-left a,
  .footer-right p {
    margin: 0.3rem 0.5rem; /* Sedikit dikompak */
  }

  .footer-content {
    flex-wrap: wrap; /* Biar kalau kepanjangan, otomatis turun ke baris baru */
    gap: 0.3rem;
  }

  .line {
    width: 95%;
  }
}
</style>

