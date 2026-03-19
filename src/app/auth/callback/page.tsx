'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push('/login');
        return;
      }

      const user = session.user;

      // alumni_master 에 등록된 사용자인지 확인
      const { data: alumni } = await supabase
        .from('alumni_master')
        .select('auth_status')
        .eq('email', user.email)
        .single();

      if (!alumni) {
        // DB에 없으면 신규 가입자 → 개인정보 입력
        router.push('/signup/profile');
      } else if (alumni.auth_status === 'pending') {
        // 승인 대기 중
        await supabase.auth.signOut();
        router.push('/login?error=pending');
      } else {
        // 승인 완료 → 디렉터리
        router.push('/directory');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-[#4B5563]">로그인 처리 중...</p>
    </div>
  );
}