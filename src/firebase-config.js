// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 이 객체 내부의 값은 Firebase 콘솔의 '프로젝트 설정'에서 복사해 오세요.
const firebaseConfig = {
  apiKey: "AIzaSyDjczh0nB1jziDsoeHIdrGndbu5UBH9HHk",
  authDomain: "my-digital-twin-5561f.firebaseapp.com",
  projectId: "my-digital-twin-5561f",
  storageBucket: "my-digital-twin-5561f.firebasestorage.app",
  messagingSenderId: "456372825198",
  appId: "1:456372825198:web:510ae8c902427330894a7f",
  measurementId: "G-84G06KTVD3"
};

// 초기화
const app = initializeApp(firebaseConfig);

// 구글 로그인을 위한 변수 export
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();