'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Sliders, PlayCircle, RotateCcw, ArrowLeft, TrendingDown } from 'lucide-react';

import { districtEducationData } from '@/lib/districtEducation';
import { simulateIntervention, DEFAULT_BENCHMARKS } from '@/lib/educationScore';
import HeroBanner from '@/components/HeroBanner';

// LEVEL_COLOR_MAP not exported yet — define locally
const LEVEL_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6', Low: '#22c55e',
};

const TP = {
  contentStyle: {
    backgroundColor: '#111827', border: '1px solid #1f2937',
    borderRadius: '6px', color: '#f9fafb', fontSize: '12px',
  },
};

function SimContent() {
  const params = useSearchParams();
  const defaultId = params.get('district') || districtEducationData
    .sort((a, b) => {
      const ra = computeScore(a);
      const rb = computeScore(b);
      return rb - ra;
    })[0].id;

  function computeScore(d: typeof districtEducationData[0]) {
    const { computeEducationPriority } = require('@/lib/educationScore');
    return computeEducationPriority(d, DEFAULT_BENCHMARKS).priorityScore;
  }

  const [districtId, setDistrictId] = useState(defaultId);
  const [iv, setIv] = useState({
    ictAdoptionIncrease: 0,
    smartClassroomIncrease: 0,
    bookRatioImprovement: 0,
    newSchoolsPer1000: 0,
  });
  const [hasRun, setHasRun] = useState(false);

  const district = districtEducationData.find(d => d.id === districtId)!;

  const simResult = useMemo(() => {
    if (!hasRun) return null;
    return simulateIntervention(district, iv, DEFAULT_BENCHMARKS);
  }, [hasRun, district, iv]);

  const sorted = [...districtEducationData].sort((a, b) => computeScore(b) - computeScore(a));
  const hasAny = Object.values(iv).some(v => v > 0);

  const pillarChart = simResult ? [
    { name: 'ICT',            Baseline: simResult.baseline.pillarScores.ict,            Simulated: simResult.simulated.pillarScores.ict            },
    { name: 'Infrastructure', Baseline: simResult.baseline.pillarScores.infrastructure, Simulated: simResult.simulated.pillarScores.infrastructure },
    { name: 'Resources',      Baseline: simResult.baseline.pillarScores.resources,      Simulated: simResult.simulated.pillarScores.resources      },
    { name: 'Digital',        Baseline: simResult.baseline.pillarScores.digital,        Simulated: simResult.simulated.pillarScores.digital        },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">

      <HeroBanner
        badge="Policy Simulation · Education Gap · NST2 Intervention Modelling"
        title={<>Education Gap <span className="text-blue-400">What-if Simulator</span></>}
        subtitle="Model the projected impact of education interventions on a district's gap score before deployment. Based on NISR Education benchmarks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">

          {/* District selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">
              Select District
            </label>
            <select value={districtId}
              onChange={e => { setDistrictId(e.target.value); setHasRun(false); }}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600">
              {sorted.map(d => {
                const score = computeScore(d);
                return (
                  <option key={d.id} value={d.id}>
                    {d.name} — Gap Score {score}
                  </option>
                );
              })}
            </select>
            {district && (
              <div className="mt-3 text-xs text-gray-500 font-mono space-y-0.5">
                <p>{district.province} · {district.schoolAgePopulation}K school-age children</p>
                <p>ICT: {district.ictAdoptionPct}% · Smart: {district.smartClassroomPct}%</p>
                <p>Primary ratio: {district.primaryBookRatio}:1 · Schools: {district.totalSchoolsEstimate}</p>
              </div>
            )}
          </div>

          {/* Intervention sliders */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-5">
            <div>
              <p className="text-white font-semibold text-sm">Configure Interventions</p>
              <p className="text-gray-600 text-xs font-mono mt-0.5">
                Set targets — model will project impact on gap score
              </p>
            </div>

            {[
              {
                key: 'ictAdoptionIncrease' as const,
                label: 'ICT Adoption Increase',
                sub: 'Deploy computers & internet to schools (REB/RNEC)',
                max: 40, unit: 'pp',
              },
              {
                key: 'smartClassroomIncrease' as const,
                label: 'Smart Classroom Rollout',
                sub: 'Smart Rwanda classroom installation programme',
                max: 30, unit: 'pp',
              },
              {
                key: 'bookRatioImprovement' as const,
                label: 'Textbook Procurement',
                sub: 'Reduce students-per-book ratio (REB procurement)',
                max: 2, unit: 'ratio pts', step: 0.1,
              },
              {
                key: 'newSchoolsPer1000' as const,
                label: 'New School Construction',
                sub: 'Additional schools per 1,000 school-age children',
                max: 2, unit: '/1000 children', step: 0.1,
              },
            ].map(({ key, label, sub, max, unit, step = 1 }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{label}</p>
                    <p className="text-gray-600 text-xs">{sub}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${iv[key] > 0 ? 'text-blue-400' : 'text-gray-700'}`}>
                    {iv[key] > 0 ? `+${iv[key]}${step < 1 ? '' : '%'}` : '—'}
                  </span>
                </div>
                <input type="range" min={0} max={max} step={step}
                  value={iv[key]}
                  onChange={e => setIv(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-gray-700 text-xs font-mono">
                  <span>0</span><span>+{max}{unit}</span>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setHasRun(true)} disabled={!hasAny}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                <PlayCircle size={16} /> Run Simulation
              </button>
              <button onClick={() => { setIv({ ictAdoptionIncrease: 0, smartClassroomIncrease: 0, bookRatioImprovement: 0, newSchoolsPer1000: 0 }); setHasRun(false); }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 px-4 py-2.5 rounded-xl transition-colors">
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">

          {!hasRun ? (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-10 sm:p-16 flex flex-col items-center gap-4 text-center">
              <Sliders size={28} className="text-gray-700" />
              <p className="text-gray-500 font-medium text-sm">Configure interventions and click Run</p>
              <p className="text-gray-700 text-xs font-mono">
                Select a district, set your intervention targets, then simulate projected gap reduction
              </p>
            </div>
          ) : simResult ? (
            <>
              {/* Score comparison */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                <p className="text-white font-semibold text-sm mb-4">Gap Score Impact</p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center bg-gray-800/50 rounded-xl p-3 sm:p-4">
                    <p className="text-gray-500 text-xs font-semibold mb-1">BASELINE</p>
                    <p className="text-3xl sm:text-4xl font-extrabold tabular-nums"
                      style={{ color: LEVEL_COLOR[simResult.baseline.priorityLevel] }}>
                      {simResult.baseline.priorityScore}
                    </p>
                    <p className="text-xs font-semibold mt-1"
                      style={{ color: LEVEL_COLOR[simResult.baseline.priorityLevel] }}>
                      {simResult.baseline.priorityLevel}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className={`rounded-full px-3 py-1 text-sm font-bold border ${
                      simResult.deltaScore > 0
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-800 text-gray-500 border-gray-700'
                    }`}>
                      {simResult.deltaScore > 0 ? `▼ ${simResult.deltaScore}` : '= 0'}
                    </div>
                    <p className="text-gray-600 text-xs font-mono">gap reduction</p>
                    {simResult.levelChange && (
                      <p className="text-emerald-400 text-xs font-semibold">
                        {simResult.baseline.priorityLevel} → {simResult.simulated.priorityLevel}
                      </p>
                    )}
                  </div>

                  <div className="text-center bg-gray-800/50 rounded-xl p-3 sm:p-4">
                    <p className="text-gray-500 text-xs font-semibold mb-1">SIMULATED</p>
                    <p className="text-3xl sm:text-4xl font-extrabold tabular-nums"
                      style={{ color: LEVEL_COLOR[simResult.simulated.priorityLevel] }}>
                      {simResult.simulated.priorityScore}
                    </p>
                    <p className="text-xs font-semibold mt-1"
                      style={{ color: LEVEL_COLOR[simResult.simulated.priorityLevel] }}>
                      {simResult.simulated.priorityLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar comparison */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
                <p className="text-white font-semibold text-sm mb-4">Pillar Gap Score Comparison</p>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={pillarChart} barGap={4}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip {...TP} />
                    <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                    <Bar dataKey="Baseline"  fill="#4b5563" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Simulated" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Impact lines */}
              {simResult.impactLines.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-white font-semibold text-sm mb-3">Indicator Changes</p>
                  <div className="space-y-2">
                    {simResult.impactLines.map((line, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <TrendingDown size={14} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-gray-300 font-mono text-xs">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulated recommendations */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5">
                <p className="text-emerald-400 font-semibold text-sm mb-2">
                  Priority Actions After Intervention
                </p>
                <div className="space-y-1.5">
                  {simResult.simulated.recommendations.map((r, i) => (
                    <p key={i} className="text-gray-400 text-xs flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span> {r}
                    </p>
                  ))}
                </div>
                <p className="text-gray-700 text-xs font-mono mt-3">
                  Model based on NISR Education benchmarks · ICT_use.px · smart.px · Primary.px
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SimContent />
    </Suspense>
  );
}
