// THIS CODE IS TAKEN FROM FIREBASE CONFIGURATION ON FIRBASE.COM
// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIj5LB4wgDQMVcqmwVL8OE-bA2iXseWrw",
  authDomain: "skillhub-3b843.firebaseapp.com",
  projectId: "skillhub-3b843",
  storageBucket: "skillhub-3b843.firebasestorage.app",
  messagingSenderId: "872579226954",
  appId: "1:872579226954:web:412ff577208220b48275b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);