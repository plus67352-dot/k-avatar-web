import { loginWithGoogle } from "./auth-service";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

window.testLogin = loginWithGoogle; // 브라우저 콘솔에서 testLogin()으로 실행 가능