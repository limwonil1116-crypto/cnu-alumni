import Link from 'next/link';

export default function StartPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#112B55] to-[#1B3F7B] px-6 pt-16 pb-10 text-center">
        <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-5 flex items-center justify-center">
          <span className="text-4xl">🎓</span>
        </div>
        <h1 className="text-white text-2xl font-bold mb-2 leading-tight">
          충남대학교<br />동문 디렉터리
        </h1>
        <p className="text-white/70 text-sm leading-relaxed">
          인증된 졸업생만 이용할 수 있는<br />폐쇄형 동문 네트워크 서비스
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 bg-[#C8941A]/20 text-[#F0BE50] px-3 py-1.5 rounded-full text-xs font-medium">
          <span>🔒</span> 동문 전용 서비스
        </div>
      </div>

      {/* Feature cards */}
      <div className="flex-1 px-5 py-6 bg-[#F4F6FA]">
        <div className="space-y-3 mb-8">
          {[
            { icon: '🔍', title: '동문 전용 조회', desc: '인증된 졸업생끼리만 서로의 정보를 확인할 수 있습니다' },
            { icon: '📋', title: '관리자 사전 등록 기반', desc: '관리자가 등록한 졸업생 명단을 기반으로 운영됩니다' },
            { icon: '🛡️', title: '개인정보 보호', desc: '외부 공개 차단, 최소 정보 공개 원칙을 적용합니다' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-[#D1D9E6] rounded-xl p-4 flex items-start gap-4">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-semibold text-[#111827] mb-1">{f.title}</p>
                <p className="text-sm text-[#4B5563] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/verify" className="flex items-center justify-center gap-2 w-full min-h-[54px] bg-[#1B3F7B] text-white rounded-[10px] text-[16px] font-semibold hover:bg-[#112B55] transition-colors active:scale-[0.98]">
            본인 인증하기
          </Link>
          <Link href="/login" className="flex items-center justify-center w-full min-h-[54px] border-[1.5px] border-[#1B3F7B] text-[#1B3F7B] rounded-[10px] text-[16px] font-semibold hover:bg-[#EBF0F8] transition-colors active:scale-[0.98]">
            로그인
          </Link>
        </div>
        <div className="mt-5 flex justify-center gap-4 text-sm text-[#9CA3AF]">
          <Link href="/policy" className="hover:text-[#1B3F7B]">개인정보 처리 안내</Link>
          <span>·</span>
          <Link href="/admin/login" className="hover:text-[#1B3F7B]">관리자 로그인</Link>
        </div>
      </div>
    </div>
  );
}
