import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <div>
                <span className="text-white font-extrabold text-base">EduGap</span>
                <span className="text-gray-500 text-sm ml-2">by Rwanda Analytics Lab</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              EduGap Rwanda is a district-level education gap intelligence platform
              built to identify where education resources are most needed across Rwanda's 30 districts,
              powered by live NISR Education data and aligned with NST2 and Vision 2050 goals.
            </p>
            <p className="text-gray-600 text-xs">
              All data sourced from the National Institute of Statistics of Rwanda (NISR).
              This platform is intended for planning, research, and policy use.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Platform</p>
            <div className="space-y-2">
              {[
                { href: '/', label: 'National Dashboard' },
                { href: '/simulator', label: 'What-if Simulator' },
                { href: '/assistant', label: 'Data Query Tool' },
                { href: '/about', label: 'About & Methodology' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div className="space-y-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">NISR Datasets</p>
            <div className="space-y-2">
              {[
                'ICT_use.px — ICT in teaching & learning',
                'smart.px — Smart classrooms in schools',
                'Primary.px — Primary textbook ratios',
                'lower_secondary.px — Secondary textbooks',
                'Edu_numb_scho.px — School counts by level',
              ].map((s) => (
                <p key={s} className="text-gray-600 text-xs font-mono">{s}</p>
              ))}
            </div>
            <p className="text-gray-700 text-xs">All data: NISR PxWeb API · Live</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-700 text-xs">
            © 2026 Rwanda Analytics Lab. Built for the NISR Data Challenge 2026.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-xs">NST2 Aligned</span>
            <span className="text-gray-800">·</span>
            <span className="text-gray-700 text-xs">Vision 2050</span>
            <span className="text-gray-800">·</span>
            <span className="text-gray-700 text-xs">NISR Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
