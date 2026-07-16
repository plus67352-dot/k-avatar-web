import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPMIStQ-khREz4_GVkVX3CKqkxUGZo5YM",
  authDomain: "k-avatar.firebaseapp.com",
  projectId: "k-avatar",
  storageBucket: "k-avatar.firebasestorage.app",
  messagingSenderId: "18276956342",
  appId: "1:18276956342:web:878c92e064b896299c0e17",
  measurementId: "G-BJ9TBREGBL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();