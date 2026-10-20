'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import {
  Monitor, Cpu, BookOpen, AlertTriangle, School,
  CheckCircle, AlertCircle, ChevronRight, ArrowRight,
  TrendingUp, MapPin, Layers,
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
    <div className="w-full h-full flex items-center justify-center bg-gray-800/20 rounded-xl">
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading map…</span>
      </div>
    </div>
  ),
});

interface ApiSummary {
  totalSchools: number | null; totalSchoolsYear: string;
  ictPct: number | null; ictYear: string; ictYoY: number | null;
  usingICT: number | null; notUsingICT: number | null;
  smartPct: number | null; smartYear: string; smartSchools: number | null;
  primaryAvgRatio: number | null; primaryBooksYear: string;
  secondaryAvgRatio: number | null;
}
interface ApiResp {
  ok: boolean;
  data: NisrEducationData;
  summary: ApiSummary;
}

const TP = {
  contentStyle: {
    backgroundColor: '#111827', border: '1px solid #374151',
    borderRadius: '8px', color: '#f9fafb', fontSize: '12px',
  },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

const LEVEL_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6', Low: '#22c55e',
};

const LEVEL_COLORS_CHART = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default function HomePage() {
  const [api, setApi] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterProvince, setFilterProvince] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'top8' | 'all'>('top8');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch('/api/education')
      .then(r => r.json())
      .then((j: ApiResp) => { if (j.ok) setApi(j); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const benchmarks: NationalBenchmarks = useMemo(() => {
    if (!api?.summary) return DEFAULT_BENCHMARKS;
    return {
      ictPct:                api.summary.ictPct              ?? DEFAULT_BENCHMARKS.ictPct,
      smartPct:              api.summary.smartPct             ?? DEFAULT_BENCHMARKS.smartPct,
      primaryBookRatio:      api.summary.primaryAvgRatio      ?? DEFAULT_BENCHMARKS.primaryBookRatio,
      secondaryBookRatio:    api.summary.secondaryAvgRatio    ?? DEFAULT_BENCHMARKS.secondaryBookRatio,
      schoolsPerThousandKids: DEFAULT_BENCHMARKS.schoolsPerThousandKids,
    };
  }, [api]);

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

  // ── Chart data from real NISR API ──────────────────────────
  const ictTrend = api?.data.ictUse.trend.map(r => ({
    year: r.year.replace('20', "'"), // '17, '18 etc for compact labels
    pct:  r.percentUsingICT,
    using: r.schoolsUsingICT,
  })) ?? [];

  const ictByLevel = api?.data.ictUse.byLevel.map(lvl => ({
    level: lvl.level === 'Pre-primary' ? 'Pre-pri.' : lvl.level,
    schools: lvl.latest ?? 0,
  })) ?? [];

  const smartByLevel = api?.data.smartClassrooms.byLevel.map(lvl => {
    const latest = lvl.series[lvl.series.length - 1];
    return {
      level: lvl.level,
      withSmart:    latest?.withSmart    ?? 0,
      withoutSmart: latest?.withoutSmart ?? 0,
    };
  }) ?? [];

  const bookSubjects = api?.data.primaryBooks.bySubject
    .filter(s => !s.subject.toLowerCase().includes('average') && s.latestRatio !== null)
    .map(s => ({
      subject: s.subject.length > 14 ? s.subject.slice(0, 13) + '…' : s.subject,
      ratio: s.latestRatio ?? 0,
    }))
    .sort((a, b) => b.ratio - a.ratio) ?? [];

  const s = api?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-5 pb-10 space-y-5">

      {/* ══ 1. HEADER ════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            EduGap <span className="text-blue-400">Rwanda</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Education gap intelligence across 30 districts · NISR PxWeb API · NST2 aligned
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-600 bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
              <div className="w-2.5 h-2.5 border border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              Fetching NISR…
            </span>
          ) : api ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-full px-3 py-1">
              <CheckCircle size={11} /> NISR Live · {s?.ictYear}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 rounded-full px-3 py-1">
              <AlertCircle size={11} /> Offline mode
            </span>
          )}
          <span className="text-xs font-mono text-gray-700 hidden sm:block">Challenge 3</span>
        </div>
      </div>

      {/* ══ 2. KPI CARDS ═════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Schools"
          value={s?.totalSchools ? s.totalSchools.toLocaleString() : '4,842'}
          sub={`Edu_numb_scho.px · ${s?.totalSchoolsYear ?? '2021'}`}
          icon={<School size={14} className="text-blue-400" />}
          accent="blue"
        />
        <StatCard
          label="ICT Adoption"
          value={`${s?.ictPct ?? 47.2}%`}
          sub={`${s?.usingICT?.toLocaleString() ?? '2,286'} schools · ICT_use.px`}
          icon={<Monitor size={14} className="text-emerald-400" />}
          accent="green"
          trend="up"
          trendLabel={s?.ictYoY ? `+${s.ictYoY} pp YoY` : '+9.7 pp YoY'}
        />
        <StatCard
          label="Smart Classrooms"
          value={`${s?.smartPct ?? 23.1}%`}
          sub={`${s?.smartSchools?.toLocaleString() ?? '1,120'} schools · smart.px`}
          icon={<Cpu size={14} className="text-purple-400" />}
          accent="purple"
          trend="up"
          trendLabel="NST2 target: 100%"
        />
        <StatCard
          label="Book Ratio"
          value={`${s?.primaryAvgRatio ?? 2}:1`}
          sub="Primary avg · Primary.px"
          icon={<BookOpen size={14} className="text-amber-400" />}
          accent="amber"
          trend="down"
          trendLabel="NST2 target: 1:1"
        />
      </div>

      {/* ══ 3. MAP + PRIORITY LIST ═══════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Map — 3/5 */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Education Priority Map</p>
                <p className="text-gray-600 text-xs font-mono">click district → gap analysis</p>
              </div>
            </div>
            <select
              value={filterProvince}
              onChange={e => setFilterProvince(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600 flex-shrink-0"
            >
              <option value="All">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p.replace(' Province', '')}</option>)}
            </select>
          </div>

          <div className="h-[300px] sm:h-[360px]">
            <EducationMap
              districts={filtered}
              selectedDistrict={selectedDistrict}
              onDistrictClick={setSelectedDistrict}
            />
          </div>

          {/* Legend */}
          <div className="px-4 py-2.5 border-t border-gray-800 grid grid-cols-4 gap-2">
            {([
              { level: 'Critical', count: counts.critical, color: '#ef4444' },
              { level: 'High',     count: counts.high,     color: '#f59e0b' },
              { level: 'Moderate', count: counts.moderate, color: '#3b82f6' },
              { level: 'Low',      count: counts.low,      color: '#22c55e' },
            ]).map(({ level, count, color }) => (
              <div key={level} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-gray-500 text-xs">{level}</span>
                <span className="text-white text-xs font-bold tabular-nums ml-auto">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority list — 2/5 */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-red-400" />
              <p className="text-white font-semibold text-sm">Priority Districts</p>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {(['top8', 'all'] as const).map(t => (
                <button key={t} onClick={() => { setActiveTab(t); setPage(0); }}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {t === 'top8' ? 'Top 8' : 'All 30'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
            {(() => {
              const list = activeTab === 'top8' ? sorted.slice(0, 8)
                : sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
              return list.map((d, i) => {
                const rank = activeTab === 'all' ? page * PAGE_SIZE + i + 1 : i + 1;
                return (
                  <Link key={d.id} href={`/district/${d.id}`}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors">
                    <span className="text-gray-700 text-xs font-mono w-4 tabular-nums flex-shrink-0">{rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate group-hover:text-blue-400 transition-colors">
                        {d.name}
                      </p>
                      <p className="text-gray-600 text-xs truncate font-mono">
                        {d.province.replace(' Province', '')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-extrabold tabular-nums" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                        {d.result.priorityScore}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: LEVEL_COLOR[d.result.priorityLevel] }}>
                        {d.result.priorityLevel}
                      </p>
                    </div>
                    <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-500 flex-shrink-0" />
                  </Link>
                );
              });
            })()}
          </div>

          {/* Pagination for All 30 */}
          {activeTab === 'all' && (
            <div className="px-4 py-2.5 border-t border-gray-800 flex items-center justify-between">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              <span className="text-gray-600 text-xs font-mono">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, 30)} / 30
              </span>
              <button onClick={() => setPage(p => Math.min(2, p + 1))} disabled={(page + 1) * PAGE_SIZE >= 30}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          )}

          {/* Footer counts */}
          {activeTab === 'top8' && (
            <div className="px-4 py-2.5 border-t border-gray-800 grid grid-cols-4 gap-1 bg-gray-950/30">
              {[
                { l: 'Critical', n: counts.critical, c: '#ef4444' },
                { l: 'High',     n: counts.high,     c: '#f59e0b' },
                { l: 'Moderate', n: counts.moderate, c: '#3b82f6' },
                { l: 'Low',      n: counts.low,      c: '#22c55e' },
              ].map(({ l, n, c }) => (
                <div key={l} className="text-center">
                  <p className="text-sm font-bold tabular-nums" style={{ color: c }}>{n}</p>
                  <p className="text-gray-600 text-xs">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ 4. ANALYTICS CHARTS ROW ══════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ICT Trend line */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm">ICT Adoption Trend</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-3">
            % schools · 2017–{s?.ictYear ?? '2021/22'} · ICT_use.px
          </p>
          {ictTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ictTrend} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false}
                  domain={[30, 55]} tickFormatter={v => `${v}%`} />
                <Tooltip {...TP} formatter={v => [`${v}%`, 'ICT Adoption']} />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-700 text-xs font-mono animate-pulse">
              Loading NISR data…
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-mono">2017: 34.9%</span>
            <span className="text-blue-400 font-bold">{s?.ictPct ?? 47.2}% ({s?.ictYear ?? '2021/22'})</span>
          </div>
        </div>

        {/* ICT by Level horizontal bars */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm">Schools Using ICT by Level</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-3">
            number of schools · {s?.ictYear ?? '2021/22'} · ICT_use.px
          </p>
          {ictByLevel.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ictByLevel} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: -4 }}>
                <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="level" tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false} tickLine={false} width={62} />
                <Tooltip {...TP} formatter={v => [v?.toLocaleString(), 'Schools']} />
                <Bar dataKey="schools" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {ictByLevel.map((_, i) => (
                    <Cell key={i} fill={LEVEL_COLORS_CHART[i % 4]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-700 text-xs font-mono animate-pulse">
              Loading…
            </div>
          )}
          <p className="text-gray-700 text-xs font-mono mt-2">
            Total: {s?.usingICT?.toLocaleString() ?? '2,286'} schools
          </p>
        </div>

        {/* Smart classrooms by level */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm">Smart Classrooms by Level</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-3">
            with / without · {s?.smartYear ?? '2021/22'} · smart.px
          </p>
          {smartByLevel.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={smartByLevel} margin={{ top: 0, right: 4, bottom: 0, left: -22 }}>
                <XAxis dataKey="level" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TP} formatter={v => [v?.toLocaleString(), '']} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
                <Bar dataKey="withSmart"    name="With Smart"    fill="#8b5cf6" radius={[3,3,0,0]} fillOpacity={0.85} />
                <Bar dataKey="withoutSmart" name="Without Smart" fill="#1f2937" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-700 text-xs font-mono animate-pulse">
              Loading…
            </div>
          )}
          <p className="text-gray-700 text-xs font-mono mt-2">
            {s?.smartSchools?.toLocaleString() ?? '1,120'} schools with smart classrooms
          </p>
        </div>
      </div>

      {/* ══ 5. NST2 PROGRESS ═════════════════════════════════ */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">NST2 Education Targets — Progress</p>
            <p className="text-gray-600 text-xs font-mono">current vs. 2029 goals</p>
          </div>
          <Link href="/about" className="text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1 transition-colors">
            Methodology <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'ICT in All Schools',
              current: s?.ictPct ?? 47.2, target: 100, unit: '%',
              color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',
              border: 'rgba(59,130,246,0.2)', icon: Monitor,
              source: `${s?.usingICT?.toLocaleString() ?? '2,286'} of ${s?.totalSchools?.toLocaleString() ?? '4,842'} schools`,
            },
            {
              label: 'Smart Classrooms',
              current: s?.smartPct ?? 23.1, target: 100, unit: '%',
              color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',
              border: 'rgba(139,92,246,0.2)', icon: Cpu,
              source: `${s?.smartSchools?.toLocaleString() ?? '1,120'} schools equipped`,
            },
            {
              label: '1:1 Textbook Ratio',
              current: s?.primaryAvgRatio ? Math.round((1 / s.primaryAvgRatio) * 100) : 50,
              target: 100, unit: '%',
              color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
              border: 'rgba(245,158,11,0.2)', icon: BookOpen,
              source: `Current ratio: ${s?.primaryAvgRatio ?? 2}:1 primary`,
            },
          ].map(({ label, current, target, unit, color, bg, border, icon: Icon, source }) => {
            const pct = Math.min(100, Math.round((current / target) * 100));
            return (
              <div key={label} className="rounded-xl p-4 space-y-3"
                style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color }} />
                    <span className="text-white text-xs font-semibold">{label}</span>
                  </div>
                  <span className="text-lg font-extrabold tabular-nums" style={{ color }}>
                    {current}{unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0%</span><span>Target: 100%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 text-xs font-mono">{pct}% achieved</span>
                    <span className="text-gray-500 text-xs">{100 - current}{unit} remaining</span>
                  </div>
                </div>

                <p className="text-gray-600 text-xs font-mono">{source}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ 6. TEXTBOOK SUBJECT BREAKDOWN ════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm">Primary Textbook Ratio by Subject</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-3">
            students per book · {s?.primaryBooksYear ?? '2021/22'} · NISR Primary.px
          </p>
          {bookSubjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={bookSubjects} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}:1`} />
                <YAxis type="category" dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={80} />
                <Tooltip {...TP} formatter={v => [`${v}:1`, 'Students per book']} />
                <Bar dataKey="ratio" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {bookSubjects.map((e) => (
                    <Cell key={e.subject}
                      fill={e.ratio >= 4 ? '#ef4444' : e.ratio >= 2 ? '#f59e0b' : '#22c55e'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-700 text-xs animate-pulse font-mono">Loading…</div>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500" /> Shortage</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> On target</span>
          </div>
        </div>

        {/* Province gap summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm">Education Gap by Province</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-3">
            avg priority score · district model · NISR benchmarks
          </p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={provinces.map(p => {
                const ds = scored.filter(d => d.province === p);
                return {
                  name: p.replace(' Province', '').replace('Kigali City', 'Kigali'),
                  avg: Math.round(ds.reduce((s, d) => s + d.result.priorityScore, 0) / ds.length),
                };
              }).sort((a, b) => b.avg - a.avg)}
              margin={{ top: 0, right: 4, bottom: 0, left: -22 }}
            >
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 80]} />
              <Tooltip {...TP} formatter={v => [`${v}/100`, 'Avg Gap Score']} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {provinces.map((_, i) => {
                  const ds = scored.filter(d => d.province === provinces[i]);
                  const avg = Math.round(ds.reduce((s, d) => s + d.result.priorityScore, 0) / ds.length);
                  return (
                    <Cell key={i}
                      fill={avg >= 58 ? '#ef4444' : avg >= 42 ? '#f59e0b' : avg >= 25 ? '#3b82f6' : '#22c55e'}
                      fillOpacity={0.8}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ 7. QUICK ACTIONS ═════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            href: '/education', icon: TrendingUp, label: 'ICT & Smart Data',
            desc: 'Full NISR ICT trend analysis', color: 'text-blue-400',
            bg: 'bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20',
          },
          {
            href: '/simulator', icon: Monitor, label: 'Intervention Simulator',
            desc: 'Model education intervention impact', color: 'text-emerald-400',
            bg: 'bg-emerald-600/10 border-emerald-600/20 hover:bg-emerald-600/20',
          },
          {
            href: '/assistant', icon: BookOpen, label: 'Data Query',
            desc: 'Ask about Rwanda education data', color: 'text-purple-400',
            bg: 'bg-purple-600/10 border-purple-600/20 hover:bg-purple-600/20',
          },
        ].map(({ href, icon: Icon, label, desc, color, bg }) => (
          <Link key={href} href={href}
            className={`group flex items-center gap-3 rounded-xl p-4 border transition-all ${bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color} bg-gray-800/60`}>
              <Icon size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ══ 8. SOURCES STRIP ═════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 border-t border-gray-800/60">
        <span className="text-gray-700 text-xs font-mono">NISR PxWeb API:</span>
        {['ICT_use.px', 'smart.px', 'Primary.px', 'lower_secondary.px', 'Edu_numb_scho.px'].map(f => (
          <span key={f} className="text-blue-500 text-xs font-mono bg-blue-950/30 border border-blue-900/30 rounded px-1.5 py-0.5">{f}</span>
        ))}
        <span className="text-gray-700 text-xs font-mono ml-auto hidden md:block">EduGap Rwanda · Rwanda Analytics Lab · 2026</span>
      </div>

    </div>
  );
}
