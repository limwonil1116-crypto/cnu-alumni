import { BottomNav } from '@/components/BottomNav';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
