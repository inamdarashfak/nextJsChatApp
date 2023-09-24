import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3An9tzqpXNxNf8phs8xQRLfiavm1N4eI",
  authDomain: "chat-app-2f174.firebaseapp.com",
  projectId: "chat-app-2f174",
  storageBucket: "chat-app-2f174.appspot.com",
  messagingSenderId: "627209734036",
  appId: "1:627209734036:web:8261b18d7c3f9737d4b181",
  measurementId: "G-4R9XFXLF3J",
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
