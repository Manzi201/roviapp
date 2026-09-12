import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}

/**
 * Hero section — uses the global fixed background image (set in globals.css).
 * Adds a darker overlay stripe so text stays readable, without
 * adding another image layer on top of the full-screen background.
 *
 * Background photo: Kigali Convention Center — CC-BY-SA 4.0, Wikimedia Commons
 */
export default function HeroBanner({ title, subtitle, badge, children }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ minHeight: 240 }}>

      {/* Semi-transparent panel — sits on top of the global body background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-gray-950/30 rounded-xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent rounded-xl" />

      {/* Subtle border to define the card edge */}
      <div className="absolute inset-0 rounded-xl border border-gray-700/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 max-w-3xl">
        {badge && (
          <span className="inline-block font-mono text-xs border border-gray-600/70 text-gray-400 rounded px-2.5 py-1 mb-4 bg-gray-900/40">
            {badge}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-gray-300 text-sm leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>

      {/* Photo credit */}
      <p className="absolute bottom-2 right-3 z-10 text-gray-600 text-xs font-mono opacity-50">
        © Kigali Convention Center · CC-BY-SA 4.0
      </p>
    </div>
  );
}
