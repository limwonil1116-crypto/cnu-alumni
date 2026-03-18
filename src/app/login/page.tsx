'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, Alert } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', pw: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.id.trim() || !form.pw.trim()) {
      setError('이메일/휴대폰 번호와 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    // 데모: 아무 값이나 입력하면 로그인 성공
    router.push('/directory');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="로그인" showBack backHref="/" />
      <div className="flex-1 px-5 py-6">
        {/* 로고 영역 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#EBF0F8] flex items-center justify-center text-2xl">🎓</div>
          <div>
            <p className="font-bold text-[#111827]">충남대학교 동문 디렉터리</p>
            <p className="text-xs text-[#9CA3AF]">인증된 동문 전용 서비스</p>
          </div>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <InputField
          label="이메일 또는 휴대폰 번호"
          placeholder="example@cnu.ac.kr 또는 010-0000-0000"
          type="text"
          value={form.id}
          onChange={set('id')}
          autoComplete="username"
        />
        <InputField
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          type="password"
          value={form.pw}
          onChange={set('pw')}
          autoComplete="current-password"
        />

        <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleLogin} className="mt-2">
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <button className="w-full text-center text-sm text-[#2A5BA8] mt-4 py-2 hover:underline">
          비밀번호 재설정
        </button>

        <div className="mt-6 pt-5 border-t border-[#D1D9E6] text-center">
          <p className="text-sm text-[#9CA3AF] mb-2">아직 인증을 완료하지 않으셨나요?</p>
          <Link href="/verify" className="text-sm text-[#1B3F7B] font-semibold">
            본인 인증하기 →
          </Link>
        </div>

        <div className="mt-4 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
          <p className="text-xs text-[#B45309] font-medium mb-0.5">📌 데모 안내</p>
          <p className="text-xs text-[#92400E]">이메일/비밀번호 아무 값이나 입력하면 디렉터리로 이동합니다</p>
        </div>
      </div>
    </div>
  );
}
