# Trip Advisor - Travel Destination Web App

Aplikasi web Trip Advisor yang dibuat dengan HTML, CSS, dan JavaScript murni, terhubung dengan Firebase Firestore untuk database.

## 📋 Fitur

- ✅ Multi-negara filtering (tabs)
- ✅ Search functionality
- ✅ Favorite system (localStorage)
- ✅ Rating system
- ✅ Detail modal dengan aktivitas
- ✅ Rekomendasi lokasi serupa
- ✅ Responsive design
- ✅ Firebase Firestore integration

## 🗂️ Struktur Database Firestore

```
countries (collection)
└── {countryId} (document)
    ├── nama: string
    ├── deskripsi_singkat: string
    ├── url_gambar_utama: string
    ├── benua: string
    └── places (sub-collection)
        └── {placeId} (document)
            ├── nama: string
            ├── deskripsi_lengkap: string
            ├── url_gambar_utama: string
            ├── rating: number (0-5)
            ├── kategori: string
            ├── lokasi: geopoint
            ├── gallery_gambar: array
            └── activities (sub-collection)
                └── {activityId} (document)
                    ├── nama: string
                    ├── deskripsi: string
                    ├── url_gambar: string
                    ├── kategori: string
                    ├── perkiraan_harga: string
                    ├── jam_buka: string
                    ├── lokasi_spesifik: geopoint
                    └── order: number
```

## 🚀 Cara Setup

### 1. Setup Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** atau pilih project yang sudah ada
3. Aktifkan **Firestore Database**:
   - Klik **"Firestore Database"** di menu kiri
   - Klik **"Create database"**
   - Pilih **"Start in production mode"**
   - Pilih lokasi server (pilih yang terdekat)

### 2. Konfigurasi Firebase di Aplikasi

1. Di Firebase Console, klik ikon **Settings (⚙️)** > **Project settings**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **Web (<//>)** untuk menambahkan web app
4. Daftarkan app dengan nama (contoh: "Trip Advisor")
5. Copy konfigurasi Firebase yang diberikan
6. Buka file `firebase-config.js` dan ganti dengan konfigurasi Anda:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 3. Setup Firestore Security Rules

1. Di Firebase Console, buka **Firestore Database** > **Rules**
2. Copy isi dari file `firestore.rules` dan paste di editor
3. Klik **"Publish"**

### 4. Isi Data Sample ke Firestore

Buka **Firestore Database** di Firebase Console dan tambahkan data manual:

#### Contoh Data Country:
```
Collection: countries
Document ID: japan (auto-generate atau custom)

Fields:
- nama: "Japan"
- deskripsi_singkat: "Negara matahari terbit dengan budaya yang kaya"
- url_gambar_utama: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
- benua: "Asia"
```

#### Contoh Data Place (sub-collection dari country):
```
Collection: countries/japan/places
Document ID: tokyo-tower (auto-generate atau custom)

Fields:
- nama: "Tokyo Tower"
- deskripsi_lengkap: "Menara ikonik setinggi 333 meter yang menjadi simbol Tokyo..."
- url_gambar_utama: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8"
- rating: 4.5
- kategori: "landmark"
- lokasi: (geopoint) latitude: 35.6586, longitude: 139.7454
- gallery_gambar: ["url1.jpg", "url2.jpg"]
```

#### Contoh Data Activity (sub-collection dari place):
```
Collection: countries/japan/places/tokyo-tower/activities
Document ID: auto-generate

Fields:
- nama: "Naik ke Main Observatory"
- deskripsi: "Menikmati pemandangan Tokyo dari ketinggian 150 meter"
- url_gambar: "https://example.com/observatory.jpg"
- kategori: "Petualangan"
- perkiraan_harga: "¥1,200"
- jam_buka: "09:00 - 23:00"
- order: 1
```

### 5. Jalankan Aplikasi Secara Lokal

**Opsi 1: Menggunakan Live Server (VS Code)**
1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih **"Open with Live Server"**

**Opsi 2: Menggunakan Python**
```bash
# Python 3
python -m http.server 8000

# Buka browser: http://localhost:8000
```

**Opsi 3: Menggunakan Node.js**
```bash
npx http-server
```

### 6. Deploy ke Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login ke Firebase:
```bash
firebase login
```

3. Inisialisasi Firebase di folder project:
```bash
firebase init
```
   - Pilih **Hosting** dan **Firestore**
   - Pilih project yang sudah dibuat
   - Public directory: ketik `.` (titik)
   - Configure as single-page app: **Yes**
   - Overwrite files: **No**

4. Deploy ke Firebase:
```bash
firebase deploy
```

5. Aplikasi akan tersedia di: `https://your-project-id.web.app`

## 📁 Struktur File

```
trip/
├── index.html              # Halaman utama
├── style.css               # Styling
├── app.js                  # Logic aplikasi
├── firebase-config.js      # Konfigurasi Firebase
├── firebase.json           # Konfigurasi Firebase Hosting
├── firestore.rules         # Security rules Firestore
├── firestore.indexes.json  # Indexes Firestore
├── .gitignore             # Git ignore file
└── README.md              # Dokumentasi
```

## 🎨 Teknologi yang Digunakan

- **HTML5** - Struktur halaman
- **CSS3** - Styling dan responsive design
- **Vanilla JavaScript** - Logic dan interaktivity
- **Firebase Firestore** - Database NoSQL
- **Firebase Hosting** - Web hosting
- **Font Awesome** - Icons

## 📱 Responsive Design

Aplikasi ini sudah responsive dan dapat diakses dengan baik di:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔧 Troubleshooting

### Error: "Firebase is not defined"
- Pastikan Firebase SDK sudah di-load di `index.html`
- Cek koneksi internet

### Error: "Missing or insufficient permissions"
- Cek Firestore Security Rules sudah di-publish
- Pastikan rules mengizinkan read access

### Data tidak muncul
- Cek Firebase Console apakah data sudah ada
- Buka Browser Console (F12) untuk lihat error
- Pastikan struktur collection sesuai: `countries/{id}/places/{id}/activities`

### Gambar tidak muncul
- Pastikan URL gambar valid dan accessible
- Gunakan placeholder jika gambar error

## 📝 Catatan

- Favorite disimpan di **localStorage** browser (tidak perlu login)
- Data akan hilang jika clear browser data
- Untuk production, pertimbangkan menggunakan CDN untuk gambar
- Tambahkan loading state untuk UX yang lebih baik

## 🤝 Kontribusi

Silakan fork dan submit pull request untuk improvement!

## 📄 License

MIT License - bebas digunakan untuk project pribadi atau komersial.

---

**Dibuat dengan ❤️ menggunakan HTML, CSS, dan JavaScript**
