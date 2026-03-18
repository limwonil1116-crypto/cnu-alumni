'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Badge, Button, Alert } from '@/components/ui';

const ERRORS = [
  { row: 12, type: 'error', msg: '이메일 형식 오류 (kim@invalid)' },
  { row: 28, type: 'error', msg: '입학년도 누락' },
  { row: 45, type: 'error', msg: '학과명 불일치 (마스터 데이터에 없음)' },
  { row: 90, type: 'duplicate', msg: '중복 데이터 (이름+연락처 일치)' },
  { row: 103, type: 'duplicate', msg: '중복 데이터 (이메일 일치)' },
  { row: 156, type: 'error', msg: '연락처 형식 오류' },
];

type Tab = 'all' | 'valid' | 'duplicate' | 'error';

export default function UploadResultPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [applying, setApplying] = useState(false);

  const filtered = ERRORS.filter(e => {
    if (tab === 'all') return true;
    if (tab === 'duplicate') return e.type === 'duplicate';
    if (tab === 'error') return e.type === 'error';
    return false;
  });

  const handleApply = async () => {
    if (!confirm('정상 건 3,020건을 반영하시겠습니까?')) return;
    setApplying(true);
    await new Promise(r => setTimeout(r, 1500));
    setApplying(false);
    router.push('/admin/dashboard');
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'error', label: '오류 100건' },
    { key: 'duplicate', label: '중복 80건' },
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="업로드 검증 결과" showBack backHref="/admin/uploads" variant="admin" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: '3,200', label: '총 건수', color: 'text-[#1B3F7B]' },
            { num: '3,020', label: '정상', color: 'text-[#15803D]' },
            { num: '180', label: '문제', color: 'text-[#DC2626]' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#D1D9E6] rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.num}</p>
              <p className="text-xs text-[#4B5563] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 배지 요약 */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="success">정상 3,020</Badge>
          <Badge variant="warn">중복 80</Badge>
          <Badge variant="error">오류 100</Badge>
        </div>

        {/* 탭 */}
        <div className="bg-white border border-[#D1D9E6] rounded-xl overflow-hidden">
          <div className="flex border-b border-[#D1D9E6]">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t.key ? 'text-[#1B3F7B] border-b-2 border-[#1B3F7B] bg-[#EBF0F8]' : 'text-[#9CA3AF] hover:text-[#4B5563]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'all' ? (
            <div className="px-4 py-3">
              <Alert variant="success">정상 데이터 3,020건은 반영 준비가 완료되었습니다</Alert>
              <p className="text-sm text-[#4B5563] mt-3">오류 및 중복 건은 아래에 표시된 내용을 확인하고 원본 파일 수정 후 재업로드 해주세요.</p>
            </div>
          ) : (
            <div>
              {filtered.map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[#D1D9E6] last:border-0">
                  <span className="text-xs bg-[#F4F6FA] text-[#4B5563] px-2 py-1 rounded font-mono flex-shrink-0">{e.row}행</span>
                  <p className="text-sm text-[#111827] flex-1">{e.msg}</p>
                  <Badge variant={e.type === 'error' ? 'error' : 'warn'}>
                    {e.type === 'error' ? '오류' : '중복'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => alert('오류 파일 다운로드 기능은 실제 구현 시 서버에서 처리됩니다')}
            className="flex-1 min-h-[48px] border-[1.5px] border-[#1B3F7B] text-[#1B3F7B] rounded-xl text-sm font-semibold hover:bg-[#EBF0F8] transition-colors"
          >
            📥 오류 파일 다운로드
          </button>
          <Button variant="primary" onClick={handleApply} loading={applying} className="flex-1">
            {applying ? '반영 중...' : '정상 건만 반영'}
          </Button>
        </div>
      </div>
    </div>
  );
}
