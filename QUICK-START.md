# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi Trip Advisor dalam 10 menit!

## ⚡ Langkah Cepat

### 1. Setup Firebase (5 menit)

1. **Buka** [Firebase Console](https://console.firebase.google.com/)
2. **Klik** "Add project" atau pilih project existing
3. **Aktifkan Firestore:**
   - Menu: Firestore Database → Create database
   - Mode: Production mode
   - Location: asia-southeast1 (Singapore) atau terdekat

### 2. Konfigurasi App (2 menit)

1. **Get Firebase Config:**
   - Firebase Console → Project Settings (⚙️)
   - Scroll ke "Your apps" → Web icon (</>)
   - Register app → Copy config

2. **Edit `firebase-config.js`:**
   ```javascript
   const firebaseConfig = {
       apiKey: "PASTE_YOUR_API_KEY",
       authDomain: "PASTE_YOUR_AUTH_DOMAIN",
       projectId: "PASTE_YOUR_PROJECT_ID",
       storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
       messagingSenderId: "PASTE_YOUR_SENDER_ID",
       appId: "PASTE_YOUR_APP_ID"
   };
   ```

### 3. Setup Firestore Rules (1 menit)

1. **Firestore Database → Rules**
2. **Copy-paste** dari file `firestore.rules`
3. **Klik** "Publish"

### 4. Isi Data Sample (2 menit)

**Cara Manual - Minimal Data:**

1. **Buat Collection:** `countries`
2. **Add Document:** 
   - Document ID: `japan`
   - Fields:
     ```
     nama: "Japan" (string)
     deskripsi_singkat: "Negara matahari terbit" (string)
     url_gambar_utama: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf" (string)
     benua: "Asia" (string)
     ```

3. **Di dalam document `japan`, buat Sub-collection:** `places`
4. **Add Document:**
   - Document ID: `tokyo-tower`
   - Fields:
     ```
     nama: "Tokyo Tower" (string)
     deskripsi_lengkap: "Menara ikonik Tokyo setinggi 333 meter" (string)
     url_gambar_utama: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8" (string)
     rating: 4.5 (number)
     kategori: "landmark" (string)
     lokasi: 35.6586, 139.7454 (geopoint)
     gallery_gambar: [] (array - kosong dulu)
     ```

5. **Di dalam document `tokyo-tower`, buat Sub-collection:** `activities`
6. **Add Document (auto-ID):**
   - Fields:
     ```
     nama: "Naik ke Observatory" (string)
     deskripsi: "Pemandangan Tokyo dari ketinggian 150m" (string)
     url_gambar: "" (string - kosong)
     kategori: "Petualangan" (string)
     perkiraan_harga: "¥1,200" (string)
     jam_buka: "09:00 - 23:00" (string)
     order: 1 (number)
     ```

**DONE!** Data minimal sudah siap.

### 5. Jalankan Aplikasi (30 detik)

**Opsi A: VS Code Live Server**
```
1. Install extension "Live Server"
2. Klik kanan index.html
3. "Open with Live Server"
```

**Opsi B: Python**
```bash
python -m http.server 8000
# Buka: http://localhost:8000
```

**Opsi C: Node.js**
```bash
npx http-server
```

---

## ✅ Checklist

- [ ] Firebase project dibuat
- [ ] Firestore Database aktif
- [ ] Config di `firebase-config.js` sudah diisi
- [ ] Firestore Rules sudah di-publish
- [ ] Minimal 1 country, 1 place, 1 activity sudah diisi
- [ ] Aplikasi berjalan di localhost
- [ ] Tab "Japan" muncul
- [ ] Card "Tokyo Tower" muncul
- [ ] Klik card → modal terbuka
- [ ] Activities muncul di modal

---

## 🐛 Troubleshooting Cepat

### Tidak ada data muncul?
1. Buka Browser Console (F12)
2. Cek error message
3. Pastikan Firebase config benar
4. Cek Firestore Rules sudah publish

### Error "Firebase is not defined"?
- Cek koneksi internet
- Reload halaman

### Gambar tidak muncul?
- Normal, placeholder akan muncul
- Gunakan URL Unsplash yang valid

---

## 📚 Next Steps

Setelah aplikasi berjalan:

1. **Tambah lebih banyak data** - lihat `sample-data.json`
2. **Tambah negara lain** - Indonesia, Singapore
3. **Test fitur favorite** - klik tombol "Add Fav."
4. **Test search** - cari "Tokyo"
5. **Deploy ke Firebase Hosting** - lihat README.md

---

## 🎯 URL Gambar Gratis (Unsplash)

Gunakan URL ini untuk testing:

**Japan:**
- Tokyo Tower: `https://images.unsplash.com/photo-1513407030348-c983a97b98d8`
- Shibuya: `https://images.unsplash.com/photo-1542051841857-5f90071e7989`
- Kyoto: `https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e`

**Indonesia:**
- Borobudur: `https://images.unsplash.com/photo-1596422846543-75c6fc197f07`
- Bali: `https://images.unsplash.com/photo-1537996194471-e657df975ab4`

**Singapore:**
- Marina Bay: `https://images.unsplash.com/photo-1525625293386-3f8f99389edd`
- Gardens: `https://images.unsplash.com/photo-1562992932-a7c035b9e1a8`

---

**Happy Coding! 🎉**

Butuh bantuan? Cek `README.md` atau `PANDUAN-ISI-DATA.md`
