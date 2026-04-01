'use client';
import { useState, useEffect } from 'react';

export default function TopButtons() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /ipad|iphone|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsIOS(ios);
    setIsSafari(safari);
    setIsInstalled(standalone);

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '백마회 - 충남대학교 동문 네트워크',
          text: '한국농어촌공사 충남대학교 동문 앱',
          url: 'https://cnu-alumni.vercel.app',
        });
      } else {
        await navigator.clipboard.writeText('https://cnu-alumni.vercel.app');
        alert('링크가 복사되었습니다!');
      }
    } catch {
      await navigator.clipboard.writeText('https://cnu-alumni.vercel.app').catch(() => {});
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleShare}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          공유
        </button>
        {!isInstalled && (
          <button onClick={handleInstall}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
            📲 설치
          </button>
        )}
      </div>

      {/* ── 앱 설치 안내 팝업 ── */}
      {showInstallGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowInstallGuide(false)}>
          <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 20px 48px', width: '100%', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1B3F7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                📱
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 2 }}>백마회 앱 설치하기</p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>홈 화면에 추가하면 앱처럼 사용 가능해요</p>
              </div>
            </div>

            {isIOS ? (
              isSafari ? (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1B3F7B', marginBottom: 10 }}>📌 설치 방법 (Safari)</p>
                  {[
                    { step: '1', icon: '⬆️', text: 'Safari 하단 가운데 공유 버튼(□↑) 탭' },
                    { step: '2', icon: '➕', text: '스크롤해서 "홈 화면에 추가" 선택' },
                    { step: '3', icon: '✅', text: '우측 상단 "추가" 탭 → 설치 완료!' },
                  ].map(item => (
                    <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1B3F7B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                        {item.step}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.text}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginTop: 4, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                    💡 지금 Safari로 접속 중이므로 바로 설치하실 수 있어요!
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>⚠️ Safari 브라우저 필요</p>
                    <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.7 }}>
                      아이폰 홈 화면 설치는<br />
                      <strong>Safari 브라우저에서만</strong> 가능해요.
                    </p>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, fontSize: 13, color: '#374151', lineHeight: 2 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Safari로 여는 방법:</p>
                    <p>1. 아래 <strong>주소 복사</strong> 버튼 탭</p>
                    <p>2. Safari 앱 열기</p>
                    <p>3. 주소창에 붙여넣기 후 접속</p>
                    <p>4. 공유 버튼 → 홈 화면에 추가</p>
                  </div>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText('https://cnu-alumni.vercel.app').catch(() => {});
                      alert('주소가 복사되었습니다!\nSafari에서 붙여넣기 해주세요.');
                    }}
                    style={{ width: '100%', background: '#1B3F7B', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}>
                    📋 주소 복사하기
                  </button>
                </div>
              )
            ) : (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1B3F7B', marginBottom: 10 }}>📌 설치 방법 (Android)</p>
                {[
                  { step: '1', icon: '⋮', text: '우측 상단 메뉴(⋮) 탭' },
                  { step: '2', icon: '➕', text: '"홈 화면에 추가" 또는 "앱 설치" 선택' },
                  { step: '3', icon: '✅', text: '"추가" 또는 "설치" 탭 → 완료!' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1B3F7B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowInstallGuide(false)}
              style={{ width: '100%', background: '#f1f5f9', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#64748b', cursor: 'pointer', marginTop: 16, marginBottom: 20, fontFamily: 'inherit' }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}