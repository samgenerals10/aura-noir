// Import the functions you need from the SDKs you need
// firebase/firebase.js
// Replace all VITE_FIREBASE_* values in your .env file with your actual Firebase project credentials.
// Get these from: Firebase Console → Project Settings → Your Apps → SDK setup and configuration
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyYl7NeRz1vjZoBzQ_82TbwipLiULHiLw",
  authDomain: "aura-noir-5fd5a.firebaseapp.com",
  projectId: "aura-noir-5fd5a",
  storageBucket: "aura-noir-5fd5a.firebasestorage.app",
  messagingSenderId: "105483430355",
  appId: "1:105483430355:web:1d7dd0271349b798aa2726",
  measurementId: "G-JTYSL8SWLT"
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);

export const functions = getFunctions(app);
export const db        = getFirestore(app);
export const auth      = getAuth(app);
// Uncomment this block when running `firebase emulators:start` locally
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;
