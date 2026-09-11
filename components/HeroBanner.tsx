import Image from "next/image";
import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}

/**
 * Full-width hero section with Kigali Convention Center background photo.
 * Photo credit: Wikimedia Commons, CC-BY-SA 4.0
 */
export default function HeroBanner(
  { title, subtitle, badge, children }: Props,
) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ minHeight: 260 }}
    >
      {/* Background photo */}
      <Image
        src="/kigali-bg.jpg"
        alt="Kigali Convention Center and City skyline, Rwanda"
        fill
        priority
        quality={75}
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark gradient overlay — ensures text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/80 to-gray-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 max-w-3xl">
        {badge && (
          <span className="inline-block font-mono text-xs border border-gray-600 text-gray-400 rounded px-2.5 py-1 mb-4">
            {badge}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>

      {/* Photo credit — bottom right, very subtle */}
      <p className="absolute bottom-2 right-3 z-10 text-gray-600 text-xs font-mono opacity-60">
        © Kigali Convention Center · CC-BY-SA 4.0
      </p>
    </div>
  );
}
