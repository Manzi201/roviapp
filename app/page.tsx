'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  Monitor, Cpu, BookOpen, AlertTriangle, TrendingUp,
  CheckCircle, AlertCircle, RefreshCw, ChevronRight,
  Layers, MapPin,
} from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import StatCard from '@/components/StatCard';
import {
  districtEducationData, provinces,
} from '@/lib/districtEducation';
import {
  computeEducationPriority,
  DEFAULT_BENCHMARKS,
  NST2_TARGETS,
  type NationalBenchmarks,
} from '@/lib/educationScore';
import type { NisrEducationData } from '@/lib/nisr-education';

// ── Lazy-load map (Leaflet — client only) ────────────────────
const EducationMap = dynamic(() => import('@/components/EducationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800/30 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-mono">Loading map…</span>
      </div>
    </div>
  ),
});

interface ApiResp {
  ok: boolean;
  data: NisrEducationData;
  summary: {
    ictPct: number | null; ictYear: string; ictYoY: number | null;
    smartPct: number | null; smartYear: string;
    primaryAvgRatio: number | null; totalSchools: number | null;
  };
}

const TP = {
  contentStyle: {
    backgroundColor: '#111827', border: '1px solid #1f2937',
    borderRadius: '6px', color: '#f9fafb', fontSize: '12px',
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

const LEVEL_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6', Low: '#22c55e',
};

export default function HomePage() {
  const [apiData, setApiData] = useState<ApiResp | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [filterProvince, setFilterProvince] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();

  // Load live NISR benchmarks
  useEffect(() => {
    fetch('/api/education')
      .then(r => r.json())
      .then((j: ApiResp) => { if (j.ok) setApiData(j); })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, []);

  // Build benchmarks from live API (fallback to defaults)
  const benchmarks: NationalBenchmarks = useMemo(() => {
    if (!apiData?.summary) return DEFAULT_BENCHMARKS;
    return {
      ictPct: apiData.summary.ictPct ?? DEFAULT_BENCHMARKS.ictPct,
      smartPct: apiData.summary.smartPct ?? DEFAULT_BENCHMARKS.smartPct,
      primaryBookRatio: apiData.summary.primaryAvgRatio ?? DEFAULT_BENCHMARKS.primaryBookRatio,
      secondaryBookRatio: DEFAULT_BENCHMARKS.secondaryBookRatio,
      schoolsPerThousandKids: DEFAULT_BENCHMARKS.schoolsPerThousandKids,
    };
  }, [apiData]);

  // Compute scores for all districts
  const scored = useMemo(() =>
    districtEducationData.map(d => ({
      ...d,
      result: computeEducationPriority(d, benchmarks),
    }))
  , [benchmarks]);

  const filtered = filterProvince === 'All'
    ? scored
    : scored.filter(d => d.province === filterProvince);

  const sorted = [...scored].sort((a, b) => b.result.priorityScore - a.result.priorityScore);
  const top8   = sorted.slice(0, 8);

  const critical = scored.filter(d => d.result.priorityLevel === 'Critical').length;
  const high     = scored.filter(d => d.result.priorityLevel === 'High').length;
  const moderate = scored.filter(d => d.result.priorityLevel === 'Moderate').length;
  const low      = scored.filter(d => d.result.priorityLevel === 'Low').length;

  // Province avg chart
  const provinceChart = provinces.map(p => {
    const pDistricts = scored.filter(d => d.province === p);
    const avg = Math.round(pDistricts.reduce((s, d) => s + d.result.priorityScore, 0) / pDistricts.length);
    return { name: p.replace(' Province', '').replace('Kigali City', 'Kigali'), avg };
  }).sort((a, b) => b.avg - a.avg);

  // ICT trend from live API
  const ictTrend = apiData?.data.ictUse.trend.map(r => ({
    year: r.year, pct: r.percentUsingICT,
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroBanner
        badge="Education Sector · NISR Data Challenge 2026 · Challenge 3"
        title={<>Rwanda Education <span className="text-blue-400">Gap Intelligence</span></>}
        subtitle="Identifying and prioritizing education resource gaps across Rwanda's 30 districts — combining live NISR benchmarks with district-level analysis to enable evidence-based intervention targeting."
      >
        <div className="flex items-center gap-3 flex-wrap">
          {apiLoading ? (
            <span className="text-xs text-gray-600 font-mono flex items-center gap-1.5">
              <div className="w-3 h-3 border border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              Loading NISR benchmarks…
            </span>
          ) : apiData ? (
            <span className="text-xs text-emerald-500 font-mono flex items-center gap-1.5">
              <CheckCircle size={12} /> NISR API connected · {apiData.summary.ictYear}
            </span>
          ) : (
            <span className="text-xs text-amber-500 font-mono flex items-center gap-1.5">
              <AlertCircle size={12} /> Using default benchmarks
            </span>
          )}
          <span className="text-gray-700 text-xs font-mono">ROVI v1.0 · Rwanda Analytics Lab</span>
        </div>
      </HeroBanner>

      {/* ── National KPI cards ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Critical Gap Districts"
          value={critical}
          sub={`Require urgent intervention`}
          icon={<AlertTriangle size={14} className="text-red-400" />}
          accent="red"
        />
        <StatCard
          label="National ICT Adoption"
          value={apiData?.summary.ictPct !== null ? `${apiData?.summary.ictPct}%` : `${DEFAULT_BENCHMARKS.ictPct}%`}
          sub={`Schools using ICT · ${apiData?.summary.ictYear ?? '2021/22'} · NISR`}
          icon={<Monitor size={14} className="text-blue-400" />}
          accent="blue"
          trend="up"
          trendLabel={apiData?.summary.ictYoY != null ? `+${apiData.summary.ictYoY} pp YoY` : 'NST2 target: 100%'}
        />
        <StatCard
          label="Smart Classrooms"
          value={apiData?.summary.smartPct !== null ? `${apiData?.summary.smartPct}%` : `${DEFAULT_BENCHMARKS.smartPct}%`}
          sub={`National coverage · NISR`}
          icon={<Cpu size={14} className="text-purple-400" />}
          accent="purple"
          trend="up"
          trendLabel="NST2 target: 100%"
        />
        <StatCard
          label="Primary Book Ratio"
          value={apiData?.summary.primaryAvgRatio != null ? `${apiData.summary.primaryAvgRatio} : 1` : `${DEFAULT_BENCHMARKS.primaryBookRatio} : 1`}
          sub="Students per book · NISR"
          icon={<BookOpen size={14} className="text-amber-400" />}
          accent="amber"
          trend="down"
          trendLabel="NST2 target: 1 : 1"
        />
      </div>

      {/* ── Map + Priority list ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Map */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              <div>
                <p className="text-white font-semibold text-sm">Education Priority Map</p>
                <p className="text-gray-600 text-xs font-mono">30 districts · click to view gap analysis</p>
              </div>
            </div>
            <select
              value={filterProvince}
              onChange={e => setFilterProvince(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] p-2">
            <EducationMap
              districts={filtered}
              selectedDistrict={selectedDistrict}
              onDistrictClick={setSelectedDistrict}
            />
          </div>
        </div>

        {/* Priority ranking */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Layers size={14} className="text-red-400" />
            <div>
              <p className="text-white font-semibold text-sm">Priority Ranking</p>
              <p className="text-gray-600 text-xs font-mono">by education gap score</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
            {top8.map((d, i) => (
              <Link key={d.id} href={`/district/${d.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors group">
                <span className="text-gray-700 text-xs font-mono w-5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">
                    {d.name}
                  </p>
                  <p className="text-gray-600 text-xs font-mono truncate">{d.province}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums"
                    style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                    {d.result.priorityScore}
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold rounded px-1.5 py-0.5 border"
                    style={{
                      color: LEVEL_COLOR[d.result.priorityLevel],
                      borderColor: LEVEL_COLOR[d.result.priorityLevel] + '40',
                      backgroundColor: LEVEL_COLOR[d.result.priorityLevel] + '15',
                    }}>
                    {d.result.priorityLevel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-800 grid grid-cols-2 gap-y-1">
            {[
              { label: 'Critical', count: critical, color: '#ef4444' },
              { label: 'High',     count: high,     color: '#f59e0b' },
              { label: 'Moderate', count: moderate, color: '#3b82f6' },
              { label: 'Low',      count: low,      color: '#22c55e' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-gray-500">{label}:</span>
                <span className="text-gray-300 font-bold tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Province gap chart + ICT trend ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <p className="text-white font-semibold text-sm">Avg. Education Gap Score by Province</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            higher = larger gap · NISR-informed model
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={provinceChart} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...TP} formatter={(v) => [`${v}/100`, 'Avg. Gap Score']} />
              <Bar dataKey="avg" radius={[3, 3, 0, 0]} maxBarSize={52}>
                {provinceChart.map(e => (
                  <Cell key={e.name}
                    fill={e.avg >= 70 ? '#ef4444' : e.avg >= 50 ? '#f59e0b' : e.avg >= 30 ? '#3b82f6' : '#22c55e'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <p className="text-white font-semibold text-sm">National ICT Adoption Trend</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            % schools using ICT · NISR ICT_use.px · live data
          </p>
          {ictTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ictTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false}
                  domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip {...TP} formatter={(v) => [`${v}%`, 'ICT Adoption']} />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm font-mono">
              {apiLoading ? 'Loading NISR data…' : 'NISR data unavailable'}
            </div>
          )}
        </div>
      </div>

      {/* ── NST2 progress ─────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
        <p className="text-white font-semibold text-sm mb-4">NST2 & Vision 2050 Education Targets — Progress</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {[
            {
              label: 'ICT in All Schools',
              current: benchmarks.ictPct, target: NST2_TARGETS.ictPct,
              unit: '%', color: 'bg-blue-600',
              source: `NISR ICT_use.px · ${apiData?.summary.ictYear ?? '2021/22'}`,
            },
            {
              label: 'Smart Classroom Coverage',
              current: benchmarks.smartPct, target: NST2_TARGETS.smartPct,
              unit: '%', color: 'bg-purple-600',
              source: `NISR smart.px · ${apiData?.summary.smartYear ?? '2021/22'}`,
            },
            {
              label: 'Primary 1:1 Textbook Ratio',
              current: benchmarks.primaryBookRatio <= 1 ? 100 :
                Math.round((1 / benchmarks.primaryBookRatio) * 100),
              target: 100, unit: '%', color: 'bg-amber-500',
              source: `NISR Primary.px · ${(apiData?.summary as any)?.primaryBooksYear ?? '2021/22'}`,
            },
          ].map(({ label, current, target, unit, color, source }) => {
            const pct = Math.min(100, Math.round((current / target) * 100));
            return (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                  <span className="text-gray-600 text-xs font-mono">
                    <span className="text-gray-400 font-semibold">{current}{unit}</span>
                    {' / '}{target}{unit}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-sm h-2">
                  <div className={`h-2 rounded-sm ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-gray-700 text-xs font-mono">{source}</p>              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full ranking table ────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">All Districts — Education Gap Ranking</p>
            <p className="text-gray-600 text-xs font-mono mt-0.5">
              30 districts · composite priority score · NISR-informed model
            </p>
          </div>
          <Link href="/about" className="flex items-center gap-1 text-gray-600 hover:text-gray-400 text-xs transition-colors">
            Methodology <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 520 }}>
            <thead>
              <tr className="border-b border-gray-800">
                {['#', 'District', 'Province', 'Gap Score', 'Priority', 'ICT %', 'Smart %', 'Book Ratio', ''].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={d.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                  <td className="py-2.5 px-3 text-gray-700 font-mono">{String(i + 1).padStart(2, '0')}</td>
                  <td className="py-2.5 px-3 text-white font-semibold whitespace-nowrap">{d.name}</td>
                  <td className="py-2.5 px-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{d.province}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 sm:w-12 bg-gray-800 rounded-sm h-1.5 overflow-hidden hidden sm:block">
                        <div className="h-full"
                          style={{ width: `${d.result.priorityScore}%`, backgroundColor: LEVEL_COLOR[d.result.priorityLevel] }} />
                      </div>
                      <span className="text-white font-bold tabular-nums">{d.result.priorityScore}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-xs" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                      {d.result.priorityLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.ictAdoptionPct}%</td>
                  <td className="py-2.5 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.smartClassroomPct}%</td>
                  <td className="py-2.5 px-3 text-gray-400 tabular-nums hidden lg:table-cell">{d.primaryBookRatio}:1</td>
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
      </div>

      {/* ── Source attribution ────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">
          Data Sources & Methodology
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            { code: 'ICT_use.px',        desc: 'NISR — ICT use in teaching · live API' },
            { code: 'smart.px',          desc: 'NISR — Smart classrooms · live API' },
            { code: 'Primary.px',        desc: 'NISR — Primary textbook ratios · live API' },
            { code: 'Edu_numb_scho.px',  desc: 'NISR — School counts · live API' },
            { code: 'EICV5 2023/24',     desc: 'NISR — District poverty & welfare proxies' },
            { code: 'RPHC4 2022',        desc: 'NISR — Population & school-age children' },
          ].map(({ code, desc }) => (
            <div key={code} className="flex items-start gap-2 p-2 bg-gray-800/40 rounded-lg">
              <div className="w-1 h-full min-h-[20px] bg-blue-700 rounded-full flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 font-mono font-bold">{code}</p>
                <p className="text-gray-600 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-700 text-xs font-mono mt-3">
          District scores = NISR national benchmarks × NISR-informed district adjustment factors (EICV5 + RPHC4).
          National benchmarks updated live from NISR PxWeb API on each page load.
        </p>
      </div>
    </div>
  );
}
