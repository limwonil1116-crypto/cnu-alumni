'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AlumniDetail {
  id: string;
  name: string;
  department: string;
  admission_year?: number;
  graduation_year?: number;
  phone?: string;
  email?: string;
  company?: string;
  job_title?: string;
  department_detail?: string;
  region?: string;
  address?: string;
  bio?: string;
  photo_url?: string;
  card_image_url?: string;
}

function InfoRow({ icon, label, value, onCopy }: {
  icon: string; label: string; value?: string; onCopy?: () => void;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F4FA] last:border-0">
      <span className="text-lg w-8 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
        <p className="text-sm text-[#111827] font-medium truncate">{value}</p>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="text-xs text-[#2A5BA8] bg-[#EBF0F8] px-2.5 py-1 rounded-lg flex-shrink-0">
          복사
        </button>
      )}
    </div>
  );
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [alumni, setAlumni] = useState<AlumniDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('alumni_master')
        .select(`
          id, name, phone, email, admission_year, graduation_year,
          alumni_profiles (company, job_title, region, bio, photo_url, card_image_url),
          department_master (name)
        `)
        .eq('id', id)
        .single();

      if (data) {
        setAlumni({
          id: data.id,
          name: data.name,
          department: (data as any).department_master?.name || '',
          admission_year: data.admission_year,
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
    fetch();
  }, [id]);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setToast(`${label} 복사됨`);
    setTimeout(() => setToast(''), 2000);
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

  if (!alumni) return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <p className="text-lg font-bold mb-2">프로필을 찾을 수 없습니다</p>
      <button onClick={() => router.back()} className="text-[#1B3F7B] text-sm">돌아가기</button>
    </div>
  );

  const colors = getGradientColor(alumni.name);

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-0 flex items-center gap-3 bg-[#F5F7FA] sticky top-0 z-40">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-[#E5EAF2] flex items-center justify-center shadow-sm">
          <span className="text-[#1B3F7B] text-lg">←</span>
        </button>
        <p className="font-semibold text-[#111827] flex-1">프로필</p>
        <button
          onClick={() => router.push(`/directory/${id}/edit`)}
          className="text-sm text-[#1B3F7B] bg-[#EBF0F8] px-3 py-1.5 rounded-full font-medium"
        >
          수정
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* 명함 스타일 프로필 카드 */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-start gap-4 mb-6">
              {/* 사진 */}
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {alumni.photo_url ? (
                  <img src={alumni.photo_url} alt={alumni.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">{alumni.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-white text-2xl font-bold mb-1">{alumni.name}</h2>
                {alumni.job_title && (
                  <p className="text-white/80 text-sm font-medium">{alumni.job_title}</p>
                )}
                {alumni.company && (
                  <p className="text-white/60 text-sm">{alumni.company}</p>
                )}
              </div>
            </div>

            {/* 학과 + 졸업년도 */}
            <div className="flex flex-wrap gap-2">
              {alumni.department && (
                <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20">
                  {alumni.department}
                </span>
              )}
              {alumni.graduation_year && (
                <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20">
                  {alumni.graduation_year}년 졸업
                </span>
              )}
              {alumni.region && (
                <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20">
                  📍 {alumni.region}
                </span>
              )}
            </div>
          </div>

          {/* 빠른 연락 버튼 */}
          <div className="bg-black/10 px-6 py-4 flex gap-3">
            {alumni.phone && (
              <a href={`tel:${alumni.phone}`} className="flex-1 bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl text-center border border-white/20 hover:bg-white/30 transition-colors">
                📞 전화
              </a>
            )}
            {alumni.email && (
              <a href={`mailto:${alumni.email}`} className="flex-1 bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl text-center border border-white/20 hover:bg-white/30 transition-colors">
                ✉️ 이메일
              </a>
            )}
            {alumni.phone && (
              <a href={`sms:${alumni.phone}`} className="flex-1 bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl text-center border border-white/20 hover:bg-white/30 transition-colors">
                💬 문자
              </a>
            )}
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">연락처</p>
          <InfoRow icon="📱" label="휴대폰" value={alumni.phone} onCopy={() => copy(alumni.phone!, '휴대폰')} />
          <InfoRow icon="✉️" label="이메일" value={alumni.email} onCopy={() => copy(alumni.email!, '이메일')} />
        </div>

        {/* 직장 정보 */}
        {(alumni.company || alumni.job_title) && (
          <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
            <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">직장</p>
            <InfoRow icon="🏢" label="회사" value={alumni.company} />
            <InfoRow icon="💼" label="직무" value={alumni.job_title} />
            <InfoRow icon="📍" label="지역" value={alumni.region} />
          </div>
        )}

        {/* 학력 */}
        <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">학력</p>
          <InfoRow icon="🎓" label="학과" value={alumni.department} />
          <InfoRow icon="📅" label="입학년도" value={alumni.admission_year ? `${alumni.admission_year}년` : undefined} />
          <InfoRow icon="🏆" label="졸업년도" value={alumni.graduation_year ? `${alumni.graduation_year}년` : undefined} />
        </div>

        {/* 자기소개 */}
        {alumni.bio && (
          <div className="bg-white rounded-2xl px-4 shadow-sm border border-[#E5EAF2]">
            <p className="text-xs font-semibold text-[#9CA3AF] pt-4 pb-2 uppercase tracking-wider">소개</p>
            <p className="text-sm text-[#4B5563] leading-relaxed pb-4">{alumni.bio}</p>
          </div>
        )}

        {/* 명함 이미지 */}
        {alumni.card_image_url && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
            <p className="text-xs font-semibold text-[#9CA3AF] mb-3 uppercase tracking-wider">명함</p>
            <img
              src={alumni.card_image_url}
              alt="명함"
              className="w-full rounded-xl border border-[#E5EAF2] cursor-pointer"
              onClick={() => setShowCard(true)}
            />
          </div>
        )}

      </div>

      {/* 명함 크게 보기 */}
      {showCard && alumni.card_image_url && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setShowCard(false)}
        >
          <img src={alumni.card_image_url} alt="명함" className="w-full max-w-sm rounded-2xl" />
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111827] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg z-50 whitespace-nowrap">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}