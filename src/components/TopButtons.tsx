'use client';

interface TopButtonsProps {
  showInstall?: boolean;
}

export default function TopButtons({ showInstall = true }: TopButtonsProps) {

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

  const handleInstall = () => {
    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);
    const msg = isIOS
      ? '1. 하단 공유버튼(□↑) 탭\n2. "홈 화면에 추가" 선택\n3. "추가" 탭'
      : '1. 우측 상단 ⋮ 메뉴 탭\n2. "홈 화면에 추가" 선택\n3. "추가" 탭';
    alert('📲 앱 설치하기\n\n' + msg);
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        공유
      </button>
      {/* 앱 설치 버튼 */}
      {showInstall && (
        <button
          onClick={handleInstall}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          📲 설치
        </button>
      )}
    </div>
  );
}