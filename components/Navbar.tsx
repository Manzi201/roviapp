'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  BarChart3, Monitor, Sliders, Search, Info,
  Menu, X, Sun, Moon, ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/',          label: 'Gap Map',     icon: BarChart3, desc: 'Education priority map'  },
  { href: '/education', label: 'ICT & Smart', icon: Monitor,   desc: 'ICT & smart classrooms'  },
  { href: '/simulator', label: 'Simulator',   icon: Sliders,   desc: 'Intervention modelling'  },
  { href: '/assistant', label: 'Data Query',  icon: Search,    desc: 'Query NISR datasets'      },
  { href: '/about',     label: 'About',       icon: Info,      desc: 'Methodology & team'       },
];

function ThemeToggle({ className = '' }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={`w-8 h-8 ${className}`} />;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700
        text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600
        transition-all duration-200 ${className}`}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [path]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Top navbar ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/96 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* ── Logo (always left) ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={14} className="text-white" />
            </div>
            <div className="leading-none min-w-0">
              <span className="text-white font-extrabold text-sm tracking-tight">ROVI</span>
              <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">Education</span>
            </div>
          </Link>

          {/* ── Desktop nav (centre/right) ── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = path === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/70 border border-transparent'
                  }`}>
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live badge — lg only */}
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-600 text-xs font-mono">NISR · Live</span>
            </div>

            {/* Theme toggle — always visible */}
            <ThemeToggle />

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 bg-black/65 backdrop-blur-sm pointer-events-auto'
               : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Slide-in drawer (RIGHT) ─────────────────────── */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0 z-50 md:hidden
          w-72 max-w-[85vw]
          flex flex-col
          bg-gray-950
          border-l border-gray-800
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer header — same height as navbar */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <BarChart3 size={13} className="text-white" />
            </div>
            <div className="leading-none">
              <p className="text-white font-extrabold text-sm">ROVI</p>
              <p className="text-gray-600 text-xs font-mono">Education Platform</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2 flex-shrink-0">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest">Navigation</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, desc }) => {
              const active = path === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150
                      ${active
                        ? 'bg-blue-600/15 border border-blue-600/20 text-blue-400'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-gray-800/60'}
                    `}
                  >
                    {/* Icon box */}
                    <div className={`
                      w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                      ${active
                        ? 'bg-blue-600/25 text-blue-400'
                        : 'bg-gray-800/80 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-200'}
                    `}>
                      <Icon size={16} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">{label}</p>
                      <p className={`text-xs leading-tight mt-0.5 ${active ? 'text-blue-400/60' : 'text-gray-600'}`}>
                        {desc}
                      </p>
                    </div>

                    {/* Indicator */}
                    {active
                      ? <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      : <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                    }
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer footer */}
        <div className="flex-shrink-0 border-t border-gray-800 px-5 py-4 space-y-3.5">
          {/* Appearance */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium leading-tight">Appearance</p>
              <p className="text-gray-600 text-xs mt-0.5">Dark / Light mode</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="border-t border-gray-800/60" />

          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-500 text-xs font-mono">NISR API · Live</span>
            </div>
            <span className="text-gray-700 text-xs font-mono bg-gray-800/60 px-2 py-0.5 rounded">v1.0</span>
          </div>

          <p className="text-gray-700 text-xs">Rwanda Analytics Lab · 2026</p>
        </div>
      </aside>
    </>
  );
}
