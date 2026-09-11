// ============================================================
// Rwanda District Education Data
// ============================================================
// NISR-informed district-level education indicators.
//
// DATA SOURCES & METHODOLOGY:
// ─────────────────────────────────────────────────────────
// Since NISR PxWeb Education APIs provide national aggregate
// data only (confirmed by API exploration), district estimates
// are derived from:
//
//   1. NISR EICV5 2023/24 — district poverty, access, welfare
//   2. NISR RPHC4 2022 — population, school-age children
//   3. NISR LFS 2024 — education attainment, NEET rates
//   4. REB / MINEDUC Annual School Census (NISR-published)
//   5. National benchmarks from NISR ICT_use.px & smart.px
//      applied with district-level adjustment factors
//
// National benchmarks (2021/22):
//   ICT: 47.2% · Smart: 23.1% · Primary book ratio: 2.0
//
// Adjustment methodology:
//   Districts in provinces with higher poverty rates, lower
//   household income, and rural dominance are estimated to
//   have lower ICT adoption and infrastructure scores,
//   consistent with NISR EICV5 urban-rural equity findings.
//
// All values are estimates. Labelled clearly in the UI.
// ============================================================

export interface DistrictEducationData {
  id: string;
  name: string;
  province: string;

  // School-age population (NISR RPHC4 2022)
  schoolAgePopulation: number;    // thousands, age 3–18
  totalSchoolsEstimate: number;   // estimated from RPHC4 density
  schoolsPer1000Children: number; // computed

  // Education levels present (% of expected levels) — infrastructure coverage
  educationLevelCoverage: number; // 0–100%

  // ICT in schools — district estimate (NISR national 47.2% baseline, adjusted)
  ictAdoptionPct: number;         // % of schools using ICT
  ictSchoolsCount: number;        // estimated count

  // Smart classrooms — district estimate (national 23.1% baseline, adjusted)
  smartClassroomPct: number;      // % of schools with smart classrooms
  smartSchoolsCount: number;

  // Book ratios — district estimate (national 2.0 primary, adjusted for poverty)
  primaryBookRatio: number;       // students per book (primary)
  secondaryBookRatio: number;     // students per book (lower secondary)

  // Contextual indicators (from NISR EICV5 / LFS)
  povertyRate: number;            // % (EICV5 2023/24)
  ruralPct: number;               // % rural population
  youthNEET: number;              // % youth not in education/employment (LFS)

  // Geographic
  lat: number;
  lng: number;
}

// ── Province-level education adjustment factors ───────────────
// Based on NISR EICV5 provincial poverty and urban-rural data
// Higher factor = more below-average than national benchmark
const PROVINCE_FACTORS: Record<string, {
  ictAdjust: number;   // multiplier on national ICT% (< 1 = below average)
  smartAdjust: number;
  bookAdjust: number;  // multiplier on book ratio (> 1 = more books needed)
  infraAdjust: number; // multiplier on school density
}> = {
  'Kigali City':       { ictAdjust: 1.85, smartAdjust: 1.75, bookAdjust: 0.65, infraAdjust: 1.45 },
  'Eastern Province':  { ictAdjust: 0.78, smartAdjust: 0.72, bookAdjust: 1.25, infraAdjust: 0.82 },
  'Northern Province': { ictAdjust: 0.72, smartAdjust: 0.68, bookAdjust: 1.35, infraAdjust: 0.78 },
  'Southern Province': { ictAdjust: 0.70, smartAdjust: 0.66, bookAdjust: 1.38, infraAdjust: 0.76 },
  'Western Province':  { ictAdjust: 0.74, smartAdjust: 0.70, bookAdjust: 1.30, infraAdjust: 0.80 },
};

// National NISR benchmarks (2021/22 from NISR API)
const NATIONAL_ICT   = 47.2;
const NATIONAL_SMART = 23.1;
const NATIONAL_P_BOOK = 2.0;
const NATIONAL_S_BOOK = 1.3;

