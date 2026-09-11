'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Monitor, Sliders, Search, Info } from 'lucide-react';

const navItems = [
  { href: '/',          label: 'Gap Map',     icon: BarChart3 },
  { href: '/education', label: 'ICT & Smart', icon: Monitor   },
  { href: '/simulator', label: 'Simulator',   icon: Sliders   },
  { href: '/assistant', label: 'Data Query',  icon: Search    },
  { href: '/about',     label: 'About',       icon: Info      },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <BarChart3 size={15} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-white font-extrabold text-sm tracking-tight">ROVI</span>
            <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">Education</span>
          </div>
        </Link>

        <div className="flex items-center gap-0.5">
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
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-gray-700 text-xs font-mono">NISR API · Live</span>
        </div>
      </div>
    </nav>
  );
}
