'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
} from 'recharts';
import {
  Monitor, Cpu, BookOpen, School,
  TrendingUp, TrendingDown, AlertCircle, RefreshCw, CheckCircle,
} from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import StatCard from '@/components/StatCard';
import type { NisrEducationData } from '@/lib/nisr-education';

// ── API response type — matches /api/education exactly ───────
interface ApiSummary {
  totalSchools: number | null;
  totalSchoolsYear: string;
  ictPct: number | null;
  ictYear: string;
  ictYoY: number | null;
  usingICT: number | null;
  notUsingICT: number | null;
  smartPct: number | null;
  smartYear: string;
  smartSchools: number | null;
  primaryAvgRatio: number | null;
  primaryBooksYear: string;
  secondaryAvgRatio: number | null;
  secondaryBooksYear: string;
}

interface ApiResponse {
  ok: boolean;
  data: NisrEducationData;
  summary: ApiSummary;
  sources: Record<string, string>;
  fetchedAt: string;
}

const TP = {
  contentStyle: {
    backgroundColor: '#111827', border: '1px solid #1f2937',
    borderRadius: '6px', color: '#f9fafb', fontSize: '12px',
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

const LEVEL_COLORS: Record<string, string> = {
  Primary: '#3b82f6', Secondary: '#8b5cf6',
  TVET: '#f59e0b', 'Pre-primary': '#10b981',
};

export default function EducationPage() {
  const [api, setApi]     = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [refreshed, setRefreshed] = useState(new Date());

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/education');
      const j: ApiResponse = await r.json();
      if (!j.ok) throw new Error('NISR API returned error');
      setApi(j);
      setRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load NISR data');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <HeroBanner
        badge="ICT, Science and Technology · NISR Education Databases"
        title={<>ICT Use in <span className="text-blue-400">Rwanda Schools</span></>}
        subtitle="Fetching live data from NISR PxWeb API…"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-mono">Connecting to NISR API — ICT_use.px · smart.px…</span>
        </div>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (error || !api) return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <HeroBanner
        badge="ICT, Science and Technology · NISR Education Databases"
        title={<>ICT Use in <span className="text-blue-400">Rwanda Schools</span></>}
        subtitle="NISR Education ICT data — schools, smart classrooms, textbooks."
      />
      <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-semibold text-sm">Cannot reach NISR API</p>
          <p className="text-red-500 text-xs font-mono mt-1">{error}</p>
          <button onClick={load}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-white border border-red-700 rounded px-3 py-1.5 transition-colors">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    </div>
  );

  const { data, summary } = api;

  // ── Build chart data from live NISR API ──────────────────

  // ICT trend — from data.ictUse.trend (NISR ICT_use.px)
  const ictTrend = data.ictUse.trend.map(r => ({
    year: r.year,
    'Using ICT':  r.schoolsUsingICT,
    'Not Using':  r.schoolsNotUsingICT,
    '% Using':    r.percentUsingICT,
  }));

  // ICT % only (filter null)
  const ictPctTrend = ictTrend.filter(d => d['% Using'] !== null);

  // ICT by level — latest year (from data.ictUse.byLevel)
  const ictByLevel = data.ictUse.byLevel.map(lvl => ({
    level: lvl.level,
    schools: lvl.latest ?? 0,
  }));

  // Smart trend (NISR smart.px)
  const smartTrend = data.smartClassrooms.trend.map(r => ({
    year: r.year,
    'With Smart':    r.withSmart,
    'Without Smart': r.withoutSmart,
  }));

  // Smart by level — latest year
  const smartByLevel = data.smartClassrooms.byLevel.map(lvl => ({
    level: lvl.level,
    withSmart:    lvl.series[lvl.series.length - 1]?.withSmart    ?? 0,
    withoutSmart: lvl.series[lvl.series.length - 1]?.withoutSmart ?? 0,
  }));

  // Primary textbook ratios (NISR Primary.px) — exclude "Average" row
  const primaryRatios = data.primaryBooks.bySubject
    .filter(s => !s.subject.toLowerCase().includes('average') && s.latestRatio !== null)
    .map(s => ({ subject: s.subject, ratio: s.latestRatio }))
    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0));

  // Secondary textbook ratios (NISR lower_secondary.px)
  const secondaryRatios = data.secondaryBooks.bySubject
    .filter(s => !s.subject.toLowerCase().includes('average') && s.latestRatio !== null)
    .map(s => ({ subject: s.subject, ratio: s.latestRatio }))
    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0));

  // School counts by level (NISR Edu_numb_scho.px) — latest year
  const schoolsByLevel = data.schools.byLevel
    .filter(l => !l.level.includes('Adult') && !l.level.includes('Polytechnic') && !l.level.includes('Higher'))
    .map(l => ({
      level: l.level.replace('Schools with ', '').replace(' level', ''),
      count: l.latest ?? 0,
    }));

  const totalICT = (summary.usingICT ?? 0) + (summary.notUsingICT ?? 0);
  const yoyPositive = (summary.ictYoY ?? 0) >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroBanner
        badge="ICT, Science and Technology · NISR Education Databases · Live Data"
        title={<>ICT Use in <span className="text-blue-400">Rwanda Schools</span></>}
        subtitle="Live data from NISR PxWeb API — ICT_use.px, smart.px, Primary.px, lower_secondary.px, and Edu_numb_scho.px. Tracking digital transformation progress in Rwanda's education sector."
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle size={12} /> NISR API connected · {data.ictUse.updatedAt.split('T')[0]}
          </span>
          <button onClick={load}
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            <RefreshCw size={10} /> refresh
          </button>
          <span className="text-gray-700 text-xs font-mono">
            fetched {refreshed.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </HeroBanner>

      {/* ── KPI Cards — all from NISR API ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Schools"
          value={summary.totalSchools?.toLocaleString() ?? '—'}
          sub={`${summary.totalSchoolsYear} · Edu_numb_scho.px`}
          icon={<School size={14} className="text-blue-400" />}
          accent="blue"
        />
        <StatCard
          label="Schools Using ICT"
          value={summary.usingICT?.toLocaleString() ?? '—'}
          sub={`${summary.ictPct ?? '—'}% of total · ${summary.ictYear} · NISR`}
          icon={<Monitor size={14} className="text-emerald-400" />}
          accent="green"
          trend={yoyPositive ? 'up' : 'down'}
          trendLabel={summary.ictYoY !== null
            ? `${yoyPositive ? '+' : ''}${summary.ictYoY} pp year-on-year`
            : undefined}
        />
        <StatCard
          label="Smart Classroom Schools"
          value={summary.smartSchools?.toLocaleString() ?? '—'}
          sub={`${summary.smartPct ?? '—'}% of schools · ${summary.smartYear}`}
          icon={<Cpu size={14} className="text-purple-400" />}
          accent="purple"
        />
        <StatCard
          label="Schools Without ICT"
          value={summary.notUsingICT?.toLocaleString() ?? '—'}
          sub="Still need ICT infrastructure"
          icon={<AlertCircle size={14} className="text-amber-400" />}
          accent="amber"
          trend="down"
          trendLabel="NST2 target: 0"
        />
      </div>

      {/* ── ICT trend + adoption gap ─────────────────────── */}
      <div className="grid md:grid-cols-3 gap-5">

        {/* Line chart: schools using / not using */}
        <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">ICT Use in Schools — Trend</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            2017 – {summary.ictYear} · number of schools · NISR ICT_use.px
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={ictTrend} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TP} formatter={(v) => [v?.toLocaleString(), '']} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Line type="monotone" dataKey="Using ICT" stroke="#3b82f6" strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6' }} connectNulls />
              <Line type="monotone" dataKey="Not Using" stroke="#374151" strokeWidth={2}
                strokeDasharray="4 2" dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Adoption gap */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">ICT Adoption Gap</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-5">{summary.ictYear}</p>

          <div className="text-center mb-5">
            <p className={`text-5xl font-extrabold tabular-nums ${yoyPositive ? 'text-blue-400' : 'text-amber-400'}`}>
              {summary.ictPct ?? '—'}%
            </p>
            <p className="text-gray-500 text-xs mt-1">of schools using ICT</p>
            {summary.ictYoY !== null && (
              <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${yoyPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {yoyPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {yoyPositive ? '+' : ''}{summary.ictYoY} pp year-on-year
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[
              { label: 'Using ICT',    value: summary.usingICT ?? 0,    color: '#3b82f6' },
              { label: 'Without ICT',  value: summary.notUsingICT ?? 0, color: '#1f2937' },
            ].map(({ label, value, color }) => {
              const pct = totalICT > 0 ? Math.round((value / totalICT) * 100) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-bold tabular-nums">
                      {value.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-sm h-1.5">
                    <div className="h-1.5 rounded-sm" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-600 font-mono space-y-0.5">
            <p>Source: NISR ICT_use.px</p>
            <p>Total schools tracked: {totalICT.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── ICT % line + ICT by level ─────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">ICT Adoption Rate — % Over Time</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            2017 – {summary.ictYear} · NISR ICT_use.px
          </p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={ictPctTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip {...TP} formatter={v => [`${v}%`, '% Schools with ICT']} />
              <Line type="monotone" dataKey="% Using" stroke="#10b981" strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          {summary.ictPct !== null && (
            <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-lg">
              <p className="text-emerald-400 font-bold text-lg tabular-nums">
                {summary.ictPct}%
                <span className="text-emerald-600 text-xs font-normal ml-2">
                  of schools using ICT ({summary.ictYear})
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">Schools Using ICT by Education Level</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            {summary.ictYear} · NISR ICT_use.px
          </p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={ictByLevel} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="level" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TP} formatter={v => [v?.toLocaleString(), 'Schools']} />
              <Bar dataKey="schools" radius={[3, 3, 0, 0]} maxBarSize={52}>
                {ictByLevel.map(e => (
                  <Cell key={e.level} fill={LEVEL_COLORS[e.level] ?? '#3b82f6'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Smart Classrooms ──────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-purple-400" />
            <div>
              <p className="text-white font-semibold text-sm">Smart Classrooms in Schools</p>
              <p className="text-gray-600 text-xs font-mono">NISR smart.px · {data.smartClassrooms.years.join(' – ')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-400 font-bold text-xl tabular-nums">{summary.smartPct ?? '—'}%</p>
            <p className="text-gray-600 text-xs">schools with smart classrooms</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <div className="p-5">
            <p className="text-gray-500 text-xs font-mono mb-4">Overall trend — with vs. without smart classrooms</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={smartTrend} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TP} formatter={v => [v?.toLocaleString(), '']} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                <Bar dataKey="With Smart"    fill="#8b5cf6" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="Without Smart" fill="#1f2937" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5">
            <p className="text-gray-500 text-xs font-mono mb-4">By education level — {summary.smartYear}</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={smartByLevel} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <XAxis dataKey="level" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TP} formatter={v => [v?.toLocaleString(), '']} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                <Bar dataKey="withSmart"    name="With Smart"    fill="#8b5cf6" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="withoutSmart" name="Without Smart" fill="#374151" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── School counts by level ────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">Schools by Education Level</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-4">
            {summary.totalSchoolsYear} · NISR Edu_numb_scho.px
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={schoolsByLevel} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="level" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TP} formatter={v => [v?.toLocaleString(), 'Schools']} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={56}>
                {schoolsByLevel.map(e => (
                  <Cell key={e.level} fill={LEVEL_COLORS[e.level] ?? '#3b82f6'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NST2 progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-white font-semibold text-sm">NST2 Target Progress</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5 mb-5">current status vs. 2029 targets · NISR data</p>
          <div className="space-y-4">
            {[
              {
                label: 'ICT in all schools',
                current: summary.ictPct ?? 0, target: 100, unit: '%',
                source: `NISR ICT_use.px · ${summary.ictYear}`, color: 'bg-blue-600',
              },
              {
                label: 'Smart classrooms',
                current: summary.smartPct ?? 0, target: 100, unit: '%',
                source: `NISR smart.px · ${summary.smartYear}`, color: 'bg-purple-600',
              },
              {
                label: 'Primary 1:1 textbook ratio',
                current: summary.primaryAvgRatio !== null
                  ? Math.min(100, Math.round((1 / summary.primaryAvgRatio) * 100))
                  : 0,
                target: 100, unit: '%',
                source: `NISR Primary.px · ${summary.primaryBooksYear}`, color: 'bg-amber-500',
              },
            ].map(({ label, current, target, unit, source, color }) => {
              const pct = Math.min(100, Math.round((current / target) * 100));
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-300 text-xs font-medium">{label}</span>
                    <span className="text-gray-600 text-xs font-mono">
                      <span className="text-gray-400 font-semibold">{current}{unit}</span>
                      {' / '}{target}{unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-sm h-2">
                    <div className={`h-2 rounded-sm ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-gray-700 text-xs font-mono">{source}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Textbook ratios ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Primary School Textbooks</p>
              <p className="text-gray-600 text-xs font-mono">NISR Primary.px · {summary.primaryBooksYear}</p>
            </div>
            {summary.primaryAvgRatio !== null && (
              <div className="text-right">
                <p className="text-amber-400 font-bold text-lg tabular-nums">{summary.primaryAvgRatio} : 1</p>
                <p className="text-gray-600 text-xs">avg students/book</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={primaryRatios} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false} tickLine={false} width={145} />
                <Tooltip {...TP} formatter={v => [`${v} : 1`, 'Students per book']} />
                <Bar dataKey="ratio" fill="#f59e0b" radius={[0, 3, 3, 0]} fillOpacity={0.85} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Lower Secondary Textbooks</p>
              <p className="text-gray-600 text-xs font-mono">NISR lower_secondary.px · {summary.secondaryBooksYear}</p>
            </div>
            {summary.secondaryAvgRatio !== null && (
              <div className="text-right">
                <p className="text-violet-400 font-bold text-lg tabular-nums">{summary.secondaryAvgRatio} : 1</p>
                <p className="text-gray-600 text-xs">avg students/book</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={secondaryRatios} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false} tickLine={false} width={145} />
                <Tooltip {...TP} formatter={v => [`${v} : 1`, 'Students per book']} />
                <Bar dataKey="ratio" fill="#8b5cf6" radius={[0, 3, 3, 0]} fillOpacity={0.85} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Raw data tables ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-white font-semibold text-sm">ICT Use — Full Data Table</p>
            <p className="text-gray-600 text-xs font-mono">NISR ICT_use.px · all years</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2.5 px-4 text-gray-600 font-semibold uppercase tracking-wider">Year</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">Using ICT</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">Not Using</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.ictUse.trend.map(row => (
                  <tr key={row.year} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-gray-400 font-mono">{row.year}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold tabular-nums">
                      {row.schoolsUsingICT?.toLocaleString() ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 tabular-nums">
                      {row.schoolsNotUsingICT?.toLocaleString() ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.percentUsingICT !== null
                        ? <span className="text-emerald-400 font-semibold">{row.percentUsingICT}%</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-white font-semibold text-sm">Smart Classrooms — Full Data Table</p>
            <p className="text-gray-600 text-xs font-mono">NISR smart.px · all years</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2.5 px-4 text-gray-600 font-semibold uppercase tracking-wider">Year</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">With Smart</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">Without</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-semibold uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.smartClassrooms.trend.map(row => (
                  <tr key={row.year} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-gray-400 font-mono">{row.year}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold tabular-nums">
                      {row.withSmart?.toLocaleString() ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 tabular-nums">
                      {row.withoutSmart?.toLocaleString() ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.percentSmart !== null
                        ? <span className="text-purple-400 font-semibold">{row.percentSmart}%</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Meta strip ────────────────────────────────────── */}
      <div className="border-t border-gray-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-700 font-mono">
        <span>Source: NISR PxWeb API · Education / ICT, Science and Technology</span>
        <span>NISR data updated: {new Date(data.ictUse.updatedAt).toLocaleDateString('en-RW')}</span>
        <span>
          Page fetched: {refreshed.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
          <button onClick={load} className="ml-2 hover:text-gray-400 inline-flex items-center gap-1 transition-colors">
            <RefreshCw size={10} /> refresh
          </button>
        </span>
      </div>
    </div>
  );
}
