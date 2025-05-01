// Special Firebase configuration for React Native with Hermes
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

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

if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { firebase, app, auth, db, storage };
