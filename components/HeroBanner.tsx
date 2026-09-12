import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}

export default function HeroBanner({ title, subtitle, badge, children }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl min-h-[150px] sm:min-h-[200px] md:min-h-[240px]">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/92 via-gray-950/72 to-gray-950/30 rounded-xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent rounded-xl" />
      <div className="absolute inset-0 rounded-xl border border-gray-700/40 pointer-events-none" />

      <div className="relative z-10 px-4 py-7 sm:px-6 sm:py-9 md:px-10 md:py-12 max-w-3xl">
        {badge && (
          <span className="inline-block font-mono text-xs border border-gray-600/70 text-gray-400 rounded px-2.5 py-1 mb-3 bg-gray-900/40 leading-snug">
            {badge}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 sm:mt-3 text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4 sm:mt-5">{children}</div>}
      </div>

      <p className="absolute bottom-2 right-3 z-10 text-gray-600 text-xs font-mono opacity-50 hidden sm:block">
        © Kigali Convention Center · CC-BY-SA 4.0
      </p>
    </div>
  );
}
