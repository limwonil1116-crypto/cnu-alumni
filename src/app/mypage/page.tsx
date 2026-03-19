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

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F4FA] last:border-0">
      <span className="text-lg w-8 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
        <p className="text-sm text-[#111827] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      setUserEmail(user.email || '');

      const { data } = await supabase
        .from('alumni_master')
        .select(`
          id, name, phone, email, graduation_year,
          alumni_profiles (company, job_title, region, bio, photo_url, card_image_url),
          department_master (name)
        `)
        .eq('email', user.email || '')
        .single();

      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          department: (data as any).department_master?.name || '',
          graduation_year: data.graduation_year,
          phone: data.phone,
          email: data.email,
          company: (data as any).alumni_profiles?.[0]?.company,
          job_title: (data as any).alumni_profiles?.[0]?.job_title,
          region: (data as any).alumni_profiles?.[0]?.region,
          bio: (data as any).alumni_profiles?.[0]?.bio,
          photo_url: (data as any).alumni_profiles?.[0]?.photo_url,
          card_image_url: (data as any).alumni_profiles?.[0]?.card_image_url,
        });
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

  const getGradientColor = (name: string) => {
    const colors = [
      ['#1B3F7B', '#2A5BA8'],
      ['#1B5E7B', '#1B8FA8'],
      ['#3B1B7B', '#6B2A8A'],
      ['#7B1B3B', '#A82A5B'],
      ['#1B6B3B', '#2A8A5B'],
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const colors = profile ? getGradientColor(profile.name) : ['#1B3F7B', '#2A5BA8'];

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 bg-[#F5F7FA] flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-bold text-[#111827] text-lg">내 정보</h1>
        <button onClick={handleLogout} className="text-sm text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
          로그아웃
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">

        {profile ? (
          <>
            {/* 프로필 카드 */}
            <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
              <div className="px-6 pt-8 pb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{profile.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h2 className="text-white text-2xl font-bold mb-1">{profile.name}</h2>
                    {profile.job_title && <p className="text-white/80 text-sm">{profile.job_title}</p>}
                    {profile.company && <p className="text-white/60 text-sm">{profile.company}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.department && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">{profile.department}</span>
                  )}
                  {profile.graduation_year && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">{profile.graduation_year}년 졸업</span>
                  )}
                </div>
              </div>
              <div className="bg-black/10 px-6 py-3">
                <p className="text-white/60 text-xs">{userEmail}</p>
              </div>
            </div>

            {/* 수정 버튼 */}
            <Link href="/mypage/edit" className="flex items-center justify-center w-full min-h-[52px] bg-[#1B3F7B] text-white rounded-2xl text-[15px] font-semibold hover:bg-[#112B55] transition-colors shadow-sm">
              ✏️ 프로필 수정
            </Link>

            {/* 연락처 */}
            <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
              <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">연락처</p>
              <InfoRow icon="📱" label="휴대폰" value={profile.phone} />
              <InfoRow icon="✉️" label="이메일" value={profile.email} />
            </div>

            {/* 직장 */}
            {(profile.company || profile.job_title) && (
              <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
                <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">직장</p>
                <InfoRow icon="🏢" label="회사" value={profile.company} />
                <InfoRow icon="💼" label="직무" value={profile.job_title} />
                <InfoRow icon="📍" label="지역" value={profile.region} />
              </div>
            )}

            {/* 명함 */}
            {profile.card_image_url && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
                <p className="text-xs font-semibold text-[#9CA3AF] mb-3 uppercase tracking-wider">명함</p>
                <img src={profile.card_image_url} alt="명함" className="w-full rounded-xl border border-[#E5EAF2]" />
              </div>
            )}
          </>
        ) : (
          /* 프로필 없음 */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5EAF2] text-center">
            <div className="w-16 h-16 rounded-full bg-[#EBF0F8] flex items-center justify-center mx-auto mb-4 text-3xl">👤</div>
            <p className="font-semibold text-[#111827] mb-1">프로필이 없습니다</p>
            <p className="text-sm text-[#9CA3AF] mb-4">관리자에게 동문 등록을 요청해 주세요</p>
            <p className="text-xs text-[#9CA3AF]">로그인: {userEmail}</p>
          </div>
        )}

        {/* 접속 로그 링크 (마스터용) */}
        <Link href="/master/logs" className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium text-[#111827]">접속 로그 확인</span>
          </div>
          <span className="text-[#9CA3AF]">›</span>
        </Link>

      </div>

      {/* 하단 네비 */}
      <div className="bg-white border-t border-[#E5EAF2] flex fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
        <Link href="/directory" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#9CA3AF]">
          <span className="text-xl">🏠</span>
          <span className="text-[11px] font-medium">홈</span>
        </Link>
        <Link href="/directory" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#9CA3AF]">
          <span className="text-xl">🔍</span>
          <span className="text-[11px] font-medium">검색</span>
        </Link>
        <Link href="/mypage" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#1B3F7B]">
          <span className="text-xl">👤</span>
          <span className="text-[11px] font-medium">내 정보</span>
        </Link>
      </div>
    </div>
  );
}