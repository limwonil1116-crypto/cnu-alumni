'use client';
import { useState, useMemo, useEffect } from 'react';
import { AlumniCard } from '@/components/AlumniCard';
import { supabase } from '@/lib/supabase';
import type { AlumniDetail } from '@/types';

export default function DirectoryPage() {
  const [query, setQuery] = useState('');
  const [alumni, setAlumni] = useState<AlumniDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumni_master')
        .select(`
          id,
          name,
          admission_year,
          graduation_year,
          email,
          phone,
          auth_status,
          alumni_profiles (
            company,
            job_title,
            region,
            bio,
            photo_url
          ),
          department_master (
            name
          )
        `)
        .eq('auth_status', 'active');

      if (error) {
        console.error('데이터 불러오기 실패:', error);
        setLoading(false);
        return;
      }

      const formatted: AlumniDetail[] = (data || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        department: a.department_master?.name || '',
        graduationYear: a.graduation_year,
        admissionYear: a.admission_year,
        company: a.alumni_profiles?.[0]?.company,
        jobTitle: a.alumni_profiles?.[0]?.job_title,
        region: a.alumni_profiles?.[0]?.region,
        bio: a.alumni_profiles?.[0]?.bio,
        photoUrl: a.alumni_profiles?.[0]?.photo_url,
        phone: a.phone,
        email: a.email,
      }));

      setAlumni(formatted);
      setLoading(false);
    };

    fetchAlumni();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return alumni.filter(a =>
      !q || a.name.includes(q) ||
      a.department.toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q) ||
      String(a.graduationYear).includes(q)
    );
  }, [query, alumni]);

  return (
    <div className="flex flex-col min-h-0">
      <div className="bg-[#1B3F7B] px-4 pt-4 pb-3 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-lg font-bold">동문 찾기</h1>
          <span className="text-white/60 text-sm">{filtered.length}명</span>
        </div>
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="이름, 학과, 회사, 졸업년도 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/10 text-white placeholder:text-white/50 border border-white/20 outline-none focus:bg-white/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin mb-4"/>
            <p className="text-sm text-[#9CA3AF]">동문 정보를 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#F4F6FA] flex items-center justify-center mb-4 text-2xl">🔍</div>
            <p className="font-semibold text-[#111827] mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-[#9CA3AF]">이름, 회사명, 학과, 졸업년도를 확인해 주세요</p>
          </div>
        ) : (
          filtered.map(a => <AlumniCard key={a.id} alumni={a} />)
        )}
      </div>
    </div>
  );
}