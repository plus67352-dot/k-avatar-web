import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Brain, Settings, ArrowRight, Trash2, User, Layers, X, Upload, 
  Check, Search, ChevronRight, ChevronLeft, Users, Edit3, TrendingUp, Stethoscope, 
  LogOut, Sparkles, Zap, Flower2, Compass, Send, Trash, Volume2, Activity, RefreshCw, Share2,
  MessageSquare, MessageCircle, Copy, AtSign, Database as DatabaseIcon, Image as ImageIcon, AlignLeft, ExternalLink, Globe, Award, UserPlus, ShieldAlert, DollarSign, ShoppingCart, Calendar, Clock, BarChart3, TrendingDown, Flame, Crown, Microscope, ShieldCheck, Star, FileText, BookOpen, GraduationCap, ArrowUp, Loader2, Paperclip, ArrowLeft
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, addDoc, deleteDoc, query, where, getDocs, getDoc, writeBatch, increment, limit, orderBy
} from 'firebase/firestore';

import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup, signOut 
} from 'firebase/auth';

// ============================================================================
// 1. CONSTANTS LAYER
// ============================================================================
const APP_VERSION = "F77.11.58 (K-Avatar Edition)";

// 🚨 [보안 패치] Gemini API 키는 프론트엔드에서 완전히 제거되었습니다.
// 이제 백엔드(Vercel API)에서만 API 키를 안전하게 관리합니다.

// 👇 새로운 무명(임시) 구글 계정으로 만든 Firebase 프로젝트의 키값을 여기에 넣으세요!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'k-avatar-master-v1';


// ▼ 금칙어 리스트 및 검사 함수 ▼
const BANNED_WORDS = ['씨발', '개새끼', '미친', '병신', '지랄', '좆', '좃', '바보', '멍청이'];
const containsBannedWord = (text) => {
  if (!text) return false;
  return BANNED_WORDS.some(word => text.includes(word));
};

const NAME_MAP = {
  "빌 게이츠": "빌 게이츠", "일론 머스크": "일론 머스크", "래리 페이지": "래리 페이지", "젠슨 황": "젠슨 황", "마크 저커버그": "마크 저커버그", "제프 베이조스": "제프 베이조스",
  "도널드 트럼프": "도널드 트럼프", "이재명": "이재명", "시진핑": "시진핑", "블라디미르 푸틴": "블라디미르 푸틴", "다카이치 사나에": "다카이치 사나에", "빈 살만": "빈 살만",
  "싯다르타 무케르지": "싯다르타 무케르지", "제임스 앨리슨": "제임스 앨리슨", "칼 준": "칼 준", "앤드류 와일": "앤드류 와일", "마이클 그레거": "마이클 그레거", "마크 하이먼": "마크 하이먼",
  "워런 버핏": "워런 버핏", "레이 달리오": "레이 달리오", "마이클 버리": "마이클 버리", "나심 탈레브": "나심 탈레브", "손정의": "손정의", "피터 틸": "피터 틸",
  "성철스님": "성철스님", "프란치스코 교황": "프란치스코 교황", "달라이 라마": "달라이 라마", "스와미 비베카난다": "스와미 비베카난다", "C.S. 루이스": "C.S. 루이스", "루미": "루미",
  "한강": "한강", "유발 하라리": "유발 하라리", "테드 창": "테드 창", "무라카미 하루키": "무라카미 하루키", "스티븐 킹": "스티븐 킹", "알랭 드 보통": "알랭 드 보통"
};

const MASTER_IMAGE_MAP = {
  "빌 게이츠": "BILL_GATES.png", "일론 머스크": "ELON_MUSK.png", "래리 페이지": "LARRY_PAGE.png", "젠슨 황": "JENSEN_HUANG.png", "마크 저커버그": "MARK_ZUCKERBERG.png", "제프 베이조스": "JEFF_BEZOS.png",
  "도널드 트럼프": "DONALD_TRUMP.png", "이재명": "LEE_JAE_MYUNG.png", "시진핑": "XI_JINPING.png", "블라디미르 푸틴": "VLADIMIR_PUTIN.png", "다카이치 사나에": "SANAE_TAKAICHI.png", "빈 살만": "MBS.png",
  "싯다르타 무케르지": "MUKHERJEE.png", "제임스 앨리슨": "JAMES_ALLISON.png", "칼 준": "CARL_JUNE.png", "앤드류 와일": "ANDREW_WEIL.png", "마이클 그레거": "MICHAEL_GREGER.png", "마크 하이먼": "MARK_HYMAN.png",
  "워런 버핏": "WARREN_BUFFETT.png", "레이 달리오": "RAY_DALIO.png", "마이클 버리": "MICHAEL_BURRY.png", "나심 탈레브": "TALEB.png", "손정의": "MASAYOSHI_SON.png", "피터 틸": "PETER_THIEL.png",
  "성철스님": "SEONGCHEOL.png", "프란치스코 교황": "POPE_FRANCIS.png", "달라이 라마": "DALAI_LAMA.png", "스와미 비베카난다": "VIVEKANANDA.png", "C.S. 루이스": "CS_LEWIS.png", "루미": "RUMI.png",
  "한강": "HAN_KANG.png", "유발 하라리": "HARARI.png", "테드 창": "TED_CHIANG.png", "무라카미 하루키": "MURAKAMI.png", "스티븐 킹": "STEPHEN_KING.png", "알랭 드 보통": "DE_BOTTON.png"
};

const MASTER_CONFIG = [
  { name: "빌 게이츠", slot: 0, theme: "에너지 혁신" }, { name: "일론 머스크", slot: 0, theme: "제1원리 설계" }, 
  { name: "래리 페이지", slot: 0, theme: "문샷 사고" }, { name: "젠슨 황", slot: 0, theme: "가속 컴퓨팅" },
  { name: "마크 저커버그", slot: 0, theme: "오픈소스 연결" }, { name: "제프 베이조스", slot: 0, theme: "고객 집착" },
  { name: "도널드 트럼프", slot: 1, theme: "협상 레버리지" }, { name: "이재명", slot: 1, theme: "공정 성장" },
  { name: "시진핑", slot: 1, theme: "중국몽 전략" }, { name: "블라디미르 푸틴", slot: 1, theme: "지정학적 실전" },
  { name: "다카이치 사나에", slot: 1, theme: "경제 안보" }, { name: "빈 살만", slot: 1, theme: "비전 2030" },
  { name: "싯다르타 무케르지", slot: 2, theme: "생명 연대기" }, { name: "제임스 앨리슨", slot: 2, theme: "면역 해방" }, 
  { name: "칼 준", slot: 2, theme: "살아있는 약물" }, { name: "앤드류 와일", slot: 2, theme: "통합 치유" },
  { name: "마이클 그레거", slot: 2, theme: "영양 역전" }, { name: "마크 하이먼", slot: 2, theme: "근본 원인" },
  { name: "워런 버핏", slot: 3, theme: "가치 투자" }, { name: "레이 달리오", slot: 3, theme: "부채 사이클" }, 
  { name: "마이클 버리", slot: 3, theme: "데이터 역발상" }, { name: "나심 탈레브", slot: 3, theme: "안티프래질" }, 
  { name: "손정의", slot: 3, theme: "특이점 투자" }, { name: "피터 틸", slot: 3, theme: "창조적 독점" },
  { name: "성철스님", slot: 4, theme: "돈오돈수" }, { name: "프란치스코 교황", slot: 4, theme: "자비의 연대" }, 
  { name: "달라이 라마", slot: 4, theme: "마음의 평화" }, { name: "스와미 비베카난다", slot: 4, theme: "내면의 신성" }, 
  { name: "C.S. 루이스", slot: 4, theme: "지성적 변증" }, { name: "루미", slot: 4, theme: "영적 넥서스" },
  { name: "한강", slot: 5, theme: "삶의 연약함" }, { name: "유발 하라리", slot: 5, theme: "사피엔스 비전" }, 
  { name: "테드 창", slot: 5, theme: "기술 인문학" }, { name: "무라카미 하루키", slot: 5, theme: "상실과 치유" },
  { name: "스티븐 킹", slot: 5, theme: "서사의 마법" }, { name: "알랭 드 보통", slot: 5, theme: "일상의 철학" }
];

const CONSULTING_CATEGORIES = [
  { id: 'innovation', name: '산업 meta-DNA', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50', targetSlot: 0 },
  { id: 'president', name: '정치 meta-DNA', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50', targetSlot: 1 },
  { id: 'health', name: '건강 meta-DNA', icon: Stethoscope, color: 'text-rose-500', bg: 'bg-rose-50', targetSlot: 2 },
  { id: 'invest', name: '투자 meta-DNA', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', targetSlot: 3 },
  { id: 'religion', name: '종교 meta-DNA', icon: Flower2, color: 'text-purple-600', bg: 'bg-purple-50', targetSlot: 4 },
  { id: 'bestseller', name: '예술 meta-DNA', icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50', targetSlot: 5 },
  { id: 'subscribe', name: '구독 Avatar', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', targetSlot: 100 }
];

const RAINBOW_THEMES = [
  { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', dot: 'bg-red-400' },
  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-400' },
  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', dot: 'bg-yellow-400' },
  { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', dot: 'bg-green-400' },
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-400' },
  { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-400' },
  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', dot: 'bg-purple-400' }
];

const SUPER_MASTERS_AVAILABLE = MASTER_CONFIG.map(m => m.name);
const MASTER_SYSTEM_MASTERS = SUPER_MASTERS_AVAILABLE.flatMap((name, i) => [
  { 
    ownerUid: `system_super_${i}`, 
    userName: `${name} (Super)`, 
    userAlias: 'giant_super', 
    userIntro: `${name} 마스터의 45노드 풀 파워 지능 유전자 패키지입니다.`, 
    totalKP: 450, 
    nodeCount: 45, 
    category: 'system', 
    fees: { monthly: 50, daily: 5 } 
  },
  { 
    ownerUid: `system_ultra_${i}`, 
    userName: `${name} (Ultra)`, 
    userAlias: 'giant_ultra', 
    userIntro: `${name} 마스터의 90노드 궁극의 지능 유전자 패키지입니다.`, 
    totalKP: 900, 
    nodeCount: 90, 
    category: 'system_ultra', 
    fees: { monthly: 70, daily: 10 } 
  }
]);

// ============================================================================
// 2. LOGIC & SERVICES LAYER
// ============================================================================

const loadTossPayments = () => {
  return new Promise((resolve, reject) => {
    if (window.TossPayments) { resolve(window.TossPayments); return; }
    const script = document.createElement('script');
    script.src = "https://js.tosspayments.com/v1/payment";
    script.onload = () => resolve(window.TossPayments);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const formatters = {
  standardizeName: (name) => {
    if (!name) return "사용자";
    const raw = String(name).trim();
    const baseName = raw.replace(/\s*\((Star|Super|Hyper|Ultra)\)/i, '').trim();
    return NAME_MAP[baseName] || baseName;
  },
  getAvatarUrl: (name, customUrl) => {
    if (customUrl && String(customUrl).startsWith('http')) return customUrl;
    const sName = formatters.standardizeName(name);
    const fileName = MASTER_IMAGE_MAP[sName];
    if (fileName) return `/images/${fileName}`;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sName)}&backgroundColor=0277bd&textColor=ffffff`;
  },
  formatSlotName: (name) => {
    const s = String(name || "SLOT");
    if (s.includes("산업")) return { p1: "산업", p2: "mDNA" };
    if (s.includes("정치")) return { p1: "정치", p2: "mDNA" };
    if (s.includes("건강")) return { p1: "건강", p2: "mDNA" };
    if (s.includes("투자")) return { p1: "투자", p2: "mDNA" };
    if (s.includes("종교")) return { p1: "종교", p2: "mDNA" };
    if (s.includes("예술")) return { p1: "예술", p2: "mDNA" };
    if (s.includes("IDEA") || s.includes("LAB")) return { p1: "IDEA", p2: "LAB" };
    return { p1: s.substring(0, 4), p2: s.substring(4) || "SLOT" };
  },
  getRemainingTime: (adoptedAt, type) => {
    if (!adoptedAt) return "N/A";
    const now = Date.now();
    const limit = type === 'subscribe' ? (31 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
    const rem = limit - (now - adoptedAt);
    if (rem <= 0) return "00일 00:00";
    const d = Math.floor(rem / (24 * 60 * 60 * 1000));
    const h = Math.floor((rem % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const m = Math.floor((rem % (60 * 60 * 1000)) / (60 * 1000));
    return `${String(d).padStart(2, '0')}일 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
};

const FirebaseServices = {
  deleteRoomMessage: async (docId, userId) => {
    if (!userId) return false;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'roomMessages', docId));
      return true;
    } catch (e) { return false; }
  },
  
  callGeminiEngine: async (payload, engineConfig, retries = 5, delay = 1000) => {
    // 🚨 [수정됨] Firebase Cloud Functions 대신 Vercel 백엔드 API(/api/gemini)를 호출합니다.
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload, engineConfig })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 에러 상태 코드: ${response.status}`);
      }

      const data = await response.json();
      return data; 
    } catch (e) {
      if (retries > 0) { 
          await new Promise(res => setTimeout(res, delay)); 
          return FirebaseServices.callGeminiEngine(payload, engineConfig, retries - 1, delay * 2); 
      }
      throw new Error(`API Failure: ${e.message}`);
    }
  }
};

// ============================================================================
// 3. CUSTOM HOOKS LAYER
// ============================================================================

const useMasterDNA = () => {
  const [masterIntelSet, setMasterIntelSet] = useState({});
  
  useEffect(() => {
    const loadMasterDNA = async () => {
      try {
        if (window.location.protocol === 'blob:') return; 
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/최종36인_90노드.json?t=${cacheBuster}`).catch(() => null);
        if (response && response.ok) {
          try {
            const data = await response.json();
            setMasterIntelSet(data || {});
          } catch (parseError) {
            setMasterIntelSet({});
          }
        }
      } catch (error) {
        setMasterIntelSet({});
      }
    };
    loadMasterDNA();
  }, []);
  
  return masterIntelSet;
};

const useFirebaseSubscriptions = (user, viewMode, activeDomainIdx, targetLandingUid) => {
  const [profile, setProfile] = useState({ userName: '사용자', userCoins: 1000, userAlias: '', userIntro: '', userPhoto: '', answerCount: 0, chatFontSize: 10 }); 
  const [domains, setDomains] = useState([ 
    { name: '산업 meta-DNA', isSystem: true }, 
    { name: '정치 meta-DNA', isSystem: true }, 
    { name: '건강 meta-DNA', isSystem: true }, 
    { name: '투자 meta-DNA', isSystem: true }, 
    { name: '종교 meta-DNA', isSystem: true }, 
    { name: '예술 meta-DNA', isSystem: true }, 
    { name: 'IDEA LAB', isSystem: true }, 
    { name: 'MY AVATAR (Slot 8)', isSystem: false } 
  ]);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [messages, setMessages] = useState({}); 
  
  const [engineConfig, setEngineConfig] = useState({ model: "gemini-3.1-flash-lite", version: "v1beta" });

  const [currentAgenda, setCurrentAgenda] = useState('');
  const [myLandingQnA, setMyLandingQnA] = useState([]);
  const [subscribedAvatars, setSubscribedAvatars] = useState([]);
  const [registeredAvatars, setRegisteredAvatars] = useState([]);
  const [systemRevenue, setSystemRevenue] = useState({ avatar: 0, import: 0 });
  const [landingProfile, setLandingProfile] = useState(null);
  const [landingKnowledge, setLandingKnowledge] = useState([]);
  const [landingHistory, setLandingHistory] = useState([]);

  useEffect(() => {
    if (!user || viewMode !== 'landing' || !targetLandingUid) return;
    const profileUnsub = onSnapshot(doc(db, 'artifacts', appId, 'users', targetLandingUid, 'settings', 'profile'), (snap) => {
      if (snap.exists()) setLandingProfile(snap.data().profile);
    }, (error) => console.error("Landing profile error:", error));
    const knowUnsub = onSnapshot(collection(db, 'artifacts', appId, 'users', targetLandingUid, 'knowledge'), (snap) => {
      setLandingKnowledge(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Landing knowledge error:", error));
    const qnaUnsub = onSnapshot(collection(db, 'artifacts', appId, 'users', targetLandingUid, 'landingQnA'), (snap) => {
      setLandingHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, (error) => console.error("Landing QnA error:", error));
    return () => { profileUnsub(); knowUnsub(); qnaUnsub(); };
  }, [user, viewMode, targetLandingUid]);

  useEffect(() => {
    if (!user || viewMode === 'landing') return;
    
    const unsubP = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), (snap) => { 
        if (snap.exists()) { 
            const d = snap.data(); 
            if(d.profile) setProfile(prev => ({ ...prev, ...d.profile })); 
            if(d.domains) {
               const updatedDomains = [...d.domains];
               updatedDomains[0] = { ...updatedDomains[0], name: '산업 meta-DNA' };
               updatedDomains[1] = { ...updatedDomains[1], name: '정치 meta-DNA' };
               updatedDomains[2] = { ...updatedDomains[2], name: '건강 meta-DNA' };
               updatedDomains[3] = { ...updatedDomains[3], name: '투자 meta-DNA' };
               updatedDomains[4] = { ...updatedDomains[4], name: '종교 meta-DNA' };
               updatedDomains[5] = { ...updatedDomains[5], name: '예술 meta-DNA' };
               updatedDomains[6] = { ...updatedDomains[6], name: 'IDEA LAB' };
               setDomains(updatedDomains);
            } else {
               setDomains([
                 { name: '산업 meta-DNA', isSystem: true }, { name: '정치 meta-DNA', isSystem: true },
                 { name: '건강 meta-DNA', isSystem: true }, { name: '투자 meta-DNA', isSystem: true },
                 { name: '종교 meta-DNA', isSystem: true }, { name: '예술 meta-DNA', isSystem: true },
                 { name: 'IDEA LAB', isSystem: true }, { name: 'MY AVATAR (Slot 8)', isSystem: false }
               ]);
            }
            if(d.engineConfig) setEngineConfig(d.engineConfig); 
        } 
    }, (error) => console.error("Profile sync error:", error));
    const unsubKnowledge = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'knowledge'), (snap) => {
      setKnowledgeList(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, (error) => console.error("Knowledge sync error:", error));
    const unsubQnA = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'landingQnA'), (snap) => {
      setMyLandingQnA(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, (error) => console.error("QnA sync error:", error));
    const unsubSubs = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'subscriptions'), (snap) => {
      const list = []; const now = Date.now();
      snap.forEach(d => {
        const data = d.data(); const elapsed = now - (data.adoptedAt || 0);
        if ((data.adoptionType === 'rent' && elapsed > 24*60*60*1000) || (data.adoptionType === 'subscribe' && elapsed > 31*24*60*60*1000)) {
            deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'subscriptions', d.id));
        } else {
            list.push(data);
        }
      });
      setSubscribedAvatars(list);
    }, (error) => console.error("Subscriptions sync error:", error));
    const unsubMarket = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'registry'), (snap) => { 
        const list = []; 
        snap.forEach(d => { if (d.id !== user.uid) list.push({ id: d.id, ...d.data() }); }); 
        setRegisteredAvatars(list); 
    }, (error) => console.error("Market sync error:", error));
    const unsubRevenue = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'finance', 'revenue'), (snap) => {
      if (snap.exists()) setSystemRevenue(snap.data());
    }, (error) => console.error("Revenue sync error:", error));
    
    return () => { unsubP(); unsubKnowledge(); unsubQnA(); unsubSubs(); unsubMarket(); unsubRevenue(); };
  }, [user, viewMode]);

  useEffect(() => {
    if (!user || viewMode === 'landing') return;
    
    const unsubRooms = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'roomMessages'), (snap) => {
      const roomMsgs = {};
      snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0)).forEach(m => {
        const slot = m.slotIdx;
        if (!roomMsgs[slot]) roomMsgs[slot] = { board: [] };
        roomMsgs[slot].board.push(m);
        if (Number(slot) === Number(activeDomainIdx) && m.agenda) setCurrentAgenda(m.agenda);
      });
      setMessages(prev => ({ ...prev, ...roomMsgs }));
    }, (error) => console.error("Room messages sync error:", error));
    
    return () => { unsubRooms(); };
  }, [user, viewMode, activeDomainIdx]);

  return { profile, setProfile, domains, setDomains, knowledgeList, messages, setMessages, engineConfig, setEngineConfig, currentAgenda, setCurrentAgenda, myLandingQnA, subscribedAvatars, registeredAvatars, systemRevenue, landingProfile, landingKnowledge, landingHistory };
};