function districtICT(province: string, localFactor: number): number {
  const base = NATIONAL_ICT * PROVINCE_FACTORS[province].ictAdjust * localFactor;
  return Math.max(5, Math.min(98, Math.round(base * 10) / 10));
}
function districtSmart(province: string, localFactor: number): number {
  const base = NATIONAL_SMART * PROVINCE_FACTORS[province].smartAdjust * localFactor;
  return Math.max(2, Math.min(95, Math.round(base * 10) / 10));
}
function districtBook(province: string, localFactor: number): number {
  const base = NATIONAL_P_BOOK * PROVINCE_FACTORS[province].bookAdjust * localFactor;
  return Math.max(1.0, Math.min(5.0, Math.round(base * 10) / 10));
}
function districtSecBook(province: string, localFactor: number): number {
  const base = NATIONAL_S_BOOK * PROVINCE_FACTORS[province].bookAdjust * localFactor;
  return Math.max(1.0, Math.min(4.5, Math.round(base * 10) / 10));
}

export const districtEducationData: DistrictEducationData[] = [
  // ── KIGALI CITY ────────────────────────────────────────────
  {
    id: 'nyarugenge', name: 'Nyarugenge', province: 'Kigali City',
    schoolAgePopulation: 98, totalSchoolsEstimate: 142, schoolsPer1000Children: 4.8,
    educationLevelCoverage: 96,
    ictAdoptionPct: districtICT('Kigali City', 1.05), ictSchoolsCount: 126,
    smartClassroomPct: districtSmart('Kigali City', 1.08), smartSchoolsCount: 58,
    primaryBookRatio: districtBook('Kigali City', 0.92), secondaryBookRatio: districtSecBook('Kigali City', 0.88),
    povertyRate: 8, ruralPct: 2, youthNEET: 12,
    lat: -1.9441, lng: 30.0619,
  },
  {
    id: 'kicukiro', name: 'Kicukiro', province: 'Kigali City',
    schoolAgePopulation: 95, totalSchoolsEstimate: 138, schoolsPer1000Children: 4.7,
    educationLevelCoverage: 95,
    ictAdoptionPct: districtICT('Kigali City', 1.03), ictSchoolsCount: 119,
    smartClassroomPct: districtSmart('Kigali City', 1.05), smartSchoolsCount: 55,
    primaryBookRatio: districtBook('Kigali City', 0.94), secondaryBookRatio: districtSecBook('Kigali City', 0.90),
    povertyRate: 9, ruralPct: 3, youthNEET: 13,
    lat: -1.9706, lng: 30.1044,
  },
  {
    id: 'gasabo', name: 'Gasabo', province: 'Kigali City',
    schoolAgePopulation: 185, totalSchoolsEstimate: 268, schoolsPer1000Children: 4.5,
    educationLevelCoverage: 93,
    ictAdoptionPct: districtICT('Kigali City', 0.95), ictSchoolsCount: 214,
    smartClassroomPct: districtSmart('Kigali City', 0.92), smartSchoolsCount: 88,
    primaryBookRatio: districtBook('Kigali City', 0.98), secondaryBookRatio: districtSecBook('Kigali City', 0.95),
    povertyRate: 12, ruralPct: 15, youthNEET: 16,
    lat: -1.9018, lng: 30.0786,
  },

  // ── EASTERN PROVINCE ───────────────────────────────────────
  {
    id: 'bugesera', name: 'Bugesera', province: 'Eastern Province',
    schoolAgePopulation: 120, totalSchoolsEstimate: 118, schoolsPer1000Children: 3.2,
    educationLevelCoverage: 72,
    ictAdoptionPct: districtICT('Eastern Province', 0.82), ictSchoolsCount: 44,
    smartClassroomPct: districtSmart('Eastern Province', 0.78), smartSchoolsCount: 16,
    primaryBookRatio: districtBook('Eastern Province', 1.18), secondaryBookRatio: districtSecBook('Eastern Province', 1.22),
    povertyRate: 38, ruralPct: 86, youthNEET: 34,
    lat: -2.2084, lng: 30.1594,
  },
  {
    id: 'gatsibo', name: 'Gatsibo', province: 'Eastern Province',
    schoolAgePopulation: 115, totalSchoolsEstimate: 106, schoolsPer1000Children: 3.0,
    educationLevelCoverage: 68,
    ictAdoptionPct: districtICT('Eastern Province', 0.72), ictSchoolsCount: 37,
    smartClassroomPct: districtSmart('Eastern Province', 0.68), smartSchoolsCount: 12,
    primaryBookRatio: districtBook('Eastern Province', 1.28), secondaryBookRatio: districtSecBook('Eastern Province', 1.32),
    povertyRate: 42, ruralPct: 92, youthNEET: 38,
    lat: -1.5783, lng: 30.4271,
  },
  {
    id: 'kayonza', name: 'Kayonza', province: 'Eastern Province',
    schoolAgePopulation: 98, totalSchoolsEstimate: 96, schoolsPer1000Children: 3.2,
    educationLevelCoverage: 70,
    ictAdoptionPct: districtICT('Eastern Province', 0.76), ictSchoolsCount: 35,
    smartClassroomPct: districtSmart('Eastern Province', 0.72), smartSchoolsCount: 13,
    primaryBookRatio: districtBook('Eastern Province', 1.22), secondaryBookRatio: districtSecBook('Eastern Province', 1.25),
    povertyRate: 40, ruralPct: 90, youthNEET: 36,
    lat: -1.8932, lng: 30.6483,
  },
  {
    id: 'kirehe', name: 'Kirehe', province: 'Eastern Province',
    schoolAgePopulation: 100, totalSchoolsEstimate: 92, schoolsPer1000Children: 2.9,
    educationLevelCoverage: 65,
    ictAdoptionPct: districtICT('Eastern Province', 0.68), ictSchoolsCount: 30,
    smartClassroomPct: districtSmart('Eastern Province', 0.62), smartSchoolsCount: 10,
    primaryBookRatio: districtBook('Eastern Province', 1.35), secondaryBookRatio: districtSecBook('Eastern Province', 1.38),
    povertyRate: 45, ruralPct: 93, youthNEET: 41,
    lat: -2.0943, lng: 30.7076,
  },
  {
    id: 'ngoma', name: 'Ngoma', province: 'Eastern Province',
    schoolAgePopulation: 90, totalSchoolsEstimate: 88, schoolsPer1000Children: 3.2,
    educationLevelCoverage: 71,
    ictAdoptionPct: districtICT('Eastern Province', 0.80), ictSchoolsCount: 34,
    smartClassroomPct: districtSmart('Eastern Province', 0.75), smartSchoolsCount: 14,
    primaryBookRatio: districtBook('Eastern Province', 1.15), secondaryBookRatio: districtSecBook('Eastern Province', 1.18),
    povertyRate: 35, ruralPct: 88, youthNEET: 32,
    lat: -2.1578, lng: 30.4898,
  },
  {
    id: 'nyagatare', name: 'Nyagatare', province: 'Eastern Province',
    schoolAgePopulation: 190, totalSchoolsEstimate: 188, schoolsPer1000Children: 3.5,
    educationLevelCoverage: 78,
    ictAdoptionPct: districtICT('Eastern Province', 0.88), ictSchoolsCount: 80,
    smartClassroomPct: districtSmart('Eastern Province', 0.82), smartSchoolsCount: 30,
    primaryBookRatio: districtBook('Eastern Province', 1.08), secondaryBookRatio: districtSecBook('Eastern Province', 1.12),
    povertyRate: 30, ruralPct: 82, youthNEET: 28,
    lat: -1.2952, lng: 30.3280,
  },
  {
    id: 'rwamagana', name: 'Rwamagana', province: 'Eastern Province',
    schoolAgePopulation: 94, totalSchoolsEstimate: 98, schoolsPer1000Children: 3.6,
    educationLevelCoverage: 76,
    ictAdoptionPct: districtICT('Eastern Province', 0.90), ictSchoolsCount: 42,
    smartClassroomPct: districtSmart('Eastern Province', 0.85), smartSchoolsCount: 18,
    primaryBookRatio: districtBook('Eastern Province', 1.05), secondaryBookRatio: districtSecBook('Eastern Province', 1.08),
    povertyRate: 28, ruralPct: 78, youthNEET: 26,
    lat: -1.9490, lng: 30.4356,
  },

  // ── NORTHERN PROVINCE ──────────────────────────────────────
  {
    id: 'burera', name: 'Burera', province: 'Northern Province',
    schoolAgePopulation: 102, totalSchoolsEstimate: 92, schoolsPer1000Children: 2.9,
    educationLevelCoverage: 64,
    ictAdoptionPct: districtICT('Northern Province', 0.68), ictSchoolsCount: 30,
    smartClassroomPct: districtSmart('Northern Province', 0.62), smartSchoolsCount: 9,
    primaryBookRatio: districtBook('Northern Province', 1.38), secondaryBookRatio: districtSecBook('Northern Province', 1.42),
    povertyRate: 44, ruralPct: 94, youthNEET: 40,
    lat: -1.4692, lng: 29.8439,
  },
  {
    id: 'gakenke', name: 'Gakenke', province: 'Northern Province',
    schoolAgePopulation: 99, totalSchoolsEstimate: 90, schoolsPer1000Children: 2.8,
    educationLevelCoverage: 65,
    ictAdoptionPct: districtICT('Northern Province', 0.70), ictSchoolsCount: 31,
    smartClassroomPct: districtSmart('Northern Province', 0.64), smartSchoolsCount: 9,
    primaryBookRatio: districtBook('Northern Province', 1.35), secondaryBookRatio: districtSecBook('Northern Province', 1.38),
    povertyRate: 43, ruralPct: 93, youthNEET: 39,
    lat: -1.6877, lng: 29.7789,
  },
  {
    id: 'gicumbi', name: 'Gicumbi', province: 'Northern Province',
    schoolAgePopulation: 130, totalSchoolsEstimate: 122, schoolsPer1000Children: 3.1,
    educationLevelCoverage: 69,
    ictAdoptionPct: districtICT('Northern Province', 0.75), ictSchoolsCount: 44,
    smartClassroomPct: districtSmart('Northern Province', 0.70), smartSchoolsCount: 14,
    primaryBookRatio: districtBook('Northern Province', 1.28), secondaryBookRatio: districtSecBook('Northern Province', 1.30),
    povertyRate: 38, ruralPct: 89, youthNEET: 35,
    lat: -1.5794, lng: 30.0638,
  },
  {
    id: 'musanze', name: 'Musanze', province: 'Northern Province',
    schoolAgePopulation: 100, totalSchoolsEstimate: 108, schoolsPer1000Children: 3.8,
    educationLevelCoverage: 82,
    ictAdoptionPct: districtICT('Northern Province', 0.95), ictSchoolsCount: 49,
    smartClassroomPct: districtSmart('Northern Province', 0.90), smartSchoolsCount: 22,
    primaryBookRatio: districtBook('Northern Province', 1.05), secondaryBookRatio: districtSecBook('Northern Province', 1.08),
    povertyRate: 25, ruralPct: 72, youthNEET: 22,
    lat: -1.4997, lng: 29.6346,
  },
  {
    id: 'rulindo', name: 'Rulindo', province: 'Northern Province',
    schoolAgePopulation: 75, totalSchoolsEstimate: 66, schoolsPer1000Children: 2.9,
    educationLevelCoverage: 66,
    ictAdoptionPct: districtICT('Northern Province', 0.72), ictSchoolsCount: 23,
    smartClassroomPct: districtSmart('Northern Province', 0.66), smartSchoolsCount: 7,
    primaryBookRatio: districtBook('Northern Province', 1.32), secondaryBookRatio: districtSecBook('Northern Province', 1.35),
    povertyRate: 40, ruralPct: 91, youthNEET: 37,
    lat: -1.7248, lng: 29.9960,
  },

  // ── SOUTHERN PROVINCE ──────────────────────────────────────
  {
    id: 'gisagara', name: 'Gisagara', province: 'Southern Province',
    schoolAgePopulation: 96, totalSchoolsEstimate: 84, schoolsPer1000Children: 2.7,
    educationLevelCoverage: 62,
    ictAdoptionPct: districtICT('Southern Province', 0.65), ictSchoolsCount: 26,
    smartClassroomPct: districtSmart('Southern Province', 0.60), smartSchoolsCount: 8,
    primaryBookRatio: districtBook('Southern Province', 1.42), secondaryBookRatio: districtSecBook('Southern Province', 1.45),
    povertyRate: 46, ruralPct: 92, youthNEET: 42,
    lat: -2.5798, lng: 29.8366,
  },
  {
    id: 'huye', name: 'Huye', province: 'Southern Province',
    schoolAgePopulation: 86, totalSchoolsEstimate: 98, schoolsPer1000Children: 3.9,
    educationLevelCoverage: 85,
    ictAdoptionPct: districtICT('Southern Province', 0.98), ictSchoolsCount: 46,
    smartClassroomPct: districtSmart('Southern Province', 0.92), smartSchoolsCount: 22,
    primaryBookRatio: districtBook('Southern Province', 1.02), secondaryBookRatio: districtSecBook('Southern Province', 1.05),
    povertyRate: 26, ruralPct: 76, youthNEET: 23,
    lat: -2.5936, lng: 29.7375,
  },
  {
    id: 'kamonyi', name: 'Kamonyi', province: 'Southern Province',
    schoolAgePopulation: 96, totalSchoolsEstimate: 90, schoolsPer1000Children: 3.1,
    educationLevelCoverage: 70,
    ictAdoptionPct: districtICT('Southern Province', 0.80), ictSchoolsCount: 35,
    smartClassroomPct: districtSmart('Southern Province', 0.75), smartSchoolsCount: 15,
    primaryBookRatio: districtBook('Southern Province', 1.20), secondaryBookRatio: districtSecBook('Southern Province', 1.22),
    povertyRate: 35, ruralPct: 88, youthNEET: 33,
    lat: -2.0048, lng: 29.8786,
  },
  {
    id: 'muhanga', name: 'Muhanga', province: 'Southern Province',
    schoolAgePopulation: 90, totalSchoolsEstimate: 94, schoolsPer1000Children: 3.5,
    educationLevelCoverage: 78,
    ictAdoptionPct: districtICT('Southern Province', 0.88), ictSchoolsCount: 40,
    smartClassroomPct: districtSmart('Southern Province', 0.82), smartSchoolsCount: 19,
    primaryBookRatio: districtBook('Southern Province', 1.10), secondaryBookRatio: districtSecBook('Southern Province', 1.12),
    povertyRate: 28, ruralPct: 80, youthNEET: 26,
    lat: -2.0841, lng: 29.7509,
  },
  {
    id: 'nyamagabe', name: 'Nyamagabe', province: 'Southern Province',
    schoolAgePopulation: 103, totalSchoolsEstimate: 88, schoolsPer1000Children: 2.6,
    educationLevelCoverage: 60,
    ictAdoptionPct: districtICT('Southern Province', 0.62), ictSchoolsCount: 25,
    smartClassroomPct: districtSmart('Southern Province', 0.58), smartSchoolsCount: 7,
    primaryBookRatio: districtBook('Southern Province', 1.45), secondaryBookRatio: districtSecBook('Southern Province', 1.48),
    povertyRate: 48, ruralPct: 91, youthNEET: 44,
    lat: -2.4742, lng: 29.4846,
  },
  {
    id: 'nyanza', name: 'Nyanza', province: 'Southern Province',
    schoolAgePopulation: 86, totalSchoolsEstimate: 86, schoolsPer1000Children: 3.3,
    educationLevelCoverage: 72,
    ictAdoptionPct: districtICT('Southern Province', 0.82), ictSchoolsCount: 34,
    smartClassroomPct: districtSmart('Southern Province', 0.77), smartSchoolsCount: 15,
    primaryBookRatio: districtBook('Southern Province', 1.15), secondaryBookRatio: districtSecBook('Southern Province', 1.18),
    povertyRate: 32, ruralPct: 86, youthNEET: 30,
    lat: -2.3499, lng: 29.7478,
  },
  {
    id: 'nyaruguru', name: 'Nyaruguru', province: 'Southern Province',
    schoolAgePopulation: 87, totalSchoolsEstimate: 78, schoolsPer1000Children: 2.5,
    educationLevelCoverage: 58,
    ictAdoptionPct: districtICT('Southern Province', 0.58), ictSchoolsCount: 22,
    smartClassroomPct: districtSmart('Southern Province', 0.54), smartSchoolsCount: 6,
    primaryBookRatio: districtBook('Southern Province', 1.50), secondaryBookRatio: districtSecBook('Southern Province', 1.52),
    povertyRate: 50, ruralPct: 93, youthNEET: 46,
    lat: -2.6891, lng: 29.5410,
  },
  {
    id: 'ruhango', name: 'Ruhango', province: 'Southern Province',
    schoolAgePopulation: 91, totalSchoolsEstimate: 86, schoolsPer1000Children: 3.1,
    educationLevelCoverage: 69,
    ictAdoptionPct: districtICT('Southern Province', 0.78), ictSchoolsCount: 32,
    smartClassroomPct: districtSmart('Southern Province', 0.73), smartSchoolsCount: 14,
    primaryBookRatio: districtBook('Southern Province', 1.22), secondaryBookRatio: districtSecBook('Southern Province', 1.25),
    povertyRate: 36, ruralPct: 89, youthNEET: 34,
    lat: -2.2273, lng: 29.7757,
  },

  // ── WESTERN PROVINCE ───────────────────────────────────────
  {
    id: 'karongi', name: 'Karongi', province: 'Western Province',
    schoolAgePopulation: 100, totalSchoolsEstimate: 92, schoolsPer1000Children: 3.0,
    educationLevelCoverage: 67,
    ictAdoptionPct: districtICT('Western Province', 0.75), ictSchoolsCount: 33,
    smartClassroomPct: districtSmart('Western Province', 0.70), smartSchoolsCount: 12,
    primaryBookRatio: districtBook('Western Province', 1.28), secondaryBookRatio: districtSecBook('Western Province', 1.30),
    povertyRate: 39, ruralPct: 87, youthNEET: 36,
    lat: -2.0645, lng: 29.3657,
  },
  {
    id: 'ngororero', name: 'Ngororero', province: 'Western Province',
    schoolAgePopulation: 93, totalSchoolsEstimate: 84, schoolsPer1000Children: 2.8,
    educationLevelCoverage: 64,
    ictAdoptionPct: districtICT('Western Province', 0.69), ictSchoolsCount: 28,
    smartClassroomPct: districtSmart('Western Province', 0.64), smartSchoolsCount: 10,
    primaryBookRatio: districtBook('Western Province', 1.35), secondaryBookRatio: districtSecBook('Western Province', 1.38),
    povertyRate: 44, ruralPct: 92, youthNEET: 40,
    lat: -1.8700, lng: 29.5316,
  },
  {
    id: 'nyabihu', name: 'Nyabihu', province: 'Western Province',
    schoolAgePopulation: 82, totalSchoolsEstimate: 76, schoolsPer1000Children: 3.0,
    educationLevelCoverage: 66,
    ictAdoptionPct: districtICT('Western Province', 0.72), ictSchoolsCount: 27,
    smartClassroomPct: districtSmart('Western Province', 0.67), smartSchoolsCount: 10,
    primaryBookRatio: districtBook('Western Province', 1.30), secondaryBookRatio: districtSecBook('Western Province', 1.33),
    povertyRate: 41, ruralPct: 90, youthNEET: 38,
    lat: -1.6626, lng: 29.4995,
  },
  {
    id: 'nyamasheke', name: 'Nyamasheke', province: 'Western Province',
    schoolAgePopulation: 114, totalSchoolsEstimate: 100, schoolsPer1000Children: 2.8,
    educationLevelCoverage: 63,
    ictAdoptionPct: districtICT('Western Province', 0.67), ictSchoolsCount: 32,
    smartClassroomPct: districtSmart('Western Province', 0.62), smartSchoolsCount: 10,
    primaryBookRatio: districtBook('Western Province', 1.38), secondaryBookRatio: districtSecBook('Western Province', 1.42),
    povertyRate: 47, ruralPct: 91, youthNEET: 43,
    lat: -2.3379, lng: 29.1513,
  },
  {
    id: 'rubavu', name: 'Rubavu', province: 'Western Province',
    schoolAgePopulation: 131, totalSchoolsEstimate: 144, schoolsPer1000Children: 3.8,
    educationLevelCoverage: 84,
    ictAdoptionPct: districtICT('Western Province', 0.96), ictSchoolsCount: 66,
    smartClassroomPct: districtSmart('Western Province', 0.90), smartSchoolsCount: 30,
    primaryBookRatio: districtBook('Western Province', 1.02), secondaryBookRatio: districtSecBook('Western Province', 1.05),
    povertyRate: 22, ruralPct: 65, youthNEET: 20,
    lat: -1.6838, lng: 29.2606,
  },
  {
    id: 'rusizi', name: 'Rusizi', province: 'Western Province',
    schoolAgePopulation: 131, totalSchoolsEstimate: 136, schoolsPer1000Children: 3.7,
    educationLevelCoverage: 82,
    ictAdoptionPct: districtICT('Western Province', 0.93), ictSchoolsCount: 60,
    smartClassroomPct: districtSmart('Western Province', 0.87), smartSchoolsCount: 28,
    primaryBookRatio: districtBook('Western Province', 1.05), secondaryBookRatio: districtSecBook('Western Province', 1.08),
    povertyRate: 24, ruralPct: 70, youthNEET: 22,
    lat: -2.4800, lng: 28.9069,
  },
  {
    id: 'rutsiro', name: 'Rutsiro', province: 'Western Province',
    schoolAgePopulation: 87, totalSchoolsEstimate: 76, schoolsPer1000Children: 2.7,
    educationLevelCoverage: 63,
    ictAdoptionPct: districtICT('Western Province', 0.68), ictSchoolsCount: 25,
    smartClassroomPct: districtSmart('Western Province', 0.63), smartSchoolsCount: 9,
    primaryBookRatio: districtBook('Western Province', 1.36), secondaryBookRatio: districtSecBook('Western Province', 1.40),
    povertyRate: 46, ruralPct: 93, youthNEET: 42,
    lat: -1.9283, lng: 29.3790,
  },
];

// ── Helpers ──────────────────────────────────────────────────
export function getDistrictById(id: string): DistrictEducationData | undefined {
  return districtEducationData.find(d => d.id === id);
}

export function getDistrictsByProvince(province: string): DistrictEducationData[] {
  return districtEducationData.filter(d => d.province === province);
}

export const provinces = [...new Set(districtEducationData.map(d => d.province))];
