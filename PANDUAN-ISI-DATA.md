# Panduan Mengisi Data ke Firestore

## 📝 Cara Manual via Firebase Console

### 1. Buat Collection `countries`

1. Buka Firebase Console → Firestore Database
2. Klik **"Start collection"**
3. Collection ID: `countries`
4. Klik **"Next"**

### 2. Tambah Document Country - Japan

**Document ID:** `japan` (atau auto-ID)

**Fields:**
- `nama` (string): `Japan`
- `deskripsi_singkat` (string): `Negara matahari terbit dengan perpaduan sempurna antara tradisi kuno dan teknologi modern`
- `url_gambar_utama` (string): `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf`
- `benua` (string): `Asia`

Klik **"Save"**

### 3. Tambah Sub-Collection `places` di Japan

1. Klik document `japan` yang baru dibuat
2. Klik tab **"Start collection"** (di dalam document)
3. Collection ID: `places`
4. Klik **"Next"**

### 4. Tambah Document Place - Tokyo Tower

**Document ID:** `tokyo-tower` (atau auto-ID)

**Fields:**
- `nama` (string): `Tokyo Tower`
- `deskripsi_lengkap` (string): `Menara ikonik setinggi 333 meter yang menjadi simbol Tokyo. Dibangun pada tahun 1958, menara ini menawarkan pemandangan spektakuler kota Tokyo dari dua observation deck.`
- `url_gambar_utama` (string): `https://images.unsplash.com/photo-1513407030348-c983a97b98d8`
- `rating` (number): `4.5`
- `kategori` (string): `landmark`
- `lokasi` (geopoint): 
  - Latitude: `35.6586`
  - Longitude: `139.7454`
- `gallery_gambar` (array): 
  - [0] (string): `https://images.unsplash.com/photo-1513407030348-c983a97b98d8`
  - [1] (string): `https://images.unsplash.com/photo-1536098561742-ca998e48cbcc`

Klik **"Save"**

### 5. Tambah Sub-Collection `activities` di Tokyo Tower

1. Klik document `tokyo-tower` yang baru dibuat
2. Klik tab **"Start collection"**
3. Collection ID: `activities`
4. Klik **"Next"**

### 6. Tambah Document Activity

**Document ID:** auto-ID

**Fields:**
- `nama` (string): `Naik ke Main Observatory`
- `deskripsi` (string): `Menikmati pemandangan Tokyo dari ketinggian 150 meter dengan lantai kaca yang mendebarkan`
- `url_gambar` (string): `https://images.unsplash.com/photo-1513407030348-c983a97b98d8`
- `kategori` (string): `Petualangan`
- `perkiraan_harga` (string): `¥1,200`
- `jam_buka` (string): `09:00 - 23:00`
- `order` (number): `1`

Klik **"Save"**

---

## 🚀 Cara Cepat: Import via Script (Opsional)

Jika Anda ingin mengisi banyak data sekaligus, bisa menggunakan Firebase Admin SDK dengan Node.js:

### 1. Install Dependencies

```bash
npm init -y
npm install firebase-admin
```

### 2. Download Service Account Key

1. Firebase Console → Project Settings → Service Accounts
2. Klik **"Generate new private key"**
3. Simpan file JSON di folder project (jangan commit ke git!)

### 3. Buat Script Import (import-data.js)

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const sampleData = require('./sample-data.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  try {
    // Import countries
    for (const country of sampleData.countries) {
      const countryRef = db.collection('countries').doc(country.id);
      await countryRef.set({
        nama: country.nama,
        deskripsi_singkat: country.deskripsi_singkat,
        url_gambar_utama: country.url_gambar_utama,
        benua: country.benua
      });
      console.log(`✅ Country ${country.nama} imported`);

      // Import places for this country
      if (sampleData.places[country.id]) {
        for (const place of sampleData.places[country.id]) {
          const placeRef = countryRef.collection('places').doc(place.id);
          await placeRef.set({
            nama: place.nama,
            deskripsi_lengkap: place.deskripsi_lengkap,
            url_gambar_utama: place.url_gambar_utama,
            rating: place.rating,
            kategori: place.kategori,
            lokasi: new admin.firestore.GeoPoint(
              place.lokasi.latitude, 
              place.lokasi.longitude
            ),
            gallery_gambar: place.gallery_gambar || []
          });
          console.log(`  ✅ Place ${place.nama} imported`);

          // Import activities for this place
          if (sampleData.activities[place.id]) {
            for (const activity of sampleData.activities[place.id]) {
              await placeRef.collection('activities').add({
                nama: activity.nama,
                deskripsi: activity.deskripsi,
                url_gambar: activity.url_gambar,
                kategori: activity.kategori,
                perkiraan_harga: activity.perkiraan_harga,
                jam_buka: activity.jam_buka,
                order: activity.order
              });
            }
            console.log(`    ✅ Activities for ${place.nama} imported`);
          }
        }
      }
    }
    
    console.log('\n🎉 All data imported successfully!');
  } catch (error) {
    console.error('❌ Error importing data:', error);
  }
}

importData();
```

### 4. Jalankan Script

```bash
node import-data.js
```

---

## 📋 Checklist Data Minimum

Untuk testing aplikasi, minimal isi:

- ✅ 1 Country (Japan)
- ✅ 2 Places (Tokyo Tower, Akihabara)
- ✅ 2-3 Activities untuk Tokyo Tower

Setelah itu aplikasi sudah bisa dijalankan!

---

## 🔍 Verifikasi Data

Setelah mengisi data, cek di Firestore Console:

```
countries
└── japan
    └── places
        ├── tokyo-tower
        │   └── activities
        │       ├── activity-1
        │       ├── activity-2
        └── akihabara
```

---

## 💡 Tips

1. **Gunakan URL gambar dari Unsplash** untuk gambar berkualitas tinggi gratis
2. **Geopoint** harus format: `new admin.firestore.GeoPoint(lat, lng)`
3. **Rating** harus number (0-5), bukan string
4. **Order** di activities untuk mengurutkan tampilan
5. Jangan lupa **publish Firestore Rules** agar data bisa dibaca

---

**Selamat mencoba! 🚀**
