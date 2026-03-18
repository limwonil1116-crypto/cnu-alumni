import Link from 'next/link';
import { TopBar } from '@/components/TopBar';

const SECTIONS = [
  {
    title: '수집 및 이용 목적',
    icon: '📋',
    content: '동문 본인 인증 및 디렉터리 서비스 제공을 위해 이름, 연락처, 이메일, 학과, 입학년도 정보를 수집합니다. 수집된 정보는 인증 및 서비스 운영 목적으로만 사용됩니다.',
  },
  {
    title: '공개 범위',
    icon: '🔒',
    content: '인증된 동문에게만 프로필 정보가 공개됩니다. 외부 사용자와 미인증 사용자는 어떤 정보도 조회할 수 없습니다. 연락처와 이메일은 부분 마스킹 처리 후 표시됩니다.',
  },
  {
    title: '보유 및 이용 기간',
    icon: '⏱️',
    content: '회원 탈퇴 또는 삭제 요청 시까지 보유합니다. 법령에 따라 일정 기간 보존이 필요한 정보는 해당 기간 동안 별도 보관됩니다.',
  },
  {
    title: '제3자 제공',
    icon: '🚫',
    content: '수집된 개인정보는 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우나 정보주체의 동의가 있는 경우에는 예외가 적용될 수 있습니다.',
  },
  {
    title: '정보 수정 및 삭제 요청',
    icon: '✏️',
    content: '본인 정보는 마이페이지에서 직접 수정할 수 있습니다. 계정 삭제 또는 정보 삭제를 원하시면 아래 관리자 이메일로 문의해 주세요.',
  },
  {
    title: '문의처',
    icon: '📧',
    content: '개인정보 관련 문의: alumni@cnu.ac.kr\n충남대학교 동문회 사무처\n운영 시간: 평일 09:00 ~ 18:00',
  },
];

export default function PolicyPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar title="개인정보 처리 안내" showBack backHref="/" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        <div className="bg-[#EBF0F8] border border-[#2A5BA8]/20 rounded-xl px-4 py-3 mb-2">
          <p className="text-sm text-[#1B3F7B] leading-relaxed">
            충남대학교 동문 디렉터리는 개인정보 보호를 최우선으로 운영됩니다.
            인증된 동문에게만 정보가 공개되며, 외부 노출을 원칙적으로 차단합니다.
          </p>
        </div>

        {SECTIONS.map(s => (
          <div key={s.title} className="bg-white border border-[#D1D9E6] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <p className="font-semibold text-[#111827]">{s.title}</p>
            </div>
            <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-[#9CA3AF]">최종 수정일: 2026년 3월 18일</p>
          <Link href="/" className="inline-block mt-3 text-sm text-[#1B3F7B] font-medium">
            ← 시작 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
