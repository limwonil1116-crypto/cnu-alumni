'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, Alert } from '@/components/ui';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2 | 3;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 - 인증 방법 선택 후 카카오/이메일 인증
  const [verified, setVerified] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  // Step 2 - 아이디/비밀번호 등록
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Step 3 - 개인정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [gradYear, setGradYear] = useState('');

  // 카카오 인증
  const handleKakao = async () => {
    setKakaoLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?signup=true`,
      },
    });
    if (error) {
      setError('카카오 인증에 실패했습니다.');
      setKakaoLoading(false);
    }
  };

  // 이메일 인증 확인
  const handleEmailVerify = async () => {
    setError('');
    if (!verifyEmail) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verifyEmail)) {
      setError('이메일 형식을 확인해 주세요.');
      return;
    }
    // 이메일 인증 완료로 처리 후 다음 단계
    setVerified(true);
    setLoginId(verifyEmail);
    setStep(2);
  };

  // Step 2 → Step 3
  const handleStep2 = () => {
    setError('');
    if (!loginId) {
      setError('아이디(이메일)를 입력해 주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)) {
      setError('아이디는 이메일 형식이어야 합니다.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setStep(3);
  };

  // 최종 가입
  const handleFinal = async () => {
    setError('');
    if (!name) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setLoading(true);

    // Supabase 회원가입
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: loginId,
      password,
      options: {
        data: { name, phone, dept, gradYear, status: 'pending' }
      }
    });

    if (signUpError) {
      setError(
        signUpError.message === 'User already registered'
          ? '이미 가입된 아이디입니다.'
          : '가입에 실패했습니다. 다시 시도해 주세요.'
      );
      setLoading(false);
      return;
    }

    // alumni_master 에 pending 상태로 저장
    if (data.user) {
      await supabase.from('alumni_master').upsert({
        email: loginId,
        name,
        phone: phone || null,
        auth_status: 'pending',
      });
    }

    setLoading(false);
    router.push('/signup/complete');
  };

  // 단계 표시
  const StepBar = () => (
    <div className="px-5 py-3 bg-white border-b border-[#D1D9E6]">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s, i) => (
          <>
            <div key={s} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${step >= s ? 'bg-[#1B3F7B] text-white' : 'bg-[#F4F6FA] text-[#9CA3AF]'}`}>
              {s}
            </div>
            {i < 2 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > s ? 'bg-[#1B3F7B]' : 'bg-[#F4F6FA]'}`} />}
          </>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[#4B5563]">본인 인증</span>
        <span className="text-xs text-[#4B5563]">아이디/비밀번호</span>
        <span className="text-xs text-[#4B5563]">개인정보</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="회원가입" showBack backHref="/" />
      <StepBar />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        {/* STEP 1 - 본인 인증 */}
        {step === 1 && (
          <>
            <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
              본인 확인을 위해 인증 방법을 선택해 주세요.
            </p>

            {/* 카카오 인증 */}
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
                  카카오로 본인 인증
                </>
              )}
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#D1D9E6]" />
              <span className="text-sm text-[#9CA3AF]">또는 이메일로 인증</span>
              <div className="flex-1 h-px bg-[#D1D9E6]" />
            </div>

            {/* 이메일 인증 */}
            <InputField
              label="이메일"
              placeholder="본인 이메일 입력"
              type="email"
              value={verifyEmail}
              onChange={e => setVerifyEmail(e.target.value)}
            />
            <Button variant="primary" size="lg" fullWidth onClick={handleEmailVerify}>
              이메일로 인증하기
            </Button>

            <div className="mt-5 text-center">
              <span className="text-sm text-[#9CA3AF]">이미 계정이 있으신가요? </span>
              <Link href="/login" className="text-sm text-[#1B3F7B] font-semibold">로그인</Link>
            </div>
          </>
        )}

        {/* STEP 2 - 아이디/비밀번호 등록 */}
        {step === 2 && (
          <>
            <p className="text-sm text-[#4B5563] mb-5 leading-relaxed">
              로그인에 사용할 아이디와 비밀번호를 등록해 주세요.
            </p>
            <InputField
              label="아이디 (이메일 형식)"
              placeholder="example@cnu.ac.kr"
              type="email"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
            />
            <InputField
              label="비밀번호"
              placeholder="6자리 이상 입력해 주세요"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <InputField
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해 주세요"
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(1)} className="flex-1">
                이전
              </Button>
              <Button variant="primary" size="md" onClick={handleStep2} className="flex-1">
                다음
              </Button>
            </div>
          </>
        )}

        {/* STEP 3 - 개인정보 */}
        {step === 3 && (
          <>
            <p className="text-sm text-[#4B5563] mb-5 leading-relaxed">
              동문 명단 확인을 위해 아래 정보를 입력해 주세요.
            </p>
            <InputField
              label="이름"
              placeholder="홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <InputField
              label="연락처"
              placeholder="010-1234-5678"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <InputField
              label="학과"
              placeholder="경영학과"
              value={dept}
              onChange={e => setDept(e.target.value)}
            />
            <InputField
              label="졸업년도"
              placeholder="2020"
              type="number"
              value={gradYear}
              onChange={e => setGradYear(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(2)} className="flex-1">
                이전
              </Button>
              <Button variant="primary" size="md" loading={loading} onClick={handleFinal} className="flex-1">
                {loading ? '가입 중...' : '가입 완료'}
              </Button>
            </div>
            <p className="text-xs text-[#9CA3AF] text-center mt-4">
              입력하신 정보는 동문 인증 목적으로만 사용됩니다
            </p>
          </>
        )}
      </div>
    </div>
  );
}