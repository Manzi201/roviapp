'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { BarChart3, Monitor, Sliders, Search, Info, Menu, X, Sun, Moon } from 'lucide-react';

const navItems = [
  { href: '/',          label: 'Gap Map',     icon: BarChart3 },
  { href: '/education', label: 'ICT & Smart', icon: Monitor   },
  { href: '/simulator', label: 'Simulator',   icon: Sliders   },
  { href: '/assistant', label: 'Data Query',  icon: Search    },
  { href: '/about',     label: 'About',       icon: Info      },
];

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-7 h-7" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
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
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-700 text-xs font-mono">NISR API · Live</span>
            </div>

            <ThemeToggle />

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Right-side slide drawer ─────────────────────────── */}

      {/* Backdrop — fades in/out */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel — slides from right */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] md:hidden
          bg-gray-950 border-l border-gray-800 shadow-2xl
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <BarChart3 size={12} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-sm">ROVI</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                }`}
              >
                <Icon size={17} />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-800 space-y-3">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-mono">Appearance</span>
            <ThemeToggle />
          </div>
          {/* API status */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-gray-600 text-xs font-mono">NISR API · Live</span>
          </div>
          <p className="text-gray-700 text-xs font-mono">ROVI v1.0 · Rwanda Analytics Lab</p>
        </div>
      </aside>
    </>
  );
}
