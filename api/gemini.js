export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🚨 1단계: 프론트엔드에서 보낸 파이어베이스 인증 토큰(JWT) 가로채기
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: 입장권(Token)이 없습니다. 접근이 거부되었습니다.' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  // Vercel 환경변수에서 구글 로그인용 파이어베이스 키를 가져옵니다. 
  // (이미 설정되어 있는 VITE_FIREBASE_API_KEY를 재활용합니다.)
  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY; 

  if (!firebaseApiKey) {
     return res.status(500).json({ error: 'Server Auth Configuration Error: 서버 키가 설정되지 않았습니다.' });
  }

  try {
    // 🚨 2단계: 구글(Firebase) 공식 보안 서버에 토큰 위조 여부 검사 의뢰
    // firebase-admin 무거운 패키지 설치 없이 REST API로 가장 빠르고 확실하게 검증합니다.
    const verifyResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });

    if (!verifyResponse.ok) {
       return res.status(401).json({ error: 'Unauthorized: 유효하지 않거나 만료된 입장권입니다. 해커의 접근을 차단합니다.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication server connection error: 인증 서버 통신 오류' });
  }

  // 🚨 3단계: 위조 검사를 무사히 통과한 '정상적인 앱 사용자'의 요청만 아래 로직으로 Gemini API를 호출해줍니다.
  try {
    const { payload, engineConfig } = req.body;
    
    // Vercel 환경 변수에 숨겨둔 Gemini API 키를 불러옵니다.
    const apiKey = process.env.VITE_AI_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing in server environment' });
    }

    const modelName = engineConfig?.model || "gemini-3.1-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // 구글 Gemini 서버로 요청 전달
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return res.status(response.status).json(errorData);
    }

    // 성공적인 답변을 React 프론트엔드로 전달
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}