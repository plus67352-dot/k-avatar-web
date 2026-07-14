// src/auth-service.js
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase-config";

/**
 * 구글 로그인만 독립적으로 실행하는 함수
 */
export const loginWithGoogle = async () => {
  try {
    // 1. 구글 로그인 팝업 실행
    const result = await signInWithPopup(auth, googleProvider);
    
    // 2. 로그인 성공 시 사용자 정보 콘솔 출력 (확인용)
    const user = result.user;
    console.log("-------------------------------");
    console.log("✅ 구글 인증 성공!");
    console.log("사용자 이름:", user.displayName);
    console.log("사용자 이메일:", user.email);
    console.log("UID:", user.uid);
    console.log("-------------------------------");

    alert(`${user.displayName}님, 로그인이 확인되었습니다.`);
    return user;
  } catch (error) {
    // 에러 발생 시 출력
    console.error("❌ 로그인 실패 에러:", error.code, error.message);
    alert("로그인에 실패했습니다. 콘솔을 확인하세요.");
  }
};