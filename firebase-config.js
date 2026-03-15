// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHZ4_PhE2gbJBDzipArubqJpHW88Alw5o",
  authDomain: "tournament-62f77.firebaseapp.com",
  databaseURL: "https://tournament-62f77-default-rtdb.firebaseio.com",
  projectId: "tournament-62f77",
  storageBucket: "tournament-62f77.firebasestorage.app",
  messagingSenderId: "59905181993",
  appId: "1:59905181993:web:8ad4f721ac50c09c478f38",
  measurementId: "G-QHHJ1BJWMP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;