'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Card, SectionTitle, Divider, Alert, Button } from '@/components/ui';
import { MOCK_CURRENT_USER } from '@/data/mock';

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-sm text-[#4B5563]">{label}</span>
      <span className="text-sm text-[#111827]">{value || '-'}</span>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const user = MOCK_CURRENT_USER;

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) router.push('/');
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* 헤더 */}
      <div className="bg-[#1B3F7B] px-5 pt-5 pb-6">
        <h1 className="text-white text-lg font-bold mb-4">마이페이지</h1>
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" photoUrl={user.photoUrl} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white text-lg font-bold">{user.name}</p>
              <Badge variant="success" className="text-[10px]">✓ 인증완료</Badge>
            </div>
            <p className="text-white/70 text-sm">{user.department} · {user.graduationYear}년 졸업</p>
            {user.company && <p className="text-[#F0BE50] text-sm font-medium mt-0.5">{user.company}</p>}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F4F6FA] space-y-3">
        {/* 승인 대기 알림 */}
        <Alert variant="warn">
          <strong className="font-semibold">승인 대기 중</strong><br />
          <span className="text-sm">연락처 변경 요청이 관리자 승인을 기다리고 있습니다</span>
        </Alert>

        {/* 내 정보 */}
        <Card>
          <SectionTitle>내 정보</SectionTitle>
          <InfoRow label="학과" value={user.department} />
          <Divider className="my-0" />
          <InfoRow label="졸업년도" value={`${user.graduationYear}년`} />
          <Divider className="my-0" />
          <InfoRow label="근무지" value={user.company} />
          <Divider className="my-0" />
          <InfoRow label="직무" value={user.jobTitle} />
          <Divider className="my-0" />
          <InfoRow label="지역" value={user.region} />
        </Card>

        {/* 연락처 */}
        <Card>
          <SectionTitle>연락처</SectionTitle>
          <InfoRow label="휴대폰" value={user.phone} />
          <Divider className="my-0" />
          <InfoRow label="이메일" value={user.email} />
        </Card>

        {/* 자기소개 */}
        {user.bio && (
          <Card>
            <SectionTitle>자기소개</SectionTitle>
            <p className="text-sm text-[#4B5563] leading-relaxed">{user.bio}</p>
          </Card>
        )}

        {/* 버튼 */}
        <Link
          href="/mypage/edit"
          className="flex items-center justify-center w-full min-h-[50px] bg-[#1B3F7B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#112B55] transition-colors"
        >
          프로필 수정
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full min-h-[50px] border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-xl text-[15px] font-semibold hover:bg-[#FEE2E2] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
