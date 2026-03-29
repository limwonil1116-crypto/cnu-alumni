'use client';
import { useState, useEffect } from 'react';

export default function TopButtons() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /ipad|iphone|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // 크롬: 자동 설치 팝업
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
    } else {
      // 사파리 등: 안내 팝업
      setShowInstallGuide(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: '백마회 - 충남대학교 동문 네트워크',
      text: '한국농어촌공사 충남대학교 동문 앱',
      url: 'https://cnu-alumni.vercel.app',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText('https://cnu-alumni.vercel.app');
        alert('링크가 복사되었습니다!');
      }
    } catch {
      await navigator.clipboard.writeText('https://cnu-alumni.vercel.app');
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        {/* 공유 버튼 */}
        <button onClick={handleShare}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          공유
        </button>
        {/* 앱 설치 버튼 */}
        <button onClick={handleInstall}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          📲 설치
        </button>
      </div>

      {/* ── 앱 설치 안내 팝업 ── */}
      {showInstallGuide && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowInstallGuide(false)}>
          <div
            style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 44px', width: '100%', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, textAlign: 'center' }}>📲 앱 설치하기</p>
            <div style={{ background: '#f5f7fa', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: '#374151', lineHeight: 2 }}>
              {isIOS ? (
                <>
                  <p>1. 하단 <strong>공유 버튼(□↑)</strong> 탭</p>
                  <p>2. <strong>"홈 화면에 추가"</strong> 선택</p>
                  <p>3. <strong>"추가"</strong> 탭 → 완료!</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Safari 브라우저에서만 가능합니다</p>
                </>
              ) : (
                <>
                  <p>1. 우측 상단 <strong>⋮ 메뉴</strong> 탭</p>
                  <p>2. <strong>"홈 화면에 추가"</strong> 선택</p>
                  <p>3. <strong>"추가"</strong> 탭 → 완료!</p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              style={{ width: '100%', background: '#1B3F7B', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}