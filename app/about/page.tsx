import Link from 'next/link';
import { ArrowLeft, Database, GitBranch, Users, Target, BookOpen } from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import { NISR_ENDPOINTS } from '@/lib/nisr-education';
import { PILLAR_WEIGHTS, DEFAULT_BENCHMARKS, NST2_TARGETS } from '@/lib/educationScore';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Gap Map
      </Link>

      <HeroBanner
        badge="NISR Data Challenge 2026 — Challenge 3 · Education Sector"
        title={<>About <span className="text-blue-400">ROVI Education</span></>}
        subtitle="Rwanda Education Gap Intelligence & Priority Platform — identifying where education resources are most needed and why, using live NISR data to power evidence-based intervention targeting."
      />

      {/* Problem */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-7 space-y-4">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Target size={16} className="text-red-400" /> The Problem
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Education resources and interventions cannot be prioritized effectively if decision-makers
          cannot easily identify where the largest education gaps are and what factors are associated
          with those gaps.
        </p>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 font-mono text-sm text-center text-blue-300">
          NISR Data → Education Indicators → Gap Analysis → Priority Score → Recommendations → Action
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Rwanda has strong NISR data on ICT adoption in schools, smart classroom coverage, textbook
          ratios, and school infrastructure — but this data is presented as national aggregates.
          ROVI translates these national benchmarks into district-level gap intelligence, making it
          actionable for planners at every level.
        </p>
      </section>

      {/* Scoring model */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-7 space-y-5">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <GitBranch size={16} className="text-emerald-400" /> Education Gap Scoring Model
        </h2>
        <p className="text-gray-400 text-sm">
          Each district receives an <strong className="text-white">Education Priority Score (0–100)</strong>,
          where a higher score indicates a larger education gap and greater need for intervention.
          The score is a weighted composite across four NST2-aligned pillars:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Pillar</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Weight</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Key Indicator</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">NISR Source</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Benchmark</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">NST2 Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { pillar: 'ICT Readiness',      weight: `${Math.round(PILLAR_WEIGHTS.ict * 100)}%`,            indicator: 'ICT adoption rate',          source: 'ICT_use.px',       bench: `${DEFAULT_BENCHMARKS.ictPct}%`,        target: `${NST2_TARGETS.ictPct}%` },
                { pillar: 'Infrastructure',     weight: `${Math.round(PILLAR_WEIGHTS.infrastructure * 100)}%`, indicator: 'Schools/1000 children',      source: 'Edu_numb_scho.px', bench: '3.8',                                  target: '5.0' },
                { pillar: 'Learning Resources', weight: `${Math.round(PILLAR_WEIGHTS.resources * 100)}%`,      indicator: 'Primary textbook ratio',     source: 'Primary.px',       bench: `${DEFAULT_BENCHMARKS.primaryBookRatio}:1`, target: '1:1' },
                { pillar: 'Digital Equity',     weight: `${Math.round(PILLAR_WEIGHTS.digital * 100)}%`,        indicator: 'Smart classroom coverage',   source: 'smart.px',         bench: `${DEFAULT_BENCHMARKS.smartPct}%`,      target: `${NST2_TARGETS.smartPct}%` },
              ].map(({ pillar, weight, indicator, source, bench, target }) => (
                <tr key={pillar}>
                  <td className="py-2.5 px-3 text-white font-medium">{pillar}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-bold text-right">{weight}</td>
                  <td className="py-2.5 px-3 text-gray-400">{indicator}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-mono text-xs">{source}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-right tabular-nums">{bench}</td>
                  <td className="py-2.5 px-3 text-emerald-400 text-right tabular-nums">{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-4 space-y-2 text-xs text-gray-400">
          <p><strong className="text-gray-300">Priority levels:</strong> Critical (≥70) · High (50–69) · Moderate (30–49) · Low (&lt;30)</p>
          <p><strong className="text-gray-300">District estimates:</strong> National NISR benchmarks are adjusted per district using NISR EICV5 2023/24 poverty rates, RPHC4 2022 urban-rural ratios, and LFS 2024 NEET rates as proxy adjustment factors.</p>
          <p><strong className="text-gray-300">Transparency:</strong> All district scores are clearly labelled as NISR-informed estimates. National benchmarks are fetched live from NISR PxWeb API on every page load.</p>
        </div>
      </section>

      {/* NISR API endpoints */}
      <section className="space-y-4">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Database size={16} className="text-purple-400" /> Live NISR API Endpoints
        </h2>
        <p className="text-gray-500 text-sm">
          National benchmarks are fetched live at runtime from NISR PxWeb API (json-stat2 format, 1h cache).
          ICT and smart classroom percentages are computed from raw school counts — not from NISR's
          placeholder percentage column.
        </p>
        <div className="space-y-2">
          {[
            { key: 'schools',         label: 'School Infrastructure',    file: 'Edu_numb_scho.px', dims: '8 levels × 5 years' },
            { key: 'ict_use',         label: 'ICT Use in Teaching',      file: 'ICT_use.px',       dims: '3 metrics × 7 levels × 5 years' },
            { key: 'smart',           label: 'Smart Classrooms',         file: 'smart.px',         dims: '3 metrics × 6 levels × 2 years' },
            { key: 'primary_books',   label: 'Primary Textbooks',        file: 'Primary.px',       dims: '2 units × 6 subjects × 4 years' },
            { key: 'secondary_books', label: 'Secondary Textbooks',      file: 'lower_secondary.px', dims: '2 units × 12 subjects × 4 years' },
          ].map(({ key, label, file, dims }) => (
            <div key={key} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="w-1 self-stretch bg-blue-700 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm font-semibold">{label}</span>
                  <span className="text-blue-400 font-mono text-xs">{file}</span>
                  <span className="text-gray-600 text-xs">{dims}</span>
                </div>
                <p className="text-gray-700 text-xs font-mono mt-0.5 truncate">
                  {NISR_ENDPOINTS[key as keyof typeof NISR_ENDPOINTS]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NST2 */}
      <section className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/40 rounded-xl p-7 space-y-4">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" /> NST2 & Vision 2050 Alignment
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {[
            { target: 'ICT in all schools by 2029',   detail: `Current: ${DEFAULT_BENCHMARKS.ictPct}% · Gap: ${(NST2_TARGETS.ictPct - DEFAULT_BENCHMARKS.ictPct).toFixed(1)} pp · NISR ICT_use.px`, pillar: 'Digital Transformation' },
            { target: 'Universal smart classrooms',   detail: `Current: ${DEFAULT_BENCHMARKS.smartPct}% · Gap: ${(NST2_TARGETS.smartPct - DEFAULT_BENCHMARKS.smartPct).toFixed(1)} pp · NISR smart.px`,   pillar: 'Digital Transformation' },
            { target: '1:1 textbook ratio',           detail: `Current: ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 primary · Target: 1:1 · NISR Primary.px`,                                                  pillar: 'Human Capital Development' },
            { target: 'Evidence-based planning',      detail: 'ROVI translates NISR statistical data into district-level gap intelligence for targeted resource allocation',                                    pillar: 'Transformational Governance' },
          ].map(({ target, detail, pillar }) => (
            <div key={target} className="space-y-1">
              <p className="text-white font-semibold text-sm">{target}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{detail}</p>
              <span className="text-blue-500 text-xs font-mono">{pillar}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="space-y-4">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Users size={16} className="text-amber-400" /> Team
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: 'Jean-Pierre Habimana', role: 'Lead Data Analyst',  area: 'NISR API integration, gap scoring model' },
            { name: 'Claudine Uwimana',     role: 'Software Engineer',  area: 'Platform architecture, data visualisation' },
            { name: 'Eric Nshimiyimana',    role: 'Policy Researcher',  area: 'NST2 alignment, education policy analysis' },
          ].map(({ name, role, area }) => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold text-sm">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-blue-400 text-xs">{role}</p>
              <p className="text-gray-600 text-xs">{area}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-700 text-sm font-mono">
          Rwanda Analytics Lab · Kigali · NISR Data Challenge 2026 — Challenge 3
        </p>
      </section>
    </div>
  );
}
