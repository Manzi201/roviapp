'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { DistrictData } from '@/lib/districts';
import VulnerabilityBadge from './VulnerabilityBadge';

interface Props {
  districts: DistrictData[];
  limit?: number;
}

export default function DistrictRankingTable({ districts, limit = 10 }: Props) {
  const sorted = [...districts]
    .sort((a, b) => b.vulnerability_score - a.vulnerability_score)
    .slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider">#</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider">District</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Province</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider">Score</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider">Level</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Poverty</th>
            <th className="text-left py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Youth Unemp.</th>
            <th className="text-right py-3 px-3 text-gray-600 text-xs font-semibold uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr
              key={d.id}
              className="border-b border-gray-800/40 hover:bg-gray-800/25 transition-colors"
            >
              <td className="py-3 px-3 text-gray-600 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
              <td className="py-3 px-3 text-white font-semibold">{d.name}</td>
              <td className="py-3 px-3 text-gray-500 text-xs hidden md:table-cell">{d.province}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-800 rounded-sm h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        d.vulnerability_level === 'High' ? 'bg-red-500' :
                        d.vulnerability_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${d.vulnerability_score}%` }}
                    />
                  </div>
                  <span className="text-white font-bold tabular-nums text-sm">{d.vulnerability_score}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <VulnerabilityBadge level={d.vulnerability_level} size="sm" />
              </td>
              <td className="py-3 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.poverty_rate}%</td>
              <td className="py-3 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.youth_unemployment}%</td>
              <td className="py-3 px-3 text-right">
                <Link
                  href={`/district/${d.id}`}
                  className="inline-flex items-center gap-0.5 text-gray-600 hover:text-blue-400 text-xs font-medium transition-colors"
                >
                  View <ChevronRight size={12} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
