'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  Monitor, Cpu, BookOpen, AlertTriangle,
  CheckCircle, AlertCircle, ChevronRight,
  MapPin, TrendingUp, School, ArrowRight,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { districtEducationData, provinces } from '@/lib/districtEducation';
import {
  computeEducationPriority, DEFAULT_BENCHMARKS, NST2_TARGETS,
  type NationalBenchmarks,
} from '@/lib/educationScore';
import type { NisrEducationData } from '@/lib/nisr-education';

const EducationMap = dynamic(() => import('@/components/EducationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading map…</span>
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

const LEVEL_BG: Record<string, string> = {
  Critical: 'rgba(239,68,68,0.1)', High: 'rgba(245,158,11,0.1)',
  Moderate: 'rgba(59,130,246,0.1)', Low: 'rgba(34,197,94,0.1)',
};

export default function HomePage() {
  const [apiData, setApiData] = useState<ApiResp | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [filterProvince, setFilterProvince] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  useEffect(() => {
    fetch('/api/education')
      .then(r => r.json())
      .then((j: ApiResp) => { if (j.ok) setApiData(j); })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, []);

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

  const scored = useMemo(() =>
    districtEducationData.map(d => ({ ...d, result: computeEducationPriority(d, benchmarks) }))
  , [benchmarks]);

  const filtered = filterProvince === 'All' ? scored : scored.filter(d => d.province === filterProvince);
  const sorted   = [...scored].sort((a, b) => b.result.priorityScore - a.result.priorityScore);

  const counts = {
    critical: scored.filter(d => d.result.priorityLevel === 'Critical').length,
    high:     scored.filter(d => d.result.priorityLevel === 'High').length,
    moderate: scored.filter(d => d.result.priorityLevel === 'Moderate').length,
    low:      scored.filter(d => d.result.priorityLevel === 'Low').length,
  };

  const provinceChart = provinces.map(p => {
    const ds = scored.filter(d => d.province === p);
    return {
      name: p.replace(' Province', '').replace('Kigali City', 'Kigali'),
      avg:  Math.round(ds.reduce((s, d) => s + d.result.priorityScore, 0) / ds.length),
    };
  }).sort((a, b) => b.avg - a.avg);

  const ictTrend = apiData?.data.ictUse.trend.map(r => ({
    year: r.year, pct: r.percentUsingICT,
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-5">

      {/* ══════════════════════════════════════════════════════
          1. PAGE HEADER — title + NISR status
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-600 bg-gray-800 border border-gray-700 rounded px-2 py-0.5">
              NISR Data Challenge 2026 · Challenge 3
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Education Gap<span className="text-blue-400"> Intelligence</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            District-level education resource gap analysis across Rwanda's 30 districts.
            Powered by live NISR PxWeb Education API.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 text-xs font-mono">
          {apiLoading ? (
            <span className="flex items-center gap-1.5 text-gray-600">
              <div className="w-3 h-3 border border-gray-700 border-t-blue-500 rounded-full animate-spin" />
              Fetching NISR…
            </span>
          ) : apiData ? (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle size={12} /> NISR · Live · {apiData.summary.ictYear}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500">
              <AlertCircle size={12} /> Default benchmarks
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. KPI STRIP — 4 key national indicators
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Critical Districts"
          value={counts.critical}
          sub="Require urgent intervention"
          icon={<AlertTriangle size={14} className="text-red-400" />}
          accent="red"
        />
        <StatCard
          label="ICT Adoption"
          value={`${apiData?.summary.ictPct ?? DEFAULT_BENCHMARKS.ictPct}%`}
          sub={`Schools · ${apiData?.summary.ictYear ?? '2021/22'} · NISR`}
          icon={<Monitor size={14} className="text-blue-400" />}
          accent="blue"
          trend="up"
          trendLabel={apiData?.summary.ictYoY ? `+${apiData.summary.ictYoY} pp YoY` : 'NST2: 100%'}
        />
        <StatCard
          label="Smart Classrooms"
          value={`${apiData?.summary.smartPct ?? DEFAULT_BENCHMARKS.smartPct}%`}
          sub="National · NISR smart.px"
          icon={<Cpu size={14} className="text-purple-400" />}
          accent="purple"
          trend="up"
          trendLabel="NST2 target: 100%"
        />
        <StatCard
          label="Book Ratio"
          value={`${apiData?.summary.primaryAvgRatio ?? DEFAULT_BENCHMARKS.primaryBookRatio}:1`}
          sub="Students/book · Primary.px"
          icon={<BookOpen size={14} className="text-amber-400" />}
          accent="amber"
          trend="down"
          trendLabel="NST2 target: 1:1"
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          3. MAIN SPLIT — Map (left) + Priority Panel (right)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Map panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">

          {/* Map toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-400 flex-shrink-0" />
              <span className="text-white font-semibold text-sm">Education Priority Map</span>
              <span className="text-gray-600 text-xs font-mono hidden sm:inline">· 30 districts</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={filterProvince}
                onChange={e => setFilterProvince(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Provinces</option>
                {provinces.map(p => <option key={p} value={p}>{p.replace(' Province', '')}</option>)}
              </select>
            </div>
          </div>

          {/* Map */}
          <div className="h-[300px] sm:h-[360px] md:h-[400px]">
            <EducationMap
              districts={filtered}
              selectedDistrict={selectedDistrict}
              onDistrictClick={setSelectedDistrict}
            />
          </div>

          {/* Map legend strip */}
          <div className="px-4 py-2.5 border-t border-gray-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(LEVEL_COLOR).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-gray-500">{level}</span>
                  <span className="text-gray-700 font-mono">
                    ({counts[level.toLowerCase() as keyof typeof counts]})
                  </span>
                </div>
              ))}
            </div>
            <span className="text-gray-700 text-xs font-mono hidden sm:block">click district → details</span>
          </div>
        </div>

        {/* ── Priority panel ───────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">

          {/* Panel header with tab toggle */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Top Priority Districts</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {(['map', 'list'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {t === 'map' ? 'Top 8' : 'All 30'}
                </button>
              ))}
            </div>
          </div>

          {/* District list */}
          <div className="flex-1 overflow-y-auto">
            {(activeTab === 'map' ? sorted.slice(0, 8) : sorted).map((d, i) => (
              <Link key={d.id} href={`/district/${d.id}`}
                className="group flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors last:border-0">
                <span className="text-gray-700 text-xs font-mono w-4 tabular-nums flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate group-hover:text-blue-400 transition-colors">
                    {d.name}
                  </p>
                  <p className="text-gray-600 text-xs font-mono truncate">
                    {d.province.replace(' Province', '')}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                      {d.result.priorityScore}
                    </p>
                    <p className="text-xs font-medium" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                      {d.result.priorityLevel}
                    </p>
                  </div>
                  <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-500" />
                </div>
              </Link>
            ))}
          </div>

          {/* Summary footer */}
          <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-950/40">
            <div className="grid grid-cols-4 gap-1">
              {[
                { level: 'Critical', count: counts.critical, color: '#ef4444' },
                { level: 'High',     count: counts.high,     color: '#f59e0b' },
                { level: 'Moderate', count: counts.moderate, color: '#3b82f6' },
                { level: 'Low',      count: counts.low,      color: '#22c55e' },
              ].map(({ level, count, color }) => (
                <div key={level} className="text-center">
                  <p className="text-sm font-bold tabular-nums" style={{ color }}>{count}</p>
                  <p className="text-gray-600 text-xs">{level}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. ANALYTICS ROW — Province chart + ICT trend
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold text-sm">Gap Score by Province</p>
              <p className="text-gray-600 text-xs font-mono">average · NISR Education model</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={provinceChart} margin={{ top: 0, right: 0, bottom: 0, left: -22 }}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...TP} formatter={v => [`${v}/100`, 'Avg Gap Score']} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {provinceChart.map(e => (
                  <Cell key={e.name}
                    fill={e.avg >= 58 ? '#ef4444' : e.avg >= 42 ? '#f59e0b' : e.avg >= 25 ? '#3b82f6' : '#22c55e'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold text-sm">National ICT Adoption</p>
              <p className="text-gray-600 text-xs font-mono">% schools · NISR ICT_use.px · live</p>
            </div>
            {apiData?.summary.ictPct && (
              <div className="text-right">
                <p className="text-blue-400 font-bold text-lg tabular-nums">{apiData.summary.ictPct}%</p>
                <p className="text-gray-600 text-xs">{apiData.summary.ictYear}</p>
              </div>
            )}
          </div>
          {ictTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ictTrend} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false}
                  domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip {...TP} formatter={v => [`${v}%`, 'ICT Adoption']} />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-600 text-sm font-mono">
              {apiLoading ? 'Fetching NISR data…' : 'Data unavailable'}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          5. NST2 PROGRESS — 3 target bars
      ══════════════════════════════════════════════════════ */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">NST2 Education Targets</p>
            <p className="text-gray-600 text-xs font-mono">progress toward 2029 goals</p>
          </div>
          <Link href="/about" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
            Methodology <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'ICT in All Schools',
              current: benchmarks.ictPct, target: 100, unit: '%',
              color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',
              icon: Monitor, source: 'ICT_use.px',
            },
            {
              label: 'Smart Classrooms',
              current: benchmarks.smartPct, target: 100, unit: '%',
              color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',
              icon: Cpu, source: 'smart.px',
            },
            {
              label: '1:1 Textbook Ratio',
              current: Math.round((1 / Math.max(1, benchmarks.primaryBookRatio)) * 100),
              target: 100, unit: '%',
              color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',
              icon: BookOpen, source: 'Primary.px',
            },
          ].map(({ label, current, target, unit, color, bg, icon: Icon, source }) => {
            const pct = Math.min(100, Math.round((current / target) * 100));
            const remaining = target - current;
            return (
              <div key={label} className="rounded-xl p-3.5 space-y-2.5" style={{ backgroundColor: bg, border: `1px solid ${color}25` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} style={{ color }} />
                    <span className="text-white text-xs font-semibold">{label}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>{current}{unit}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-mono">{source}</span>
                  <span className="text-gray-500">{remaining}{unit} to go</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          6. QUICK ACTIONS — navigate to key sections
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/education', icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20',
            title: 'ICT & Smart Data',      desc: 'Deep-dive into NISR ICT & classroom data' },
          { href: '/simulator', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20 hover:bg-emerald-600/20',
            title: 'Intervention Simulator', desc: 'Model impact of education interventions' },
          { href: '/assistant', icon: School, color: 'text-purple-400', bg: 'bg-purple-600/10 border-purple-600/20 hover:bg-purple-600/20',
            title: 'Data Query',             desc: 'Ask questions about education data' },
        ].map(({ href, icon: Icon, color, bg, title, desc }) => (
          <Link key={href} href={href}
            className={`group flex items-center gap-3 rounded-xl p-4 border transition-all ${bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color} bg-gray-800/60`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-gray-500 text-xs mt-0.5 truncate">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          7. DATA SOURCES — compact strip
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-t border-gray-800">
        <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">NISR Sources:</span>
        {['ICT_use.px', 'smart.px', 'Primary.px', 'lower_secondary.px', 'Edu_numb_scho.px'].map(f => (
          <span key={f} className="text-blue-400 text-xs font-mono bg-blue-950/40 border border-blue-900/30 rounded px-2 py-0.5">{f}</span>
        ))}
        <span className="text-gray-700 text-xs font-mono ml-auto hidden sm:block">EduGap Rwanda · Rwanda Analytics Lab</span>
      </div>

    </div>
  );
}
