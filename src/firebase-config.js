import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🚨 이전 프로젝트의 정지된 키를 지우고, k-avatar 새 프로젝트 키로 교체했습니다.
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