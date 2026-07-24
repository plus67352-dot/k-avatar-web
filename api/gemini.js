export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload, engineConfig } = req.body;
    
    // 🚨 Vercel 환경 변수에 숨겨둔 Gemini API 키를 불러옵니다.
    // 절대 소스코드에 키를 하드코딩하지 마세요!
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