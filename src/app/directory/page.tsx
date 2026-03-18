'use client';
import { useState, useMemo } from 'react';
import { AlumniCard } from '@/components/AlumniCard';
import { MOCK_ALUMNI } from '@/data/mock';
import { DEPARTMENTS } from '@/lib/constants';

const REGIONS = ['전체', '서울', '대전', '수원', '성남', '부산', '기타'];
const GRAD_YEARS = ['전체', '2024', '2022', '2019', '2018', '2016', '2015', '2013', '2012', '2010'];

export default function DirectoryPage() {
  const [query, setQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const filtered = useMemo(() => {
    return MOCK_ALUMNI.filter(a => {
      const q = query.toLowerCase();
      const matchQ = !q || a.name.includes(q) || a.department.toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q) || String(a.graduationYear).includes(q);
      const matchDept = !filterDept || a.department === filterDept;
      const matchRegion = !filterRegion || a.region === filterRegion;
      const matchYear = !filterYear || String(a.graduationYear) === filterYear;
      return matchQ && matchDept && matchRegion && matchYear;
    });
  }, [query, filterDept, filterRegion, filterYear]);

  const allDepts = DEPARTMENTS.flatMap(g => g.items as unknown as string[]);
  const hasFilter = filterDept || filterRegion || filterYear;

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-[#1B3F7B] px-4 pt-4 pb-0 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-lg font-bold">동문 찾기</h1>
          <span className="text-white/60 text-sm">{filtered.length}명</span>
        </div>
        {/* Search bar */}
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
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-lg">×</button>
          )}
        </div>

        {/* Filter chips - scrollable */}
        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border bg-white/10 text-white border-white/20 outline-none appearance-none pr-7 cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='white' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}
          >
            <option value="" className="text-black">학과 전체</option>
            {allDepts.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border bg-white/10 text-white border-white/20 outline-none appearance-none pr-7 cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='white' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}
          >
            <option value="" className="text-black">졸업년도</option>
            {GRAD_YEARS.slice(1).map(y => <option key={y} value={y} className="text-black">{y}년</option>)}
          </select>
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border bg-white/10 text-white border-white/20 outline-none appearance-none pr-7 cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='white' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}
          >
            <option value="" className="text-black">지역 전체</option>
            {REGIONS.slice(1).map(r => <option key={r} value={r} className="text-black">{r}</option>)}
          </select>
          {hasFilter && (
            <button
              onClick={() => { setFilterDept(''); setFilterRegion(''); setFilterYear(''); }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#C8941A] text-white font-medium"
            >
              필터 초기화 ×
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#F4F6FA] flex items-center justify-center mb-4 text-2xl">🔍</div>
            <p className="font-semibold text-[#111827] mb-1">검색 결과가 없습니다</p>
            <p className="text-sm text-[#9CA3AF]">이름, 회사명, 학과, 졸업년도를<br />다시 확인해 주세요</p>
          </div>
        ) : (
          filtered.map(a => <AlumniCard key={a.id} alumni={a} />)
        )}
      </div>
    </div>
  );
}
