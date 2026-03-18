import Link from 'next/link';

export default function VerifyFailPage() {
  return (
    <div className="flex flex-col min-h-dvh items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3C6.477 3 2 7.477 2 12s4.477 9 10 9 10-4.477 10-9S17.523 3 12 3z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-[#111827] mb-3">일치하는 등록 정보를<br />찾지 못했습니다</h1>
      <p className="text-[#4B5563] text-[15px] leading-relaxed mb-8">
        입력 정보를 다시 확인해 주세요.<br />
        문제가 계속되면 관리자에게 문의해 주세요.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/verify"
          className="flex items-center justify-center w-full min-h-[54px] bg-[#1B3F7B] text-white rounded-[10px] text-[16px] font-semibold hover:bg-[#112B55] transition-colors"
        >
          다시 시도
        </Link>
        <Link
          href="/policy"
          className="flex items-center justify-center w-full min-h-[54px] border-[1.5px] border-[#1B3F7B] text-[#1B3F7B] rounded-[10px] text-[16px] font-semibold hover:bg-[#EBF0F8] transition-colors"
        >
          문의 안내 보기
        </Link>
      </div>
    </div>
  );
}
