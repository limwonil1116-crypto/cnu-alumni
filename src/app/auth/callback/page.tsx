'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'checking' | 'denied'>('loading');

  useEffect(() => {
    const handleAuth = async () => {
      // 1. 세션 확인
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        await new Promise(r => setTimeout(r, 1500));
      }

      let session = null;
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) { session = data.session; break; }
        await new Promise(r => setTimeout(r, 800));
      }

      // 세션 없으면 메인으로
      if (!session) { router.replace('/'); return; }

      // 2. DB 등록 여부 확인
      setStatus('checking');
      const email = session.user.email || '';
      const meta = session.user.user_metadata || {};
      const name = meta.full_name || meta.name || meta.preferred_username || '';

      // 이메일로 조회
      let { data: found } = await supabase
        .from('alumni_master')
        .select('id')
        .eq('email', email)
        .eq('auth_status', 'active')
        .single();

      // 이메일로 못 찾으면 이름으로 조회
      if (!found && name) {
        const res = await supabase
          .from('alumni_master')
          .select('id')
          .eq('name', name)
          .eq('auth_status', 'active')
          .single();
        found = res.data;

        // 이름으로 찾았으면 이메일 업데이트
        if (found) {
          await supabase
            .from('alumni_master')
            .update({ email })
            .eq('id', found.id);
        }
      }

      // 3. 등록된 동문이면 홈으로, 아니면 차단
      if (found) {
        router.replace('/home');
      } else {
        // 로그아웃 처리 후 차단 화면 표시
        await supabase.auth.signOut();
        setStatus('denied');
      }
    };

    handleAuth();
  }, [router]);

  // ── 로딩 화면 ──
  if (status === 'loading' || status === 'checking') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 16 }} />
        <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
          {status === 'loading' ? '로그인 처리 중...' : '동문 인증 확인 중...'}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>잠시만 기다려주세요</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── 차단 화면 ──
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(13,45,110,0.1)', border: '1px solid #e2e8f0' }}>

        {/* 자물쇠 아이콘 */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>
          🔒
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
          접근이 제한되었습니다
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 20 }}>
          백마회 동문 명부에 등록되지 않은<br />
          카카오 계정입니다.<br />
          동문 등록 후 이용하실 수 있습니다.
        </p>

        {/* 안내 박스 */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#92400e', lineHeight: 1.8 }}>
          📋 동문 등록 문의<br />
          <strong>임원일 과장</strong><br />
          <a href="tel:010-4758-1293" style={{ color: '#1B3F7B', fontWeight: 700, textDecoration: 'none' }}>
            📱 010-4758-1293
          </a>
        </div>

        {/* 버튼 */}
        <button
          onClick={() => router.replace('/')}
          style={{ width: '100%', background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          메인으로 돌아가기
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}