// ============================================================================
// 4. UI COMPONENTS LAYER 
// ============================================================================
const SharedStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    @keyframes progress-glow { 0% { transform: translateX(-150%); } 100% { transform: translateX(150%); } }
    .animate-progress-glow { animation: progress-glow 2.2s infinite ease-in-out; width: 60%; }
    .fade-enter { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .dot-pulse { animation: pulseDot 2s infinite; }
    @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
  `}</style>
);

const KnowledgePreviewCard = React.memo(({ k, viewMode, userId, getDisplayNodes, onDelete, onRead }) => {
  const [slotPage, setSlotPage] = useState(0);
  const nodes = getDisplayNodes(k.masterName);
  const totalUnits = nodes.length;
  const maxPage = Math.ceil(totalUnits / 15) - 1;
  const previewContent = String(k.content || "요약된 지능 데이터가 없습니다.").substring(0, 1500);

  const isAuto = k.source === "AUTO_CHAT_IMPRINT";
  
  const themeClasses = {
    cardBg: isAuto ? "bg-blue-50/50 border-blue-100 hover:border-blue-300 hover:bg-blue-50" : "bg-amber-50/50 border-amber-100 hover:border-amber-300 hover:bg-amber-50",
    iconBg: isAuto ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600",
    divider: isAuto ? "border-blue-200/50" : "border-amber-200/50",
    totalText: isAuto ? "text-blue-600" : "text-amber-600",
    navBg: isAuto ? "border-blue-100" : "border-amber-100",
    navBtn: isAuto ? "text-blue-400 hover:text-blue-600" : "text-amber-400 hover:text-amber-600",
    navPageText: isAuto ? "text-blue-500" : "text-amber-500",
    glow: isAuto ? "shadow-[0_0_5px_rgba(96,165,250,0.5)]" : "shadow-[0_0_5px_rgba(251,191,36,0.5)]"
  };

  return (
    <div 
      onClick={() => onRead && onRead(k)} 
      className={`${themeClasses.cardBg} p-6 rounded-[2.5rem] border transition-all shadow-sm group relative overflow-hidden flex flex-col h-full cursor-pointer hover:scale-[1.02]`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${themeClasses.iconBg}`}>
          <DatabaseIcon size={14}/>
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate flex-1">Genome ID: {String(k.hashtag || "#Nexus").replace('#', '')}</span>
        {viewMode === 'main' && (
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onRead(k); }} className="text-blue-500 hover:text-blue-700 transition-colors shrink-0 bg-blue-50 p-1.5 rounded-lg shadow-sm"><Search size={14}/></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(k.id); }} className="text-slate-200 hover:text-red-500 transition-colors shrink-0 p-1.5"><Trash2 size={14}/></button>
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6 line-clamp-3 h-[60px] overflow-hidden">{previewContent}</p>
      <div className={`mt-auto pt-4 border-t flex flex-col gap-3 ${themeClasses.divider}`}>
        <div className="flex justify-between items-center px-1">
          <span className={`text-[8px] font-black uppercase tracking-tight ${themeClasses.totalText}`}>Total {String(totalUnits)} Units</span>
          <div className={`flex items-center gap-2 bg-white/50 rounded-full px-1.5 py-0.5 border shadow-sm ${themeClasses.navBg}`}>
            <button onClick={(e) => { e.stopPropagation(); setSlotPage(p => Math.max(0, p - 1)); }} className={`transition-all ${themeClasses.navBtn} ${slotPage === 0 ? 'opacity-20 cursor-default' : ''}`}><ChevronLeft size={12}/></button>
            <span className={`text-[7px] font-bold ${themeClasses.navPageText}`}>{String(slotPage + 1)}</span>
            <button onClick={(e) => { e.stopPropagation(); setSlotPage(p => Math.min(maxPage, p + 1)); }} className={`transition-all ${themeClasses.navBtn} ${slotPage >= maxPage ? 'opacity-20 cursor-default' : ''}`}><ChevronRight size={12}/></button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 15 }).map((_, idx) => {
            const theme = RAINBOW_THEMES[idx % 7];
            const isFilled = (slotPage * 15 + idx) < totalUnits;
            return <div key={idx} className={`h-1.5 rounded-sm ${theme.dot} transition-all duration-500 ${isFilled ? `opacity-100 ${themeClasses.glow}` : 'opacity-10'}`}></div>;
          })}
        </div>
      </div>
    </div>
  );
});

const IntroView = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white font-sans text-center px-6 fade-enter w-full">
      <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-white/20">
        <Globe className="w-12 h-12 text-blue-400" />
      </div>
      <h1 className="text-4xl font-black mb-3 tracking-tighter">Human OS</h1>
      <p className="text-blue-200 text-sm mb-16 font-bold tracking-widest uppercase">Decentralized Intelligence Network</p>
      
      <div className="w-full max-w-sm space-y-4">
        <button onClick={() => onSelectMode('main')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 group">
          <Brain className="w-6 h-6 text-blue-200 group-hover:text-white" />
          Human OS (마스터 각인)
        </button>
        <button onClick={() => onSelectMode('b2b')} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-black text-lg py-5 px-6 rounded-2xl border border-white/10 flex items-center justify-center gap-3 transition-all active:scale-95 group">
          <Search className="w-6 h-6 text-amber-400" />
          명예의 전당 (Avatar 검색)
        </button>
      </div>
      <p className="absolute bottom-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest">© k-avatar.kr</p>
    </div>
  );
};

const B2BEnterpriseView = ({ user, engineConfig, onBackToIntro, getDisplayNodes, setDetailKnowledge }) => {
  const [b2bStep, setB2BStep] = useState('home');
  const [topAvatars, setTopAvatars] = useState([]);
  const [allAvatars, setAllAvatars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarNodes, setAvatarNodes] = useState([]);
  const [avatarQna, setAvatarQna] = useState([]);
  const [avatarTone, setAvatarTone] = useState('humorous'); 
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchTopAvatars = async () => {
      try {
        const registryRef = collection(db, 'artifacts', appId, 'public', 'data', 'registry');
        const snapshot = await getDocs(registryRef); 
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        const sortedList = list.sort((a,b) => (b.totalKP||0) - (a.totalKP||0));
        setAllAvatars(sortedList); 
        setTopAvatars(sortedList.slice(0, 10)); 
      } catch (e) { console.error("B2B Avatar fetch error", e); }
    };
    fetchTopAvatars();
  }, [user]);
  
  const displayAvatars = searchTerm.trim() 
    ? allAvatars.filter(av => av.userName.includes(searchTerm) || String(av.userIntro || "").includes(searchTerm))
    : topAvatars;
    
  const handleSelectAvatar = async (av) => {
    if (!user) return;
    setSelectedAvatar(av);
    setB2BStep('landing');
    setAvatarNodes([]);
    setAvatarQna([]);
    
    try {
        let nodes = [];
        if (av.ownerUid.startsWith('system_')) {
            nodes = getDisplayNodes(av.userName).map((n, idx) => ({ id: `sys_${idx}`, hashtag: n.hashtag, content: n.content, masterName: av.userName, source: 'SYSTEM_DNA' }));
        } else {
            const nodeSnap = await getDocs(collection(db, 'artifacts', appId, 'users', av.ownerUid, 'knowledge'));
            let fetchedNodes = [];
            nodeSnap.forEach(d => {
                if (Number(d.data().domainIdx) === 7) fetchedNodes.push({ id: d.id, ...d.data(), masterName: av.userName });
            });
            fetchedNodes.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
            nodes = fetchedNodes.slice(0, 45);
        }
        setAvatarNodes(nodes);

        const qnaSnap = await getDocs(collection(db, 'artifacts', appId, 'users', av.ownerUid, 'landingQnA'));
        const qnas = []; qnaSnap.forEach(d => qnas.push(d.data()));
        qnas.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
        setAvatarQna(qnas.slice(0, 20));

        setChatHistory([
           { role: 'assistant', text: `반갑습니다. ${av.userName}의 디지털 아바타입니다.<br><br>제 각인 데이터베이스를 바탕으로 질문에 답변해 드립니다.` }
        ]);
    } catch(e) { console.error("Data load error:", e); }
  };

  const handleB2BChatSubmit = async () => {
    if (!chatInput.trim() || !selectedAvatar || !user) return;

    if (containsBannedWord(chatInput)) {
        setChatHistory(prev => [...prev, { role: 'system', text: "욕설 및 비방의 질문은 받지 않습니다." }]);
        setChatInput('');
        return;
    }

    const text = chatInput;  
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
        const displayNodes = selectedAvatar?.ownerUid.startsWith('system_') 
          ? getDisplayNodes(selectedAvatar.userName).map((n, idx) => ({ id: `sys_${idx}`, hashtag: n.hashtag, content: n.content, masterName: selectedAvatar.userName, source: 'SYSTEM_DNA' }))
          : avatarNodes;
        
        const knowledgeText = displayNodes.map(n => n.content).join('\n\n');
        
        const toneInstruction = avatarTone === 'humorous'
          ? "매우 유쾌하고 재치 넘치는 유머러스한 톤으로, 친근한 반말과 이모지(😎,🚀 등)를 적극 사용하여 흥미롭게 답하라."
          : "매우 정중하고 전문적인 컨설턴트/비즈니스 톤으로, 격식 있는 존댓말(하십시오체)을 사용하여 신뢰감 있게 답하라.";

        const systemPrompt = `너는 '${selectedAvatar.userName}'의 디지털 아바타다. [어투 지시사항]: ${toneInstruction}\n아래 [각인지식]을 바탕으로 질문에 답변하라. 각인지식에 없는 내용은 모델 지능을 활용하되 자신의 지식인 것처럼 자연스럽게 답하라.\n[각인지식]\n${knowledgeText.substring(0, 15000)}`;

        const res = await FirebaseServices.callGeminiEngine({ 
            contents: [{ parts: [{ text: text }] }], 
            systemInstruction: { parts: [{ text: systemPrompt }] } 
        }, engineConfig);
        
        let rawReply = res.candidates?.[0]?.content?.parts?.[0]?.text || "응답 지연.";
        let htmlReply = rawReply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        setChatHistory(prev => [...prev, { role: 'assistant', text: htmlReply }]);
        
        const newTimestamp = Date.now();
        const qnaCol = collection(db, 'artifacts', appId, 'users', selectedAvatar.ownerUid, 'landingQnA');
        await addDoc(qnaCol, { question: text, answer: rawReply, timestamp: newTimestamp });
        
        await setDoc(doc(db, 'artifacts', appId, 'users', selectedAvatar.ownerUid, 'settings', 'profile'), { profile: { answerCount: increment(1) } }, { merge: true });

        setAvatarQna(prev => [{ question: text, answer: rawReply, timestamp: newTimestamp }, ...prev].slice(0, 20));
    } catch(e) {
        setChatHistory(prev => [...prev, { role: 'system', text: `네트워크 오류가 발생했습니다: ${e.message}` }]);
    } finally {
        setIsTyping(false);
    }
  };

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isTyping, b2bStep]);

  let displayNodes = selectedAvatar?.ownerUid.startsWith('system_') 
    ? getDisplayNodes(selectedAvatar.userName).map((n, idx) => ({ id: `sys_${idx}`, hashtag: n.hashtag, content: n.content, masterName: selectedAvatar.userName, source: 'SYSTEM_DNA' }))
    : avatarNodes;

  if (selectedAvatar && selectedAvatar.userName.includes('(Super)') && displayNodes.length === 15) {
      displayNodes = [
          ...displayNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Core'})),
          ...displayNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Adv', content: String(c.content) + ' (심화 적용 및 확장 추론)' })),
          ...displayNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Pro', content: String(c.content) + ' (통합적 문제 해결 및 전략)' }))
      ];
  }

  return (
    <div className="bg-slate-200 font-sans text-slate-900 flex items-center justify-center min-h-screen md:py-10 w-full overflow-x-hidden">
      <div className="w-full max-w-[400px] h-[100dvh] max-h-[800px] md:rounded-[3rem] md:border-[12px] md:border-slate-800 bg-white relative overflow-hidden shadow-2xl flex flex-col mx-auto">
        
        {b2bStep === 'home' && (
          <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 via-blue-900 to-slate-900 text-white relative z-10">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBackToIntro(); }} className="absolute top-4 left-4 z-[100] p-3 text-white/50 hover:text-white cursor-pointer bg-white/10 rounded-full hover:bg-white/20 transition-all"><ArrowLeft size={24}/></button>
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center fade-enter">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                      <Award className="w-10 h-10 text-amber-400" />
                  </div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">명예의 전당</h1>
                  <p className="text-blue-200 text-sm mb-12 font-bold tracking-widest uppercase">Human OS 지식 gateway</p>
                  
                  <button onClick={() => setB2BStep('search')} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black text-lg py-5 px-6 rounded-2xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] flex items-center justify-center gap-3 transition-all active:scale-95 group">
                      <Search className="w-6 h-6 text-white group-hover:animate-bounce" />
                      명예의 전당 AI 아바타 찾기
                  </button>
              </div>
              <div className="p-6 text-center shrink-0 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Powered by k-avatar.kr</span>
              </div>
          </div>
        )}

        {b2bStep === 'search' && (
          <div className="flex flex-col h-full bg-white z-20">
              <div className="bg-blue-900 p-4 pt-10 sm:pt-6 pb-6 text-white shrink-0 shadow-md relative">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBackToIntro(); }} className="absolute top-4 left-4 z-[100] p-3 text-white/50 hover:text-white cursor-pointer bg-white/10 rounded-full hover:bg-white/20 transition-all">
                      <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-4 mt-8 justify-center">
                      <h2 className="text-lg font-black tracking-tighter">AI 아바타 디렉토리</h2>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 focus-within:bg-white focus-within:text-slate-900 transition-all">
                      <Search className="w-5 h-5 opacity-70 ml-1" />
                      <input type="text" 
                             value={searchTerm} 
                             onChange={(e) => setSearchTerm(e.target.value)}
                             placeholder="이름 또는 전문분야 검색..." className="bg-transparent border-none outline-none px-3 text-sm font-bold w-full placeholder-slate-300 focus:placeholder-slate-400" />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 fade-enter custom-scrollbar">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Total {topAvatars.length} Avatars (Real Data)</p>
                  <div className="space-y-3">
                      {displayAvatars.map(av => (
                        <button key={av.ownerUid} onClick={() => handleSelectAvatar(av)} className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all text-left group hover:border-blue-300 hover:shadow-md">
                            <div className="relative shrink-0">
                                <img src={formatters.getAvatarUrl(av.userName, av.userPhoto)} className="w-14 h-14 rounded-full border-2 border-slate-100 group-hover:border-blue-200 object-cover" alt="av" />
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-black text-slate-900 text-base truncate">{av.userName}</h3>
                                <p className="text-xs text-blue-600 font-bold mt-0.5 truncate">{av.userIntro || "디지털 트윈 아바타"}</p>
                                <span className="inline-block mt-2 text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">{Number(av.totalKP||0).toLocaleString()} KP</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                        </button>
                      ))}
                  </div>
              </div>
          </div>
        )}

        {b2bStep === 'landing' && selectedAvatar && (
          <div className="flex flex-col h-full bg-white z-30 overflow-y-auto relative custom-scrollbar">
              <div className="bg-white/80 backdrop-blur-md text-slate-900 p-4 pt-10 sm:pt-4 flex items-center justify-between shrink-0 border-b border-slate-100 sticky top-0 z-40">
                  <button onClick={() => setB2BStep('search')} className="p-1 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft size={24} className="text-slate-600" /></button>
                  <div className="flex items-center gap-1.5 text-blue-600"><Globe size={16} /><span className="text-[10px] font-black tracking-tighter">k-avatar.kr</span></div>
                  <button className="p-1 rounded-full hover:bg-slate-100 transition-colors"><Share2 size={20} className="text-slate-400" /></button>
              </div>

              <div className="px-6 py-10 shrink-0 flex flex-col items-center text-center fade-enter relative overflow-hidden">
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(227,242,253,0.5)_0%,rgba(255,255,255,1)_100%)]"></div>
                  <div className="relative mb-4 cursor-pointer" onClick={() => setB2BStep('chat')}>
                      <img src={formatters.getAvatarUrl(selectedAvatar.userName, selectedAvatar.userPhoto)} className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white" alt="av" />
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-lg"><Zap size={16} className="fill-current" /></div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-3">
                      <Award size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-blue-700 tracking-tight">{Number(selectedAvatar.totalKP||0).toLocaleString()} KP</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{selectedAvatar.userName}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">명예의 전당 특별 멘토</p>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed px-2">{selectedAvatar.userIntro || "Human OS에 각인된 전문 지식 아바타입니다."}</p>
                  <button onClick={() => setB2BStep('chat')} className="mt-8 w-full bg-slate-900 text-white font-black text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                      <MessageCircle size={20} /> ASK TO AVATAR
                  </button>
              </div>

              <div className="px-6 py-8 border-t border-slate-100 bg-slate-50">
                  <div className="flex flex-col mb-5 border-l-4 border-blue-600 pl-3">
                      <h3 className="text-lg font-black tracking-tighter uppercase text-slate-900">My Avatar Grid Flow</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">논문/보고서/강의노트/특허/KnowHow/recipe 기반 추출 지능 노드(meta-DNA)</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                      {displayNodes.filter(n => n.source === 'DOC_IMPORT' || n.source === 'SYSTEM_DNA').length > 0 ? displayNodes.filter(n => n.source === 'DOC_IMPORT' || n.source === 'SYSTEM_DNA').map((n, i) => (
                          <KnowledgePreviewCard 
                              key={n.id || i} 
                              k={n} 
                              viewMode="b2b" 
                              getDisplayNodes={getDisplayNodes} 
                              onRead={setDetailKnowledge} 
                          />
                      )) : <div className="col-span-full p-6 text-center text-slate-400 font-bold text-xs border-2 border-dashed rounded-2xl">문서로 각인된 핵심 지능 노드만 표시됩니다.</div>}
                  </div>
              </div>

              <div className="px-6 py-8 border-t border-slate-100 bg-white">
                  <div className="flex flex-col mb-6 border-l-4 border-slate-900 pl-3">
                      <h3 className="text-lg font-black tracking-tighter uppercase text-slate-900">Recent Conversations</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">최근 공개된 대화 기록 20건</p>
                  </div>
                  <div className="space-y-5">
                      {avatarQna.length > 0 ? avatarQna.map((qna, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm fade-enter" style={{animationDelay: `${i*0.05}s`}}>
                            <div className="flex gap-2 mb-3"><MessageSquare size={16} className="text-blue-600 shrink-0 mt-0.5" /><p className="text-sm font-bold text-slate-800 leading-snug">{qna.question}</p></div>
                            <div className="flex gap-2 pt-3 border-t border-slate-200/50"><Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" /><p className="text-[13px] font-bold text-slate-600 leading-relaxed italic">{qna.answer}</p></div>
                        </div>
                      )) : <div className="p-6 text-center text-slate-400 font-bold text-xs border-2 border-dashed rounded-2xl">공개된 대화가 없습니다.</div>}
                  </div>
              </div>
              <footer className="py-10 bg-slate-100 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© k-avatar.kr Framework</p></footer>
          </div>
        )}

        {b2bStep === 'chat' && selectedAvatar && (
          <div className="fixed inset-0 mx-auto w-full max-w-[400px] flex flex-col bg-[#f8fafc] z-[50000] slide-up">
              <div className="bg-white/90 backdrop-blur-md text-slate-900 p-4 pt-10 sm:pt-4 flex items-center justify-between shrink-0 shadow-sm border-b border-slate-200 z-20">
                  <div className="flex items-center gap-3">
                      <img src={formatters.getAvatarUrl(selectedAvatar.userName, selectedAvatar.userPhoto)} className="w-10 h-10 rounded-full shadow-sm border border-slate-100 object-cover" alt="av" />
                      <div>
                          <h3 className="text-sm font-black text-slate-900">{selectedAvatar.userName}</h3>
                          <div className="flex items-center gap-1.5">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Synchronized</span>
                             <button onClick={() => setAvatarTone(prev => prev === 'humorous' ? 'polite' : 'humorous')} className="ml-3 px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm font-black">
                               {avatarTone === 'humorous' ? '😎 유머 모드' : '👔 정중 모드'}
                             </button>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setB2BStep('landing')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc] custom-scrollbar">
                  <div className="text-center my-2"><span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded-full uppercase tracking-wider">Conversation Started</span></div>
                  {chatHistory.map((msg, i) => (
                      msg.role === 'user' ? (
                          <div key={i} className="flex justify-end mb-4 fade-enter"><div className="max-w-[75%] bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-none shadow-md font-bold text-sm leading-[1.6]">{msg.text}</div></div>
                      ) : msg.role === 'system' ? (
                          <div key={i} className="text-red-500 text-xs font-bold text-center mb-4 bg-red-50 p-2 rounded-xl">{msg.text}</div>
                      ) : (
                          <div key={i} className="flex justify-start mb-4 fade-enter">
                              <img src={formatters.getAvatarUrl(selectedAvatar.userName, selectedAvatar.userPhoto)} className="w-8 h-8 rounded-full mr-2 shadow-sm border border-slate-200 mt-1 object-cover" alt="av" />
                              <div className="max-w-[85%] bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm font-bold text-sm leading-[1.6]" dangerouslySetInnerHTML={{__html: msg.text}}></div>
                          </div>
                      )
                  ))}
                  {isTyping && (
                      <div className="flex justify-start mb-4 fade-enter">
                          <img src={formatters.getAvatarUrl(selectedAvatar.userName, selectedAvatar.userPhoto)} className="w-8 h-8 rounded-full mr-2 shadow-sm border border-slate-200 mt-1 opacity-50 object-cover" alt="av" />
                          <div className="bg-slate-200/50 text-slate-500 text-xs font-black px-4 py-3.5 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                          </div>
                      </div>
                  )}
                  <div ref={chatBottomRef} />
              </div>

              <div className="p-3 pb-8 sm:pb-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] relative z-20">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                      <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleB2BChatSubmit()} placeholder="아바타에게 직접 질문하세요..." className="flex-1 bg-transparent px-3 py-2 text-sm font-bold outline-none text-slate-800 placeholder-slate-400" disabled={isTyping} />
                      <button onClick={handleB2BChatSubmit} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isTyping}><ArrowUp size={20}/></button>
                  </div>
              </div>
          </div>
        )}

      </div>
    </div>
  );
};

