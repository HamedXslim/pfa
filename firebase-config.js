// Special Firebase configuration for React Native with Hermes
import { initializeApp } from '@firebase/app';
import { getAuth, connectAuthEmulator } from '@firebase/auth';
import { getFirestore, connectFirestoreEmulator } from '@firebase/firestore';
import { getStorage, connectStorageEmulator } from '@firebase/storage';

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

// Initialize Auth
const auth = getAuth();

// Initialize Firestore
const db = getFirestore();

// Initialize Storage
const storage = getStorage();

export { app, auth, db, storage };
