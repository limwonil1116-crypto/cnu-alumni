'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, InputField, Alert } from '@/components/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', pw: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.id || !form.pw) { setError('관리자 ID와 비밀번호를 입력해 주세요.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Admin header */}
      <div className="bg-[#112B55] px-5 py-4 flex items-center gap-3">
        <Link href="/" className="text-white/70 hover:text-white">←</Link>
        <div>
          <h2 className="text-white text-[17px] font-semibold">관리자 로그인</h2>
          <p className="text-white/50 text-xs">충남대학교 동문 디렉터리</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6">
        <Alert variant="warn" className="mb-6">
          🔐 관리자 전용 접근 영역입니다. 허가된 관리자만 접근할 수 있습니다.
        </Alert>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <InputField
          label="관리자 ID" placeholder="admin@cnu.ac.kr"
          type="text" value={form.id} onChange={set('id')} autoComplete="username"
        />
        <InputField
          label="비밀번호" placeholder="비밀번호를 입력해 주세요"
          type="password" value={form.pw} onChange={set('pw')} autoComplete="current-password"
        />

        <Button
          variant="primary" size="lg" fullWidth loading={loading} onClick={handleLogin}
          className="mt-2 bg-[#112B55] hover:bg-[#0A1E3D]"
        >
          {loading ? '로그인 중...' : '관리자 로그인'}
        </Button>

        <div className="mt-5 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
          <p className="text-xs text-[#B45309] font-medium mb-0.5">📌 데모 안내</p>
          <p className="text-xs text-[#92400E]">아무 값이나 입력하면 관리자 대시보드로 이동합니다</p>
        </div>
      </div>
    </div>
  );
}
