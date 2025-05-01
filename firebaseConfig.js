import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

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
let app;
let auth;
let firestore;
let storage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  firestore = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, firestore, storage };
