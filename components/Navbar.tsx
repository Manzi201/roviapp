'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  BarChart3, Monitor, Sliders, Search, Info, Sun, Moon,
} from 'lucide-react';

const navItems = [
  { href: '/',          label: 'Map',     icon: BarChart3 },
  { href: '/education', label: 'ICT',     icon: Monitor   },
  { href: '/simulator', label: 'Simulate',icon: Sliders   },
  { href: '/assistant', label: 'Query',   icon: Search    },
  { href: '/about',     label: 'About',   icon: Info      },
];

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700
        text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-500
        transition-all duration-200"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();

  return (
    <>
      {/* ══════════════════════════════════════════════
          TOP BAR — visible on all screen sizes
      ══════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50
        bg-gray-950/96 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700
              flex items-center justify-center shadow-md">
              <BarChart3 size={14} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-white font-extrabold text-sm tracking-tight">EduGap</span>
              <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">Rwanda</span>
            </div>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = path === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                    transition-all whitespace-nowrap border
                    ${active
                      ? 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/70 border-transparent'
                    }`}>
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Live badge — desktop only */}
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-600 text-xs font-mono">NISR · Live</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          BOTTOM TAB BAR — mobile only (md:hidden)
          Styled like a native app bottom navigation
      ══════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
        bg-gray-950/97 backdrop-blur-md border-t border-gray-800
        safe-area-inset-bottom">
        <div className="flex items-stretch h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative
                  transition-colors duration-150 select-none
                  active:bg-gray-800/50"
              >
                {/* Active top indicator line */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2
                    w-8 h-0.5 bg-blue-500 rounded-full" />
                )}

                {/* Icon */}
                <div className={`flex items-center justify-center w-6 h-6 transition-all duration-150 ${
                  active ? 'text-blue-400 scale-110' : 'text-gray-500'
                }`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                </div>

                {/* Label */}
                <span className={`text-[10px] font-medium leading-none transition-colors duration-150 ${
                  active ? 'text-blue-400' : 'text-gray-600'
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* iPhone home indicator space */}
        <div className="h-safe-area-inset-bottom bg-gray-950" />
      </nav>
    </>
  );
}
