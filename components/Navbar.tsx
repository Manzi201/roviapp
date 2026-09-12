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
  { href: '/',          label: 'Gap Map',     icon: BarChart3, desc: 'Education priority map' },
  { href: '/education', label: 'ICT & Smart', icon: Monitor,   desc: 'ICT & smart classrooms' },
  { href: '/simulator', label: 'Simulator',   icon: Sliders,   desc: 'Intervention modelling' },
  { href: '/assistant', label: 'Data Query',  icon: Search,    desc: 'Query NISR datasets'    },
  { href: '/about',     label: 'About',       icon: Info,      desc: 'Methodology & team'     },
];

function ThemeToggle({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={size === 'md' ? 'w-8 h-8' : 'w-7 h-7'} />;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        flex items-center justify-center rounded-lg border transition-all duration-200
        ${size === 'md'
          ? 'w-8 h-8 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700'
          : 'w-7 h-7 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800'}
      `}
    >
      {isDark ? <Sun size={size === 'md' ? 15 : 13} /> : <Moon size={size === 'md' ? 15 : 13} />}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <BarChart3 size={14} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-white font-extrabold text-sm tracking-tight">ROVI</span>
              <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">Education</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = path === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                  }`}>
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 mr-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-600 text-xs font-mono">NISR · Live</span>
            </div>

            <ThemeToggle />

            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Drawer overlay ───────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          open
            ? 'bg-black/70 backdrop-blur-sm pointer-events-auto'
            : 'bg-transparent pointer-events-none'
        }`}
      />

      {/* ── Drawer ──────────────────────────────────────── */}
      <aside
        aria-label="Mobile navigation"
        className={`
          fixed top-0 right-0 z-50 h-full md:hidden
          w-[280px] max-w-[88vw]
          flex flex-col
          bg-gray-950
          border-l border-gray-800/80
          shadow-[−8px_0_32px_rgba(0,0,0,0.6)]
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <BarChart3 size={12} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none">ROVI</p>
              <p className="text-gray-600 text-xs font-mono leading-none mt-0.5">Education</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav links ─────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-gray-700 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon, desc }) => {
              const active = path === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-150
                      ${active
                        ? 'bg-blue-600/15 border border-blue-600/25 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent'}
                    `}
                  >
                    {/* Icon container */}
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                      ${active
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}
                    `}>
                      <Icon size={15} />
                    </div>

                    {/* Label + desc */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none">{label}</p>
                      <p className={`text-xs mt-0.5 leading-none ${active ? 'text-blue-400/70' : 'text-gray-600'}`}>
                        {desc}
                      </p>
                    </div>

                    {/* Active indicator / chevron */}
                    {active
                      ? <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      : <ChevronRight size={13} className="text-gray-700 flex-shrink-0 group-hover:text-gray-500 transition-colors" />
                    }
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-800 px-4 py-4 space-y-3">
          {/* Appearance row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs font-semibold">Appearance</p>
              <p className="text-gray-600 text-xs font-mono">Dark / Light mode</p>
            </div>
            <ThemeToggle size="md" />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800/60" />

          {/* Status + version */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-600 text-xs font-mono">NISR API · Live</span>
            </div>
            <span className="text-gray-700 text-xs font-mono">v1.0</span>
          </div>
          <p className="text-gray-700 text-xs">Rwanda Analytics Lab · 2026</p>
        </div>
      </aside>
    </>
  );
}
