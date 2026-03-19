'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Button, Alert } from '@/components/ui';

interface UploadResult {
  total: number;
  success: number;
  duplicate: number;
  error: number;
  errors: { row: number; reason: string }[];
}

export default function AdminUploadsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [apiError, setApiError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); setApiError(''); }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (mode === 'replace' && !confirm('기존 데이터를 전부 삭제하고 새로 올립니다.\n계속하시겠습니까?')) return;

    setLoading(true);
    setProgress(0);
    setResult(null);
    setApiError('');

    // 진행바 애니메이션
    const timer = setInterval(() => {
      setProgress(p => p < 85 ? p + 5 : p);
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(timer);
      setProgress(100);

      if (data.error) {
        setApiError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      clearInterval(timer);
      setApiError('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="졸업생 리스트 업로드" showBack backHref="/admin/dashboard" variant="admin" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* CSV 양식 안내 */}
        <div className="bg-[#EBF0F8] border border-[#2A5BA8]/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-[#1B3F7B] mb-2">📋 CSV 파일 양식</p>
          <p className="text-xs text-[#1B3F7B] mb-2">첫 번째 행은 아래 헤더여야 합니다:</p>
          <div className="bg-white rounded-lg p-2 font-mono text-xs text-[#4B5563] overflow-x-auto">
            이름,학과,입학년도,졸업년도,연락처,이메일,회사명,직무,지역
          </div>
          <p className="text-xs text-[#4B5563] mt-2">필수: 이름, 이메일 / 나머지는 선택입니다</p>
        </div>

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
                onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                className="mt-2 text-xs text-[#DC2626] underline"
              >
                파일 제거
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#111827] mb-1">CSV 파일을 선택해 주세요</p>
              <p className="text-sm text-[#9CA3AF]">지원 형식: .csv</p>
            </>
          )}
          <input id="file-input" type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>

        {/* 처리 옵션 */}
        <div className="bg-white border border-[#D1D9E6] rounded-xl p-4">
          <p className="text-sm font-semibold text-[#111827] mb-3">처리 옵션</p>
          <div className="space-y-2">
            {([
              { value: 'merge' as const, label: '기존 데이터와 병합', desc: '새 항목만 추가, 기존 항목 유지', danger: false },
              { value: 'replace' as const, label: '기존 데이터 덮어쓰기', desc: '주의: 기존 데이터 전부 삭제됩니다', danger: true },
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
              <span className="text-[#4B5563]">업로드 중...</span>
              <span className="font-medium text-[#1B3F7B]">{progress}%</span>
            </div>
            <div className="h-2 bg-[#F4F6FA] rounded-full overflow-hidden">
              <div className="h-full bg-[#1B3F7B] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* 에러 */}
        {apiError && <Alert variant="error">{apiError}</Alert>}

        {/* 결과 */}
        {result && (
          <div className="bg-white border border-[#D1D9E6] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#1B3F7B]">
              <p className="text-white font-semibold">업로드 완료</p>
            </div>
            <div className="grid grid-cols-3 gap-0 border-b border-[#D1D9E6]">
              {[
                { label: '전체', num: result.total, color: 'text-[#1B3F7B]' },
                { label: '성공', num: result.success, color: 'text-[#15803D]' },
                { label: '실패', num: result.error + result.duplicate, color: 'text-[#DC2626]' },
              ].map((s, i) => (
                <div key={i} className="text-center py-4 border-r border-[#D1D9E6] last:border-0">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.num}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[#111827] mb-2">오류 목록</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex gap-2 text-xs text-[#4B5563]">
                      <span className="bg-[#F4F6FA] px-2 py-0.5 rounded font-mono flex-shrink-0">{e.row}행</span>
                      <span>{e.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.success > 0 && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full py-2.5 bg-[#1B3F7B] text-white rounded-xl text-sm font-semibold hover:bg-[#112B55] transition-colors"
                >
                  대시보드로 돌아가기
                </button>
              </div>
            )}
          </div>
        )}

        <Button
          variant="primary" size="lg" fullWidth
          disabled={!file || loading}
          onClick={handleUpload}
          className={!file ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {loading ? '업로드 중...' : '업로드 시작'}
        </Button>

      </div>
    </div>
  );
}