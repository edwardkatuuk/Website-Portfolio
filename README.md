# Edward Katuuk Portfolio + VanoWorship

Jalankan perintah ini dari folder gabungan. Gunakan Node.js 22.12 atau lebih baru.

```powershell
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite. Portfolio ada di `/` dan halaman VanoWorship ada di `/vanoworship/`. Klik lanyard, lalu pilih **VanoWorship** untuk membukanya di tab yang sama.

```powershell
npm run build
npm run preview
```

Folder `dist/` memuat kedua halaman siap hosting untuk Vercel.

Untuk tautan download installer Windows (Google Drive, GitHub Releases, dll.), salin `.env.example` menjadi `.env.local` dan isi `VITE_DOWNLOAD_URL` dengan tautan direct download Anda. Pada dashboard Vercel, masukkan variabel `VITE_DOWNLOAD_URL` di menu **Settings > Environment Variables**. Tombol Download akan otomatis menampilkan dialog informasi jika tautan belum diisi.

Sumber Portfolio ada di `portfolio/` dan sumber VanoWorship ada di `vanoworship/`. Aset visual badge dan logo tersedia dalam format WebP yang dioptimalkan di folder `Assets/` masing-masing.
