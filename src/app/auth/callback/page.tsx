'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        await new Promise(r => setTimeout(r, 1500));
      }
      for (let i = 0; i < 5; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/home'); // ← /directory 에서 /home 으로 변경
          return;
        }
        await new Promise(r => setTimeout(r, 800));
      }
      router.replace('/');
    };
    handleAuth();
  }, [router]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
      <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 16 }} />
      <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>로그인 처리 중...</p>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>잠시만 기다려주세요</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}