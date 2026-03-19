'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, Alert } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function SignupProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [gradYear, setGradYear] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setLoading(true);

    // 현재 로그인된 사용자 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('로그인 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    // alumni_master에 pending 상태로 저장
    await supabase.from('alumni_master').upsert({
      email: user.email || user.id,
      name,
      phone: phone || null,
      auth_status: 'pending',
    });

    setLoading(false);
    router.push('/signup/complete');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="개인정보 입력" showBack backHref="/" />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="bg-[#DCFCE7] border border-[#15803D]/20 rounded-xl p-4 mb-5">
          <p className="text-sm text-[#15803D] font-medium">✓ 카카오 인증이 완료되었습니다</p>
          <p className="text-xs text-[#15803D]/70 mt-1">아래 정보를 입력하면 가입 신청이 완료됩니다</p>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

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

        <Button
          variant="primary" size="lg" fullWidth
          loading={loading} onClick={handleSubmit}
          className="mt-2"
        >
          {loading ? '저장 중...' : '가입 신청 완료'}
        </Button>

        <p className="text-xs text-[#9CA3AF] text-center mt-4">
          입력하신 정보는 동문 인증 목적으로만 사용됩니다
        </p>
      </div>
    </div>
  );
}