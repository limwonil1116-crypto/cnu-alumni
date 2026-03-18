import Link from 'next/link';

export default function VerifySuccessPage() {
  return (
    <div className="flex flex-col min-h-dvh items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[#15803D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[#111827] mb-3">인증이 완료되었습니다</h1>
      <p className="text-[#4B5563] text-[15px] leading-relaxed mb-8">
        이제 충남대학교 동문 디렉터리를<br />이용하실 수 있습니다
      </p>
      <Link
        href="/login"
        className="flex items-center justify-center w-full max-w-xs min-h-[54px] bg-[#1B3F7B] text-white rounded-[10px] text-[16px] font-semibold hover:bg-[#112B55] transition-colors"
      >
        로그인하기
      </Link>
    </div>
  );
}
