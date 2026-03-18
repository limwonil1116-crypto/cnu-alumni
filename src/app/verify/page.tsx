'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, SelectField, Alert } from '@/components/ui';
import { DEPARTMENTS, getAdmissionYears } from '@/lib/constants';

interface FormErrors {
  name?: string; phone?: string; email?: string; year?: string; dept?: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', year: '', dept: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = '이름을 입력해 주세요.';
    if (!form.phone.trim()) errs.phone = '휴대폰 번호를 입력해 주세요.';
    else if (!/^01[0-9][-\s]?\d{3,4}[-\s]?\d{4}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = '휴대폰 번호를 다시 확인해 주세요.';
    if (!form.email.trim()) errs.email = '이메일을 입력해 주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = '이메일 형식을 확인해 주세요.';
    if (!form.year) errs.year = '입학년도를 선택해 주세요.';
    if (!form.dept) errs.dept = '학과를 선택해 주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    if (form.name === '홍길동') router.push('/verify/success');
    else router.push('/verify/fail');
  };

  const years = getAdmissionYears();

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="본인 인증" showBack backHref="/" />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <Alert variant="info" className="mb-5">
          사전 등록된 동문 정보와 일치해야 계정이 활성화됩니다
        </Alert>

        <InputField
          label="이름" placeholder="홍길동"
          value={form.name} onChange={set('name')} error={errors.name}
        />
        <InputField
          label="휴대폰 번호" placeholder="010-1234-5678" type="tel"
          value={form.phone} onChange={set('phone')} error={errors.phone}
        />
        <InputField
          label="이메일" placeholder="example@cnu.ac.kr" type="email"
          value={form.email} onChange={set('email')} error={errors.email}
        />

        <SelectField label="입학년도" value={form.year} onChange={set('year')} error={errors.year}>
          <option value="">▼ 선택해 주세요</option>
          {years.map(y => <option key={y} value={y}>{y}년</option>)}
        </SelectField>

        <SelectField label="학과" value={form.dept} onChange={set('dept')} error={errors.dept}>
          <option value="">▼ 학과를 선택해 주세요</option>
          {DEPARTMENTS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {(group.items as readonly string[]).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </optgroup>
          ))}
        </SelectField>

        <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleSubmit} className="mt-2">
          {loading ? '인증 중...' : '본인 인증하기'}
        </Button>

        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          입력한 정보는 인증 목적으로만 사용됩니다
        </p>
        <div className="mt-3 text-center">
          <span className="text-sm text-[#9CA3AF]">이미 인증하셨나요? </span>
          <Link href="/login" className="text-sm text-[#1B3F7B] font-medium">로그인</Link>
        </div>

        <div className="mt-5 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
          <p className="text-xs text-[#B45309] font-medium mb-0.5">📌 데모 안내</p>
          <p className="text-xs text-[#92400E]">이름에 <strong>홍길동</strong> 입력 시 인증 성공 화면으로 이동</p>
        </div>
      </div>
    </div>
  );
}
