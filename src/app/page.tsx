'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SHARED_PASSWORD = '2580';

export default function StartPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showBrowserGuide, setShowBrowserGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isKakao, setIsKakao] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  /* ── 황금 비 캔버스 ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles: { x: number; y: number; speed: number; size: number; opacity: number; swing: number; swingSpeed: number; swingOffset: number; }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, speed: Math.random() * 1.2 + 0.4, size: Math.random() * 3 + 1, opacity: Math.random() * 0.6 + 0.2, swing: Math.random() * 40 + 10, swingSpeed: Math.random() * 0.02 + 0.008, swingOffset: Math.random() * Math.PI * 2 });
    }
    let frame = 0;
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      particles.forEach(p => {
        p.y += p.speed;
        const x = p.x + Math.sin(frame * p.swingSpeed + p.swingOffset) * p.swing;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.size);
        grad.addColorStop(0, `rgba(255,220,80,${p.opacity})`);
        grad.addColorStop(0.5, `rgba(201,168,76,${p.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(180,140,40,0)`);
        ctx.beginPath();
        ctx.arc(x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/home');
    };
    checkSession();

    const ua = navigator.userAgent.toLowerCase();
    const ios = /ipad|iphone|ipod/.test(ua);
    const kakao = ua.includes('kakaotalk');
    setIsIOS(ios);
    setIsKakao(kakao);

    // 카카오 인앱브라우저면 자동으로 안내 팝업 표시
    if (kakao) {
      setTimeout(() => setShowBrowserGuide(true), 500);
    }

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [router]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: 'profile_nickname profile_image account_email' },
    });
  };

  // 외부 브라우저로 열기
  const openInBrowser = () => {
    const url = 'https://cnu-alumni.vercel.app';
    if (isIOS) {
      // 아이폰: 사파리로 열기
      window.location.href = url;
    } else {
      // 안드로이드: 크롬으로 열기
      window.location.href = `intent://cnu-alumni.vercel.app#Intent;scheme=https;package=com.android.chrome;end`;
    }
  };

  const F = { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

  /* ── PIN 입력 화면 ── */
  if (showPin) {
    return (
      <div style={{ ...F, minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <img src="/campus-bg.jpg" alt="" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.38) saturate(1.1)', zIndex: 0 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(160deg,rgba(0,30,90,0.55) 0%,rgba(0,10,40,0.2) 50%,rgba(0,5,20,0.65) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 10, flex: 1, background: 'rgba(255,255,255,0.97)', margin: '80px 0 0', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => { setShowPin(false); setPin(''); setPinError(''); }}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
            ← 돌아가기
          </button>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🔐</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>공용 비밀번호 입력</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.7 }}>4자리 공용 비밀번호를 입력해 주세요<br />모르시는 분은 <strong style={{ color: '#1B3F7B' }}>임원일 과장</strong>에게 문의</p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: 52, height: 60, border: '2px solid ' + (pin.length > i ? '#1B3F7B' : '#E5E7EB'), borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#111827', background: pin.length > i ? '#EFF6FF' : '#fff', transition: 'all 0.15s' }}>
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          {pinError && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 12, marginBottom: 14, lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line' }}>{pinError}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 280, margin: '0 auto 16px', width: '100%' }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, idx) => (
              <button key={idx} onClick={() => {
                if (k === '⌫') { setPin(p => p.slice(0, -1)); setPinError(''); }
                else if (k === '') return;
                else if (pin.length < 4) {
                  const next = pin + k; setPin(next); setPinError('');
                  if (next.length === 4 && next !== SHARED_PASSWORD) {
                    setTimeout(() => { setPinError('비밀번호가 올바르지 않습니다.\n임원일 과장(010-4758-1293)에게 문의하세요.'); setPin(''); }, 300);
                  }
                }
              }} style={{ height: 56, background: k === '' ? 'transparent' : '#F5F7FA', border: 'none', borderRadius: 12, fontSize: 22, fontWeight: 600, color: '#111827', cursor: k === '' ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                {k}
              </button>
            ))}
          </div>
          <button onClick={handleKakaoLogin} disabled={kakaoLoading || pin.length < 4 || !!pinError}
            style={{ width: '100%', minHeight: 54, background: pin.length === 4 && !pinError ? '#FEE500' : '#F3F4F6', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, color: pin.length === 4 && !pinError ? '#191919' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: pin.length === 4 && !pinError ? 'pointer' : 'default', boxShadow: pin.length === 4 && !pinError ? '0 4px 16px rgba(254,229,0,0.4)' : 'none', fontFamily: 'inherit' }}>
            {kakaoLoading
              ? <span style={{ width: 20, height: 20, border: '2px solid rgba(25,25,25,0.3)', borderTop: '2px solid #191919', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : <><svg width="20" height="20" viewBox="0 0 24 24" fill={pin.length === 4 && !pinError ? '#191919' : '#9CA3AF'}><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.633 5.085 4.1 6.525L5.1 21l4.65-2.475c.735.1 1.485.15 2.25.15 5.523 0 10-3.477 10-7.875C22 6.477 17.523 3 12 3z" /></svg>카카오로 로그인</>}
          </button>
          <div style={{ background: '#FFF8E7', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 14px', marginTop: 16, fontSize: 12, color: '#92400E', lineHeight: 1.7, textAlign: 'center' }}>
            🔐 비밀번호를 모르시면<br /><strong>임원일 과장(010-4758-1293)</strong>에게 문의하세요
          </div>
        </div>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  /* ── 메인 화면 ── */
  return (
    <div style={{ ...F, minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <img src="/campus-bg.jpg" alt="" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.42) saturate(1.1)', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(160deg,rgba(0,30,90,0.55) 0%,rgba(0,10,40,0.2) 50%,rgba(0,5,20,0.65) 100%)' }} />
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }} />

      {/* 홈에 추가 버튼 */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
        <button onClick={() => isKakao ? setShowBrowserGuide(true) : handleInstall()}
          style={{ background: isKakao ? '#FEE500' : 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 22, padding: '7px 16px', fontSize: 12, color: isKakao ? '#191919' : '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          {isKakao ? '🌐 브라우저로 열기' : '📲 홈에 추가'}
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

        {/* 로고 + 금색 회전 선 */}
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
          <svg style={{ position: 'absolute', inset: -20, width: 160, height: 160, animation: 'spin1 3s linear infinite' }} viewBox="0 0 160 160">
            <defs>
              <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" stopOpacity="0"/>
                <stop offset="30%" stopColor="#ffe87a" stopOpacity="1"/>
                <stop offset="60%" stopColor="#c9a84c" stopOpacity="1"/>
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="72" fill="none" stroke="url(#gold1)" strokeWidth="3" strokeDasharray="180 272" strokeLinecap="round"/>
          </svg>
          <svg style={{ position: 'absolute', inset: -28, width: 176, height: 176, animation: 'spin2 5s linear infinite' }} viewBox="0 0 176 176">
            <defs>
              <linearGradient id="gold2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffe87a" stopOpacity="0"/>
                <stop offset="40%" stopColor="#c9a84c" stopOpacity="0.8"/>
                <stop offset="70%" stopColor="#ffe87a" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <circle cx="88" cy="88" r="80" fill="none" stroke="url(#gold2)" strokeWidth="1.5" strokeDasharray="120 382" strokeLinecap="round"/>
          </svg>
          <svg style={{ position: 'absolute', inset: -14, width: 148, height: 148, animation: 'spin3 4s linear infinite' }} viewBox="0 0 148 148">
            <defs>
              <linearGradient id="gold3" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" stopOpacity="0"/>
                <stop offset="50%" stopColor="#ffe87a" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <circle cx="74" cy="74" r="66" fill="none" stroke="url(#gold3)" strokeWidth="2" strokeDasharray="90 324" strokeLinecap="round"/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff', padding: 6, boxShadow: '0 6px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/cnu-logo.png" alt="충남대학교" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <p style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(201,168,76,0.95)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const }}>Chungnam National University</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 6, textShadow: '0 2px 20px rgba(0,0,0,0.6)', letterSpacing: -0.5 }}>백마회</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, marginBottom: 32 }}>한국농어촌공사 충청지역 동문 네트워크</p>

        <div style={{ width: 60, height: 1, marginBottom: 32, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.9),transparent)' }} />

        {/* 로그인 카드 */}
        <div style={{ width: '100%', maxWidth: 380, background: 'rgba(0,20,70,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 24, padding: '28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 6 }}>동문 로그인</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 20 }}>카카오 계정으로 간편하게 시작하세요</p>
          <button onClick={() => setShowPin(true)}
            style={{ width: '100%', height: 52, background: '#FEE500', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 4px 20px rgba(254,229,0,0.35)', fontFamily: 'inherit' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.633 5.085 4.1 6.525L5.1 21l4.65-2.475c.735.1 1.485.15 2.25.15 5.523 0 10-3.477 10-7.875C22 6.477 17.523 3 12 3z" /></svg>
            카카오로 시작하기
          </button>
          <div style={{ background: 'rgba(255,248,230,0.1)', border: '1px solid rgba(253,230,138,0.25)', borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'center' }}>
            🔐 로그인 시 공용 비밀번호(4자리)가 필요합니다<br />
            비밀번호 문의 <strong style={{ color: 'rgba(201,168,76,0.9)' }}>임원일 과장 010-4758-1293</strong>
          </div>
        </div>

        <p style={{ marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: 0.3 }}>
          © 2025 백마회 · 한국농어촌공사 충청지역본부 · Chungnam National University Alumni
        </p>
      </div>

      {/* ── 카카오 인앱브라우저 안내 팝업 ── */}
      {showBrowserGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowBrowserGuide(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 44px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 24, marginBottom: 6 }}>📱</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>앱으로 설치하기</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>더 편하게 사용하려면 앱을 설치하세요</p>
            </div>

            {/* 갤럭시 안내 */}
            {!isIOS && (
              <>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🤖 갤럭시 (안드로이드)</p>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 2 }}>
                    <p>1. 아래 <strong style={{ color: '#1B3F7B' }}>"크롬으로 열기"</strong> 버튼 탭</p>
                    <p>2. 크롬 주소창 오른쪽 <strong>⋮ 메뉴</strong> 탭</p>
                    <p>3. <strong>"홈 화면에 추가"</strong> 선택 → <strong>"추가"</strong></p>
                  </div>
                </div>
                <button onClick={openInBrowser}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  🌐 크롬으로 열기
                </button>
              </>
            )}

            {/* 아이폰 안내 */}
            {isIOS && (
              <>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🍎 아이폰</p>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 2 }}>
                    <p>1. 아래 <strong style={{ color: '#1B3F7B' }}>"사파리로 열기"</strong> 버튼 탭</p>
                    <p>2. 하단 <strong>공유 버튼(□↑)</strong> 탭</p>
                    <p>3. <strong>"홈 화면에 추가"</strong> → <strong>"추가"</strong></p>
                  </div>
                </div>
                <button onClick={openInBrowser}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  🌐 사파리로 열기
                </button>
              </>
            )}

            <button onClick={() => setShowBrowserGuide(false)}
              style={{ width: '100%', background: '#f1f5f9', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>
              나중에 하기
            </button>
          </div>
        </div>
      )}

      {/* 홈에 추가 안내 팝업 (크롬/사파리용) */}
      {showInstallGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowInstallGuide(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 44px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, textAlign: 'center' }}>📲 홈 화면에 추가하기</p>
            <div style={{ background: '#F5F7FA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: '#374151', lineHeight: 2 }}>
              {isIOS ? (
                <><p>1. 하단 <strong>공유 버튼(□↑)</strong> 탭</p><p>2. <strong>"홈 화면에 추가"</strong> 선택</p><p>3. <strong>"추가"</strong> 탭</p></>
              ) : (
                <><p>1. 우측 상단 <strong>⋮ 메뉴</strong> 탭</p><p>2. <strong>"홈 화면에 추가"</strong> 선택</p><p>3. <strong>"추가"</strong> 탭</p></>
              )}
            </div>
            <button onClick={() => setShowInstallGuide(false)} style={{ width: '100%', background: '#1B3F7B', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin1 { to { transform: rotate(360deg); } }
        @keyframes spin2 { to { transform: rotate(-360deg); } }
        @keyframes spin3 { from { transform: rotate(60deg); } to { transform: rotate(420deg); } }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}