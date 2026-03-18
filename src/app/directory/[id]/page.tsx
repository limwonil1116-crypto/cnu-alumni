'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Avatar, Badge, Card, SectionTitle, Divider } from '@/components/ui';
import { MOCK_ALUMNI } from '@/data/mock';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg border transition-all ${
        copied ? 'bg-[#DCFCE7] border-[#15803D] text-[#15803D]' : 'border-[#D1D9E6] text-[#1B3F7B] hover:bg-[#EBF0F8]'
      }`}
    >
      {copied ? '✓ 복사 완료' : label}
    </button>
  );
}

function InfoRow({ label, value, masked }: { label: string; value?: string; masked?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-sm text-[#4B5563]">{label}</span>
      <span className={`text-sm text-[#111827] ${masked ? 'font-mono tracking-wider' : ''}`}>{value}</span>
    </div>
  );
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const alumni = MOCK_ALUMNI.find(a => a.id === id);
  if (!alumni) notFound();

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="프로필 상세" showBack backHref="/directory" />
      <div className="flex-1 overflow-y-auto pb-6">

        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-b from-[#1B3F7B] to-[#2A5BA8] px-6 pt-6 pb-8 text-center">
          <Avatar name={alumni.name} size="xl" photoUrl={alumni.photoUrl} />
          <h2 className="text-white text-xl font-bold mt-3 mb-1">{alumni.name}</h2>
          <p className="text-white/70 text-sm">{alumni.department} · {alumni.graduationYear}년 졸업</p>
          {alumni.company && (
            <p className="text-[#F0BE50] text-sm font-medium mt-1">
              {alumni.company}{alumni.jobTitle && ` / ${alumni.jobTitle}`}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-3">
            <Badge variant="info" className="bg-white/15 text-white border-0">{alumni.department}</Badge>
            {alumni.region && <Badge variant="info" className="bg-white/15 text-white border-0">📍 {alumni.region}</Badge>}
          </div>
        </div>

        {/* 카드 섹션 */}
        <div className="px-4 -mt-4 space-y-3">

          {/* 기본 정보 */}
          <Card>
            <SectionTitle>기본 정보</SectionTitle>
            <InfoRow label="학과" value={alumni.department} />
            <Divider className="my-0.5" />
            <InfoRow label="졸업년도" value={`${alumni.graduationYear}년`} />
            {alumni.admissionYear && (
              <>
                <Divider className="my-0.5" />
                <InfoRow label="입학년도" value={`${alumni.admissionYear}년`} />
              </>
            )}
            {alumni.region && (
              <>
                <Divider className="my-0.5" />
                <InfoRow label="지역" value={alumni.region} />
              </>
            )}
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>연락처 정보</SectionTitle>
              <span className="text-[10px] text-[#9CA3AF] bg-[#F4F6FA] px-2 py-0.5 rounded-full">인증된 동문에게만 공개</span>
            </div>
            {alumni.phone && (
              <>
                <InfoRow label="연락처" value={alumni.phone} masked />
                <Divider className="my-0.5" />
              </>
            )}
            {alumni.email && <InfoRow label="이메일" value={alumni.email} />}
            <div className="flex gap-2 mt-4">
              {alumni.phone && <CopyButton text={alumni.phone} label="📋 연락처 복사" />}
              {alumni.email && <CopyButton text={alumni.email} label="✉️ 이메일 복사" />}
            </div>
          </Card>

          {/* 자기소개 */}
          {alumni.bio && (
            <Card>
              <SectionTitle>자기소개</SectionTitle>
              <p className="text-sm text-[#4B5563] leading-relaxed">{alumni.bio}</p>
            </Card>
          )}

          {/* 개인정보 안내 */}
          <p className="text-xs text-[#9CA3AF] text-center px-4 pb-2">
            일부 정보는 운영 정책에 따라 제한될 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
