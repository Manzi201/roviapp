// ============================================================
// NISR Education Data Fetcher & Parser
// All data from NISR PxWeb API — live, no synthetic data
//
// Datasets:
//   School Infrastructure  → Edu_numb_scho.px   (8 levels × 5 years)
//   ICT Use in Education   → ICT_use.px          (3 metrics × 7 levels × 5 years)
//   Smart Classrooms       → smart.px            (3 metrics × 6 levels × 2 years)
//   Primary Books          → Primary.px          (2 units × 6 subjects × 4 years)
//   Lower Secondary Books  → lower_secondary.px  (2 units × 12 subjects × 4 years)
// ============================================================

const BASE =
  'https://pxweb.statistics.gov.rw/api/v1/en/NISR%20Statistical%20Databases/Education';

export const NISR_ENDPOINTS = {
  schools:        `${BASE}/School%20Infrastructure/Edu_numb_scho.px`,
  ict_use:        `${BASE}/ICT%2C%20Science%20and%20Technology/ICT_use.px`,
  smart:          `${BASE}/ICT%2C%20Science%20and%20Technology/smart.px`,
  primary_books:  `${BASE}/Books%20And%20Textbooks/Primary.px`,
  secondary_books:`${BASE}/Books%20And%20Textbooks/lower_secondary.px`,
};

// ── Raw json-stat2 type ──────────────────────────────────────
interface JsonStat2 {
  label: string;
  source: string;
  updated: string;
  id: string[];
  size: number[];
  dimension: Record<string, {
    label: string;
    category: {
      index: Record<string, number>;
      label: Record<string, string>;
    };
  }>;
  value: (number | null)[];
  status?: Record<string, string>;
}

// ── Fetch helper (server-side, 1h cache) ─────────────────────
async function fetchPx(url: string): Promise<JsonStat2> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: [], response: { format: 'json-stat2' } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NISR API ${res.status}: ${url}`);
  return res.json();
}

// ── Row-major flat index getter ───────────────────────────────
function get(data: JsonStat2, indices: number[]): number | null {
  const strides = data.size.map((_, i) =>
    data.size.slice(i + 1).reduce((a, b) => a * b, 1)
  );
  const idx = indices.reduce((acc, v, i) => acc + v * strides[i], 0);
  if (data.status?.[String(idx)] === '..') return null;
  const v = data.value[idx];
  return v === undefined ? null : v;
}

// ──────────────────────────────────────────────────────────────
// OUTPUT TYPES
// ──────────────────────────────────────────────────────────────

export interface SchoolCountRow {
  level: string;
  counts: { year: string; value: number | null }[];
  latest: number | null;
}

export interface IctRow {
  year: string;
  schoolsUsingICT: number | null;
  schoolsNotUsingICT: number | null;
  percentUsingICT: number | null;
}

export interface IctByLevel {
  level: string;
  series: { year: string; schoolsUsingICT: number | null }[];
  latest: number | null;
}

export interface SmartRow {
  year: string;
  withSmart: number | null;
  withoutSmart: number | null;
  percentSmart: number | null;
}

export interface SmartByLevel {
  level: string;
  series: { year: string; withSmart: number | null; withoutSmart: number | null }[];
  latest: number | null;
}

export interface BookSubject {
  subject: string;
  data: { year: string; books: number | null; ratioPerStudent: number | null }[];
  latestBooks: number | null;
  latestRatio: number | null;
}

export interface NisrEducationData {
  schools: {
    title: string; updatedAt: string; years: string[];
    byLevel: SchoolCountRow[];
    totalLatest: number | null;
    totalLatestYear: string;
  };
  ictUse: {
    title: string; updatedAt: string; years: string[];
    trend: IctRow[];
    byLevel: IctByLevel[];
    latestPct: number | null;
    latestYear: string;
    yoyChange: number | null;
  };
  smartClassrooms: {
    title: string; updatedAt: string; years: string[];
    trend: SmartRow[];
    byLevel: SmartByLevel[];
    latestPct: number | null;
    latestYear: string;
  };
  primaryBooks: {
    title: string; updatedAt: string; years: string[];
    bySubject: BookSubject[];
    avgRatioLatest: number | null;
    latestYear: string;
  };
  secondaryBooks: {
    title: string; updatedAt: string; years: string[];
    bySubject: BookSubject[];
    avgRatioLatest: number | null;
    latestYear: string;
  };
  fetchedAt: string;
}

// ──────────────────────────────────────────────────────────────
// PARSERS
// ──────────────────────────────────────────────────────────────

// ── 1. Schools Infrastructure — Edu_numb_scho.px ─────────────
// size=[8,5]: dim0=Level(8), dim1=Year(5)
function parseSchools(d: JsonStat2): NisrEducationData['schools'] {
  const years = Object.values(d.dimension['Year'].category.label) as string[];
  const levelLabels = Object.values(d.dimension['Levels of education'].category.label) as string[];

  // Levels: 0=Overall, 1=Preprimary, 2=Primary, 3=Secondary, 4=TVET, 5=Polytechnics, 6=Higher Ed, 7=Adult Literacy
  const displayLevels = [1, 2, 3, 4, 5, 6, 7];

  const byLevel: SchoolCountRow[] = displayLevels.map((li) => {
    const counts = years.map((year, yi) => ({ year, value: get(d, [li, yi]) }));
    return {
      level: levelLabels[li],
      counts,
      latest: counts[counts.length - 1]?.value ?? null,
    };
  });

  return {
    title: d.label,
    updatedAt: d.updated,
    years,
    byLevel,
    totalLatest: get(d, [0, years.length - 1]),   // Overall, latest year
    totalLatestYear: years[years.length - 1],
  };
}

// ── 2. ICT Use — ICT_use.px ───────────────────────────────────
// size=[3,7,5]: dim0=metric(3), dim1=level(7), dim2=year(5)
// m=0: schools using ICT; m=1: schools NOT using; m=2: % (placeholder)
// l=0: Overall using; l=1: Preprimary; l=2: Primary; l=3: Secondary; l=4: TVET
// l=5: Overall NOT using; l=6: % overall (unreliable)
function parseIctUse(d: JsonStat2): NisrEducationData['ictUse'] {
  const years = Object.values(d.dimension['Year'].category.label) as string[];

  const trend: IctRow[] = years.map((year, yi) => {
    const using    = get(d, [0, 0, yi]);
    const notUsing = get(d, [1, 5, yi]);
    const pct = using !== null && notUsing !== null && (using + notUsing) > 0
      ? Math.round((using / (using + notUsing)) * 1000) / 10
      : null;
    return { year, schoolsUsingICT: using, schoolsNotUsingICT: notUsing, percentUsingICT: pct };
  });

  const levelMap = [
    { li: 2, label: 'Primary' },
    { li: 3, label: 'Secondary' },
    { li: 4, label: 'TVET' },
    { li: 1, label: 'Pre-primary' },
  ];

  const byLevel: IctByLevel[] = levelMap.map(({ li, label }) => {
    const series = years.map((year, yi) => ({
      year,
      schoolsUsingICT: get(d, [0, li, yi]),
    }));
    return { level: label, series, latest: series[series.length - 1]?.schoolsUsingICT ?? null };
  });

  const last  = trend[trend.length - 1];
  const prev  = trend[trend.length - 2];
  const yoy   = last?.percentUsingICT !== null && prev?.percentUsingICT !== null
    ? Math.round((last!.percentUsingICT! - prev!.percentUsingICT!) * 10) / 10
    : null;

  return {
    title: d.label, updatedAt: d.updated, years, trend, byLevel,
    latestPct: last?.percentUsingICT ?? null,
    latestYear: years[years.length - 1],
    yoyChange: yoy,
  };
}

// ── 3. Smart Classrooms — smart.px ───────────────────────────
// size=[3,6,2]: dim0=metric(3), dim1=level(6), dim2=year(2)
// m=0: with smart; m=1: without; l=0: Overall with; l=1: Primary; l=2: Secondary; l=3: TVET; l=4: Overall without
function parseSmart(d: JsonStat2): NisrEducationData['smartClassrooms'] {
  const years = Object.values(d.dimension['Year'].category.label) as string[];

  const trend: SmartRow[] = years.map((year, yi) => {
    const w  = get(d, [0, 0, yi]);
    const wo = get(d, [1, 4, yi]);
    const pct = w !== null && wo !== null && (w + wo) > 0
      ? Math.round((w / (w + wo)) * 1000) / 10
      : null;
    return { year, withSmart: w, withoutSmart: wo, percentSmart: pct };
  });

  const levelMap = [
    { li: 1, label: 'Primary' },
    { li: 2, label: 'Secondary' },
    { li: 3, label: 'TVET' },
  ];

  const byLevel: SmartByLevel[] = levelMap.map(({ li, label }) => {
    const series = years.map((year, yi) => ({
      year,
      withSmart:    get(d, [0, li, yi]),
      withoutSmart: get(d, [1, li, yi]),
    }));
    return { level: label, series, latest: series[series.length - 1]?.withSmart ?? null };
  });

  const last = trend[trend.length - 1];
  return {
    title: d.label, updatedAt: d.updated, years, trend, byLevel,
    latestPct: last?.percentSmart ?? null,
    latestYear: years[years.length - 1],
  };
}

// ── 4. Books helper (shared for Primary + Secondary) ──────────
// Primary   size=[2,6,4]:  dim0=unit(2), dim1=subject(6),  dim2=year(4)
// Secondary size=[2,12,4]: dim0=unit(2), dim1=subject(12), dim2=year(4)
// unit=0: Number of books; unit=1: Average ratio per level
// Last subject in each = "Average ratio per level" — treat separately
function parseBooks(
  d: JsonStat2,
  subjectDim: string
): Pick<NisrEducationData['primaryBooks'], 'title'|'updatedAt'|'years'|'bySubject'|'avgRatioLatest'|'latestYear'> {
  const years    = Object.values(d.dimension['Year'].category.label) as string[];
  const subjects = Object.values(d.dimension[subjectDim].category.label) as string[];
  const nSubj    = subjects.length;

  const bySubject: BookSubject[] = [];

  for (let si = 0; si < nSubj; si++) {
    const label = subjects[si];
    const data = years.map((year, yi) => ({
      year,
      books:           get(d, [0, si, yi]),   // unit=0: count
      ratioPerStudent: get(d, [1, si, yi]),   // unit=1: ratio
    }));
    bySubject.push({
      subject:      label,
      data,
      latestBooks:  data[data.length - 1]?.books ?? null,
      latestRatio:  data[data.length - 1]?.ratioPerStudent ?? null,
    });
  }

  // Overall average ratio = last subject (index nSubj-1, unit=1)
  const avgRatioLatest = get(d, [1, nSubj - 1, years.length - 1]);

  return {
    title: d.label, updatedAt: d.updated, years, bySubject,
    avgRatioLatest,
    latestYear: years[years.length - 1],
  };
}

// ──────────────────────────────────────────────────────────────
// MAIN EXPORT
// ──────────────────────────────────────────────────────────────
export async function fetchEducationData(): Promise<NisrEducationData> {
  const [schoolsRaw, ictRaw, smartRaw, primaryRaw, secondaryRaw] = await Promise.all([
    fetchPx(NISR_ENDPOINTS.schools),
    fetchPx(NISR_ENDPOINTS.ict_use),
    fetchPx(NISR_ENDPOINTS.smart),
    fetchPx(NISR_ENDPOINTS.primary_books),
    fetchPx(NISR_ENDPOINTS.secondary_books),
  ]);

  return {
    schools:        parseSchools(schoolsRaw),
    ictUse:         parseIctUse(ictRaw),
    smartClassrooms: parseSmart(smartRaw),
    primaryBooks:   parseBooks(primaryRaw,   'Subject') as NisrEducationData['primaryBooks'],
    secondaryBooks: parseBooks(secondaryRaw, 'Subjects') as NisrEducationData['secondaryBooks'],
    fetchedAt:      new Date().toISOString(),
  };
}

// ── Derived helpers ───────────────────────────────────────────
export function totalSchools(d: NisrEducationData): number | null {
  return d.schools.totalLatest;
}
export function schoolsUsingICT(d: NisrEducationData): number | null {
  return d.ictUse.trend[d.ictUse.trend.length - 1]?.schoolsUsingICT ?? null;
}
export function schoolsWithoutICT(d: NisrEducationData): number | null {
  return d.ictUse.trend[d.ictUse.trend.length - 1]?.schoolsNotUsingICT ?? null;
}
export function smartSchoolsCount(d: NisrEducationData): number | null {
  return d.smartClassrooms.trend[d.smartClassrooms.trend.length - 1]?.withSmart ?? null;
}
export function primaryAvgRatio(d: NisrEducationData): number | null {
  return d.primaryBooks.avgRatioLatest;
}
export function secondaryAvgRatio(d: NisrEducationData): number | null {
  return d.secondaryBooks.avgRatioLatest;
}
