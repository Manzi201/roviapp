'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { DistrictEducationData } from '@/lib/districtEducation';
import type { EducationPriorityResult } from '@/lib/educationScore';

interface Props {
  districts: (DistrictEducationData & { result: EducationPriorityResult })[];
  limit?: number;
}

const LEVEL_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6', Low: '#22c55e',
};

export default function DistrictRankingTable({ districts, limit = 30 }: Props) {
  const sorted = [...districts]
    .sort((a, b) => b.result.priorityScore - a.result.priorityScore)
    .slice(0, limit);

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full text-xs" style={{ minWidth: 480 }}>
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">#</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">District</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider hidden sm:table-cell">Province</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">Score</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">Level</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider hidden lg:table-cell">ICT %</th>
            <th className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider hidden lg:table-cell">Smart %</th>
            <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr key={d.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
              <td className="py-2.5 px-3 text-gray-700 font-mono tabular-nums">{String(i + 1).padStart(2, '0')}</td>
              <td className="py-2.5 px-3 text-white font-semibold whitespace-nowrap">{d.name}</td>
              <td className="py-2.5 px-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">{d.province}</td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 sm:w-12 bg-gray-800 rounded-sm h-1.5 overflow-hidden hidden sm:block">
                    <div className="h-full"
                      style={{ width: `${d.result.priorityScore}%`, backgroundColor: LEVEL_COLOR[d.result.priorityLevel] }} />
                  </div>
                  <span className="text-white font-bold tabular-nums">{d.result.priorityScore}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                <span className="font-semibold" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                  {d.result.priorityLevel}
                </span>
              </td>
              <td className="py-2.5 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.ictAdoptionPct}%</td>
              <td className="py-2.5 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.smartClassroomPct}%</td>
              <td className="py-2.5 px-3 text-right">
                <Link href={`/district/${d.id}`}
                  className="inline-flex items-center gap-0.5 text-gray-600 hover:text-blue-400 transition-colors">
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
