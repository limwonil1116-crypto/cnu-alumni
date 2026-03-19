'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, InputField, Alert } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', pw: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  // 이메일 로그인
  const handleLogin = async () => {
    if (!form.id.trim() || !form.pw.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.id,
      password: form.pw,
    });
    setLoading(false);
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    router.push('/directory');
  };

  // 카카오 로그인
  const handleKakao = async () => {
    setKakaoLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('카카오 로그인에 실패했습니다.');
      setKakaoLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="bg-[#1B3F7B] px-6 pt-12 pb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center text-3xl">🎓</div>
        <h1 className="text-white text-xl font-bold mb-1">충남대학교 동문 디렉터리</h1>
        <p className="text-white/60 text-sm">인증된 동문 전용 서비스</p>
      </div>

      <div className="flex-1 px-5 py-6">
        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakao}
          disabled={kakaoLoading}
          className="w-full min-h-[54px] bg-[#FEE500] text-[#191919] rounded-xl text-[16px] font-bold flex items-center justify-center gap-3 hover:bg-[#F0D800] transition-colors mb-4 disabled:opacity-70"
        >
          {kakaoLoading ? (
            <span className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.633 5.085 4.1 6.525L5.1 21l4.65-2.475c.735.1 1.485.15 2.25.15 5.523 0 10-3.477 10-7.875C22 6.477 17.523 3 12 3z"/>
              </svg>
              카카오로 로그인
            </>
          )}
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#D1D9E6]" />
          <span className="text-sm text-[#9CA3AF]">또는</span>
          <div className="flex-1 h-px bg-[#D1D9E6]" />
        </div>

        {/* 이메일 로그인 */}
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <InputField
          label="이메일"
          placeholder="example@cnu.ac.kr"
          type="email"
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

        <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleLogin}>
          {loading ? '로그인 중...' : '이메일로 로그인'}
        </Button>

        <div className="mt-6 pt-5 border-t border-[#D1D9E6] text-center">
          <p className="text-sm text-[#9CA3AF] mb-2">아직 인증을 완료하지 않으셨나요?</p>
          <Link href="/verify" className="text-sm text-[#1B3F7B] font-semibold">
            본인 인증하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}