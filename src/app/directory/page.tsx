'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Alumni {
  id: string;
  name: string;
  department: string;
  graduation_year: number;
  company?: string;
  job_title?: string;
  region?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
}

export default function DirectoryPage() {
  const [query, setQuery] = useState('');
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('전체');

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('alumni_master')
        .select(`
          id, name, phone, email,
          admission_year, graduation_year, auth_status,
          alumni_profiles (company, job_title, region, photo_url),
          department_master (name)
        `)
        .eq('auth_status', 'active');

      const formatted = (data || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        department: a.department_master?.name || '',
        graduation_year: a.graduation_year,
        company: a.alumni_profiles?.[0]?.company,
        job_title: a.alumni_profiles?.[0]?.job_title,
        region: a.alumni_profiles?.[0]?.region,
        photo_url: a.alumni_profiles?.[0]?.photo_url,
        phone: a.phone,
        email: a.email,
      }));
      setAlumni(formatted);
      setLoading(false);
    };
    fetchAlumni();
  }, []);

  // 학과 필터 목록
  const departments = ['전체', ...Array.from(new Set(alumni.map(a => a.department).filter(Boolean)))];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return alumni.filter(a => {
      const matchQ = !q || a.name.includes(q) ||
        (a.department || '').includes(q) ||
        (a.company || '').toLowerCase().includes(q) ||
        String(a.graduation_year || '').includes(q);
      const matchFilter = activeFilter === '전체' || a.department === activeFilter;
      return matchQ && matchFilter;
    });
  }, [query, alumni, activeFilter]);

  const getInitials = (name: string) => name.charAt(0);

  const getGradientColor = (name: string) => {
    const colors = [
      'from-[#1B3F7B] to-[#2A5BA8]',
      'from-[#1B5E7B] to-[#1B8FA8]',
      'from-[#3B1B7B] to-[#6B2A8A]',
      'from-[#7B1B3B] to-[#A82A5B]',
      'from-[#1B6B3B] to-[#2A8A5B]',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3F7B] px-4 pt-4 pb-0 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-lg font-bold">동문 디렉터리</h1>
            <p className="text-white/50 text-xs">총 {filtered.length}명</p>
          </div>
          <Link href="/mypage" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <span className="text-white text-lg">👤</span>
          </Link>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="이름, 학과, 회사 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/10 text-white placeholder:text-white/40 border border-white/10 outline-none focus:bg-white/20 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-lg leading-none">×</button>
          )}
        </div>

        {/* 학과 필터 */}
        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveFilter(dept)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                activeFilter === dept
                  ? 'bg-white text-[#1B3F7B]'
                  : 'bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#9CA3AF]">불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-[#111827] mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-[#9CA3AF]">다른 검색어를 입력해 보세요</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filtered.map(a => (
              <Link key={a.id} href={`/directory/${a.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2] hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-4">
                  {/* 아바타 */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradientColor(a.name)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    {a.photo_url ? (
                      <img src={a.photo_url} alt={a.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">{getInitials(a.name)}</span>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-[#111827] text-[15px]">{a.name}</p>
                      {a.graduation_year && (
                        <span className="text-xs text-[#9CA3AF]">{a.graduation_year}년</span>
                      )}
                    </div>
                    {a.department && (
                      <p className="text-xs text-[#2A5BA8] font-medium mb-1 bg-[#EBF0F8] px-2 py-0.5 rounded-full inline-block">{a.department}</p>
                    )}
                    {a.company && (
                      <p className="text-sm text-[#4B5563] truncate">{a.company}{a.job_title && ` · ${a.job_title}`}</p>
                    )}
                    {a.region && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">📍 {a.region}</p>
                    )}
                  </div>

                  <span className="text-[#D1D9E6] text-xl flex-shrink-0">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 하단 네비 */}
      <div className="bg-white border-t border-[#E5EAF2] flex sticky bottom-0 z-40">
        <Link href="/directory" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#1B3F7B]">
          <span className="text-xl">🏠</span>
          <span className="text-[11px] font-medium">홈</span>
        </Link>
        <Link href="/directory" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#9CA3AF]">
          <span className="text-xl">🔍</span>
          <span className="text-[11px] font-medium">검색</span>
        </Link>
        <Link href="/mypage" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#9CA3AF]">
          <span className="text-xl">👤</span>
          <span className="text-[11px] font-medium">내 정보</span>
        </Link>
      </div>
    </div>
  );
}