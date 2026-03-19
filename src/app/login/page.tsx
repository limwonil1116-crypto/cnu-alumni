'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, Alert } from '@/components/ui';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', pw: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'pending') {
      setError('관리자 승인 대기 중입니다. 승인 후 로그인하실 수 있습니다.');
    }
  }, [searchParams]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.pw.trim()) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.pw,
    });
    setLoading(false);
    if (error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    const { data: alumni } = await supabase
      .from('alumni_master')
      .select('auth_status')
      .eq('email', form.email)
      .single();

    if (alumni?.auth_status === 'pending') {
      await supabase.auth.signOut();
      setError('관리자 승인 대기 중입니다. 승인 후 로그인하실 수 있습니다.');
      return;
    }

    if (autoLogin) localStorage.setItem('autoLogin', 'true');
    router.push('/directory');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="flex-1 px-5 py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#EBF0F8] flex items-center justify-center text-2xl">🎓</div>
        <div>
          <p className="font-bold text-[#111827]">충남대학교 동문 디렉터리</p>
          <p className="text-xs text-[#9CA3AF]">인증된 동문 전용 서비스</p>
        </div>
      </div>

      {error && (
        <Alert variant={error.includes('승인') ? 'warn' : 'error'} className="mb-4">
          {error}
        </Alert>
      )}

      <InputField
        label="아이디 (이메일 형식)"
        placeholder="example@cnu.ac.kr"
        type="email"
        value={form.email}
        onChange={set('email')}
        onKeyDown={handleKeyDown}
        autoComplete="username"
      />
      <InputField
        label="비밀번호"
        placeholder="비밀번호를 입력해 주세요"
        type="password"
        value={form.pw}
        onChange={set('pw')}
        onKeyDown={handleKeyDown}
        autoComplete="current-password"
      />

      <label className="flex items-center gap-2 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={autoLogin}
          onChange={e => setAutoLogin(e.target.checked)}
          className="w-4 h-4 accent-[#1B3F7B] cursor-pointer"
        />
        <span className="text-sm text-[#4B5563]">자동 로그인</span>
      </label>

      <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleLogin}>
        {loading ? '로그인 중...' : '로그인'}
      </Button>

      <button className="w-full text-center text-sm text-[#9CA3AF] mt-3 py-2 hover:text-[#1B3F7B] transition-colors">
        비밀번호를 잊으셨나요?
      </button>

      <div className="mt-4 pt-5 border-t border-[#D1D9E6] text-center">
        <span className="text-sm text-[#9CA3AF]">아직 계정이 없으신가요? </span>
        <Link href="/signup" className="text-sm text-[#1B3F7B] font-semibold">회원가입</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="로그인" showBack backHref="/" />
      <Suspense fallback={
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}