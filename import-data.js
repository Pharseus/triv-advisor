const admin = require('firebase-admin');
const sampleData = require('./sample-data.json');

// Download service account key dari Firebase Console
// Project Settings → Service Accounts → Generate new private key
// Save as 'serviceAccountKey.json'
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  console.log('🚀 Importing data to Firestore...\n');

  try {
    for (const country of sampleData.countries) {
      console.log(`📍 ${country.nama}`);
      
      const countryRef = db.collection('countries').doc(country.id);
      await countryRef.set({
        nama: country.nama,
        deskripsi_singkat: country.deskripsi_singkat,
        url_gambar_utama: country.url_gambar_utama,
        benua: country.benua
      });

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
          console.log(`   ✅ ${place.nama}`);

          if (sampleData.activities[place.id]) {
            for (const activity of sampleData.activities[place.id]) {
              await placeRef.collection('activities').add({
                nama: activity.nama,
                deskripsi: activity.deskripsi,
                url_gambar: activity.url_gambar || '',
                kategori: activity.kategori,
                perkiraan_harga: activity.perkiraan_harga,
                jam_buka: activity.jam_buka,
                order: activity.order
              });
            }
          }
        }
      }
    }
    
    console.log('\n🎉 Import complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importData();