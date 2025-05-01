// React Native compatible Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsQAQhNwNmQvMBJJDmAh4Nc9MxvGVl_hk",
  authDomain: "pfa2025-31274.firebaseapp.com",
  projectId: "pfa2025-31274",
  storageBucket: "pfa2025-31274.firebasestorage.app",
  messagingSenderId: "796560035128",
  appId: "1:796560035128:web:9383a720c5b73317b0c5cd",
  measurementId: "G-1J4JHN79JV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services - but don't export them directly
// This pattern helps avoid the "Component auth has not been registered yet" error
const _auth = getAuth(app);
const _firestore = getFirestore(app);
const _storage = getStorage(app);

// Export functions to get the services instead of the services directly
export const getFirebaseAuth = () => _auth;
export const getFirebaseFirestore = () => _firestore;
export const getFirebaseStorage = () => _storage;
export { app };
