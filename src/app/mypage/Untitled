'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface MyProfile {
  id: string;
  name: string;
  department: string;
  graduation_year?: number;
  phone?: string;
  email?: string;
  company?: string;
  job_title?: string;
  region?: string;
  bio?: string;
  photo_url?: string;
  card_image_url?: string;
}

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      const email = user.email || '';
      setUserEmail(email);
      const meta = user.user_metadata || {};
      const kName = meta.full_name || meta.name || meta.preferred_username || '';
      const avatar = meta.avatar_url || meta.picture || '';

      let { data } = await supabase
        .from('alumni_master')
        .select(`id, name, phone, email, graduation_year, alumni_profiles (company, job_title, region, bio, photo_url, card_image_url), department_master (name)`)
        .eq('email', email).single();

      if (!data && kName) {
        const res = await supabase
          .from('alumni_master')
          .select(`id, name, phone, email, graduation_year, alumni_profiles (company, job_title, region, bio, photo_url, card_image_url), department_master (name)`)
          .eq('name', kName).single();
        data = res.data;
        if (data) await supabase.from('alumni_master').update({ email }).eq('id', data.id);
      }

      if (data) {
        setIsNewUser(false);
        setProfile({
          id: data.id, name: data.name,
          department: (data as any).department_master?.name || '',
          graduation_year: data.graduation_year,
          phone: data.phone, email: data.email,
          company: (data as any).alumni_profiles?.[0]?.company,
          job_title: (data as any).alumni_profiles?.[0]?.job_title,
          region: (data as any).alumni_profiles?.[0]?.region,
          bio: (data as any).alumni_profiles?.[0]?.bio,
          photo_url: (data as any).alumni_profiles?.[0]?.photo_url || avatar,
          card_image_url: (data as any).alumni_profiles?.[0]?.card_image_url,
        });
      } else {
        setIsNewUser(true);
        setProfile({ id: user.id, name: kName, department: '', email, photo_url: avatar });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const F = { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

  if (loading) return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>

      {/* ── 헤더 ── */}
      <div style={{ background: 'linear-gradient(135deg, #0d2d6e 0%, #1B3F7B 60%, #1a5276 100%)', boxShadow: '0 2px 12px rgba(13,45,110,0.3)' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', height: 32, display: 'flex', alignItems: 'center' }}>
              <img src="/krc-logo.jpg" alt="KRC" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>한국농어촌공사</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '5px 12px', fontSize: 12, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            로그아웃
          </button>
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* 프로필 사진 */}
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.photo_url
              ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{profile?.name?.charAt(0)}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>My Profile</p>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 2, letterSpacing: -0.3 }}>{profile?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
              {[profile?.job_title, profile?.company].filter(Boolean).join(' · ') || userEmail}
            </p>
          </div>
        </div>
        {/* 뱃지들 */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 14px', flexWrap: 'wrap' }}>
          {profile?.department && <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>{profile.department}</span>}
          {profile?.graduation_year && <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>{profile.graduation_year}년 졸업</span>}
          {isNewUser && <span style={{ background: 'rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(251,191,36,0.3)' }}>미등록 동문</span>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 80px' }}>

        {/* 미등록 안내 */}
        {isNewUser && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>동문 DB 미등록 상태</p>
              <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.6 }}>동문 등록은 <strong>임원일 과장(010-4758-1293)</strong>에게 문의하세요.</p>
            </div>
          </div>
        )}

        {/* 프로필 수정 / 문의 버튼 */}
        {!isNewUser && profile ? (
          <Link href={`/directory/${profile.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 50, background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', color: '#fff', borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 12, boxShadow: '0 4px 14px rgba(13,45,110,0.3)', gap: 8 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            프로필 수정하기
          </Link>
        ) : (
          <button onClick={() => { window.location.href = 'tel:010-4758-1293'; }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 50, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12, gap: 8 }}>
            📞 동문 등록 문의 (임원일 과장)
          </button>
        )}

        {/* 연락처 카드 */}
        {(profile?.phone || profile?.email) && (
          <div style={{ background: '#fff', borderRadius: 14, marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(13,45,110,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>연락처</p>
            </div>
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📱</div>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>휴대폰</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.phone}</p>
                </div>
              </div>
            )}
            {profile?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✉️</div>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>이메일</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.email}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 직장 카드 */}
        {(profile?.company || profile?.job_title || profile?.region) && (
          <div style={{ background: '#fff', borderRadius: 14, marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(13,45,110,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>직장</p>
            </div>
            {profile?.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏢</div>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>회사</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.company}</p>
                </div>
              </div>
            )}
            {profile?.job_title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: profile?.region ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💼</div>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>직무</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.job_title}</p>
                </div>
              </div>
            )}
            {profile?.region && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📍</div>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>지역</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profile.region}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 명함 */}
        {profile?.card_image_url && (
          <div style={{ background: '#fff', borderRadius: 14, marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(13,45,110,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>명함</p>
            </div>
            <div style={{ padding: 14 }}>
              <img src={profile.card_image_url} alt="명함" style={{ width: '100%', borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </div>
          </div>
        )}

        {/* 접속 로그 */}
        <Link href="/master/logs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(13,45,110,0.06)', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📊</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>접속 로그 확인</span>
          </div>
          <svg width="16" height="16" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
        </Link>
      </div>

      {/* 하단 네비 */}
      <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', position: 'sticky', bottom: 0, zIndex: 40, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <Link href="/directory" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#64748b', textDecoration: 'none' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span style={{ fontSize: 10, fontWeight: 500 }}>홈</span>
        </Link>
        <Link href="/directory" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#64748b', textDecoration: 'none' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <span style={{ fontSize: 10, fontWeight: 500 }}>검색</span>
        </Link>
        <Link href="/mypage" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#1B3F7B', textDecoration: 'none' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
          <span style={{ fontSize: 10, fontWeight: 700 }}>내 정보</span>
        </Link>
      </div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}