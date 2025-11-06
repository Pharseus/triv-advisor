// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYq35_kLwwLEnKy70SdDsUaOZhVCMcbgM",
    authDomain: "triv-advisor.firebaseapp.com",
    projectId: "triv-advisor",
    storageBucket: "triv-advisor.firebasestorage.app",
    messagingSenderId: "665581633257",
    appId: "1:665581633257:web:8c0e325f18b2fd91d87a78",
    measurementId: "G-V81X2154TS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other files
window.db = db;
