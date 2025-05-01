// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
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

// Check if app has been initialized
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with React Native persistence
  if (Platform.OS !== 'web') {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } else {
    auth = getAuth(app);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };
