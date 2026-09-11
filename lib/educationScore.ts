// ============================================================
// Rwanda Education Gap Scoring Engine
// ============================================================
// Computes an Education Priority Score (0–100) per district,
// where HIGHER score = LARGER gap = MORE intervention needed.
//
// Four pillars aligned with NST2 / Vision 2050:
//
//  1. ICT Readiness       35% — digital access in schools
//  2. Infrastructure      30% — school availability & coverage
//  3. Learning Resources  20% — textbook ratios
//  4. Digital Equity      15% — smart classroom adoption
//
// National benchmarks are injected at runtime from NISR API
// (ICT_use.px, smart.px, Primary.px, Edu_numb_scho.px).
// District deviations from benchmarks drive the gap score.
// ============================================================

import type { DistrictEducationData } from './districtEducation';

// ── National benchmarks (injected from NISR API at runtime) ─
export interface NationalBenchmarks {
  ictPct: number;              // % schools using ICT (national)
  smartPct: number;            // % smart classroom schools (national)
  primaryBookRatio: number;    // avg students per book primary (national)
  secondaryBookRatio: number;  // avg students per book secondary (national)
  schoolsPerThousandKids: number; // schools per 1000 school-age children
}

// Default benchmarks (NISR 2021/22 actual values) used as fallback
export const DEFAULT_BENCHMARKS: NationalBenchmarks = {
  ictPct: 47.2,
  smartPct: 23.1,
  primaryBookRatio: 2.0,
  secondaryBookRatio: 1.3,
  schoolsPerThousandKids: 3.8,
};

// NST2 2029 targets
export const NST2_TARGETS = {
  ictPct: 100,
  smartPct: 100,
  primaryBookRatio: 1.0,     // 1 book per student
  secondaryBookRatio: 1.0,
  schoolsPerThousandKids: 5.0,
};

// ── Pillar weights ───────────────────────────────────────────
export const PILLAR_WEIGHTS = {
  ict:            0.35,
  infrastructure: 0.30,
  resources:      0.20,
  digital:        0.15,
};

// ── Output types ─────────────────────────────────────────────
export interface PillarScores {
  ict: number;           // 0–100 gap score (100 = largest gap)
  infrastructure: number;
  resources: number;
  digital: number;
}

export interface GapDriver {
  pillar: string;
  indicator: string;
  districtValue: number;
  nationalValue: number;
  unit: string;
  severity: 'critical' | 'high' | 'moderate';
  contribution: number; // weighted contribution to total score
}

export interface EducationPriorityResult {
  priorityScore: number;          // 0–100 composite gap score
  priorityLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  pillarScores: PillarScores;
  topDrivers: GapDriver[];
  recommendations: string[];
  nst2Alignment: string[];
  confidenceNote: string;
}

// ── Normalise a value to 0–100 risk/gap scale ────────────────
function norm(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}
// For "inverted" indicators: higher value = better = lower gap
function inv(value: number, min: number, max: number): number {
  return 100 - norm(value, min, max);
}

// ── Core scoring function ─────────────────────────────────────
export function computeEducationPriority(
  district: DistrictEducationData,
  benchmarks: NationalBenchmarks = DEFAULT_BENCHMARKS
): EducationPriorityResult {

  // ── 1. ICT Readiness gap (higher % using ICT → lower gap) ──
  // District ICT % compared to national & NST2 target
  const ictGap = inv(district.ictAdoptionPct, 0, 100);
  // Gap from national benchmark (amplified if below national avg)
  const ictBelowNational = Math.max(0, benchmarks.ictPct - district.ictAdoptionPct);
  const ictScore = Math.min(100, ictGap * 0.7 + (ictBelowNational / benchmarks.ictPct) * 100 * 0.3);

  // ── 2. Infrastructure gap ────────────────────────────────────
  // School density per 1000 school-age children
  const infraGap = inv(district.schoolsPer1000Children, 0, NST2_TARGETS.schoolsPerThousandKids);
  // % of expected education levels present
  const levelCoverage = inv(district.educationLevelCoverage, 0, 100);
  const infraScore = infraGap * 0.6 + levelCoverage * 0.4;

  // ── 3. Learning Resources gap ───────────────────────────────
  // Book ratio: higher ratio = worse (more students per book)
  const primaryGap  = norm(district.primaryBookRatio, 1, 5);
  const secondaryGap = norm(district.secondaryBookRatio, 1, 5);
  const resourceScore = primaryGap * 0.55 + secondaryGap * 0.45;

  // ── 4. Digital Equity gap ───────────────────────────────────
  const smartGap = inv(district.smartClassroomPct, 0, 100);
  const smartBelowNational = Math.max(0, benchmarks.smartPct - district.smartClassroomPct);
  const digitalScore = Math.min(100, smartGap * 0.7 + (smartBelowNational / (benchmarks.smartPct || 1)) * 100 * 0.3);

  // ── Composite weighted score ─────────────────────────────────
  const raw =
    ictScore          * PILLAR_WEIGHTS.ict +
    infraScore        * PILLAR_WEIGHTS.infrastructure +
    resourceScore     * PILLAR_WEIGHTS.resources +
    digitalScore      * PILLAR_WEIGHTS.digital;

  const priorityScore = Math.round(Math.max(0, Math.min(100, raw)));

  const priorityLevel: EducationPriorityResult['priorityLevel'] =
    priorityScore >= 70 ? 'Critical' :
    priorityScore >= 50 ? 'High' :
    priorityScore >= 30 ? 'Moderate' : 'Low';

  const pillarScores: PillarScores = {
    ict:            Math.round(ictScore),
    infrastructure: Math.round(infraScore),
    resources:      Math.round(resourceScore),
    digital:        Math.round(digitalScore),
  };

  // ── Gap drivers (top contributors) ──────────────────────────
  const allDrivers: GapDriver[] = [
    {
      pillar: 'ICT Readiness',
      indicator: 'ICT adoption rate',
      districtValue: district.ictAdoptionPct,
      nationalValue: benchmarks.ictPct,
      unit: '% schools',
      severity: ictScore >= 70 ? 'critical' : ictScore >= 45 ? 'high' : 'moderate',
      contribution: Math.round(ictScore * PILLAR_WEIGHTS.ict),
    },
    {
      pillar: 'Infrastructure',
      indicator: 'Schools per 1,000 children',
      districtValue: district.schoolsPer1000Children,
      nationalValue: benchmarks.schoolsPerThousandKids,
      unit: 'schools',
      severity: infraScore >= 70 ? 'critical' : infraScore >= 45 ? 'high' : 'moderate',
      contribution: Math.round(infraScore * PILLAR_WEIGHTS.infrastructure),
    },
    {
      pillar: 'Learning Resources',
      indicator: 'Primary textbook ratio',
      districtValue: district.primaryBookRatio,
      nationalValue: benchmarks.primaryBookRatio,
      unit: 'students/book',
      severity: primaryGap >= 70 ? 'critical' : primaryGap >= 45 ? 'high' : 'moderate',
      contribution: Math.round(resourceScore * PILLAR_WEIGHTS.resources),
    },
    {
      pillar: 'Digital Equity',
      indicator: 'Smart classroom coverage',
      districtValue: district.smartClassroomPct,
      nationalValue: benchmarks.smartPct,
      unit: '% schools',
      severity: digitalScore >= 70 ? 'critical' : digitalScore >= 45 ? 'high' : 'moderate',
      contribution: Math.round(digitalScore * PILLAR_WEIGHTS.digital),
    },
  ];

  const topDrivers = allDrivers
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4);

  // ── Recommendations ──────────────────────────────────────────
  const recs: string[] = [];

  if (ictScore >= 60) {
    recs.push('Deploy ICT equipment (computers, internet connectivity) to underserved schools');
    recs.push('Scale RNEC / REB ICT integration programme to all school levels');
  } else if (ictScore >= 40) {
    recs.push('Expand teacher ICT training and digital skills development');
  }

  if (infraScore >= 60) {
    recs.push('Prioritise new school construction and rehabilitation in underserved areas');
    recs.push('Review school catchment areas to reduce pupil-to-school distance');
  } else if (infraScore >= 40) {
    recs.push('Upgrade existing school facilities and sanitation infrastructure');
  }

  if (resourceScore >= 60) {
    recs.push('Increase textbook procurement — target 1:1 ratio for all core subjects');
    recs.push('Deploy REB digital content libraries as textbook supplement');
  } else if (resourceScore >= 40) {
    recs.push('Prioritise shared textbook programmes for high-shortage subjects');
  }

  if (digitalScore >= 60) {
    recs.push('Accelerate Smart Classroom roll-out — prioritise secondary and TVET levels');
    recs.push('Partner with RDB/Smart Rwanda for district-level connectivity infrastructure');
  }

  if (recs.length === 0) {
    recs.push('Maintain current investment levels and monitor progress against NST2 targets');
  }

  // ── NST2 alignment ───────────────────────────────────────────
  const nst2: string[] = [];
  if (ictScore >= 40)    nst2.push('NST2 Pillar: Digital Transformation — ICT in all schools by 2029');
  if (infraScore >= 40)  nst2.push('NST2 Pillar: Social Transformation — Quality education access');
  if (resourceScore >= 40) nst2.push('NST2 Pillar: Human Capital — Textbook 1:1 ratio target');
  if (digitalScore >= 40) nst2.push('Vision 2050: Knowledge-based economy — Smart classrooms');

  return {
    priorityScore,
    priorityLevel,
    pillarScores,
    topDrivers,
    recommendations: recs.slice(0, 5),
    nst2Alignment: nst2,
    confidenceNote:
      'Score computed from NISR Education database benchmarks + NISR-informed district proxies. ' +
      'National data: ICT_use.px, smart.px, Primary.px, Edu_numb_scho.px (NISR 2021/22).',
  };
}

// ── What-if simulation ───────────────────────────────────────
export interface EducationIntervention {
  ictAdoptionIncrease?: number;        // pp increase
  smartClassroomIncrease?: number;     // pp increase
  bookRatioImprovement?: number;       // ratio reduction (e.g. 0.5 = reduce by 0.5)
  newSchoolsPer1000?: number;          // additional schools per 1000 children
}

export interface SimulationResult {
  baseline: EducationPriorityResult;
  simulated: EducationPriorityResult;
  deltaScore: number;
  levelChange: boolean;
  impactLines: string[];
}

export function simulateIntervention(
  district: DistrictEducationData,
  interventions: EducationIntervention,
  benchmarks: NationalBenchmarks = DEFAULT_BENCHMARKS
): SimulationResult {
  const baseline = computeEducationPriority(district, benchmarks);

  // Apply interventions
  const modified: DistrictEducationData = { ...district };

  if (interventions.ictAdoptionIncrease) {
    modified.ictAdoptionPct = Math.min(100,
      district.ictAdoptionPct + interventions.ictAdoptionIncrease);
  }
  if (interventions.smartClassroomIncrease) {
    modified.smartClassroomPct = Math.min(100,
      district.smartClassroomPct + interventions.smartClassroomIncrease);
  }
  if (interventions.bookRatioImprovement) {
    modified.primaryBookRatio   = Math.max(1, district.primaryBookRatio - interventions.bookRatioImprovement);
    modified.secondaryBookRatio = Math.max(1, district.secondaryBookRatio - interventions.bookRatioImprovement * 0.8);
  }
  if (interventions.newSchoolsPer1000) {
    modified.schoolsPer1000Children = Math.min(8,
      district.schoolsPer1000Children + interventions.newSchoolsPer1000);
    // Secondary effect: improved education level coverage
    modified.educationLevelCoverage = Math.min(100,
      district.educationLevelCoverage + interventions.newSchoolsPer1000 * 3);
  }

  const simulated = computeEducationPriority(modified, benchmarks);
  const delta = baseline.priorityScore - simulated.priorityScore;

  const lines: string[] = [];
  if (interventions.ictAdoptionIncrease) {
    lines.push(`ICT adoption: ${district.ictAdoptionPct}% → ${modified.ictAdoptionPct.toFixed(1)}%`);
  }
  if (interventions.smartClassroomIncrease) {
    lines.push(`Smart classrooms: ${district.smartClassroomPct}% → ${modified.smartClassroomPct.toFixed(1)}%`);
  }
  if (interventions.bookRatioImprovement) {
    lines.push(`Primary book ratio: ${district.primaryBookRatio}:1 → ${modified.primaryBookRatio.toFixed(1)}:1`);
  }
  if (interventions.newSchoolsPer1000) {
    lines.push(`Schools/1000 children: ${district.schoolsPer1000Children} → ${modified.schoolsPer1000Children.toFixed(1)}`);
  }

  return {
    baseline,
    simulated,
    deltaScore: delta,
    levelChange: baseline.priorityLevel !== simulated.priorityLevel,
    impactLines: lines,
  };
}
