'use client';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'admin' | 'transparent';
  subtitle?: string;
}

export function TopBar({ title, showBack, backHref, rightElement, variant = 'default', subtitle }: TopBarProps) {
  const router = useRouter();
  const bgClass = variant === 'admin' ? 'bg-[#112B55]' : 'bg-[#1B3F7B]';

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <div className={`${bgClass} text-white px-4 py-3.5 flex items-center gap-3 sticky top-0 z-40`}>
      {showBack && (
        <button onClick={handleBack} className="p-1 -ml-1 text-white/80 hover:text-white text-xl">
          ←
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-[17px] font-semibold truncate">{title}</h2>
        {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
      </div>
      {rightElement}
    </div>
  );
}
