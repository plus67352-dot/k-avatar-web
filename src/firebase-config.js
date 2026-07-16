import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 새 프로젝트 K-avatar 키값
const firebaseConfig = {
  apiKey: "AIzaSyDlXMqfI-ayMW8V3HRyF03BfjHuvXRtWbk",
  authDomain: "k-avatar.firebaseapp.com",
  projectId: "k-avatar",
  storageBucket: "k-avatar.firebasestorage.app",
  messagingSenderId: "18276956342",
  appId: "1:18276956342:web:881cfb73f1ec32fb9c0e17",
  measurementId: "G-HK140RMSCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🚨 제가 빼먹었던 구글 로그인 제공자 부품 추가!
export const googleProvider = new GoogleAuthProvider();