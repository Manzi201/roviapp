'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Monitor, Sliders, Search, Info, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/',          label: 'Gap Map',     icon: BarChart3 },
  { href: '/education', label: 'ICT & Smart', icon: Monitor   },
  { href: '/simulator', label: 'Simulator',   icon: Sliders   },
  { href: '/assistant', label: 'Data Query',  icon: Search    },
  { href: '/about',     label: 'About',       icon: Info      },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setOpen(false)}>
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
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-gray-700 text-xs font-mono">NISR API · Live</span>
            </div>
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

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950/98 pb-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = path === href;
              return (
                <Link key={href} href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'text-blue-400 bg-blue-600/10 border-l-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
                  }`}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <div className="mx-5 mt-2 pt-2 border-t border-gray-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-gray-600 text-xs font-mono">NISR API · Live</span>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
