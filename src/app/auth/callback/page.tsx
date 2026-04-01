'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'checking' | 'denied'>('loading');

  useEffect(() => {
    const handleAuth = async () => {
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

      if (!session) { router.replace('/'); return; }

      setStatus('checking');
      const email = session.user.email || '';
      const meta = session.user.user_metadata || {};
      const name = meta.full_name || meta.name || meta.preferred_username || '';

      // 1. 이메일로 조회
      let { data: found } = await supabase
        .from('alumni_master')
        .select('id')
        .eq('email', email)
        .eq('auth_status', 'active')
        .single();

      // 2. 이름으로 조회
      if (!found && name) {
        const res = await supabase
          .from('alumni_master')
          .select('id')
          .eq('name', name)
          .eq('auth_status', 'active')
          .single();
        found = res.data;
        if (found) {
          await supabase.from('alumni_master').update({ email }).eq('id', found.id);
        }
      }

      // 3. kakao_name으로 조회 (카카오 이름이 성 없이 등록된 경우)
      if (!found && name) {
        const res = await supabase
          .from('alumni_master')
          .select('id')
          .eq('kakao_name', name)
          .eq('auth_status', 'active')
          .single();
        found = res.data;
        if (found) {
          await supabase.from('alumni_master').update({ email }).eq('id', found.id);
        }
      }

      if (found) {
        router.replace('/home');
      } else {
        await supabase.auth.signOut();
        setStatus('denied');
      }
    };

    handleAuth();
  }, [router]);

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

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(13,45,110,0.1)', border: '1px solid #e2e8f0' }}>
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
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.8 }}>
          📋 동문 등록 문의<br />
          <strong>임원일 과장</strong><br />
          <a href="tel:010-4758-1293" style={{ color: '#1B3F7B', fontWeight: 700, textDecoration: 'none' }}>
            📱 010-4758-1293
          </a>
        </div>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#0369a1', lineHeight: 1.8, textAlign: 'left' }}>
          ⚠️ <strong>카카오톡 이름 안내</strong><br />
          카카오톡 이름이 <strong>성+이름</strong>(예: 홍길동)으로<br />
          설정되어 있지 않으면 자동 연동이 불가합니다.<br /><br />
          이 경우 <strong>카카오톡 이메일 주소</strong>를<br />
          임원일 과장님께 알려주시면 등록해드립니다.
        </div>
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