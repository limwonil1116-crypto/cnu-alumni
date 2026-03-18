'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui';

function StatCard({ num, label, color }: { num: string; label: string; color?: string }) {
  return (
    <div className="bg-white border border-[#D1D9E6] rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color || 'text-[#1B3F7B]'}`}>{num}</p>
      <p className="text-xs text-[#4B5563] mt-1">{label}</p>
    </div>
  );
}

const RECENT_ACTIVITIES = [
  { title: '홍길동 연락처 변경 요청', badge: 'pending' as const, label: '승인 대기', date: '03/16', href: '/admin/approvals' },
  { title: 'alumni_2024.csv 업로드 완료', badge: 'success' as const, label: '정상 3,020건', date: '03/16', href: '/admin/uploads' },
  { title: '이OO 본인 인증 완료', badge: 'success' as const, label: '인증 승인', date: '03/15', href: '/admin/dashboard' },
  { title: '김민준 프로필 수정 반려', badge: 'error' as const, label: '반려', date: '03/14', href: '/admin/approvals' },
];

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Admin top bar */}
      <div className="bg-[#112B55] px-4 py-3.5 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-[16px]">관리자 대시보드</p>
            <p className="text-white/50 text-xs">충남대학교 동문 디렉터리</p>
          </div>
          <button
            onClick={() => { if (confirm('로그아웃 하시겠습니까?')) router.push('/'); }}
            className="text-white/60 text-sm hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F4F6FA] space-y-4">
        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard num="12,420" label="등록 동문" />
          <StatCard num="4,320" label="인증 완료" />
          <StatCard num="38" label="승인 대기" color="text-[#B45309]" />
          <StatCard num="24" label="최근 수정" />
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/uploads" className="bg-[#1B3F7B] text-white rounded-xl p-4 flex items-center gap-3 hover:bg-[#112B55] transition-colors">
            <span className="text-2xl">📤</span>
            <div><p className="font-semibold text-sm">리스트 업로드</p><p className="text-white/60 text-xs mt-0.5">CSV / Excel</p></div>
          </Link>
          <Link href="/admin/approvals" className="bg-[#92400E] text-white rounded-xl p-4 flex items-center gap-3 hover:bg-[#78350F] transition-colors">
            <span className="text-2xl">⏳</span>
            <div><p className="font-semibold text-sm">승인 대기</p><p className="text-white/60 text-xs mt-0.5">38건</p></div>
          </Link>
          <Link href="/admin/alumni" className="bg-white border border-[#D1D9E6] rounded-xl p-4 flex items-center gap-3 hover:bg-[#F4F6FA] transition-colors">
            <span className="text-2xl">👥</span>
            <div><p className="font-semibold text-sm text-[#111827]">졸업생 목록</p><p className="text-[#9CA3AF] text-xs mt-0.5">검색/수정</p></div>
          </Link>
          <Link href="/policy" className="bg-white border border-[#D1D9E6] rounded-xl p-4 flex items-center gap-3 hover:bg-[#F4F6FA] transition-colors">
            <span className="text-2xl">📜</span>
            <div><p className="font-semibold text-sm text-[#111827]">변경 이력</p><p className="text-[#9CA3AF] text-xs mt-0.5">로그 조회</p></div>
          </Link>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white border border-[#D1D9E6] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D1D9E6]">
            <p className="font-semibold text-[#111827] text-sm">최근 활동</p>
          </div>
          {RECENT_ACTIVITIES.map((item, i) => (
            <Link key={i} href={item.href} className="flex items-center justify-between px-4 py-3.5 border-b border-[#D1D9E6] last:border-0 hover:bg-[#F4F6FA] transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium text-[#111827] truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.badge === 'pending' ? 'warn' : item.badge === 'error' ? 'error' : 'success'}>
                    {item.label}
                  </Badge>
                </div>
              </div>
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">{item.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
