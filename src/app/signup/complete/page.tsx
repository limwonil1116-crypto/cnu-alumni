import Link from 'next/link';

export default function SignupCompletePage() {
  return (
    <div className="flex flex-col min-h-dvh items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-[#FEF3C7] flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[#B45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[#111827] mb-3">
        가입 신청이 완료되었습니다
      </h1>
      <p className="text-[#4B5563] text-[15px] leading-relaxed mb-2">
        관리자 승인 후 로그인하실 수 있습니다.
      </p>
      <p className="text-sm text-[#9CA3AF] mb-8 leading-relaxed">
        승인까지 1~2일 소요될 수 있습니다.<br />
        승인 완료 후 등록하신 이메일로 안내 드립니다.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/login"
          className="flex items-center justify-center w-full min-h-[54px] bg-[#1B3F7B] text-white rounded-xl text-[16px] font-semibold hover:bg-[#112B55] transition-colors"
        >
          로그인 화면으로
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center w-full min-h-[50px] border-[1.5px] border-[#D1D9E6] text-[#4B5563] rounded-xl text-[15px] font-semibold hover:bg-[#F4F6FA] transition-colors"
        >
          시작 화면으로
        </Link>
      </div>
    </div>
  );
}