import Link from 'next/link';
import { Avatar } from './ui';
import type { AlumniDetail } from '@/types';

export function AlumniCard({ alumni }: { alumni: AlumniDetail }) {
  return (
    <Link href={`/directory/${alumni.id}`} className="flex items-center gap-4 px-5 py-4 border-b border-[#D1D9E6] hover:bg-[#F4F6FA] transition-colors active:bg-[#EBF0F8]">
      <Avatar name={alumni.name} size="md" photoUrl={alumni.photoUrl} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-[#111827]">{alumni.name}</p>
        <p className="text-sm text-[#4B5563] mt-0.5 truncate">
          {alumni.department} · {alumni.graduationYear}년 졸업
        </p>
        {(alumni.company || alumni.region) && (
          <p className="text-sm text-[#9CA3AF] mt-0.5 truncate">
            {[alumni.company, alumni.region].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <span className="text-[#D1D9E6] text-xl flex-shrink-0">›</span>
    </Link>
  );
}
