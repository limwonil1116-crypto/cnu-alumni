'use client';
import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

// ── Button ──────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type BtnSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const btnBase = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[8px] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none';
const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-[#1B3F7B] text-white hover:bg-[#112B55]',
  secondary: 'bg-transparent text-[#1B3F7B] border-[1.5px] border-[#1B3F7B] hover:bg-[#EBF0F8]',
  ghost:     'bg-transparent text-[#4B5563] hover:bg-[#F4F6FA]',
  danger:    'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2]/80',
  accent:    'bg-[#C8941A] text-white hover:bg-[#A07815]',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-3 text-[15px] min-h-[48px]',
  lg: 'px-6 py-4 text-[16px] min-h-[54px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

// ── Loading Spinner ────────────────────────────────────
export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// ── Badge ──────────────────────────────────────────────
type BadgeVariant = 'success' | 'warn' | 'error' | 'info' | 'gray' | 'pending';
const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-[#DCFCE7] text-[#15803D]',
  warn:    'bg-[#FEF3C7] text-[#B45309]',
  error:   'bg-[#FEE2E2] text-[#DC2626]',
  info:    'bg-[#EBF0F8] text-[#1B3F7B]',
  gray:    'bg-[#F1F5F9] text-[#4B5563]',
  pending: 'bg-[#FEF3C7] text-[#B45309]',
};

export function Badge({ variant = 'info', children, className = '' }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────
export function Avatar({ name, size = 'md', photoUrl }: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  photoUrl?: string;
}) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-20 h-20 text-2xl' };
  const initial = name.charAt(0);
  if (photoUrl) return (
    <img src={photoUrl} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  );
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#1B3F7B] to-[#3B72D1] flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initial}
    </div>
  );
}

// ── Input Field ────────────────────────────────────────
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  badge?: React.ReactNode;
}

export function InputField({ label, error, hint, badge, className = '', ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#4B5563]">{label}</label>
        {badge}
      </div>
      <input
        className={`w-full px-4 py-3 border-[1.5px] rounded-[8px] text-[16px] text-[#111827] bg-white outline-none transition-colors placeholder:text-[#9CA3AF]
          ${error ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#D1D9E6] focus:border-[#2A5BA8]'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}

// ── Select Field ────────────────────────────────────────
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function SelectField({ label, error, children, className = '', ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-medium text-[#4B5563]">{label}</label>
      <select
        className={`w-full px-4 py-3 border-[1.5px] rounded-[8px] text-[16px] text-[#111827] bg-white outline-none transition-colors appearance-none
          ${error ? 'border-[#DC2626]' : 'border-[#D1D9E6] focus:border-[#2A5BA8]'}
          ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234B5563' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}

// ── Alert ───────────────────────────────────────────────
type AlertVariant = 'info' | 'success' | 'warn' | 'error';
const alertVariants: Record<AlertVariant, string> = {
  info:    'bg-[#EBF0F8] text-[#1B3F7B] border-l-4 border-[#2A5BA8]',
  success: 'bg-[#DCFCE7] text-[#15803D] border-l-4 border-[#15803D]',
  warn:    'bg-[#FEF3C7] text-[#B45309] border-l-4 border-[#B45309]',
  error:   'bg-[#FEE2E2] text-[#DC2626] border-l-4 border-[#DC2626]',
};

export function Alert({ variant = 'info', children, className = '' }: {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 rounded-[8px] text-sm leading-relaxed ${alertVariants[variant]} ${className}`}>
      {children}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────
export function Card({ children, className = '', onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white border border-[#D1D9E6] rounded-[12px] p-5 ${onClick ? 'cursor-pointer hover:bg-[#F4F6FA] transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ── Section Title ──────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">{children}</p>
  );
}

// ── Divider ────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-[#D1D9E6] ${className}`} />;
}
