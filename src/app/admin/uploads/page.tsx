'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Button, Alert } from '@/components/ui';

export default function AdminUploadsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleVerify = async () => {
    if (!file) return;
    if (mode === 'replace' && !confirm('기존 데이터를 덮어쓰면 되돌릴 수 없습니다.\n계속 진행하시겠습니까?')) return;

    setLoading(true);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 150));
      setProgress(i);
    }
    setLoading(false);
    router.push('/admin/uploads/result');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="졸업생 리스트 업로드" showBack backHref="/admin/dashboard" variant="admin" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* 업로드 존 */}
        <div
          onClick={() => document.getElementById('file-input')?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            file ? 'border-[#15803D] bg-[#DCFCE7]' : 'border-[#D1D9E6] bg-[#F4F6FA] hover:border-[#2A5BA8] hover:bg-[#EBF0F8]'
          }`}
        >
          <div className="text-4xl mb-3">{file ? '✅' : '📂'}</div>
          {file ? (
            <>
              <p className="font-semibold text-[#15803D] mb-1">{file.name}</p>
              <p className="text-sm text-[#15803D]/70">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); }}
                className="mt-2 text-xs text-[#DC2626] underline"
              >
                파일 제거
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#111827] mb-1">파일을 선택해 주세요</p>
              <p className="text-sm text-[#9CA3AF]">지원 형식: Excel (.xlsx) / CSV (.csv)</p>
            </>
          )}
          <input id="file-input" type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFile} />
        </div>

        {/* 필수 컬럼 안내 */}
        <div className="bg-white border border-[#D1D9E6] rounded-xl p-4">
          <p className="text-sm font-semibold text-[#111827] mb-2">📋 필수 컬럼</p>
          <div className="flex flex-wrap gap-2">
            {['이름', '학과', '입학년도', '졸업년도', '연락처', '이메일'].map(col => (
              <span key={col} className="text-xs bg-[#EBF0F8] text-[#1B3F7B] px-2.5 py-1 rounded-full font-medium">{col}</span>
            ))}
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">선택 컬럼: 회사명, 직무, 지역, 자기소개, 사진URL</p>
        </div>

        {/* 처리 옵션 */}
        <div className="bg-white border border-[#D1D9E6] rounded-xl p-4">
          <p className="text-sm font-semibold text-[#111827] mb-3">처리 옵션</p>
          <div className="space-y-2">
            {([
              { value: 'merge' as const, label: '기존 데이터와 병합', desc: '새 항목 추가, 기존 항목 유지', danger: false },
              { value: 'replace' as const, label: '기존 데이터 덮어쓰기', desc: '주의: 되돌릴 수 없습니다', danger: true },
            ]).map(opt => (
              <label key={opt.value} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                mode === opt.value ? 'border-[#1B3F7B] bg-[#EBF0F8]' : 'border-[#D1D9E6] hover:bg-[#F4F6FA]'
              }`}>
                <input type="radio" name="mode" value={opt.value} checked={mode === opt.value}
                  onChange={() => setMode(opt.value)} className="mt-0.5 accent-[#1B3F7B]" />
                <div>
                  <p className="text-sm font-medium text-[#111827]">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${opt.danger ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 진행바 */}
        {loading && (
          <div className="bg-white border border-[#D1D9E6] rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#4B5563]">검증 중...</span>
              <span className="font-medium text-[#1B3F7B]">{progress}%</span>
            </div>
            <div className="h-2 bg-[#F4F6FA] rounded-full overflow-hidden">
              <div className="h-full bg-[#1B3F7B] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <Button
          variant="primary" size="lg" fullWidth
          disabled={!file} loading={loading}
          onClick={handleVerify}
          className={!file ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {loading ? '검증 중...' : '검증 시작'}
        </Button>
      </div>
    </div>
  );
}
