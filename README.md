# kailku

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

<h1>🐟 KailKu – Website Pemesanan Tempat & Perlengkapan Memancing</h1>
KailKu adalah website berbasis Vue.js yang dirancang untuk mempermudah pengguna dalam booking tempat pemancingan serta membeli atau menyewa alat pancing di tempat yang telah dipilih.
Website ini juga dilengkapi dengan fitur akun pengguna, sistem pembayaran, informasi lomba, dan tips memancing agar pengalaman memancing menjadi lebih mudah dan menyenangkan.

<h2>🚀 Fitur Utama</h2>
<h3>1. Navigasi & Tampilan Awal</h3>

- Halaman utama (index 0) berfungsi sebagai pintu masuk ke seluruh halaman website.<br>
- Untuk kembali ke halaman utama, pengguna cukup menekan logo "KailKu" yang terdapat di bagian header.<br>
- Tampilan awal menampilkan navigasi utama menuju berbagai halaman dan fitur yang tersedia di dalam aplikasi.<br>

<h2>🧭 Struktur Halaman (Indeks)</h2>
<h3>🏠 Indeks 0 – Halaman Depan</h3>

- Berisi nama dan kelompok pengembang website.<br>
- Menjadi halaman utama yang menavigasi pengguna ke seluruh bagian website.<br>

<h3>🌊 Indeks 1 – Landing Page</h3>

- Merupakan tampilan awal website bagi pengguna baru.<br>
- Terdapat search bar untuk mencari tempat pemancingan berdasarkan nama atau lokasi.<br>
- Saat pengguna scroll ke bawah, akan muncul beberapa tempat pemancingan.<br>
- Tombol “Lihat Selengkapnya” berfungsi untuk menampilkan daftar tempat pemancingan lebih banyak.<br>
- Scroll lebih lanjut akan menampilkan:<br>
  - Tips & Trik Memancing<br>
  - Informasi Lomba Memancing Terbaru<br>

<h3>🧾 Indeks 2 – Sign Up</h3>

- Halaman untuk membuat akun baru.<br>
- Pengguna mengisi data seperti nama, email, dan password<br>
- Setelah registrasi, akun dapat digunakan untuk login dan melakukan aktivitas lainnya.<br>

<h3>🔐 Indeks 3 – Login</h3>

- Halaman untuk masuk ke akun yang sudah terdaftar sebelumnya.<br>
- Setelah login berhasil, pengguna diarahkan ke halaman utama atau ke halaman terakhir yang diakses.<br>

<h3>🎣 Indeks 4 – Daftar Tempat Pemancingan</h3>

- Menampilkan semua tempat pemancingan yang tersedia di sistem.<br>
- Dilengkapi fitur filter dan pencarian berdasarkan kategori, lokasi, atau harga.<br>
- Setiap kartu tempat pemancingan menampilkan nama, foto, dan rating singkat.<br>

<h3>📍 Indeks 5 – Detail Tempat Pemancingan</h3>

- Menampilkan deskripsi lengkap tempat pemancingan yang dipilih.<br>
- Dilengkapi informasi seperti:<br>
  - Fasilitas tempat<br>
  - Lokasi (dengan peta)<br>
  - Ulasan / review pengguna lain<br>
- Memberi opsi untuk melanjutkan ke proses booking tempat.<br>

<h3>🪑 Indeks 6 – Booking Tempat</h3>

- Menampilkan layout kursi atau spot memancing yang tersedia.<br>
- Pengguna dapat memilih:<br>
  - Jumlah orang yang akan ikut memancing<br>
  - Waktu dan durasi booking<br>
- Sistem memungkinkan lebih dari satu orang untuk satu kali booking (multi-seat booking).<br>

<h3>🛒 Indeks 7 – Cart / Keranjang</h3>

- Menampilkan daftar barang atau alat pancing yang dijual atau disewakan dari tempat yang dipilih.<br>
- Pengguna dapat:<br>
  - Menambah ke keranjang (beli/sewa)<br>
  - Menghapus item<br>
- Fitur ini opsional, pengguna dapat lanjut tanpa membeli apapun jika hanya ingin memancing.<br>

<h3>💰 Indeks 8 – Rincian Biaya</h3>

- Menampilkan ringkasan total biaya, meliputi:<br>
  - Biaya booking tempat<br>
  - Biaya alat pancing (jika ada pembelian/sewa)<br>
- Digunakan sebagai tahap review sebelum ke pembayaran.<br>

<h3>💳 Indeks 9 – Metode Pembayaran</h3>

- Menampilkan berbagai opsi metode pembayaran:<br>
  - Transfer Bank<br>
  - E-Wallet<br>
  - Pembayaran langsung di tempat<br>
- Setelah memilih metode, pengguna diarahkan untuk konfirmasi pembayaran.<br>

<h3>👤 Indeks 10 – Profil Akun</h3>

- Menampilkan data akun pengguna yang sudah login.<br>
- Fitur yang tersedia:<br>
  - Edit profil (nama, foto, email)<br>
