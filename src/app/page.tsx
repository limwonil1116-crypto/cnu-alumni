'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function StartPage() {
  const router = useRouter();
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleKakao = async () => {
    setKakaoLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image account_email',
      },
    });
  };

  const handleEmail = async () => {
    setError('');
    if (!email || !password) { setError('이메일과 비밀번호를 입력해 주세요.'); return; }
    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 로그인 실패시 회원가입 시도
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError('로그인에 실패했습니다. 다시 시도해 주세요.');
        setEmailLoading(false);
        return;
      }
    }
    setEmailLoading(false);
    router.push('/directory');
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3F7B] px-6 pt-16 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }}
        />
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-white/15 mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">충남대학교</h1>
          <p className="text-white/80 text-lg font-medium mb-1">동문 디렉터리</p>
          <p className="text-white/50 text-sm">CNU Alumni Directory</p>
        </div>
      </div>

      {/* 로그인 영역 */}
      <div className="flex-1 px-5 py-8 flex flex-col">
        <p className="text-center text-[#4B5563] text-sm mb-6">
          충남대학교 졸업생 전용 네트워크입니다
        </p>

        {error && (
          <div className="bg-[#FEE2E2] text-[#DC2626] px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakao}
          disabled={kakaoLoading}
          className="w-full min-h-[56px] bg-[#FEE500] text-[#191919] rounded-2xl text-[16px] font-bold flex items-center justify-center gap-3 hover:bg-[#F0D800] transition-all mb-3 shadow-sm disabled:opacity-70 active:scale-[0.98]"
        >
          {kakaoLoading ? (
            <span className="w-5 h-5 border-2 border-[#191919]/40 border-t-[#191919] rounded-full animate-spin" />
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.633 5.085 4.1 6.525L5.1 21l4.65-2.475c.735.1 1.485.15 2.25.15 5.523 0 10-3.477 10-7.875C22 6.477 17.523 3 12 3z"/>
              </svg>
              카카오로 로그인
            </>
          )}
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-[#E5EAF2]" />
          <span className="text-xs text-[#9CA3AF]">또는</span>
          <div className="flex-1 h-px bg-[#E5EAF2]" />
        </div>

        {/* 이메일 로그인 */}
        {!showEmail ? (
          <button
            onClick={() => setShowEmail(true)}
            className="w-full min-h-[56px] bg-white border-[1.5px] border-[#E5EAF2] text-[#1B3F7B] rounded-2xl text-[15px] font-semibold hover:border-[#1B3F7B] hover:bg-[#EBF0F8] transition-all"
          >
            이메일로 로그인
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border-[1.5px] border-[#E5EAF2] rounded-2xl text-[15px] outline-none focus:border-[#1B3F7B] transition-colors bg-white"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border-[1.5px] border-[#E5EAF2] rounded-2xl text-[15px] outline-none focus:border-[#1B3F7B] transition-colors bg-white"
              onKeyDown={e => e.key === 'Enter' && handleEmail()}
            />
            <button
              onClick={handleEmail}
              disabled={emailLoading}
              className="w-full min-h-[56px] bg-[#1B3F7B] text-white rounded-2xl text-[15px] font-semibold hover:bg-[#112B55] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {emailLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : '로그인 / 가입'}
            </button>
            <button onClick={() => setShowEmail(false)} className="w-full text-center text-sm text-[#9CA3AF] py-1">
              취소
            </button>
          </div>
        )}

        <div className="mt-auto pt-8 text-center">
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            로그인 시 개인정보 처리방침에 동의하는 것으로 간주합니다
          </p>
        </div>
      </div>
    </div>
  );
}