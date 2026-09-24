const firebaseConfig = {
    apiKey: "AIzaSyBnQwSaTMi6j0fJTgBxCFj3UsclxvkHDxQ",
    authDomain: "barangay-animal-health-system.firebaseapp.com",
    projectId: "barangay-animal-health-system",
    storageBucket: "barangay-animal-health-system.firebasestorage.app",
    messagingSenderId: "327500945136",
    appId: "1:327500945136:web:4fc476dffc0a503e319435",
    measurementId: "G-D3R48BDJGZ"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();