'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui';
import { MOCK_ALUMNI } from '@/data/mock';

const STATUS_MAP = ['인증완료','인증완료','승인대기','인증완료','인증완료','인증전','인증완료','인증완료'];

export default function AdminAlumniPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_ALUMNI.filter(a =>
      !q || a.name.includes(q) || a.department.toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) || (a.company || '').toLowerCase().includes(q)
    );
  }, [query]);

  const getBadge = (status: string) => {
    if (status === '인증완료') return <Badge variant="success">인증완료</Badge>;
    if (status === '승인대기') return <Badge variant="warn">승인대기</Badge>;
    return <Badge variant="gray">인증전</Badge>;
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="졸업생 목록" showBack backHref="/admin/dashboard" variant="admin"
        subtitle={`전체 ${filtered.length}명`} />

      {/* 검색 */}
      <div className="px-4 py-3 bg-white border-b border-[#D1D9E6] sticky top-[58px] z-30">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="이름, 학과, 이메일, 회사 검색"
            className="w-full pl-9 pr-4 py-2.5 border border-[#D1D9E6] rounded-xl text-sm outline-none focus:border-[#2A5BA8] transition-colors"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((a, i) => {
          const status = STATUS_MAP[i] || '인증완료';
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#D1D9E6] hover:bg-[#F4F6FA] transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B3F7B] to-[#3B72D1] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {a.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-[#111827]">{a.name}</p>
                  {getBadge(status)}
                </div>
                <p className="text-xs text-[#4B5563] truncate">{a.department} · {a.graduationYear}년 졸업</p>
                {a.company && <p className="text-xs text-[#9CA3AF] truncate">{a.company}</p>}
              </div>
              <Link
                href={`/directory/${a.id}`}
                className="flex-shrink-0 text-xs text-[#1B3F7B] border border-[#1B3F7B] px-3 py-1.5 rounded-lg hover:bg-[#EBF0F8] font-medium transition-colors"
              >
                수정
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
