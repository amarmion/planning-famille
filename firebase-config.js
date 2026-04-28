// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYKeXpqIHzxvB8byZ-ujozhcrKRTpSibE",
  authDomain: "planning-famille-cda1a.firebaseapp.com",
  databaseURL: "https://planning-famille-cda1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "planning-famille-cda1a",
  storageBucket: "planning-famille-cda1a.firebasestorage.app",
  messagingSenderId: "720570302220",
  appId: "1:720570302220:web:d8e830783665b1ed2cd329",
  measurementId: "G-ZK8WGQW19G"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