const HeaderSection = ({ ctx, totalKP }) => {
  const { profile, user, ttsGender, domains, activeTab, activeDomainIdx } = ctx.state;
  const { setTtsGender, setActiveDomainIdx, setSelectedTfCategoryId, setCurrentAgenda, setIsSpeaking, setDisabledMembers } = ctx.actions;
  
  return (
    <header className="shrink-0 bg-white border-b border-slate-100 p-4 shadow-sm z-50 font-bold text-left text-slate-900">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex flex-col font-black">
          <span className="text-blue-600 text-xs font-black uppercase tracking-tighter">Human OS</span>
          <h4 className="text-sm text-slate-900 mt-0.5">{String(profile?.userName)} <span className="text-[8px] text-slate-400 font-bold ml-1">v{APP_VERSION}</span></h4>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTtsGender(ttsGender === 'female' ? 'male' : 'female')} 
            className="flex items-center gap-1 bg-slate-100 p-1.5 px-2.5 rounded-xl border border-slate-200 mr-2 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">TTS</span>
            <span className="text-[9px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-sm">
              {ttsGender === 'female' ? '👩 여성' : '👨 남성'}
            </span>
          </button>
          <div className="flex flex-col items-end mr-1 text-right">
             <div className="text-amber-600 text-[11px] font-black flex items-center gap-1">
                <ShoppingCart size={10} className="text-amber-400"/>
                {Number(profile?.userCoins || 0).toLocaleString()} <span className="text-[7px]">AC</span>
             </div>
             <div className="text-blue-600 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                <Zap size={9} className="text-blue-400 fill-blue-400"/>
                {Number(totalKP).toLocaleString()} <span className="text-[7px]">KP</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden active:scale-95">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="u" /> : <User size={18} className="text-blue-400 mx-auto" />}
            </button>
            {(!user || user.isAnonymous) && <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">구글 로그인</span>}
          </div>
        </div>
      </div>
      {activeTab === 'training' && (
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-3 mt-1 max-w-full font-black text-center justify-center">
          {domains.slice(0,7).map((d, i) => {
            const parts = formatters.formatSlotName(d.name);
            const isHeaderBlocked = activeTab !== 'training';
            return (
              <button key={i} disabled={isHeaderBlocked} onClick={() => { if (isHeaderBlocked) return; setActiveDomainIdx(i); setSelectedTfCategoryId(null); setActiveMembers([]); window.speechSynthesis.cancel(); setIsSpeaking(null); setCurrentAgenda(''); }} className={`px-3 py-1.5 rounded-xl text-[9px] border transition-all shrink-0 whitespace-nowrap font-black ${activeDomainIdx === i ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-200'} ${isHeaderBlocked ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : 'active:scale-95'}`}>
                <div className="flex flex-col items-center leading-tight"><span>{String(parts.p1)}</span><span>{String(parts.p2)}</span></div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

const CommitteeView = ({ ctx }) => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(true);
  const { activeDomainIdx, joinedMasters, subscribedAvatars, currentAgenda, messages, isTyping, isSpeaking, chatInput, useChairmanContext, profile, ideaSpices, activeMembers } = ctx.state;
  const { setShowMissionModal, setUseChairmanContext, setPreviewExpert, setExpertGenomeSlot, setJoinedMasters, setActiveDomainIdx, handleTTS, handleDeleteRoomMessage, setChatInput, handleSendMessage, triggerToast, setIdeaSpices, setActiveMembers } = ctx.actions;
  const { chatTopRef } = ctx.refs;

  const toggleMember = (name) => {
    if (activeMembers.includes(name)) setActiveMembers(prev => prev.filter(n => n !== name));
    else setActiveMembers(prev => [...prev, name]);
  };

  return (
    <div className="shrink-0 z-[45] flex flex-col bg-white">
      {isAvatarOpen && (
        <div className="p-4 bg-slate-50 border-b overflow-x-auto no-scrollbar flex items-center justify-between shadow-inner relative min-h-[70px] shrink-0">
           <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex gap-1.5 items-center w-full justify-center px-4 no-scrollbar overflow-x-auto">
              {activeDomainIdx === 6 && (
                 <>
                   <button onClick={() => setIdeaSpices(prev => ({...prev, mckinsey: !prev.mckinsey}))} className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-90 h-[26px] shrink-0 whitespace-nowrap border ${ideaSpices.mckinsey ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-500 border-slate-200'}`}>맥킨지 톤</button>
                   <button onClick={() => setIdeaSpices(prev => ({...prev, ir: !prev.ir}))} className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-90 h-[26px] shrink-0 whitespace-nowrap border ${ideaSpices.ir ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500 border-slate-200'}`}>IR 피치 톤</button>
                   <button onClick={() => setIdeaSpices(prev => ({...prev, redteam: !prev.redteam}))} className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-90 h-[26px] shrink-0 whitespace-nowrap border ${ideaSpices.redteam ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-500 border-slate-200'}`}>레드팀 검증</button>
                   <button onClick={() => setIdeaSpices(prev => ({...prev, qna: !prev.qna}))} className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-90 h-[26px] shrink-0 whitespace-nowrap border ${ideaSpices.qna ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>예상 Q&A</button>
                 </>
              )}
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pt-3">
              {activeDomainIdx === 6 && (
                <div onClick={() => { setPreviewExpert({ name: profile.userName, slot: 7, theme: 'Council Chairman' }); setExpertGenomeSlot(0); }} className="flex flex-col items-center gap-1 shrink-0 p-2 bg-amber-50 rounded-xl shadow-md border-2 border-amber-200 min-w-[70px] relative cursor-pointer active:scale-95">
                   <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full shadow-sm">의장</div>
                   <img src={formatters.getAvatarUrl(profile.userName, profile.userPhoto)} className="w-8 h-8 mx-auto rounded-full object-cover border-2 border-white shadow-sm" alt="chairman" />
                   <span className="text-[7px] font-black text-amber-700 block mt-1">My Avatar</span>
                </div>
              )}
              {(activeDomainIdx === 6 
                ? joinedMasters.map(n => { const sub = subscribedAvatars.find(s => s.userName === n); return { name: n, userPhoto: sub ? sub.userPhoto : null, slot: activeDomainIdx }; }) 
                : MASTER_CONFIG.filter(m => m.slot === activeDomainIdx)
              ).map((m, idx) => {
                const sName = formatters.standardizeName(m.name);
                const baseName = sName.replace(' (Super)', '');
                const isSuperSubscribed = subscribedAvatars.some(s => s.userName === `${baseName} (Super)`);
                const isUltraSubscribed = subscribedAvatars.some(s => s.userName === `${baseName} (Ultra)`);
                const isExcluded = activeDomainIdx !== 6 && !activeMembers.includes(m.name);
                return (
                  <div key={idx} className={`flex flex-col items-center gap-1 shrink-0 p-2 rounded-xl shadow-sm border min-w-[60px] relative text-center transition-all duration-300 ${ isUltraSubscribed ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-100' : isSuperSubscribed ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-white border-slate-200'} ${isExcluded ? 'opacity-40 grayscale scale-95' : 'scale-100'}`}>
                     {activeDomainIdx !== 6 && (
                       <button onClick={(e) => { e.stopPropagation(); toggleMember(m.name); }} className={`absolute -top-2.5 z-20 text-[6px] font-black px-2 py-0.5 rounded-full shadow-md border transition-all ${!isExcluded ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300'}`}>
                         {!isExcluded ? '참석ON' : '참석OFF'}
                       </button>
                     )}
                     <div className={`relative ${activeDomainIdx !== 6 ? 'mt-2' : ''} cursor-pointer active:scale-95`} onClick={() => { setPreviewExpert(m); setExpertGenomeSlot(0); }}>
                        <img src={formatters.getAvatarUrl(m.name, m.userPhoto)} className={`w-7 h-7 mx-auto rounded-full object-cover border ${isUltraSubscribed ? 'border-purple-400 p-0.5' : isSuperSubscribed ? 'border-amber-400 p-0.5' : 'border-blue-50'}`} alt="e" />
                        {(isSuperSubscribed || isUltraSubscribed) && <div className={`absolute -top-1 -right-1 ${isUltraSubscribed ? 'bg-purple-500' : 'bg-amber-400'} text-white p-0.5 rounded-full shadow-sm`}><Crown size={8}/></div>}
                     </div>
                     <span className={`text-[7px] font-black block mt-1 ${isUltraSubscribed ? 'text-purple-700' : isSuperSubscribed ? 'text-amber-700' : 'text-slate-700'}`}>{String(baseName)}{isUltraSubscribed ? ' (U)' : isSuperSubscribed ? ' (S)' : ''}</span>                       
                  </div>
                );
              })}
           </div>
        </div>
      )}
      <div className="bg-slate-50 border-b border-slate-200 flex justify-center py-1.5 shrink-0 z-10 shadow-sm">
        <button onClick={() => setIsAvatarOpen(!isAvatarOpen)} className="text-[10px] font-black text-slate-500 flex items-center gap-1 px-4 active:scale-95 transition-all">
          {isAvatarOpen ? '▲ 명단 접기' : '▼ 참여 위원 보기'}
        </button>
      </div>
      
      {currentAgenda && (<div className="p-5 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top duration-500 shadow-sm sticky top-0 z-40 shrink-0"><div className="flex items-center gap-2 mb-2"><div className="bg-blue-600 w-1 h-3 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div><span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Current Committee Agenda</span></div><p className="text-[13px] font-bold text-slate-800 leading-relaxed">{String(currentAgenda)}</p></div>)}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col font-black text-slate-800 relative pb-20 custom-scrollbar">
         <div ref={chatTopRef} className="h-1 shrink-0" />
         {isTyping && (<div className="flex flex-col gap-2 w-full max-w-[95%] mb-2"><div className="relative w-full h-2 bg-blue-100 rounded-full overflow-hidden shadow-inner border border-blue-200"><div className="absolute top-0 h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 w-full animate-progress-glow shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div></div></div>)}
         {(messages[activeDomainIdx]?.board || []).slice().reverse().map((m, i) => (
           <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-top-2`}>
             <div className={`p-4 rounded-2xl shadow-sm relative break-words ${m.role === 'user' ? 'max-w-[62%] bg-slate-900 text-white rounded-tr-none shadow-md' : 'max-w-[95%] bg-slate-50 text-slate-800 rounded-tl-none border border-blue-100 shadow-sm'}`}>
               <div className="leading-[1.6] whitespace-pre-wrap font-bold" style={{ fontSize: `${profile?.chatFontSize || 10}px` }}>{String(m.content)}</div>
               
               {m.role === 'assistant' && m.tokenUsage && (
                 <div className="mt-2 flex items-center gap-2 text-[8.5px] font-black text-slate-400 bg-white/60 px-2 py-1 rounded-lg w-fit border border-slate-200/50">
                   <span className="text-blue-500">IN: {m.tokenUsage.promptTokenCount}</span>
                   <span className="text-emerald-500">OUT: {m.tokenUsage.candidatesTokenCount}</span>
                   <span className="text-slate-300 ml-1">TOTAL: {m.tokenUsage.totalTokenCount}</span>
                 </div>
               )}

               <div className="mt-4 pt-3 border-t border-slate-200/30 flex justify-between items-center gap-2">
                 <div className="flex gap-2">
                   {m.role === 'assistant' && (
                     <button onClick={() => handleTTS(m.content, m.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[8px] border transition-all ${isSpeaking === m.id ? 'bg-amber-100 text-amber-600 border-amber-200 shadow-inner' : 'bg-white text-slate-500 shadow-sm'}`}>
                       <Volume2 size={12}/> {isSpeaking === m.id ? '중지' : '듣기'}
                     </button>
                   )}
                 </div>
                 <button onClick={() => handleDeleteRoomMessage(m.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg"><Trash2 size={13}/></button>
               </div>
             </div>
           </div>
         ))}
      </div>
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm z-[50]"><div className="max-w-5xl mx-auto flex items-center gap-2 bg-white p-1 rounded-full shadow-xl border h-[42px] px-2 border-blue-100 font-black text-slate-900">
      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="토론 안건 입력..." className="flex-1 px-4 text-[13px] outline-none bg-transparent" disabled={isTyping} />
      <span className="text-[9px] font-black tracking-tighter uppercase mr-2 text-amber-500/70 border border-amber-500/30 px-2 py-0.5 rounded-md bg-amber-50/50">
        {ctx.state.engineConfig.model.includes('flash') ? '3.1 FLASH' : '3.1 PRO'}
      </span>
      <button onClick={()=>handleSendMessage()} className="bg-slate-900 text-white p-2.5 rounded-full active:scale-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isTyping}><ArrowRight size={16} /></button></div></div>
    </div>
  );
};

const MarketView = ({ ctx }) => {
  const { marketRoom, marketSearchTerm, filteredMarketPool, subscribedAvatars, pendingTransactions } = ctx.state;
  const { setMarketRoom, setMarketSearchTerm, handleSubscribeAvatarFromMarket, setPendingTransactions, setPreviewExpert, setExpertGenomeSlot } = ctx.actions;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-black text-left text-slate-900 text-[10px] animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">AVATAR MARKET</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] flex items-center gap-2"><Globe size={12} className="text-blue-500" /> Decentralized Knowledge Genome Network</p>
        </div>
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={marketSearchTerm} onChange={(e) => setMarketSearchTerm(e.target.value)} placeholder="지능 검색..." className="w-full bg-white border border-slate-200 rounded-[2rem] py-3.5 pl-12 pr-6 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm" />
        </div>
      </div>
      <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar py-2">
        {[ { id: 'hot', label: 'HOT', icon: Flame, color: 'bg-red-500 shadow-red-100' }, { id: 'system', label: 'SYSTEM', icon: Crown, color: 'bg-amber-500 shadow-amber-100' }, { id: 'pro', label: 'PRO', icon: Microscope, color: 'bg-indigo-600 shadow-indigo-100' }, { id: 'user', label: 'USER', icon: Users, color: 'bg-slate-900 shadow-slate-100' } ].map(room => {
          const Icon = room.icon;
          return (
            <button key={room.id} onClick={() => setMarketRoom(room.id)} className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all text-[10px] font-black uppercase tracking-tight shrink-0 ${marketRoom === room.id ? `${room.color} text-white shadow-xl scale-105` : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 shadow-sm'}`}>
              <Icon size={13} /> {room.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
        {filteredMarketPool.map((av) => {
          const existing = subscribedAvatars.find(s => s.userName === av.userName);
          const isSuper = av.category === 'system';
          const isUltra = av.category === 'system_ultra';
          const isSpecial = isSuper || isUltra;
          const pendingType = pendingTransactions[av.ownerUid];
          
          const handleActionClick = (type) => {
            if (existing) return; 
            if (pendingType === type) {
              handleSubscribeAvatarFromMarket(av, type);
              setPendingTransactions(prev => { const next = {...prev}; delete next[av.ownerUid]; return next; });
            } else { setPendingTransactions(prev => ({ ...prev, [av.ownerUid]: type })); }
          };
          
          const handlePreview = () => {
             setPreviewExpert({ name: av.userName, slot: 7, theme: isSpecial ? 'System Master' : 'Market Avatar', userPhoto: av.userPhoto });
             setExpertGenomeSlot(0);
          };

          return (
            <div key={av.ownerUid} className={`group relative rounded-[1.5rem] p-0.5 transition-all duration-500 w-full mx-auto ${isUltra ? 'bg-gradient-to-br from-purple-300 via-purple-500 to-purple-800 shadow-xl' : isSuper ? 'bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-xl' : av.totalKP >= 1000 ? 'bg-gradient-to-br from-indigo-300 via-indigo-600 to-indigo-800 shadow-lg' : 'bg-white border border-slate-100 shadow-md'} hover:scale-[1.02]`}>
              <div className="bg-white rounded-[calc(1.5rem-2px)] p-4 h-full flex flex-col items-center text-center">
                <div className="relative mb-2 cursor-pointer hover:scale-110 transition-all duration-300" onClick={handlePreview}>
                  <div className={`w-14 h-14 rounded-full overflow-hidden border-4 ${isUltra ? 'border-purple-100' : isSuper ? 'border-amber-100' : av.totalKP >= 1000 ? 'border-indigo-100' : 'border-slate-50'}`}><img src={formatters.getAvatarUrl(av.userName, av.userPhoto)} className="w-full h-full object-cover" alt="a" /></div>
                  {isSpecial && <div className={`absolute -top-1 -right-1 ${isUltra ? 'bg-purple-500' : 'bg-amber-500'} text-white p-1 rounded-full shadow-sm border-2 border-white`}><Crown size={10}/></div>}
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-0.5">{av.userName}</h4>
                <p className="text-[9px] text-slate-500 font-bold leading-relaxed line-clamp-2 h-6 mb-2">{av.userIntro}</p>
                <div className="flex justify-center gap-1.5 mb-3 w-full">
                  <div className="flex flex-col items-center bg-slate-50 rounded-lg p-1 flex-1 border border-slate-100"><span className="text-[5px] text-slate-400 font-black uppercase">Nodes</span><span className="text-[10px] font-black text-slate-900">{av.nodeCount}</span></div>
                  <div className="flex flex-col items-center bg-slate-50 rounded-lg p-1 flex-1 border border-slate-100"><span className="text-[5px] text-slate-400 font-black uppercase">KP Power</span><span className={`text-[10px] font-black ${av.totalKP >= 1000 ? 'text-indigo-600' : 'text-blue-600'}`}>{av.totalKP}</span></div>
                </div>
                <div className="w-full space-y-1 mt-auto">
                  <button disabled={!!existing || pendingType === 'rent'} onClick={() => handleActionClick('subscribe')} className={`w-full py-2 rounded-xl font-black text-[9px] uppercase transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1 ${existing?.adoptionType === 'subscribe' ? 'bg-emerald-600 text-white' : pendingType === 'subscribe' ? 'bg-amber-400 text-slate-900 animate-pulse border-2 border-amber-600' : (!!existing || pendingType === 'rent') ? 'bg-slate-50 text-slate-200' : isSpecial ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>{existing?.adoptionType === 'subscribe' ? '구독 승인됨' : pendingType === 'subscribe' ? '승인?' : `구독 ${av.fees?.monthly || 50} AC`}</button>
                  <button disabled={!!existing || pendingType === 'subscribe'} onClick={() => handleActionClick('rent')} className={`w-full py-1.5 rounded-xl font-black text-[8px] uppercase border transition-all active:scale-95 flex items-center justify-center gap-1 ${existing?.adoptionType === 'rent' ? 'bg-emerald-600 text-white' : pendingType === 'rent' ? 'bg-amber-400 text-slate-900 animate-pulse border-2 border-amber-600' : (!!existing || pendingType === 'subscribe') ? 'bg-slate-50 text-slate-100 opacity-50' : 'bg-white text-slate-500 border-slate-200'}`}>{existing?.adoptionType === 'rent' ? '리스 승인됨' : pendingType === 'rent' ? '승인?' : `리스 ${av.fees?.daily || 5} AC/일`}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DatabaseView = ({ ctx, totalKP }) => {
  const { profile, knowledgeList, isAvatarRegistered, user } = ctx.state;
  const { setPreviewExpert, setExpertGenomeSlot, setShowImprintModal, setShowQnaModal, handleBuildAvatar, setShowRegisterFeeModal, handleUnregisterAvatar, setDetailKnowledge } = ctx.actions;
  const { fileInputRef, dtwinFileInputRef } = ctx.refs;
  const { getDisplayNodes } = ctx.utils;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 font-black text-left text-slate-900 text-[10px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter">MY AVATAR ASSETS</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase shadow-sm">누적 답변: {String(profile.answerCount || 0)}</span>
               <span className="text-slate-400 font-bold italic text-[9px]">디지털 자아 지능 각인 및 관리</span>
            </div>
         </div>
         
         <div className="flex flex-col items-center justify-center shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 rounded-[2rem] shadow-xl border-2 border-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse"></div>
            <Award className="text-blue-300 opacity-30 absolute top-2 right-2 rotate-12" size={24}/>
            <span className="text-[8px] font-black text-blue-100 uppercase tracking-widest z-10 leading-none mb-1">Reputation</span>
            <span className="text-2xl font-black text-white z-10 leading-none drop-shadow-md">{Number(totalKP).toLocaleString()}</span>
            <span className="text-[7px] font-bold text-blue-200 uppercase z-10 mt-1">KNOWLEDGE POWER</span>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
        <button onClick={() => setShowImprintModal(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all"><Edit3 size={12} /> CHAT 각인</button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all"><Upload size={12} /> 문서 각인</button>
        <button onClick={() => dtwinFileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-emerald-600 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all"><Brain size={12} /> meta-DNA 각인</button>
        <button onClick={() => setShowQnaModal(true)} className="flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all"><MessageSquare size={12} /> Q&A 관리</button>
        <button onClick={handleBuildAvatar} className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all"><Sparkles size={12} /> AVATAR 만들기</button>
        {!isAvatarRegistered ? (
          <button onClick={() => setShowRegisterFeeModal(true)} className="col-span-1 lg:col-span-2 flex items-center justify-center gap-2 bg-amber-500 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all">
            <Globe size={12} /> AVATAR 등록하기
          </button>
        ) : (
          <button onClick={handleUnregisterAvatar} className="col-span-1 lg:col-span-2 flex items-center justify-center gap-2 bg-red-500 text-white p-3 rounded-xl font-black text-[9px] shadow-lg active:scale-95 transition-all">
            <X size={12} /> AVATAR 해제하기
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {knowledgeList.filter(k => Number(k.domainIdx) === 7).sort((a,b)=> (b.timestamp||0)-(a.timestamp||0)).map(k => (
          <KnowledgePreviewCard key={k.id} k={k} viewMode="main" userId={user?.uid} getDisplayNodes={getDisplayNodes} onDelete={async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'knowledge', id))} onRead={setDetailKnowledge} />
        ))}
      </div>
    </div>
  );
};

const TfHubView = ({ ctx }) => {
  const { joinedMasters, selectedTfCategoryId, subscribedAvatars } = ctx.state;
  const { setJoinedMasters, setSelectedTfCategoryId, setActiveDomainIdx, setActiveTab, triggerToast } = ctx.actions;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-left font-black text-slate-900 text-[10px]">
      <h2 className="text-2xl font-black uppercase text-slate-900 border-l-8 border-blue-600 pl-4 mb-4">AVATAR for IDEA LAB</h2>
      {joinedMasters.length > 0 && (
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between mb-6 font-black">
          <div className="flex-1 text-left font-bold font-black">
            <h4 className="text-xs font-black uppercase tracking-tight text-white text-left">선출된 거장 지능 ({String(joinedMasters.length)})</h4>
            <p className="text-[7px] text-blue-100 font-bold mt-1 line-clamp-1">{joinedMasters.join(', ')}</p>
          </div>
          <button onClick={() => { setActiveDomainIdx(6); setActiveTab('training'); triggerToast("IDEA 집결 완료"); }} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black shadow-lg animate-pulse uppercase font-black">Enter IDEA Room</button>
        </div>
      )}
      {!selectedTfCategoryId ? (
        <div className="grid grid-cols-1 gap-4 font-black">
          {CONSULTING_CATEGORIES.map((cat) => {
            const joinedInCat = (cat.id === 'subscribe' ? subscribedAvatars.filter(sa => joinedMasters.includes(sa.userName)).length : MASTER_CONFIG.filter(m => m.slot === cat.targetSlot && joinedMasters.includes(m.name)).length);
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setSelectedTfCategoryId(cat.id)} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 active:scale-95 transition-all font-bold text-left relative group">
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color} shadow-sm`}><Icon size={24}/></div>
                <div className="flex-1 text-left font-black"><h4 className="text-sm font-black text-slate-900">{String(cat.name)}</h4><p className="text-[8px] text-slate-400 font-bold uppercase mt-1 text-left">{cat.id === 'subscribe' ? 'Ecosystem' : 'Select Experts'}</p></div>
                {joinedInCat > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black mr-2 shadow-sm">{String(joinedInCat)} 선출</span>}
                <ChevronRight size={16} className="text-slate-200" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 font-black">
          <button onClick={() => setSelectedTfCategoryId(null)} className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase"><X size={14}/> Back to IDEA</button>
          <div className="grid grid-cols-1 gap-3 font-bold">
            {selectedTfCategoryId === 'subscribe' ? (
              Array.from({ length: 24 }).map((_, i) => {
                const subAvatar = subscribedAvatars[i];
                if (subAvatar) {
                  const isJoined = joinedMasters.includes(subAvatar.userName);
                  const isSuper = subAvatar.userName.includes("(Super)");
                  const isUltra = subAvatar.userName.includes("(Ultra)");
                  return (
                    <div key={subAvatar.ownerUid} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 shadow-sm text-left ${isUltra ? 'bg-purple-50 border-purple-300 shadow-md' : isSuper ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-white border-indigo-100'}`}>
                       <div className="flex-1 flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { ctx.actions.setPreviewExpert({ name: subAvatar.userName, slot: 7, theme: 'Market Avatar', userPhoto: subAvatar.userPhoto }); ctx.actions.setExpertGenomeSlot(0); }}>
                         <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm ${isUltra ? 'border-purple-400 p-0.5' : isSuper ? 'border-amber-400 p-0.5' : 'border-indigo-50'}`}><img src={formatters.getAvatarUrl(subAvatar.userName, subAvatar.userPhoto)} className="w-full h-full object-cover rounded-full" alt="sa" /></div>
                         <div className="flex-1 text-left font-black">
                           <h4 className={`text-sm font-black text-left ${isUltra ? 'text-purple-900' : isSuper ? 'text-amber-900 font-black' : 'text-slate-900'}`}>{subAvatar.userName}</h4>
                           <div className="flex items-center gap-1.5 mt-1">
                             <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase ${subAvatar.adoptionType === 'subscribe' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>{subAvatar.adoptionType === 'subscribe' ? 'Subscribed' : 'Rented'}</span>
                             <span className="text-[8px] text-slate-400 font-bold uppercase text-left">({subAvatar.totalKP} KP)</span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="flex flex-col items-end mr-1 shrink-0">
                           <span className="text-[6px] text-slate-400 font-black uppercase leading-none mb-1">Remain</span>
                           <span className="text-[9px] font-black text-blue-600 font-mono tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap">
                             {formatters.getRemainingTime(subAvatar.adoptedAt, subAvatar.adoptionType)}
                           </span>
                         </div>
                         <button onClick={() => ctx.actions.setJoinedMasters(prev => prev.includes(subAvatar.userName) ? prev.filter(n => n !== subAvatar.userName) : [...prev, subAvatar.userName])} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-sm ${isJoined ? 'bg-red-500 text-white' : (isUltra ? 'bg-purple-600 text-white' : isSuper ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white')}`}>{isJoined ? 'LEAVE' : 'JOIN'}</button>
                       </div>
                    </div>
                  );
                }
                return (
                  <div key={`empty-${i}`} className="p-4 rounded-2xl border transition-all flex items-center gap-4 shadow-sm text-left bg-white border-slate-100 opacity-70 grayscale">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><UserPlus size={20}/></div>
                    <div className="flex-1 text-left font-black"><h4 className="text-sm font-black text-slate-400 text-left">Empty Slot {String(i+1)}</h4><p className="text-[8px] text-slate-300 font-bold uppercase text-left">Market Subscription Required</p></div>
                    <button onClick={() => { ctx.actions.setActiveTab('search'); ctx.actions.setSelectedTfCategoryId(null); }} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-slate-100 text-slate-400">지능 검색</button>
                  </div>
                );
              })
            ) : (
              MASTER_CONFIG.filter(m => m.slot === CONSULTING_CATEGORIES.find(c => c.id === selectedTfCategoryId)?.targetSlot).map((av, idx) => { 
                const isJoined = joinedMasters.includes(av.name); 
                const isSuperSubbed = subscribedAvatars.some(s => s.userName === `${formatters.standardizeName(av.name)} (Super)`);
                const isUltraSubbed = subscribedAvatars.some(s => s.userName === `${formatters.standardizeName(av.name)} (Ultra)`);
                return (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 shadow-sm text-left ${isJoined ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'} ${ isUltraSubbed ? 'bg-purple-50/20' : isSuperSubbed ? 'bg-amber-50/20' : ''}`}>
                    <div className="flex-1 flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { ctx.actions.setPreviewExpert({ name: av.name, slot: av.slot, theme: av.theme }); ctx.actions.setExpertGenomeSlot(0); }}>
                      <img src={formatters.getAvatarUrl(av.name)} className={`w-12 h-12 rounded-full object-cover border shadow-sm ${isUltraSubbed ? 'border-purple-400 p-0.5' : isSuperSubbed ? 'border-amber-400 p-0.5' : ''}`} alt="expert" />
                      <div className="flex-1 text-left font-black"><h4 className={`text-sm font-black text-left ${ isUltraSubbed ? 'text-purple-800' : isSuperSubbed ? 'text-amber-800' : 'text-slate-900'}`}>{String(av.name)}{ isUltraSubbed ? ' (Ultra)' : isSuperSubbed ? ' (Super)' : ''}</h4><p className="text-[8px] text-blue-600 font-bold uppercase text-left">{String(av.theme)}</p></div>
                    </div>
                    <button onClick={() => { ctx.actions.setJoinedMasters(prev => prev.includes(av.name) ? prev.filter(n => n !== av.name) : [...prev, av.name]); }} className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all shadow-sm ${isJoined ? 'bg-red-500 text-white shadow-md' : 'bg-slate-900 text-white'}`}>{isJoined ? 'LEAVE' : 'JOIN'}</button>
                  </div>
                ); 
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SystemSettingsView = ({ ctx, totalKP }) => {
  const { profile, engineConfig, systemRevenue, domains, activeDomainIdx } = ctx.state;
  const { setProfile, handleSaveProfile, setEngineConfig, setDomains, setActiveDomainIdx, triggerToast, handleLogout, handleChargeAC } = ctx.actions;
  
  const getSlotKP = (slotIdx) => {
    const count = ctx.state.knowledgeList.filter(k => Number(k.domainIdx) === Number(slotIdx)).length;
    if (slotIdx >= 0 && slotIdx <= 5) return count > 0 ? count * 10 : 150;
    return (count * 10) + (Number(slotIdx) === 7 ? Number(profile.answerCount || 0) : 0);
  };

  return (
    <div className="p-6 space-y-8 font-black max-w-3xl mx-auto text-left text-slate-900 text-[10px]">
      <h2 className="text-2xl font-black uppercase text-slate-900 border-l-8 border-blue-600 pl-4 mb-8">MASTER SETTING</h2>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2"><DollarSign size={14} className="text-amber-500" /> My Wallet</label>
        <div className="flex flex-col gap-4">
           <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl">
             <div className="flex flex-col">
               <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black mb-1">보유한 AC</span>
               <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-amber-400">{Number(profile?.userCoins || 0).toLocaleString()}</span><span className="text-[10px] font-black opacity-80 uppercase">AC</span></div>
               <span className="text-[7px] text-blue-400 mt-2 font-bold uppercase tracking-widest">Global Reputation: {totalKP.toLocaleString()} KP</span>
             </div>
             <Brain size={32} className="text-white/10" />
           </div>
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleChargeAC(1000, 10000)} className="py-4 bg-amber-500 text-white rounded-2xl font-black text-[11px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"><Zap size={14} /> 1,000 AC 충전 (10,000원)</button>
              <button disabled className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-2 cursor-not-allowed group relative border border-slate-100">
                <RefreshCw size={14} /> AC 환전하기
                <span className="absolute -top-8 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">환전 기능 준비중</span>
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5"><User size={12}/> Master Identity</label>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><span className="text-[7px] text-slate-400 font-bold ml-1 uppercase tracking-tight">Display Name</span><input value={profile.userName} onChange={(e)=>setProfile({...profile, userName: e.target.value})} className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-sm w-full shadow-inner" placeholder="이름" /></div>
            <div className="space-y-1.5"><div className="flex justify-between items-center pr-1"><span className="text-[7px] text-slate-400 font-bold ml-1 uppercase tracking-tight">Global Alias (@ID)</span>{profile.userAlias && (<span className="text-[7px] text-blue-600 font-black animate-in fade-in slide-in-from-right-1">( https://k-avatar.kr/@{String(profile.userAlias)} )</span>)}</div><input value={profile.userAlias} onChange={(e)=>setProfile({...profile, userAlias: e.target.value})} className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-sm w-full shadow-inner" placeholder="별칭 입력" /></div>
          </div>
          <div className="space-y-1.5"><span className="text-[7px] text-slate-400 font-bold ml-1 uppercase flex items-center gap-1 tracking-tight"><ImageIcon size={8}/> Avatar Facial Image (URL)</span><input value={profile.userPhoto || ''} onChange={(e)=>setProfile({...profile, userPhoto: e.target.value})} className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-sm w-full shadow-inner" placeholder="https://example.com/photo.png" /></div>
          <div className="space-y-1.5"><span className="text-[7px] text-slate-400 font-bold ml-1 uppercase flex items-center gap-1 tracking-tight"><AlignLeft size={8}/> Avatar Introduction (Max 3 lines)</span><textarea value={profile.userIntro || ''} onChange={(e)=>setProfile({...profile, userIntro: e.target.value.substring(0, 500)})} className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-sm w-full min-h-[80px] resize-none shadow-inner" placeholder="소개글을 입력하세요." /></div>
        </div>
        <button onClick={handleSaveProfile} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs shadow-lg uppercase active:scale-95 transition-all">Save All Profile Settings</button>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2"><Zap size={14} className="text-blue-500" /> Intelligence Engine Core</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>setEngineConfig({model:"gemini-3.1-flash-lite",version:"v1beta"})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${engineConfig.model.includes('3.1-flash') ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>3.1 Flash (Q&A당 1AC 차감)</button>
          <button onClick={()=>setEngineConfig({model:"gemini-3.1-pro-preview",version:"v1beta"})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${engineConfig.model.includes('3.1') ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>3.1 Pro (Q&A당 5AC 차감)</button>          
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2">
          <Settings size={14} className="text-slate-500" /> Chat Font Size
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-500">작게 (8px)</span>
            <span className="text-sm font-black text-blue-600">{profile?.chatFontSize || 10}px</span>
            <span className="text-[10px] font-bold text-slate-500">크게 (12px)</span>
          </div>
          <input 
            type="range" 
            min="8" max="12" step="1" 
            value={profile?.chatFontSize || 10} 
            onChange={(e) => setProfile({ ...profile, chatFontSize: Number(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
         <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2"><BarChart3 size={14} className="text-blue-500" /> Human OS System Finance</label>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-600 p-5 rounded-[2rem] text-white flex flex-col items-center justify-center gap-1.5 shadow-xl border-4 border-white/10">
              <span className="text-[7px] font-black uppercase tracking-widest opacity-80">AVATAR 수익</span>
              <div className="flex items-baseline gap-1"><span className="text-2xl font-black">{Number(systemRevenue?.avatarRevenue || 0).toLocaleString()}</span><span className="text-[8px] font-black opacity-80 uppercase">AC</span></div>
            </div>
            <div className="bg-indigo-600 p-5 rounded-[2rem] text-white flex flex-col items-center justify-center gap-1.5 shadow-xl border-4 border-white/10">
              <span className="text-[7px] font-black uppercase tracking-widest opacity-80">IMPORT 수익</span>
              <div className="flex items-baseline gap-1"><span className="text-2xl font-black">{Number(systemRevenue?.importRevenue || 0).toLocaleString()}</span><span className="text-[8px] font-black opacity-80 uppercase">AC</span></div>
            </div>
         </div>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
         <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2"><Layers size={14} className="text-emerald-500" /> Slot Governance & KP Status</label>
         <div className="grid grid-cols-1 gap-2 font-bold">
            {domains.map((d, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-left font-bold ${activeDomainIdx === i ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                 <div className="flex flex-col text-left font-bold flex-1 overflow-hidden mr-2">
                    <span className="text-[6px] text-slate-400 uppercase tracking-widest leading-none mb-1 block">Slot 0{String(i+1)} • <span className="text-blue-600 font-black">{String(getSlotKP(i))} KP</span></span>
                    <input disabled={i < 7} value={String(d.name)} onChange={(e) => { const next = [...domains]; next[i].name = e.target.value; setDomains(next); }} className={`bg-transparent font-black text-xs outline-none border-none p-0 truncate ${i < 7 ? 'text-slate-400' : 'text-slate-900'}`} />
                 </div>
                 <button onClick={() => { setActiveDomainIdx(i); triggerToast(`Slot 0${String(i+1)} 가동`); }} className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all ${activeDomainIdx === i ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border shadow-sm'}`}>{activeDomainIdx === i ? 'Active' : 'Select'}</button>
              </div>
            ))}
         </div>
      </div>
      
      <div className="pt-6 border-t border-slate-100"><button onClick={handleLogout} className="w-full py-5 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center gap-3 font-black text-xs shadow-sm active:scale-95 transition-all"><LogOut size={18} /> LOGOUT SESSION</button></div>
    </div>
  );
};

// ============================================================================
// 5. CONTROLLER & ASSEMBLE LAYER (Main App Component)
// ============================================================================
const HumanOSApp = () => {
  const [viewMode, setViewMode] = useState('intro'); // intro, main, b2b, landing
  const [user, setUser] = useState(null);
  
  const [targetLandingUid, setTargetLandingUid] = useState(null);
  const [showQnaModal, setShowQnaModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ alias: '', agreed: false });
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('training'); 
  const [activeDomainIdx, setActiveDomainIdx] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expertChatTarget, setExpertChatTarget] = useState(null);
  const [expertChatInput, setExpertChatInput] = useState('');
  const [showImprintModal, setShowImprintModal] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualTag, setManualTag] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [previewExpert, setPreviewExpert] = useState(null);
  const [deepDiveResult, setDeepDiveResult] = useState(null);
  const [detailKnowledge, setDetailKnowledge] = useState(null);
  const [selectedTfCategoryId, setSelectedTfCategoryId] = useState(null); 
  const [joinedMasters, setJoinedMasters] = useState([]);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [ttsGender, setTtsGender] = useState('female');
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [showLandingChat, setShowLandingChat] = useState(false);
  const [expertGenomeSlot, setExpertGenomeSlot] = useState(0);
  const [useChairmanContext, setUseChairmanContext] = useState(false);
  const [isAvatarRegistered, setIsAvatarRegistered] = useState(false);
  const [showRegisterFeeModal, setShowRegisterFeeModal] = useState(false);
  const [registrationFee, setRegistrationFee] = useState({ monthly: 50, daily: 5 });
  const [marketRoom, setMarketRoom] = useState('hot'); 
  const [marketSearchTerm, setMarketSearchTerm] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState({}); 
  const [ideaSpices, setIdeaSpices] = useState({ mckinsey: false, ir: false, redteam: false, qna: false });

  const [activeMembers, setActiveMembers] = useState([]);

  const fileInputRef = useRef(null); 
  const dtwinFileInputRef = useRef(null);
  const chatTopRef = useRef(null);

  const masterIntelSet = useMasterDNA();

  const firebaseData = useFirebaseSubscriptions(user, viewMode, activeDomainIdx, targetLandingUid);
  const { profile, setProfile, domains, setDomains, knowledgeList, messages, setMessages, engineConfig, setEngineConfig, currentAgenda, setCurrentAgenda, myLandingQnA, subscribedAvatars, registeredAvatars, systemRevenue, landingProfile, landingKnowledge, landingHistory } = firebaseData;

  const triggerToast = useCallback((msg) => { setShowToast(String(msg)); setTimeout(() => setShowToast(null), 3500); }, []);

  const deductAC = useCallback(async (amount = 10) => {
    if (!user) return false;
    if (user.isAnonymous) { 
      triggerToast("구글 로그인이 필요합니다."); 
      return false; 
    }
    const currentCoins = Number(profile.userCoins || 0);
    if (currentCoins < amount) { triggerToast(`AC 부족 (필요: ${amount} AC)`); return false; }
    const batch = writeBatch(db);
    batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { profile: { userCoins: increment(-amount) } }, { merge: true });
    await batch.commit(); return true;
  }, [user, profile, triggerToast]);

  const filteredMarketPool = useMemo(() => {
    let pool = marketRoom === 'system' ? MASTER_SYSTEM_MASTERS : marketRoom === 'pro' ? registeredAvatars.filter(av => (av.totalKP || 0) >= 1000) : marketRoom === 'user' ? registeredAvatars.filter(av => (av.totalKP || 0) < 1000) : [...registeredAvatars].sort((a, b) => (b.totalKP || 0) - (a.totalKP || 0)).slice(0, 15);
    return marketSearchTerm.trim() ? pool.filter(av => String(av.userName).includes(marketSearchTerm) || String(av.userIntro || "").includes(marketSearchTerm)) : pool;
  }, [marketRoom, registeredAvatars, marketSearchTerm]);

  const totalKP = useMemo(() => {
    const userNodes = viewMode === 'landing' ? landingKnowledge : knowledgeList.filter(k => Number(k.domainIdx) === 7);
    const answers = viewMode === 'landing' ? (landingProfile?.answerCount || 0) : (profile?.answerCount || 0);
    const knowledgeKP = userNodes.reduce((sum, k) => {
      if (k.source === 'AVATAR_IMPORT') return sum + 10;
      if (k.source === 'DOC_IMPORT') return sum + 20;
      if (k.source === 'Manual') return sum + 5;
      if (k.source === 'AUTO_CHAT_IMPRINT') return sum + 1;
      return sum + 10;
    }, 0);
    return knowledgeKP + Number(answers || 0);
  }, [knowledgeList, landingKnowledge, viewMode, landingProfile, profile]);

  const missionInfo = useMemo(() => {
    const missions = [
      { t: "산업 meta-DNA 전략 미션", c: ["글로벌 기술 주도권 확보", "오픈소스 생태계 확장", "제1원리 미래 설계"] },
      { t: "정치 meta-DNA 전략 미션", c: ["지정학적 리스크 관리", "실용주의 시장 점유", "기술 초격차 유지"] },
      { t: "건강 meta-DNA 전략 미션", c: ["전인적 예방 프로토콜", "영양 데이터 기반 치유", "생물학적 최적화"] },
      { t: "투자 meta-DNA 전략 미션", c: ["부채 사이클 리스크 헷징", "안티프래질 수익 구조", "평균 회귀 자산 배분"] },
      { t: "종교 meta-DNA 전략 미션", c: ["자비의 지능 고도화", "정신적 회복탄력성", "윤리적 넥서스 구축"] },
      { t: "예술 meta-DNA 전략 미션", c: ["삶의 철학적 재해석", "강력한 서사 구축", "지적 영토 확장"] },
      { t: "IDEA LAB 특수 미션", c: ["지능 시너지 극대화", "다학제적 융합 해결", "초집중 지능 협공"] }
    ];
    return missions[activeDomainIdx] || { t: "개인 아바타 미션", c: ["지능 각인 및 자산화 추진"] };
  }, [activeDomainIdx]);

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
      await signInAnonymously(auth);
      triggerToast("logout 완료"); 
      setViewMode('intro');
    } catch (e) { 
      triggerToast("로그아웃 오류"); 
    }
  };

  const handleChargeAC = async (acAmount, krwAmount) => {
    if (!user) { triggerToast("로그인이 필요합니다."); return; }
    try {
      const TossPayments = await loadTossPayments();
      const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; 
      const tossPayments = TossPayments(clientKey);
      const orderId = `order_${Date.now()}_${user.uid.substring(0,5)}`;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('payment', 'success');
      currentUrl.searchParams.set('amount', acAmount);
      const successUrl = currentUrl.toString();
      currentUrl.searchParams.set('payment', 'fail');
      const failUrl = currentUrl.toString();

      await tossPayments.requestPayment('카드', {
        amount: krwAmount, orderId: orderId, orderName: `Human OS - ${acAmount.toLocaleString()} AC 충전`,
        customerName: profile.userName, successUrl: successUrl, failUrl: failUrl,
      });
    } catch (error) { triggerToast("결제 모듈 로드 실패."); }
  };

  const handleCompleteOnboarding = async () => {
    if (!user) return;
    if (!onboardingData.agreed) { triggerToast("이용약관에 동의해야 합니다."); return; }
    const cleanAlias = String(onboardingData.alias).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanAlias.length < 3) { triggerToast("별칭은 3자 이상이어야 합니다."); return; }
    setIsOnboardingLoading(true);
    try {
      const aliasDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'aliases', cleanAlias);
      const aliasDoc = await getDoc(aliasDocRef);
      if (aliasDoc.exists()) { triggerToast("이미 사용 중인 별칭입니다."); setIsOnboardingLoading(false); return; }
      const batch = writeBatch(db);
      batch.set(aliasDocRef, { ownerUid: user.uid, timestamp: Date.now() });
      const initialProfile = { userName: user.displayName || '신규 마스터', userCoins: 1000, userAlias: cleanAlias, userIntro: 'AI이 거대화에 맞서 Human OS로 재탄생한 meta-DNA 마스터입니다.', userPhoto: user.photoURL || '', answerCount: 0 };
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
      batch.set(userRef, { profile: initialProfile, engineConfig: { model: "gemini-3.1-flash-lite", version: "v1beta" } }, { merge: true });
      await batch.commit(); setProfile(initialProfile); setShowOnboardingModal(false); triggerToast("마스터 임명 완료!");
    } catch (e) { triggerToast("처리 중 오류 발생"); } finally { setIsOnboardingLoading(false); }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      if (profile.userAlias) {
        const cleanAlias = String(profile.userAlias).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const aliasDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aliases', cleanAlias));
        if (aliasDoc.exists() && aliasDoc.data().ownerUid !== user.uid) { triggerToast("이미 사용 중인 별칭입니다."); return; }
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aliases', cleanAlias), { ownerUid: user.uid, timestamp: Date.now() });
      }
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { profile, domains, engineConfig }, { merge: true });
      triggerToast("정보가 저장되었습니다.");
    } catch (e) { triggerToast("저장 오류"); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; if (!file || !user) return;
    deductAC(10).then(success => {
      if (!success) { e.target.value = null; return; }
      triggerToast(`${String(file.name)} 분석 중... (-10 AC)`);
      const reader = new FileReader(); reader.onload = async (ev) => {
        try { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'knowledge'), { content: String(ev.target.result).trim().substring(0, 100000), domainIdx: 7, masterName: String(profile.userName), source: "DOC_IMPORT", hashtag: `#문서각인`, timestamp: Date.now() }); triggerToast("문서 각인 성공"); } 
        catch (err) { triggerToast("각인 실패"); }
      }; reader.readAsText(file); e.target.value = null;
    });
  };

  const handleAvatarImprintFileSelect = (e) => {
    const file = e.target.files[0]; if (!file || !user) return;
    deductAC(10).then(success => {
      if (!success) { e.target.value = null; return; }
      triggerToast(`지능 이식 분석 중... (-10 AC)`);
      const reader = new FileReader(); reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result); 
          const list = Array.isArray(data) ? data : (data.knowledge || data.nodes || [data]);
          const batch = writeBatch(db); const kCol = collection(db, 'artifacts', appId, 'users', user.uid, 'knowledge');
          list.forEach(n => { batch.set(doc(kCol), { content: String(n.content || n.text || "").trim().substring(0, 100000), domainIdx: 7, masterName: String(n.masterName || profile.userName), source: "AVATAR_IMPORT", hashtag: String(n.hashtag || n.tag || "#지능_상속"), timestamp: Date.now() }); });
          await batch.commit(); triggerToast(`${String(list.length)}개 지능 유닛 이식 완료`);
        } catch (err) { triggerToast(`이식 오류`); }
      }; reader.readAsText(file); e.target.value = null;
    });
  };

  const handleBuildAvatar = useCallback(() => {
    if (!user || knowledgeList.length === 0) return;
    const myKnowledge = knowledgeList.filter(k => Number(k.domainIdx) === 7);
    const buildData = { master: profile.userName, version: APP_VERSION, knowledge: myKnowledge };
    const blob = new Blob([JSON.stringify(buildData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${String(profile.userName)}_avatar.dtwin`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); triggerToast(`아바타 빌드 성공`);
  }, [user, knowledgeList, profile.userName, triggerToast]);

  const handleRegisterAvatar = async () => {
    if (!user) return;
    const myKnowledge = knowledgeList.filter(k => Number(k.domainIdx) === 7);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registry', user.uid), { ownerUid: user.uid, userName: profile.userName, userAlias: profile.userAlias, userPhoto: profile.userPhoto, userIntro: profile.userIntro, totalKP, nodeCount: myKnowledge.length, fees: registrationFee, timestamp: Date.now(), status: 'active' });
    setIsAvatarRegistered(true); setShowRegisterFeeModal(false); triggerToast("지능 시장 등록 완료");
  };

  const handleDeleteQna = async (docId) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'landingQnA', docId)); triggerToast("Q&A 기록이 삭제되었습니다."); } catch (e) { triggerToast("삭제 중 오류 발생"); }
  };

  const getDisplayNodes = useCallback((name) => {
    if (!masterIntelSet || !name) return [];

    const safeName = String(name);
    const sName = formatters.standardizeName(safeName);
    const baseName = sName.replace(' (Super)', '').replace(' (Ultra)', '').replace(' (Hyper)', '').replace(' (Star)', '').trim();
    
    const isUltraSubscribed = subscribedAvatars.some(s => s.userName === `${baseName} (Ultra)`);
    const isSuperSubscribed = subscribedAvatars.some(s => s.userName === `${baseName} (Super)`);
    
    const isUltra = isUltraSubscribed || safeName.includes('(Ultra)');
    const isSuper = isSuperSubscribed || safeName.includes('(Super)');
    const isHyper = safeName.includes('(Hyper)');
    
    let finalLookupName = baseName;
    if (isUltra) finalLookupName = `${baseName} (Ultra)`;
    else if (isSuper) finalLookupName = `${baseName} (Super)`;
    
    const sourceList = (viewMode === 'landing' && baseName === formatters.standardizeName(landingProfile?.userName)) ? landingKnowledge : knowledgeList;
    
    const dbNodes = sourceList.filter(k => (formatters.standardizeName(k.masterName) === finalLookupName || formatters.standardizeName(k.masterName) === baseName) && Number(k.domainIdx) === 7);
    
    let resultNodes = [];
    if (dbNodes.length > 0) { 
      resultNodes = dbNodes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); 
    } else {
      const rawNodes = masterIntelSet[finalLookupName] || masterIntelSet[baseName] || [];
      if (!rawNodes || rawNodes.length === 0) {
         const fallbackCount = isUltra ? 90 : (isSuper ? 45 : 15);
         resultNodes = Array.from({length: fallbackCount}).map((_, i) => ({
             hashtag: `#${baseName.replace(/\s+/g, '')}_${i+1}`,
             content: `${baseName} 마스터의 핵심 지능 데이터 ${i+1} (Preview Fallback)`,
             tier: 1
         }));
      } else {
         resultNodes = rawNodes.map(node => typeof node === 'string' ? { hashtag: `#${node.replace(/ /g, '')}`, content: node, tier: 1 } : node);
      }
    }
    
    if (isHyper) resultNodes = resultNodes.filter(n => !n.tier || Number(n.tier) <= 6);
    else if (isUltra && dbNodes.length === 0) resultNodes = resultNodes.filter(n => !n.tier || Number(n.tier) <= 6);
    else if (isSuper && dbNodes.length === 0) resultNodes = resultNodes.filter(n => !n.tier || Number(n.tier) <= 3);
    else if (dbNodes.length === 0) resultNodes = resultNodes.filter(n => !n.tier || Number(n.tier) === 1);
    
    if (isUltra && resultNodes.length <= 15) {
        resultNodes = [
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Core'})),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Adv', content: String(c.content) + ' (심화 적용)' })),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Pro', content: String(c.content) + ' (전략 기획)' })),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Sys', content: String(c.content) + ' (시스템 설계)' })),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Vis', content: String(c.content) + ' (미래 비전)' })),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Leg', content: String(c.content) + ' (궁극 유산)' }))
        ];
    } else if (isSuper && resultNodes.length <= 15) {
        resultNodes = [
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Core'})),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Adv', content: String(c.content) + ' (심화 적용 및 확장 추론)' })),
            ...resultNodes.map(c => ({...c, hashtag: String(c.hashtag) + '_Pro', content: String(c.content) + ' (통합적 문제 해결 및 전략)' }))
        ];
    }
    return resultNodes;
  }, [knowledgeList, landingKnowledge, landingProfile, viewMode, subscribedAvatars, masterIntelSet]);

  const handleDeepDive = async (name) => {
    if (!name) return; 
    if (user && user.isAnonymous) { triggerToast("구글 로그인이 필요합니다."); return; }
    setIsTyping(true); triggerToast(`${String(formatters.standardizeName(name))} 분석 중...`);
    const targetName = String(formatters.standardizeName(name));
    let expertK = getDisplayNodes(targetName).map(node => String(node.content)).join("\n\n");
    try {
      const res = await FirebaseServices.callGeminiEngine({ contents: [{ parts: [{ text: `${targetName}의 지능 지도를 분석하여 인사이트를 도출하라. [현대적 재해석], [실천 로직], [기대 효과] 순으로 분석할 세.` }] }], systemInstruction: { parts: [{ text: `너는 지식 공학자다. 각인 지능: ${expertK.slice(0, 100000)}` }] } }, engineConfig);
      if (res.candidates?.[0]?.content?.parts?.[0]?.text) setDeepDiveResult({ title: `${targetName} 지능 심층 분석`, content: String(res.candidates[0].content.parts[0].text) });
    } catch (e) { triggerToast("분석 지연 발생"); } finally { setIsTyping(false); }
  };

  const handleExpertSendMessage = async () => {
    if (!expertChatInput.trim() || !user || !expertChatTarget) return;
    if (user && user.isAnonymous) { triggerToast("구글 로그인이 필요합니다."); return; }
    const targetName = String(formatters.standardizeName(expertChatTarget.name));
    const input = expertChatInput; setExpertChatInput(''); setIsTyping(true);
    setMessages(prev => { const slotData = prev[activeDomainIdx] || {}; const history = slotData[targetName] || []; return { ...prev, [activeDomainIdx]: { ...slotData, [targetName]: [...history, { role: 'user', content: input, id: Date.now() }] } }; });
    const expertK = getDisplayNodes(targetName).map(node => String(node.content)).join("\n\n").slice(0, 100000);
    try {
      const res = await FirebaseServices.callGeminiEngine({ 
        contents: [{ parts: [{ text: input }] }], 
        systemInstruction: { parts: [{ text: `너는 오직 ${targetName} 위원 본인이다. [하이브리드 추론 가이드]: 각인지식(${expertK})을 최우선 전제로 삼되 부족한 부분은 보완하라. 답변 시 '([node 숫자])' 형태의 표기는 절대 금지하며, 강조할 내용은 **강조** 문법만 사용하라.` }] } 
      }, engineConfig);
      const content = String(res.candidates?.[0]?.content?.parts?.[0]?.text || "연결 지연.");
      setMessages(prev => { const slotData = prev[activeDomainIdx] || {}; const history = slotData[targetName] || []; return { ...prev, [activeDomainIdx]: { ...slotData, [targetName]: [...history, { role: 'assistant', content: content, id: Date.now()+1 }] } }; });
    } catch (e) {
      setMessages(prev => { const slotData = prev[activeDomainIdx] || {}; const history = slotData[targetName] || []; return { ...prev, [activeDomainIdx]: { ...slotData, [targetName]: [...history, { role: 'system', content: `API 오류: ${e.message}`, id: Date.now() }] } }; });
    } finally { setIsTyping(false); }
  };

  const handleSendMessage = async (forcedPrompt = null) => {
    const currentInput = forcedPrompt || String(chatInput);
    if (!currentInput.trim() || (!user && viewMode !== 'landing')) return;

    if (viewMode !== 'landing' && user && user.isAnonymous) {
      triggerToast("구글 로그인이 필요합니다.");
      return;
    }

    if (containsBannedWord(currentInput)) {
        triggerToast("욕설 및 비방의 질문은 받지 않습니다.");
        if (!forcedPrompt) setChatInput('');
        return;
    }

    const slotKey = viewMode === 'landing' ? 'landing' : activeDomainIdx;  
    
    const userMsgId = Date.now();
    setMessages(prev => { const slotData = prev[slotKey] || { board: [] }; return { ...prev, [slotKey]: { ...slotData, board: [...(slotData.board || []), { role: 'user', content: currentInput, id: userMsgId }] } }; });
    if (!forcedPrompt) setChatInput(''); setIsTyping(true);

    try {
      let K_POOL = "";
      let systemInstructionText = "";

      const activeGiantsNames = activeDomainIdx === 6 ? joinedMasters : MASTER_CONFIG.filter(m => m.slot === activeDomainIdx && activeMembers.includes(m.name)).map(m => m.name);    
      
      if (viewMode !== 'landing' && activeDomainIdx !== 6 && activeGiantsNames.length === 0) {
          triggerToast("최소 1명 이상의 위원을 참석시켜주세요.");
          setIsTyping(false);
          return;
      }
      
      let finalGiantsNames = activeGiantsNames;
      let isSoloMyAvatar = false;
      if (activeDomainIdx === 6 && activeGiantsNames.length === 0) {
          finalGiantsNames = [profile.userName];
          isSoloMyAvatar = true;
      }
      if (viewMode === 'landing') {
        K_POOL = landingKnowledge.map(k => `[Fragment]: ${k.content}`).join("\n\n");
        
        const toneInstruction = "매우 정중하고 전문적인 컨설턴트/비즈니스 톤으로, 격식 있는 존댓말(하십시오체)을 사용하여 신뢰감 있게 답하라.";
        
        systemInstructionText = `너는 '${landingProfile?.userName}'의 디지털 아바타다. [어투 지시사항]: ${toneInstruction}\n각인지식(${K_POOL.slice(0, 150000)})을 최우선 전제로 삼되 부족한 부분은 모델 지능 활용. 답변 시 '([node 숫자])' 표기 금지, **강조**만 사용.`;
      } else {
        finalGiantsNames.forEach(masterName => {
          const sName = formatters.standardizeName(masterName); const baseName = sName.replace(' (Super)', '').replace(' (Ultra)', '');
          const isUltraSub = subscribedAvatars.some(s => s.userName === `${baseName} (Ultra)`);
          const isSuperSub = subscribedAvatars.some(s => s.userName === `${baseName} (Super)`);
          
          const targetKey = Object.keys(masterIntelSet).find(k => k === (isUltraSub ? `${baseName} (Ultra)` : isSuperSub ? `${baseName} (Super)` : baseName) || k.replace(/\s+/g, '') === baseName.replace(/\s+/g, ''));
          let intelNodes = targetKey ? masterIntelSet[targetKey] : [];
          if (isUltraSub && intelNodes.length === 15) intelNodes = [...intelNodes, ...intelNodes.map(n => (n.content || n) + " (심화)"), ...intelNodes.map(n => (n.content || n) + " (전략)"), ...intelNodes.map(n => (n.content || n) + " (시스템)"), ...intelNodes.map(n => (n.content || n) + " (비전)"), ...intelNodes.map(n => (n.content || n) + " (유산)")];
          else if (isSuperSub && intelNodes.length === 15) intelNodes = [...intelNodes, ...intelNodes.map(n => (n.content || n) + " (심화)")];
          K_POOL += intelNodes.map(node => `[위원: ${masterName} / Node]: ${node.content || node}`).join("\n") + "\n\n";
        });
        
        let chairmanPrompt = "";
        let formatGuide = "";
        const spices = ideaSpices;
        const isDefaultMode = !spices.mckinsey && !spices.ir && !spices.redteam && !spices.qna;

        if (activeDomainIdx === 6) {
          let toneInstruction = "대화 형식은 철저히 배제하고, 복사해서 즉시 보고서나 기획서로 쓸 수 있는 완성된 비즈니스 전략 리포트 형태로 작성하라.";
          
          if (isDefaultMode) {
              toneInstruction = "어조는 매우 유쾌하고 뼈 때리는 재치와 유머가 넘치게 작성하라. 농담과 위트 있는 비유를 섞어가며 아이디어를 찰지게 분석하는 예능 토크쇼 같은 매력적인 톤을 유지하라. 이모지(😎, 🚀, 💡, 🔥 등)도 적극적으로 사용하여 읽는 재미를 극대화하라.";
          }
          
          if (spices.mckinsey) {
              toneInstruction += " 어조는 매우 단호하고 냉철한 컨설턴트 톤을 유지하며, '~할 수 있습니다' 같은 유약한 표현을 배제하고 '~해야 합니다', '~가 유일한 해법입니다'와 같은 단정적 어조를 강제하라.";
          }
          if (spices.ir) {
              toneInstruction += " 어조는 실리콘밸리 IR 피치 톤을 사용하여 시장 파괴적이고 혁명적인 뉘앙스를 담고 투자자를 매혹시키는 확신에 찬 표현을 써라.";
          }

          if (isSoloMyAvatar) {
              chairmanPrompt = `너는 사용자 본인의 디지털 자아(Digital Twin)인 '${profile.userName} 아바타'다. 외부 거장 없이 오직 너에 각인된 지능 유닛(KNOWLEDGE_POOL)만을 사용하여 본체(사용자)의 아이디어를 스스로 피드백하고 메타인지적으로 발전시켜라. ${toneInstruction}`;
          } else {
              chairmanPrompt = `너는 최고 전략 고문단(Brain Trust)의 수석 조율자다. 사용자가 제시한 '아이디어'를 중심에 두고, 오늘 초빙된 거장들("${finalGiantsNames.join(', ')}")의 지능 유닛을 철저히 융합하여 사용자의 기획을 검증하고 고도화하라. ${toneInstruction}`;
          }

          let structureGuide = "[필수 출력 양식 - 반드시 아래의 구조로 작성할 것]\n";
          
          if (spices.mckinsey) {
              structureGuide += "### 📋 [Executive Summary (핵심 요약)]\n- (바쁜 의사결정권자를 위한 3줄 핵심 요약)\n\n";
          }

          structureGuide += "### 💡 [MY IDEA: 아이디어 핵심 요약 및 강점]\n- (사용자의 아이디어가 가진 타당성과 시장/상황적 강점을 자신감 있고 논리적으로 서술)\n\n";

          if (spices.redteam) {
              structureGuide += "### ⚠️ [레드팀 검증: 아이디어의 치명적 리스크]\n- (본 기획이 실패할 수 있는 최악의 시나리오나 맹점을 신랄하게 지적)\n\n### 🛡️ [거장 지능 융합: 완벽한 방어 논리]\n- (초빙된 거장들의 [지능 노드]를 총동원하여 앞서 지적한 리스크를 어떻게 무력화하는지 서술. 거장의 통찰을 굵은 글씨로 강조)\n\n";
          } else {
              structureGuide += "### 🧠 [거장 지능 융합: 논리적 보완점 및 고도화]\n- (초빙된 거장들의 [지능 노드]를 융합하여 아이디어의 사각지대를 보완하고 논리를 무장시킴. 거장의 통찰을 굵은 글씨로 강조)\n\n";
          }

          let impactInstruction = spices.ir ? "- (가상의 정량적 임팩트 및 수치화된 기대효과를 반드시 포함하여 작성)" : "- (이 아이디어를 즉시 실행에 옮기거나 타인을 설득하기 위한 구체적인 3단계 로드맵 및 기대 효과)";

          structureGuide += `### 🚀 [실행 전략 및 설득 논리 (Action Plan)]\n${impactInstruction}\n\n`;

          if (spices.qna) {
              structureGuide += "### ❓ [예상 Q&A (반박 및 방어)]\n- Q1: (발표 후 예상되는 가장 까다로운 질문 1)\n  - A1: (거장의 지능을 활용한 압도적인 모범 답변)\n- Q2: (발표 후 예상되는 가장 까다로운 질문 2)\n  - A2: (모범 답변)\n";
          }

          formatGuide = structureGuide;
        } else {
          chairmanPrompt = `너는 meta DNA 지능형 위원회의 'AI 코디네이터'다. 참여한 위원들("${finalGiantsNames.join(', ')}")의 지능 유닛만을 근거로 토론을 진행하라. 불필요한 본인 소개("저는 AI 코디네이터입니다" 등)나 인사말은 절대 생략하고, 곧바로 오늘의 핵심 의제를 소개하며 토론을 시작하라.`;

          formatGuide = `[필수 출력 양식 - 도입부 인사말 없이 바로 안건 상정부터 시작할 것]
### 🌐 [meta DNA 지능형 위원회 토론 기록]
**[안건 상정]**: (사용자의 질문을 바탕으로 "오늘의 핵심 의제는 [OOO]입니다. 심도 있는 토론을 시작하겠습니다." 형태의 짧은 문장 작성)

**[위원: 이름] - "핵심 발언 요약"**
대화 내용... (위원들끼리 서로의 이름을 부르며 반박하거나 동의하는 생생한 티키타카 대화 형식. 각자의 [지능 노드]를 자연스럽게 굵은 글씨로 언급)
**[위원: 이름] - "핵심 발언 요약"**
대화 내용...
---
### *** [최종 전략 합의안] : "합의안 제목"
(구체적인 3단계 실행 로드맵 및 결론 요약)`;
        }
        
        systemInstructionText = `${chairmanPrompt} [하이브리드 추론 가이드]: 제공된 'KNOWLEDGE_POOL' 지식 최우선 근거.\n\n${formatGuide}\n\n'([node 숫자])' 표기 절대 금지, **강조**만 사용.\n\n[KNOWLEDGE_POOL]\n${K_POOL.slice(0, 35000)}`;
      }
      const res = await FirebaseServices.callGeminiEngine({ contents: [{ parts: [{ text: currentInput }] }], systemInstruction: { parts: [{ text: systemInstructionText }] } }, engineConfig);
      const content = String(res.candidates?.[0]?.content?.parts?.[0]?.text || "응답 지연.");
      const tokenUsage = res.usageMetadata || null; 
      const asstMsgId = Date.now() + 1;

      if (viewMode !== 'landing' && user) { 
         const currentCoins = Number(profile?.userCoins) || 0;
         const currentMasterName = profile?.userName || '사용자';

         if (currentCoins >= 1) {
            try {
               await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'knowledge'), { 
                   content: content.substring(0, 100000), 
                   domainIdx: 7, 
                   masterName: currentMasterName, 
                   source: "AUTO_CHAT_IMPRINT", 
                   hashtag: `#자동각인_${String(asstMsgId).slice(-4)}`, 
                   timestamp: asstMsgId 
               });
               await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { 
                   profile: { userCoins: increment(-1) } 
               }, { merge: true });
               
               triggerToast("답변 자동 각인 완료 (-1 AC)");
            } catch (err) {
               triggerToast("자동 각인 DB 저장 실패 (권한 또는 네트워크)");
            }
         } else {
            triggerToast("AC가 부족하여 자동 각인되지 않았습니다.");
         }
      }
      if (viewMode === 'landing' && targetLandingUid) {
        const qnaCol = collection(db, 'artifacts', appId, 'users', targetLandingUid, 'landingQnA');
        await addDoc(qnaCol, { question: currentInput, answer: content, timestamp: asstMsgId });
        await setDoc(doc(db, 'artifacts', appId, 'users', targetLandingUid, 'settings', 'profile'), { profile: { answerCount: increment(1) } }, { merge: true });
      } else if (user) {
        const roomCol = collection(db, 'artifacts', appId, 'users', user.uid, 'roomMessages');
        await addDoc(roomCol, { slotIdx: activeDomainIdx, role: 'user', content: currentInput, timestamp: userMsgId });
        await addDoc(roomCol, { slotIdx: activeDomainIdx, role: 'assistant', content, timestamp: asstMsgId, tokenUsage }); 
      }
      setMessages(prev => { const slotData = prev[slotKey] || { board: [] }; return { ...prev, [slotKey]: { ...slotData, board: [...(slotData.board || []), { role: 'assistant', content, id: asstMsgId, tokenUsage }] } }; });
    } catch (e) { 
      triggerToast("오류 발생"); 
      setMessages(prev => { const slotData = prev[slotKey] || { board: [] }; return { ...prev, [slotKey]: { ...slotData, board: [...(slotData.board || []), { role: 'system', content: `API 오류: ${e.message}`, id: Date.now() }] } }; });
    } finally { setIsTyping(false); }
  };

  const handleDeleteRoomMessage = async (docId) => {
    const success = await FirebaseServices.deleteRoomMessage(docId, user?.uid);
    if (success) triggerToast("대화가 삭제되었습니다.");
  };

  const handleTTS = useCallback((text, id) => {
    if (isSpeaking === id) { window.speechSynthesis.cancel(); setIsSpeaking(null); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\*/g, '').replace(/#/g, ''));
    utterance.lang = 'ko-KR';
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('ko'));
    if (voices.length > 0) {
        const targetVoice = voices.find(v => { const name = v.name.toLowerCase(); return ttsGender === 'male' ? ['민상', '인준', '민수'].some(k => name.includes(k)) : ['해미', '유나'].some(k => name.includes(k)); });
        utterance.voice = targetVoice || voices[0];
    }
    utterance.onend = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance); setIsSpeaking(id);
  }, [isSpeaking, ttsGender]);

  const handleImprintChat = (content) => {
    if (Number(profile.userCoins || 0) < 10) { triggerToast("AC가 부족하여 각인할 수 없습니다."); return; }
    setManualText(content); setManualTag("#위원회_합의"); setShowImprintModal(true);
  };

  const handleSubscribeAvatarFromMarket = async (avatar, type) => {
    const cost = type === 'subscribe' ? (avatar.fees?.monthly || 50) : (avatar.fees?.daily || 5);
    if (Number(profile.userCoins || 0) < cost) { triggerToast(`도입 AC가 부족합니다.`); return; }
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { "profile.userCoins": increment(-cost) });
      const ownerEarning = Math.floor(cost * 0.7);
      if (!avatar.ownerUid.startsWith('system_')) batch.set(doc(db, 'artifacts', appId, 'users', avatar.ownerUid, 'settings', 'profile'), { profile: { userCoins: increment(ownerEarning) } }, { merge: true });
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'finance', 'revenue'), { avatarRevenue: increment(avatar.ownerUid.startsWith('system_') ? cost : (cost - ownerEarning)) }, { merge: true });
      batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'subscriptions', avatar.ownerUid), { ...avatar, adoptionType: type, adoptedAt: Date.now() });
      await batch.commit();
      triggerToast(`${avatar.userName} 도입 완료 (-${cost} AC).`);
    } catch (e) { triggerToast("거래 처리 중 오류가 발생했습니다."); }
  };

  const handleUnregisterAvatar = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registry', user.uid)); 
      setIsAvatarRegistered(false); 
      triggerToast("등록 해제 완료");
    } catch (error) {
      console.error("해제 에러:", error);
      triggerToast("등록 해제 중 오류가 발생했습니다.");
    }
  };


  const ctx = {
    state: { user, profile, activeTab, activeDomainIdx, domains, ttsGender, messages, currentAgenda, isTyping, isSpeaking, chatInput, joinedMasters, subscribedAvatars, useChairmanContext, marketRoom, marketSearchTerm, filteredMarketPool, pendingTransactions, knowledgeList, isAvatarRegistered, engineConfig, systemRevenue, selectedTfCategoryId, ideaSpices, activeMembers },
    actions: { setActiveTab, setActiveDomainIdx, setTtsGender, setSelectedTfCategoryId, setCurrentAgenda, setIsSpeaking, setChatInput, triggerToast, handleSendMessage, handleTTS, handleDeleteRoomMessage, setProfile, handleSaveProfile, setEngineConfig, setDomains, handleLogout, handleDeepDive, setExpertChatTarget, handleDeleteQna, handleRegisterAvatar, handleUnregisterAvatar, deductAC, setDetailKnowledge, handleChargeAC, handleSubscribeAvatarFromMarket, setMarketRoom, setMarketSearchTerm, setPendingTransactions, setShowImprintModal, setShowQnaModal, handleBuildAvatar, setShowRegisterFeeModal, setJoinedMasters, setUseChairmanContext, setPreviewExpert, setExpertGenomeSlot, setIdeaSpices, setActiveMembers },
    refs: { fileInputRef, dtwinFileInputRef, chatTopRef },
    utils: { getDisplayNodes }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amountParam = urlParams.get('amount');
    if (paymentStatus === 'success' && amountParam && user) {
      const chargeAmount = Number(amountParam);
      const batch = writeBatch(db);
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
      batch.set(userRef, { profile: { userCoins: increment(chargeAmount) } }, { merge: true });
      batch.commit().then(() => {
        triggerToast(`${chargeAmount.toLocaleString()} AC 결제 및 충전 완료!`);
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: cleanUrl}, '', cleanUrl);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIsAvatarRegistered(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'registry', user.uid), (docSnap) => {
      setIsAvatarRegistered(docSnap.exists());
    }, (error) => console.error("Avatar registry check error:", error));
    return () => unsub();
  }, [user]);

  useEffect(() => { document.title = "K-Avatar System"; }, []);
  useEffect(() => { chatTopRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, activeDomainIdx]);

  useEffect(() => {
    const resolveRouteAndAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let targetUid = urlParams.get('uid');
      let aliasParam = urlParams.get('alias');
      const path = window.location.pathname;
      if (path.startsWith('/@')) aliasParam = path.substring(2);

      if (aliasParam) {
        try {
          const cleanAlias = String(aliasParam).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          const aliasDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'aliases', cleanAlias));
          if (aliasDoc.exists()) targetUid = aliasDoc.data().ownerUid;
        } catch(e) {}
      }

      if (targetUid) { 
        setViewMode('landing'); 
        setTargetLandingUid(targetUid); 
      }
      
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try { 
              await signInWithCustomToken(auth, __initial_auth_token); 
          } catch(tokenError) { 
              console.warn("Custom token mismatch, falling back to anonymous login:", tokenError);
              await signInAnonymously(auth); 
          }
        } else {
          const isPaymentRedirect = urlParams.get('payment') === 'success' || urlParams.get('payment') === 'fail';
          if (!isPaymentRedirect) {
            await signInAnonymously(auth);
          }
        }
      } catch(e) { console.error("Auth Fail", e); }
    };
    resolveRouteAndAuth();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => { 
      setUser(currentUser); 
      if (currentUser && !currentUser.isAnonymous && viewMode === 'main') {
        try {
          const profileSnap = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'settings', 'profile'));
          if (!profileSnap.exists()) setShowOnboardingModal(true);
        } catch (e) {}
      }
    }); 
    return () => unsub();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'landing') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0; 
        document.documentElement.scrollTop = 0; 
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, landingKnowledge]);

  // --- 통합 라우팅 분기 ---
  if (viewMode === 'intro') {
    return <IntroView onSelectMode={(mode) => setViewMode(mode)} />;
  }

  if (viewMode === 'b2b') {
    return (
      <>
        <B2BEnterpriseView user={user} engineConfig={engineConfig} onBackToIntro={() => setViewMode('intro')} getDisplayNodes={getDisplayNodes} setDetailKnowledge={setDetailKnowledge} />
        {detailKnowledge && (
          <div className="fixed inset-0 z-[50000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-left font-bold">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 border-t-4 border-blue-500">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <DatabaseIcon className="text-blue-500" size={18}/>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{String(detailKnowledge.hashtag || "#지능_데이터")}</span>
                </div>
                <button onClick={() => setDetailKnowledge(null)} className="p-2 bg-slate-200 rounded-full active:scale-90 transition-all"><X size={16}/></button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                <p className="text-sm text-slate-800 leading-[1.8] whitespace-pre-wrap">{String(detailKnowledge.content)}</p>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
                 <span className="text-[8px] text-slate-400 font-black uppercase">Source: {String(detailKnowledge.source || 'Imported')}</span>
                 <span className="text-[8px] text-slate-400 font-black uppercase">{new Date(detailKnowledge.timestamp || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (viewMode === 'landing') {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-white font-sans text-slate-900 text-[10px] overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ overflowAnchor: 'none' }}>
        <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center shrink-0"><div className="flex items-center gap-2"><Globe className="text-blue-600" size={18} /><span className="text-lg font-black tracking-tighter text-slate-900">k-avatar.kr<span className="text-blue-500">/@{String(landingProfile?.userAlias || "owner")}</span></span></div><button onClick={() => setViewMode('main')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-all">OWNER LOGIN <ExternalLink size={10}/></button></nav>
        
        <section className="relative py-12 pb-12 flex flex-col items-center px-6 text-center shrink-0">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(227,242,253,1)_0%,rgba(255,255,255,1)_100%)]"></div>
          
          <div className="flex flex-col items-center w-full">
            <div className="relative flex items-center gap-6 animate-in zoom-in duration-500">
              <div className="relative group cursor-pointer" onClick={() => { setPreviewExpert({ name: landingProfile?.userName, slot: 7, theme: 'Digital Persona' }); setExpertGenomeSlot(0); }}>
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden">
                  <img src={formatters.getAvatarUrl(landingProfile?.userName, landingProfile?.userPhoto)} className="w-full h-full object-cover" alt="p" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg"><Zap size={20} fill="white"/></div>
              </div>
              <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-blue-100 shadow-sm">
                <Award className="text-amber-500 mb-1" size={24} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reputation</span>
                <span className="text-2xl font-black text-blue-600">{String(totalKP)} <span className="text-[10px]">KP</span></span>
              </div>
            </div>
            
            <div className="mt-8 space-y-4 max-w-lg">
              <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Authorized Intelligence Avatar</h2>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{String(landingProfile?.userName || "Anonymous Master")}</h1>
              <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap font-bold px-4">{String(landingProfile?.userIntro || "소개글이 없습니다.")}</p>
              
              <div className="flex flex-col items-center gap-3 pt-4 w-full">
                <button onClick={() => setShowLandingChat(true)} className="w-full max-w-[280px] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all">
                  <MessageCircle size={16}/> ASK TO AVATAR
                </button>
                <button onClick={() => setViewMode('intro')} className="w-full max-w-[280px] py-4 bg-amber-400 text-slate-900 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-all">
                  <Globe size={16}/> Human OS 체험하기
                </button>
                <button onClick={() => triggerToast("명함 주소 복사됨")} className="mt-2 text-slate-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Share2 size={12}/> Share Business Card
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24 w-full text-slate-900 shrink-0">
          <div className="flex flex-col gap-2 mb-12 text-left border-l-4 border-blue-600 pl-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">MY AVATAR GRID FLOW</h3>
            <p className="text-slate-400 text-xs font-bold uppercase">Authorized Knowledge meta-Genome Records</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {landingKnowledge.filter(k => Number(k.domainIdx) === 7 && k.source === 'DOC_IMPORT').length > 0 ? landingKnowledge.filter(k => Number(k.domainIdx) === 7 && k.source === 'DOC_IMPORT').sort((a,b)=> (b.timestamp||0)-(a.timestamp||0)).map(k => (
               <KnowledgePreviewCard key={k.id} k={k} viewMode="landing" userId={targetLandingUid} getDisplayNodes={getDisplayNodes} onRead={setDetailKnowledge} />
            )) : <div className="col-span-full py-20 text-center text-slate-300 font-bold border-2 border-dashed rounded-[3rem]">문서로 각인된 핵심 지능 노드만 표시됩니다.</div>}
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-6 py-24 w-full text-slate-900 shrink-0"><div className="flex flex-col gap-2 mb-12 text-left border-l-4 border-slate-900 pl-6"><h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Recent Conversations</h3><p className="text-slate-400 text-xs font-bold uppercase">Publicly Shared Intelligence Feed</p></div><div className="space-y-6">{landingHistory.length > 0 ? landingHistory.map((qna, idx) => (<div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 font-bold"><div className="flex items-center gap-2 mb-4 text-blue-600"><MessageSquare size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Question</span></div><p className="text-slate-800 text-sm mb-6 pl-2 leading-relaxed">{qna.question}</p><div className="flex items-center gap-2 mb-4 text-slate-400"><Sparkles size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Avatar's Response</span></div><div className="bg-white p-5 rounded-2xl text-slate-600 text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-100 italic shadow-inner">{qna.answer}</div><div className="mt-4 text-right"><span className="text-[7px] text-slate-300 font-black uppercase tracking-tighter">{new Date(qna.timestamp).toLocaleString()}</span></div></div>)) : (<div className="py-20 text-center text-slate-200 font-black border-2 border-dashed rounded-[3rem]">기록된 대화가 아직 없습니다.</div>)}</div></section>
        <footer className="py-20 border-t bg-slate-50 text-center px-6 shrink-0"><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© HUMAN OS FRAMEWORK • POWERED BY META-DNA</p></footer>
        {showLandingChat && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-xl flex flex-col font-black text-slate-900 text-[10px]">
            <header className="p-6 flex justify-between items-center bg-white/5 border-b border-white/10 shrink-0"><div className="flex items-center gap-3"><img src={formatters.getAvatarUrl(landingProfile?.userName, landingProfile?.userPhoto)} className="w-10 h-10 rounded-full border" alt="a" /><div className="text-left text-white"><h4 className="text-sm font-black">{String(landingProfile?.userName)}'s Avatar</h4><span className="text-[8px] text-blue-400 uppercase">Synchronized Mode</span></div></div><button onClick={() => { setShowLandingChat(false); setCurrentAgenda(''); }} className="p-2 bg-white/10 text-white rounded-full"><X size={20}/></button></header>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div ref={chatTopRef} className="h-1 shrink-0" />
              {isTyping && <div className="h-1 w-full bg-blue-900/50 overflow-hidden shrink-0 mb-2"><div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 animate-progress-glow w-full shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div></div>}
              {(messages['landing']?.board || []).slice().reverse().map((m, idx) => (<div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-top-2`}><div className={`p-5 rounded-[2rem] max-w-[90%] text-left font-bold ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' : 'bg-white/10 text-slate-100 border border-white/5 rounded-tl-none'}`}><div className="text-[11px] leading-relaxed whitespace-pre-wrap">{String(m.content)}</div>{m.role === 'assistant' && <button onClick={() => handleTTS(m.content, m.id)} className="mt-4 text-[8px] flex items-center gap-1 opacity-50 text-white font-black uppercase tracking-widest"><Volume2 size={10}/> LISTEN</button>}</div></div>))}
            </div>
            <div className="p-6 pb-12 bg-white/5 shrink-0"><div className="max-w-4xl mx-auto flex items-center gap-2 bg-white p-1 rounded-full shadow-2xl h-[52px] font-black text-slate-900"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="질문을 입력하세요..." className="flex-1 px-5 text-sm outline-none bg-transparent" disabled={isTyping} /><button onClick={() => handleSendMessage()} className="bg-slate-900 text-white p-3 rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isTyping}><ArrowRight size={20}/></button></div></div>
          </div>
        )}
        {detailKnowledge && (
          <div className="fixed inset-0 z-[20000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-left font-bold">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 border-t-4 border-blue-500">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <DatabaseIcon className="text-blue-500" size={18}/>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{String(detailKnowledge.hashtag || "#지능_데이터")}</span>
                </div>
                <button onClick={() => setDetailKnowledge(null)} className="p-2 bg-slate-200 rounded-full active:scale-90 transition-all"><X size={16}/></button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                <p className="text-sm text-slate-800 leading-[1.8] whitespace-pre-wrap">{String(detailKnowledge.content)}</p>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
                 <span className="text-[8px] text-slate-400 font-black uppercase">Source: {String(detailKnowledge.source || 'Imported')}</span>
                 <span className="text-[8px] text-slate-400 font-black uppercase">{new Date(detailKnowledge.timestamp || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 기존 MAIN HUMAN OS VIEW ---
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden selection:bg-blue-100 text-[10px]">
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.doc,.docx" onChange={handleFileUpload} />
      <input type="file" ref={dtwinFileInputRef} className="hidden" accept=".dtwin,.json,.txt" onChange={handleAvatarImprintFileSelect} />
      
      <HeaderSection ctx={ctx} totalKP={totalKP} />
      <main className="flex-1 overflow-y-auto relative pb-24 font-black">
        {activeTab === 'training' && <CommitteeView ctx={ctx} />}
        {activeTab === 'search' && <MarketView ctx={ctx} />}
        {activeTab === 'database' && <DatabaseView ctx={ctx} totalKP={totalKP} />}
        {activeTab === 'tf' && <TfHubView ctx={ctx} />}
        {activeTab === 'system' && <SystemSettingsView ctx={ctx} totalKP={totalKP} />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-white/5 flex items-center justify-around px-2 z-[9999] shadow-2xl font-black text-white text-[10px]">
        <button onClick={() => { setActiveTab('training'); }} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'training' ? 'text-blue-400 scale-110' : 'opacity-40'}`}><Users size={18} /><span className="text-[7px]">Board</span></button>
        <button onClick={() => { setSelectedTfCategoryId(null); setActiveTab('tf'); setActiveDomainIdx(6); }} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'tf' ? 'text-blue-400 scale-110' : 'opacity-40'}`}><Layers size={18} /><span className="text-[7px]">IDEA LAB</span></button>
        <button onClick={() => { setActiveTab('search'); }} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'search' ? 'text-indigo-400 scale-110' : 'opacity-40'}`}><Search size={18} /><span className="text-[7px]">Avatar 검색</span></button>
        <button onClick={() => { setActiveTab('database'); }} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'database' ? 'text-blue-600 scale-110' : 'opacity-40'}`}><Brain size={18} /><span className="text-[7px]">MY AVATAR</span></button>
        <button onClick={() => { setActiveTab('system'); }} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'system' ? 'text-blue-600 scale-110' : 'opacity-40'}`}><Settings size={18} /><span className="text-[7px]">Settings</span></button>
      </nav>

      {/* 지식 상세 보기 모달 */}
      {detailKnowledge && (
        <div className="fixed inset-0 z-[20000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-left font-bold">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 border-t-4 border-blue-500">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <DatabaseIcon className="text-blue-500" size={18}/>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{String(detailKnowledge.hashtag || "#지능_데이터")}</span>
              </div>
              <button onClick={() => setDetailKnowledge(null)} className="p-2 bg-slate-200 rounded-full active:scale-90 transition-all"><X size={16}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
              <p className="text-sm text-slate-800 leading-[1.8] whitespace-pre-wrap">{String(detailKnowledge.content)}</p>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
               <span className="text-[8px] text-slate-400 font-black uppercase">Source: {String(detailKnowledge.source || 'Imported')}</span>
               <span className="text-[8px] text-slate-400 font-black uppercase">{new Date(detailKnowledge.timestamp || Date.now()).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {showQnaModal && (
        <div className="fixed inset-0 z-[15000] bg-slate-900/90 backdrop-blur-md flex items-end justify-center font-black text-left text-slate-900">
          <div className="bg-white w-full h-[85vh] rounded-t-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><div className="flex items-center gap-2"><MessageSquare className="text-blue-600" size={20}/><h3 className="text-lg font-black uppercase">Landing Page Q&A 관리</h3></div><button onClick={() => setShowQnaModal(false)} className="p-2 bg-slate-200 rounded-full"><X size={20}/></button></header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {myLandingQnA.length > 0 ? myLandingQnA.map((qna) => (
                <div key={qna.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group"><button onClick={() => handleDeleteQna(qna.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button><div className="flex flex-col gap-3 pr-8"><div><span className="text-[8px] font-black text-blue-600 uppercase mb-1 block">Question</span><p className="text-sm font-bold text-slate-800 leading-relaxed">{qna.question}</p></div><div className="pt-3 border-t border-slate-200/50"><span className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Answer</span><p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">{qna.answer}</p></div></div></div>
              )) : (<div className="h-full flex flex-col items-center justify-center text-slate-300"><p className="font-black">기록이 없습니다.</p></div>)}
            </div>
          </div>
        </div>
      )}

      {showImprintModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-end justify-center font-extrabold text-left text-slate-900">
          <div className="bg-white w-full rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-300 font-extrabold"><div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 font-bold"><h3 className="text-xl font-extrabold text-slate-900 uppercase">Intelligence Imprint</h3><button onClick={() => { setShowImprintModal(false); setManualText(''); }} className="p-2 bg-slate-200 rounded-full"><X size={20}/></button></div><div className="p-6 space-y-4 pb-12"><textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="데이터 입력..." style={{ height: '180px' }} className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-1 focus:ring-blue-600 font-bold text-[10px] shadow-inner" /><input value={manualTag} onChange={(e) => setManualTag(e.target.value)} placeholder="#태그" className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-[10px] shadow-inner" /><button onClick={async () => { if (!manualText.trim()) return; const success = await deductAC(10); if (!success) return; await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'knowledge'), { content: manualText.trim().substring(0, 8000), domainIdx: 7, masterName: profile.userName, source: "Manual", hashtag: manualTag, timestamp: Date.now() }); setManualText(''); setManualTag(''); setShowImprintModal(false); triggerToast("CHAT 각인 완료 (-10 AC)"); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-extrabold text-lg shadow-xl uppercase transition-all active:scale-95">각인 시작</button></div></div>
        </div>
      )}

      {showRegisterFeeModal && (
        <div className="fixed inset-0 z-[13000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 font-black text-slate-900">
          <div className="bg-white w-full max-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border-t-8 border-amber-500"><header className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center"><div className="flex items-center gap-2"><DollarSign size={20} className="text-amber-500" /><h3 className="text-lg font-black uppercase">Pricing</h3></div><button onClick={() => setShowRegisterFeeModal(false)} className="p-2 bg-slate-200 rounded-full"><X size={16}/></button></header><div className="p-8 space-y-6"><div className="space-y-4"><div className="flex flex-col gap-2"><label className="text-[10px] text-slate-400 font-black uppercase ml-1">Subscription (1 Month) AC</label><input type="number" value={registrationFee.monthly} onChange={(e)=>setRegistrationFee({...registrationFee, monthly: Number(e.target.value)})} className="bg-slate-50 p-4 rounded-2xl font-bold text-lg w-full shadow-inner border-none focus:ring-2 focus:ring-amber-500" /></div><div className="flex flex-col gap-2"><label className="text-[10px] text-slate-400 font-black uppercase ml-1">Rent (1 Day) AC</label><input type="number" value={registrationFee.daily} onChange={(e)=>setRegistrationFee({...registrationFee, daily: Number(e.target.value)})} className="bg-slate-50 p-4 rounded-2xl font-bold text-lg w-full shadow-inner border-none focus:ring-2 focus:ring-amber-500" /></div></div><button onClick={handleRegisterAvatar} className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black text-xs shadow-lg uppercase active:scale-95 transition-all">등록 승인</button></div></div>
        </div>
      )}

      {previewExpert && (
        <div className="fixed inset-0 z-[11000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 font-black">
          <div className="bg-white w-full max-sm rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-blue-600 flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-8 flex flex-col items-center shrink-0">
               <div className={`w-24 h-24 rounded-full border-4 p-1 mb-4 shadow-md overflow-hidden bg-slate-50 ${previewExpert.name && previewExpert.name.includes("(Ultra)") ? 'border-purple-400' : previewExpert.name && previewExpert.name.includes("(Super)") ? 'border-amber-400' : 'border-blue-50'}`}>
                  <img src={formatters.getAvatarUrl(previewExpert.name, (previewExpert.slot === 7 ? (viewMode === 'landing' ? landingProfile?.userPhoto : profile?.userPhoto) : (previewExpert.userPhoto || null)))} className="w-full h-full object-cover" alt="p" />
               </div>
               <h3 className="text-xl font-black text-slate-900">{String(formatters.standardizeName(previewExpert.name))}</h3>
               <div className="mt-4 flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] text-slate-400 font-black uppercase leading-none mb-0.5">Genome Map</span>
                     <span className="text-[10px] font-black text-blue-600">Total {getDisplayNodes(previewExpert.name).length} Nodes</span>
                  </div>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 text-left text-slate-800 custom-scrollbar">
               <div className="grid grid-cols-4 gap-1.5">
                  {getDisplayNodes(previewExpert.name).map((node, idx) => { 
                     const color = RAINBOW_THEMES[idx % 7]; 
                     return (
                        <div key={idx} className={`p-1.5 ${color.bg} rounded-xl border ${color.border} text-center flex flex-col justify-center min-h-[35px] transition-all duration-300 hover:scale-105 shadow-sm`}>
                           <span className="text-[7px] text-slate-800 font-black leading-tight truncate px-1" title={node.content}>{node ? String(node.content || node).substring(0, 50) : '-'}</span>
                        </div>
                     ); 
                  })}
               </div>
            </div>
            <div className="p-8 shrink-0 flex flex-col gap-4">
               <div className="grid grid-cols-2 gap-3 w-full">
                  <button onClick={() => { handleDeepDive(previewExpert.name); setPreviewExpert(null); }} className="bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-black text-[10px] active:scale-95 transition-all shadow-sm"> 지능 분석 </button>
                  <button onClick={() => { setExpertChatTarget(previewExpert); setPreviewExpert(null); }} className="bg-blue-600 text-white py-3.5 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 transition-all"> 1:1 CHAT </button>
               </div>
               <button onClick={() => setPreviewExpert(null)} className="w-full text-slate-300 hover:text-slate-500 transition-colors flex justify-center"><X size={20}/></button>
            </div>
          </div>
        </div>
      )}

      {expertChatTarget && (
        <div className="fixed inset-0 z-[12000] bg-slate-900/95 backdrop-blur-md flex items-end justify-center font-black text-left text-slate-900 text-[10px]">
          <div className="bg-white w-full h-[90vh] rounded-t-[3rem] shadow-2xl flex flex-col border-t-4 border-blue-600 overflow-hidden animate-in slide-in-from-bottom">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
               <div className="flex items-center gap-3">
                  <img src={formatters.getAvatarUrl(expertChatTarget.name, (expertChatTarget.slot === 7 ? (viewMode === 'landing' ? landingProfile?.userPhoto : profile?.userPhoto) : (expertChatTarget.userPhoto || null)))} className="w-12 h-12 rounded-full border-2 border-blue-100 object-cover" alt="e" />
                  <div className="text-left"><h3 className="text-lg font-black text-slate-900">{String(formatters.standardizeName(expertChatTarget.name))}</h3></div>
               </div>
               <button onClick={() => setExpertChatTarget(null)} className="p-2 bg-slate-200 rounded-full text-slate-500"><X size={24} /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
               <div ref={chatTopRef} className="h-1 shrink-0" />
               {isTyping && <div className="h-1 w-full bg-blue-50 overflow-hidden shrink-0 mb-2"><div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 animate-progress-glow w-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"></div></div>}
               {(messages[activeDomainIdx]?.[formatters.standardizeName(expertChatTarget.name)] || []).slice().reverse().map((m, idx) => (
                 <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-top-2`}>
                   <div className={`p-4 rounded-2xl shadow-md relative break-words ${m.role === 'user' ? 'max-w-[70%] bg-slate-900 text-white rounded-tr-none' : 'max-w-[85%] bg-blue-50 text-slate-800 rounded-tl-none border border-blue-100'}`}>
                     <div className="text-[10px] leading-[1.6] whitespace-pre-wrap font-bold">{String(m.content)}</div>
                   </div>
                 </div>
               ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 pb-12 shrink-0">
               <div className="max-w-5xl mx-auto flex items-center gap-2 bg-white p-1 rounded-full shadow-xl border border-blue-100 h-[48px] px-1 font-black text-slate-900 relative z-50">
                  <input type="text" autoComplete="off" value={expertChatInput} onChange={(e) => setExpertChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleExpertSendMessage()} placeholder={`${String(formatters.standardizeName(expertChatTarget.name))}에게 질문...`} className="flex-1 px-4 text-[13px] outline-none bg-transparent" disabled={isTyping}  />
                  <button onClick={handleExpertSendMessage} className="bg-blue-600 text-white p-2.5 h-10 w-10 rounded-full shadow-lg active:scale-90 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isTyping}><Send size={16} /></button>
               </div>
            </div>
          </div>
        </div>
      )}

      {deepDiveResult && (
        <div className="fixed inset-0 z-[15000] bg-slate-900/90 backdrop-blur-md flex items-end justify-center font-black text-left text-slate-900">
          <div className="bg-white w-full h-[85vh] rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom border-t-4 border-blue-500 font-black flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 font-bold shrink-0">
               <div className="flex items-center gap-2"><div className="p-1.5 bg-blue-100 rounded text-blue-600 font-bold shadow-sm"><Zap size={18}/></div><h3 className="text-lg font-black text-slate-900">Human OS 심층 분석 ✨</h3></div>
               <button onClick={() => setDeepDiveResult(null)} className="p-2 bg-slate-200 rounded-full active:scale-90 transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto flex-1 pb-32 text-left font-bold">
               <span className="text-blue-600 font-extrabold text-lg block"># {String(deepDiveResult.title)}</span>
               <div className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-[2rem] border border-slate-100 font-bold shadow-inner">{String(deepDiveResult.content)}</div>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-[40000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 font-black text-slate-900">
          <div className="bg-white w-full max-w-lg h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border-t-8 border-slate-800">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="text-slate-800" size={20}/>
                <h3 className="text-lg font-black uppercase">서비스 이용약관 및 IP 합의서</h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"><X size={20}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left bg-white custom-scrollbar">
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                본 약관은 k-avatar.kr (이하 "플랫폼")가 제공하는 디지털 아바타 생성 및 지능 위원회 서비스의 이용과 관련하여, 회사와 사용자 간의 권리, 의무, 지적재산권(IP) 합의 및 책임 사항을 규정합니다.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-600">제 1 조 (목적 및 서비스 정의)</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl">
                  본 플랫폼은 사용자가 입력한 텍스트, 문서, 대화(이하 "지능 데이터")를 기반으로 사용자의 디지털 자아(Avatar)를 구축하고, 이를 기반으로 AI 기반 하이브리드 추론 및 시뮬레이션 서비스를 제공하는 것을 목적으로 합니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-600">제 2 조 (지적재산권 및 데이터 활용 합의)</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl">
                  1. 사용자가 직접 각인(업로드 및 채팅)한 지능 데이터의 원시적 저작권은 사용자 본인에게 귀속됩니다.<br/><br/>
                  2. 사용자는 본 플랫폼 서비스를 이용함과 동시에, 자신이 제공한 지능 데이터를 플랫폼이 디지털 아바타 구축, AI 추론 모델 학습, 서비스 품질 개선을 위해 전 세계적으로 무상 및 비독점적으로 활용(복제, 가공, 전시 등)하는 것에 명시적으로 동의합니다.<br/><br/>
                  3. 플랫폼이 기본적으로 제공하는 거장(Master) 아바타의 구조, 프롬프트 엔지니어링 설계, 그리고 사용자 데이터와 결합되어 생성된 '최종 AI 산출물(결과 답변)'에 대한 기반 아키텍처 소유권은 플랫폼에 귀속됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-600">제 3 조 (사용자의 의무)</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl">
                  1. 사용자는 타인의 저작권, 영업비밀, 개인정보를 침해하는 데이터를 '지능 각인' 목적으로 업로드할 수 없습니다.<br/><br/>
                  2. 사용자가 불법적인 내용을 업로드하여 발생하는 모든 법적 책임은 전적으로 사용자 본인에게 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-600">제 4 조 (면책 조항)</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl">
                  1. 본 플랫폼에서 AI (디지털 아바타, 거장 위원회 등)가 생성한 답변 및 산출물은 확률적 추론에 기반한 정보로, 항상 정확성이나 신뢰성을 보장하지 않습니다.<br/><br/>
                  2. 플랫폼은 사용자가 AI 산출물을 바탕으로 내린 투자, 의료, 경영 등의 모든 결정 및 그로 인해 발생한 손해에 대하여 어떠한 법적 책임도 지지 않습니다. 최종 판단의 책임은 사용자에게 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-blue-600">제 5 조 (글로벌 별칭 및 계정 관리)</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl">
                  1. 사용자가 설정한 글로벌 별칭(@Alias)은 본 플랫폼 내에서 사용자를 식별하는 고유 주소입니다.<br/><br/>
                  2. 타인을 사칭하거나, 상표권을 침해하거나, 장기간 부당하게 점유할 목적으로 생성된 별칭에 대하여 플랫폼은 임의로 사용을 중지시키거나 회수할 수 있는 권리를 가집니다.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={() => { setShowTermsModal(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">
                확인 후 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[20000] bg-slate-900/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[11px] uppercase animate-in fade-in zoom-in-95 border border-white/10 text-left"><Check size={14} className="text-green-400" /><span>{String(showToast)}</span></div>}
    </div>
  );
};

export default function App() {
  return (
    <>
      <SharedStyles />
      <HumanOSApp />
    </>
  );
}