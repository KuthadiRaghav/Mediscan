import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ------------------------------------------------------------------
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// 1. Go to console.firebase.google.com
// 2. Create a project -> Add Web App
// 3. Copy the config object below
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Simple check to see if user has configured keys
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app;
let db: any;
let auth: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { db, auth };
export { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp, signInWithEmailAndPassword, signOut, onAuthStateChanged };