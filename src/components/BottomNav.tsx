'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/directory', label: '홈', icon: '⊞', activeIcon: '⊞' },
  { href: '/directory/search', label: '검색', icon: '○', activeIcon: '◎' },
  { href: '/mypage', label: '내 정보', icon: '◯', activeIcon: '●' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#D1D9E6] flex z-50">
      {NAV_ITEMS.map(item => {
        const isActive = pathname.startsWith(item.href.split('/search')[0]);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${isActive ? 'text-[#1B3F7B]' : 'text-[#9CA3AF]'}`}
          >
            <span className="text-xl leading-none">{isActive ? item.activeIcon : item.icon}</span>
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
