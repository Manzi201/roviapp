import Link from 'next/link';
import { ArrowLeft, GitBranch, Target, BookOpen, BarChart2 } from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import { PILLAR_WEIGHTS, DEFAULT_BENCHMARKS, NST2_TARGETS } from '@/lib/educationScore';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Gap Map
      </Link>

      <HeroBanner
        badge="NISR Data Challenge 2026 — Challenge 3 · Education Sector"
        title={<>About <span className="text-blue-400">EduGap Rwanda</span></>}
        subtitle="Rwanda Education Gap Intelligence & Priority Platform — identifying where education resources are most needed and why, using live NISR data to power evidence-based intervention targeting."
      />

      {/* Problem */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
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
          EduGap Rwanda translates these national benchmarks into district-level gap intelligence,
          making it actionable for planners at every level.
        </p>
      </section>

      {/* What the platform does */}
      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-400" /> Platform Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { code: 'GAP MAP',   title: 'District Priority Map', desc: '30 districts ranked by education gap score with interactive map.' },
            { code: 'ICT DATA',  title: 'ICT & Smart Dashboard', desc: 'Live trend data on ICT adoption and smart classrooms from NISR API.' },
            { code: 'SIMULATE',  title: 'What-if Simulator',     desc: 'Model the impact of interventions before deployment.' },
            { code: 'QUERY',     title: 'Data Query Tool',        desc: 'Ask questions about Rwanda education data in plain language.' },
          ].map(({ code, title, desc }) => (
            <div key={code} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1.5">
              <span className="inline-block font-mono text-xs font-bold text-blue-400 bg-blue-950/50 border border-blue-900/40 rounded px-2 py-0.5">{code}</span>
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring model */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <GitBranch size={16} className="text-emerald-400" /> Education Gap Scoring Model
        </h2>
        <p className="text-gray-400 text-sm">
          Each district receives an <strong className="text-white">Education Priority Score (0–100)</strong> —
          higher score means larger gap, more intervention needed.
          The score is a weighted composite across four NST2-aligned pillars:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Pillar</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Weight</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Indicator</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">NISR Source</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">NST2 Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { pillar: 'ICT Readiness',      weight: `${Math.round(PILLAR_WEIGHTS.ict * 100)}%`,            indicator: 'ICT adoption rate',        source: 'ICT_use.px',       target: `${NST2_TARGETS.ictPct}%` },
                { pillar: 'Infrastructure',     weight: `${Math.round(PILLAR_WEIGHTS.infrastructure * 100)}%`, indicator: 'Schools/1000 children',    source: 'Edu_numb_scho.px', target: '5.0' },
                { pillar: 'Learning Resources', weight: `${Math.round(PILLAR_WEIGHTS.resources * 100)}%`,      indicator: 'Primary textbook ratio',   source: 'Primary.px',       target: '1:1' },
                { pillar: 'Digital Equity',     weight: `${Math.round(PILLAR_WEIGHTS.digital * 100)}%`,        indicator: 'Smart classroom coverage', source: 'smart.px',         target: `${NST2_TARGETS.smartPct}%` },
              ].map(({ pillar, weight, indicator, source, target }) => (
                <tr key={pillar}>
                  <td className="py-2.5 px-3 text-white font-medium">{pillar}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-bold text-right">{weight}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-sm">{indicator}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-mono text-xs">{source}</td>
                  <td className="py-2.5 px-3 text-emerald-400 text-right tabular-nums">{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-4 space-y-1.5 text-xs text-gray-400">
          <p><strong className="text-gray-300">Priority levels:</strong> Critical (≥58) · High (42–57) · Moderate (25–41) · Low (&lt;25)</p>
          <p><strong className="text-gray-300">Data:</strong> All national benchmarks fetched live from NISR PxWeb Education API. District scores are NISR-informed estimates clearly labelled as such.</p>
        </div>
      </section>

      {/* NST2 alignment */}
      <section className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/40 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" /> NST2 & Vision 2050 Alignment
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { target: 'ICT in all schools by 2029',   detail: `Current: ${DEFAULT_BENCHMARKS.ictPct}% → Gap: ${(NST2_TARGETS.ictPct - DEFAULT_BENCHMARKS.ictPct).toFixed(1)} pp`, pillar: 'Digital Transformation' },
            { target: 'Universal smart classrooms',   detail: `Current: ${DEFAULT_BENCHMARKS.smartPct}% → Gap: ${(NST2_TARGETS.smartPct - DEFAULT_BENCHMARKS.smartPct).toFixed(1)} pp`, pillar: 'Digital Transformation' },
            { target: '1:1 textbook ratio',           detail: `Current: ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 → Target: 1:1 for all core subjects`, pillar: 'Human Capital Development' },
            { target: 'Evidence-based planning',      detail: 'EduGap translates NISR data into district-level gap intelligence for targeted resource allocation.', pillar: 'Transformational Governance' },
          ].map(({ target, detail, pillar }) => (
            <div key={target} className="space-y-1">
              <p className="text-white font-semibold text-sm">{target}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{detail}</p>
              <span className="text-blue-500 text-xs font-mono">{pillar}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NISR datasets */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">NISR Data Sources</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { file: 'ICT_use.px',          desc: 'ICT use in teaching & learning',    years: '2017–2021/22' },
            { file: 'smart.px',             desc: 'Smart classrooms in schools',       years: '2020/21–2021/22' },
            { file: 'Primary.px',           desc: 'Primary school textbook ratios',    years: '2018–2021/22' },
            { file: 'lower_secondary.px',   desc: 'Secondary textbook ratios',         years: '2018–2021/22' },
            { file: 'Edu_numb_scho.px',     desc: 'School counts by education level',  years: '2017–2021' },
          ].map(({ file, desc, years }) => (
            <div key={file} className="flex items-start gap-3 bg-gray-800/40 rounded-lg p-3">
              <div className="w-1 self-stretch bg-blue-700 rounded-full flex-shrink-0" />
              <div>
                <p className="text-blue-400 font-mono text-xs font-bold">{file}</p>
                <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                <p className="text-gray-600 text-xs font-mono">{years}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs font-mono">
          Source: NISR PxWeb API · Education / ICT, Science and Technology · Live data
        </p>
      </section>

    </div>
  );
}
