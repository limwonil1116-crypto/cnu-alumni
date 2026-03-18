'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Button, InputField, Alert, Badge, Avatar } from '@/components/ui';
import { MOCK_CURRENT_USER } from '@/data/mock';

export default function EditProfilePage() {
  const router = useRouter();
  const user = MOCK_CURRENT_USER;
  const [form, setForm] = useState({
    company: user.company || '',
    jobTitle: user.jobTitle || '',
    phone: user.phone || '',
    email: user.email || '',
    bio: user.bio || '',
    region: user.region || '',
  });
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === 'phone') setPhoneError('');
  };

  const handleSave = async () => {
    if (form.phone && !/^01[0-9][-\s]?\d{3,4}[-\s]?\d{4}$/.test(form.phone.replace(/\s/g, ''))) {
      setPhoneError('휴대폰 번호를 다시 확인해 주세요.');
      return;
    }
    if (!confirm('변경 사항을 저장하시겠습니까?\n일부 항목은 관리자 승인 후 반영됩니다.')) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    router.push('/mypage');
  };

  const handleCancel = () => {
    if (confirm('저장하지 않은 변경 사항이 있습니다. 나가시겠습니까?')) router.back();
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="프로필 수정" showBack />
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <Alert variant="info" className="mb-5">
          일부 항목은 관리자 승인 후 반영될 수 있습니다
        </Alert>

        {/* 사진 */}
        <div className="flex flex-col items-center mb-6">
          <Avatar name={user.name} size="xl" photoUrl={user.photoUrl} />
          <button className="mt-3 text-sm text-[#2A5BA8] font-medium py-1 px-3 border border-[#2A5BA8] rounded-full hover:bg-[#EBF0F8] transition-colors">
            사진 변경
          </button>
        </div>

        <InputField
          label="근무지" placeholder="회사명 또는 기관명"
          value={form.company} onChange={set('company')}
        />
        <InputField
          label="직무" placeholder="담당 업무를 입력해 주세요"
          value={form.jobTitle} onChange={set('jobTitle')}
        />

        {/* 연락처 - 승인 필요 */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#4B5563]">연락처</label>
            <Badge variant="pending">승인 필요</Badge>
          </div>
          <input
            type="tel" placeholder="010-1234-5678"
            value={form.phone}
            onChange={set('phone') as React.ChangeEventHandler<HTMLInputElement>}
            className={`w-full px-4 py-3 border-[1.5px] rounded-[8px] text-[16px] outline-none transition-colors ${
              phoneError ? 'border-[#DC2626]' : 'border-[#D1D9E6] focus:border-[#2A5BA8]'
            }`}
          />
          {phoneError && <p className="text-xs text-[#DC2626]">{phoneError}</p>}
        </div>

        <InputField
          label="이메일" placeholder="example@cnu.ac.kr" type="email"
          value={form.email} onChange={set('email')}
        />
        <InputField
          label="지역" placeholder="서울, 대전 등"
          value={form.region} onChange={set('region')}
        />

        {/* 자기소개 */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-sm font-medium text-[#4B5563]">자기소개</label>
          <textarea
            placeholder="간단한 자기소개를 입력해 주세요"
            value={form.bio}
            onChange={set('bio') as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={3}
            className="w-full px-4 py-3 border-[1.5px] border-[#D1D9E6] rounded-[8px] text-[16px] outline-none focus:border-[#2A5BA8] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="secondary" size="md" onClick={handleCancel} className="flex-1">취소</Button>
          <Button variant="primary" size="md" fullWidth loading={saving} onClick={handleSave} className="flex-1">
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
