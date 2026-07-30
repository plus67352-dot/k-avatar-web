import admin from 'firebase-admin';

// 1. Firebase 관리자 권한 초기화 (서버 구동 시 1회만)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 프론트엔드에서 보낸 결제 정보와 유저 ID를 받습니다.
  const { paymentKey, orderId, amount, acAmount, uid, appId } = req.body;

  if (!paymentKey || !orderId || !amount || !uid) {
    return res.status(400).json({ error: '필수 결제 정보가 누락되었습니다.' });
  }

  try {
    // 🚨 2. 토스 서버에 "이 결제가 진짜인지" 몰래 확인합니다.
    // 👇 아래 따옴표 안에 방금 복사하신 토스 시크릿 키(test_sk_...)를 붙여넣어 주세요!
    const tossSecretKey = 'test_sk_GePWvyJnrKJMDlgl5le1VgLzN97E'; 
    
    const encryptedSecretKey = Buffer.from(`${tossSecretKey}:`).toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) })
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error("Toss Verify Error:", errorData);
      return res.status(400).json({ error: '결제 검증에 실패했습니다. (Toss 차단)' });
    }

    // 3. 결제 검증이 완벽히 성공했으므로, Firebase Admin(관리자 권한)으로 코인을 안전하게 올려줍니다.
    // 관리자 권한이므로 앞서 설정한 '코인 차감만 허용' 보안 규칙을 무시하고 충전이 가능합니다.
    const db = admin.firestore();
    const userRef = db.doc(`artifacts/${appId}/users/${uid}/settings/profile`);
    
    await userRef.set({
      profile: { userCoins: admin.firestore.FieldValue.increment(Number(acAmount)) }
    }, { merge: true });

    return res.status(200).json({ success: true, message: '결제 및 충전이 완벽하게 완료되었습니다.' });

  } catch (error) {
    console.error("Payment Verification Fatal Error:", error);
    return res.status(500).json({ error: '서버 내부 오류로 결제 처리에 실패했습니다.' });
  }
}