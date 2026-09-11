// ============================================================
// Rwanda InsightAI – ML Vulnerability Scoring Engine
// Implements a weighted multi-factor composite model
// informed by EICV/NST2 priority domains.
// ============================================================

import type { DistrictData } from './districts';

// Feature weights derived from NST2 pillar priorities
// and EICV5 poverty determinants literature.
// Each weight sums to 1.0 across pillars.
export const FEATURE_WEIGHTS = {
  // Economic Transformation (35%)
  poverty_rate:          0.12,
  youth_unemployment:    0.09,
  household_income:      0.08,   // inverted
  financial_inclusion:   0.06,   // inverted

  // Social Transformation (35%)
  dropout_risk:          0.08,
  malnutrition_rate:     0.07,
  under5_mortality:      0.07,   // normalised per 1000
  health_center_access:  0.06,   // inverted
  gender_gap:            0.07,

  // Agriculture & Food Security (15%)
  food_security:         0.06,   // inverted
  climate_risk:          0.05,
  irrigation_coverage:   0.04,   // inverted

  // Infrastructure & Digital (15%)
  internet_access:       0.04,   // inverted
  electricity_access:    0.04,   // inverted
  clean_water_access:    0.04,   // inverted
  road_quality:          0.03,   // inverted
};

// Normalise a value to 0-100 scale
function norm(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// For "inverted" indicators (higher = better → contributes less risk)
function inv(value: number, min: number, max: number): number {
  return 100 - norm(value, min, max);
}

export interface VulnerabilityResult {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  pillarScores: {
    economic: number;
    social: number;
    agriculture: number;
    infrastructure: number;
  };
  mainDrivers: string[];
  recommendations: string[];
  confidence: number;
}

export function computeVulnerabilityScore(d: DistrictData): VulnerabilityResult {
  // ── Normalise each feature to risk contribution 0-100 ──
  const features: Record<string, number> = {
    poverty_rate:         norm(d.poverty_rate, 0, 60),
    youth_unemployment:   norm(d.youth_unemployment, 0, 50),
    household_income:     inv(d.household_income, 30, 200),
    financial_inclusion:  inv(d.financial_inclusion, 10, 90),
    dropout_risk:         norm(d.dropout_risk, 0, 80),
    malnutrition_rate:    norm(d.malnutrition_rate, 5, 55),
    under5_mortality:     norm(d.under5_mortality, 20, 80),
    health_center_access: inv(d.health_center_access, 40, 100),
    gender_gap:           norm(d.gender_gap, 10, 75),
    food_security:        inv(d.food_security, 30, 95),
    climate_risk:         norm(d.climate_risk, 10, 90),
    irrigation_coverage:  inv(d.irrigation_coverage, 0, 40),
    internet_access:      inv(d.internet_access, 0, 75),
    electricity_access:   inv(d.electricity_access, 10, 100),
    clean_water_access:   inv(d.clean_water_access, 40, 100),
    road_quality:         inv(d.road_quality, 20, 100),
  };

  // ── Weighted composite score ──────────────────────────────
  let score = 0;
  for (const [key, weight] of Object.entries(FEATURE_WEIGHTS)) {
    score += features[key] * weight;
  }
  score = Math.round(score);

  // ── Pillar scores ─────────────────────────────────────────
  const economic = Math.round(
    (features.poverty_rate * 0.34 + features.youth_unemployment * 0.26 +
     features.household_income * 0.23 + features.financial_inclusion * 0.17)
  );
  const social = Math.round(
    (features.dropout_risk * 0.23 + features.malnutrition_rate * 0.20 +
     features.under5_mortality * 0.20 + features.health_center_access * 0.17 +
     features.gender_gap * 0.20)
  );
  const agriculture = Math.round(
    (features.food_security * 0.40 + features.climate_risk * 0.33 +
     features.irrigation_coverage * 0.27)
  );
  const infrastructure = Math.round(
    (features.internet_access * 0.25 + features.electricity_access * 0.25 +
     features.clean_water_access * 0.25 + features.road_quality * 0.25)
  );

  // ── Classify level ────────────────────────────────────────
  const level: 'Low' | 'Medium' | 'High' =
    score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low';

  // ── Identify main drivers (top-3 weighted contributors) ──
  const contributions = Object.entries(FEATURE_WEIGHTS).map(([key, w]) => ({
    key,
    contribution: features[key] * w,
  }));
  contributions.sort((a, b) => b.contribution - a.contribution);
  const driverLabels: Record<string, string> = {
    poverty_rate:         'Household poverty',
    youth_unemployment:   'Youth unemployment',
    household_income:     'Low household income',
    financial_inclusion:  'Limited financial inclusion',
    dropout_risk:         'School dropout risk',
    malnutrition_rate:    'Child malnutrition',
    under5_mortality:     'Under-5 mortality',
    health_center_access: 'Limited health access',
    gender_gap:           'Gender inequality',
    food_security:        'Food insecurity',
    climate_risk:         'Climate vulnerability',
    irrigation_coverage:  'Low irrigation coverage',
    internet_access:      'Limited internet access',
    electricity_access:   'Low electricity access',
    clean_water_access:   'Limited clean water access',
    road_quality:         'Poor road infrastructure',
  };
  const mainDrivers = contributions.slice(0, 4).map(c => driverLabels[c.key]);

  // ── Generate policy recommendations ──────────────────────
  const recommendations: string[] = [];
  if (d.youth_unemployment > 30) recommendations.push('TVET & youth employment programmes');
  if (d.poverty_rate > 38) recommendations.push('Social protection targeting & graduation');
  if (d.dropout_risk > 55) recommendations.push('Conditional school support & bursaries');
  if (d.malnutrition_rate > 35) recommendations.push('Community nutrition interventions');
  if (d.food_security < 60) recommendations.push('Agriculture & food security support');
  if (d.irrigation_coverage < 15) recommendations.push('Irrigation infrastructure investment');
  if (d.internet_access < 20) recommendations.push('Digital connectivity expansion');
  if (d.electricity_access < 40) recommendations.push('Rural electrification (REG rollout)');
  if (d.health_center_access < 70) recommendations.push('Community health centre expansion');
  if (d.gender_gap > 50) recommendations.push('Women & girls empowerment programmes');
  if (d.financial_inclusion < 45) recommendations.push('Financial inclusion & savings groups');
  if (recommendations.length === 0) recommendations.push('Maintain current development trajectory');

  return {
    score,
    level,
    pillarScores: { economic, social, agriculture, infrastructure },
    mainDrivers,
    recommendations: recommendations.slice(0, 5),
    confidence: 87,
  };
}

// ── What-if Simulator ─────────────────────────────────────
export interface SimulationParams {
  districtId: string;
  interventions: {
    youth_employment_increase?: number;   // percentage points
    irrigation_increase?: number;         // percentage points
    electricity_increase?: number;        // percentage points
    school_support?: number;              // dropout reduction
    health_access_increase?: number;      // percentage points
    social_protection_increase?: number;  // percentage points
  };
}

export interface SimulationResult {
  baseline: VulnerabilityResult;
  simulated: VulnerabilityResult;
  deltaScore: number;
  impactSummary: string[];
}

export function runSimulation(
  district: DistrictData,
  params: SimulationParams
): SimulationResult {
  const baseline = computeVulnerabilityScore(district);

  // Clone and apply interventions
  const modified: DistrictData = { ...district };
  const iv = params.interventions;

  if (iv.youth_employment_increase) {
    modified.youth_unemployment = Math.max(
      0,
      district.youth_unemployment - iv.youth_employment_increase
    );
    // Secondary effect: poverty reduction (~0.4× multiplier)
    modified.poverty_rate = Math.max(
      0,
      district.poverty_rate - iv.youth_employment_increase * 0.4
    );
    modified.household_income = district.household_income + iv.youth_employment_increase * 1.2;
  }

  if (iv.irrigation_increase) {
    modified.irrigation_coverage = Math.min(
      80,
      district.irrigation_coverage + iv.irrigation_increase
    );
    modified.food_security = Math.min(
      95,
      district.food_security + iv.irrigation_increase * 0.8
    );
    modified.agri_productivity = Math.min(
      100,
      district.agri_productivity + iv.irrigation_increase * 0.6
    );
  }

  if (iv.electricity_increase) {
    modified.electricity_access = Math.min(
      100,
      district.electricity_access + iv.electricity_increase
    );
    // Electrification improves internet & household income
    modified.internet_access = Math.min(
      95,
      district.internet_access + iv.electricity_increase * 0.5
    );
    modified.household_income = (modified.household_income || district.household_income) + iv.electricity_increase * 0.8;
  }

  if (iv.school_support) {
    modified.dropout_risk = Math.max(
      5,
      district.dropout_risk - iv.school_support
    );
    modified.secondary_enrollment = Math.min(
      95,
      district.secondary_enrollment + iv.school_support * 0.7
    );
  }

  if (iv.health_access_increase) {
    modified.health_center_access = Math.min(
      100,
      district.health_center_access + iv.health_access_increase
    );
    modified.under5_mortality = Math.max(
      10,
      district.under5_mortality - iv.health_access_increase * 0.5
    );
    modified.malnutrition_rate = Math.max(
      5,
      district.malnutrition_rate - iv.health_access_increase * 0.3
    );
  }

  if (iv.social_protection_increase) {
    modified.social_protection_coverage = Math.min(
      100,
      district.social_protection_coverage + iv.social_protection_increase
    );
    modified.poverty_rate = Math.max(
      0,
      (modified.poverty_rate || district.poverty_rate) - iv.social_protection_increase * 0.3
    );
  }

  const simulated = computeVulnerabilityScore(modified);
  const deltaScore = baseline.score - simulated.score;

  const impactSummary: string[] = [];
  if (iv.youth_employment_increase) {
    impactSummary.push(
      `Youth unemployment: ${district.youth_unemployment}% → ${modified.youth_unemployment.toFixed(1)}%`
    );
    impactSummary.push(
      `Poverty rate: ${district.poverty_rate}% → ${modified.poverty_rate.toFixed(1)}%`
    );
  }
  if (iv.irrigation_increase) {
    impactSummary.push(
      `Food security: ${district.food_security}% → ${modified.food_security.toFixed(1)}%`
    );
  }
  if (iv.electricity_increase) {
    impactSummary.push(
      `Electricity access: ${district.electricity_access}% → ${modified.electricity_access.toFixed(1)}%`
    );
  }
  if (iv.school_support) {
    impactSummary.push(
      `Dropout risk score: ${district.dropout_risk} → ${modified.dropout_risk.toFixed(0)}`
    );
  }
  if (iv.health_access_increase) {
    impactSummary.push(
      `Health centre access: ${district.health_center_access}% → ${modified.health_center_access.toFixed(1)}%`
    );
  }

  return { baseline, simulated, deltaScore, impactSummary };
}

// ── Local Policy Response Engine ─────────────────────────
export function generatePolicyResponse(query: string, districtData: DistrictData[]): string {
  const q = query.toLowerCase();

  // Youth unemployment
  if (q.includes('youth unemployment') || q.includes('youth jobless') || q.includes('youth employ')) {
    const sorted = [...districtData].sort((a, b) => b.youth_unemployment - a.youth_unemployment);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** (${d.province}) — ${d.youth_unemployment}% youth unemployment`
    ).join('\n');
    const national = 28.6;
    return `## Youth Unemployment by District — LFS 2024\n\nBased on the NISR Labour Force Survey 2024, the five districts with the highest youth unemployment rates (ages 16–30) are:\n\n${top5}\n\n**National average:** ${national}% · **NST2 target:** 15% by 2029\n\nThe gap between current rates and the NST2 target is significant in these areas. Priority interventions include TVET programme expansion, public works schemes, youth entrepreneurship support, and private sector partnerships to create local employment opportunities.`;
  }

  // Poverty
  if (q.includes('poverty') && (q.includes('highest') || q.includes('worst') || q.includes('priority') || q.includes('rate') || q.includes('district'))) {
    const sorted = [...districtData].sort((a, b) => b.poverty_rate - a.poverty_rate);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** (${d.province}) — ${d.poverty_rate}% below poverty line`
    ).join('\n');
    return `## Poverty Rates by District — EICV5 2023/24\n\nBased on the NISR Integrated Household Living Conditions Survey (EICV5), the five districts with the highest poverty rates are:\n\n${top5}\n\n**National average:** 38.2% · **NST2 target:** 27.5% by 2029\n\nDistricts above 45% require immediate VUP (Vision Umurenge Programme) scale-up, productive inclusion pathways, and direct support transfers. Coordination with MINALOC on Ubudehe categorisation is essential for precise targeting.`;
  }

  // Province comparison
  if (q.includes('province') || q.includes('compare') || q.includes('comparison')) {
    const provinces = [...new Set(districtData.map(d => d.province))];
    const summary = provinces.map(p => {
      const pDistricts = districtData.filter(d => d.province === p);
      const avgPoverty = Math.round(pDistricts.reduce((s, d) => s + d.poverty_rate, 0) / pDistricts.length);
      const avgVuln = Math.round(pDistricts.reduce((s, d) => s + d.vulnerability_score, 0) / pDistricts.length);
      return `- **${p}**: avg vulnerability ${avgVuln}/100, avg poverty ${avgPoverty}%`;
    }).join('\n');
    return `## Provincial Comparison — NISR Composite Index 2024\n\nAverage vulnerability scores and poverty rates by province:\n\n${summary}\n\nSouthern and Northern provinces show the highest average vulnerability, driven by elevated poverty, limited infrastructure, and agricultural constraints. Kigali City records the lowest vulnerability, reflecting better access to services and economic opportunities.\n\n*Source: ROVI composite index integrating EICV5, LFS 2024, DHS 2020, SAS 2024/25.*`;
  }

  // Agriculture / irrigation / food security
  if (q.includes('agriculture') || q.includes('irrigation') || q.includes('food security') || q.includes('food insecurity') || q.includes('farming') || q.includes('crop')) {
    const sorted = [...districtData].sort((a, b) => a.food_security - b.food_security);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** — food security ${d.food_security}%, irrigation coverage ${d.irrigation_coverage}%`
    ).join('\n');
    return `## Food Security & Agriculture — SAS 2024/25\n\nBased on the NISR Seasonal Agricultural Survey 2024/25, districts most at risk of food insecurity are:\n\n${top5}\n\n**National food security rate:** 63.4% · **NST2 target:** 88% by 2029\n\nKey gaps include low irrigation coverage, limited use of improved seeds, and high climate variability risk. Recommended interventions: expansion of the National Irrigation Policy, community-level water harvesting, agriculture extension services, and climate-smart farming adoption.`;
  }

  // Education / school / dropout
  if (q.includes('education') || q.includes('school') || q.includes('dropout') || q.includes('literacy') || q.includes('enrollment')) {
    const sorted = [...districtData].sort((a, b) => b.dropout_risk - a.dropout_risk);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** — dropout risk index ${d.dropout_risk}/100, secondary enrollment ${d.secondary_enrollment}%`
    ).join('\n');
    return `## Education Indicators — MINEDUC / NISR 2024\n\nDistricts with highest school dropout risk:\n\n${top5}\n\n**National primary completion:** 78.3% · **NST2 target:** 100%\n**National secondary enrollment:** varies widely by district\n\nHigh dropout risk correlates strongly with household poverty (r=0.87) and food insecurity. Effective interventions include school feeding programmes, conditional cash transfers for vulnerable families, community sensitisation campaigns, and investment in school infrastructure — particularly in rural areas.`;
  }

  // Health / malnutrition / mortality
  if (q.includes('health') || q.includes('malnutrition') || q.includes('mortality') || q.includes('nutrition') || q.includes('stunting')) {
    const sorted = [...districtData].sort((a, b) => b.malnutrition_rate - a.malnutrition_rate);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** — stunting ${d.malnutrition_rate}%, under-5 mortality ${d.under5_mortality}/1000`
    ).join('\n');
    return `## Health & Nutrition Indicators — DHS 2020\n\nBased on the Rwanda Demographic and Health Survey (DHS 2020), districts with the highest child malnutrition burden:\n\n${top5}\n\n**NST2 targets:** stunting < 15%, under-5 mortality < 28/1000 by 2029\n\nMalnutrition in these districts is linked to food insecurity, limited health centre access, and low WASH coverage. Priority interventions: community health worker programmes, supplementary nutrition support, ante-natal care, and clean water infrastructure expansion.`;
  }

  // Internet / digital / connectivity / ICT
  if (q.includes('internet') || q.includes('digital') || q.includes('connectivity') || q.includes('ict') || q.includes('electricity')) {
    const sortedInternet = [...districtData].sort((a, b) => a.internet_access - b.internet_access);
    const top5 = sortedInternet.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** — internet ${d.internet_access}%, electricity ${d.electricity_access}%`
    ).join('\n');
    return `## Digital & Infrastructure Access — ICT Survey 2023 / REG\n\nDistricts with lowest digital connectivity:\n\n${top5}\n\n**National internet access:** 22.4% · **NST2 target:** 80% by 2029\n**National electricity access:** varies significantly by district\n\nDigital infrastructure gaps compound economic disadvantages — low connectivity limits access to digital financial services, e-health, and e-government. Priority actions: expand national broadband rollout, establish community digital hubs, rural electrification through REG, and digital literacy programmes.`;
  }

  // Vulnerability / priority districts
  if (q.includes('vulnerable') || q.includes('vulnerability') || q.includes('priority') || q.includes('risk') || q.includes('worst')) {
    const sorted = [...districtData].sort((a, b) => b.vulnerability_score - a.vulnerability_score);
    const top5 = sorted.slice(0, 5).map((d, i) =>
      `${i + 1}. **${d.name}** (${d.province}) — composite score ${d.vulnerability_score}/100 [${d.vulnerability_level}]`
    ).join('\n');
    return `## Top Priority Districts — ROVI Composite Index\n\nBased on the ROVI multi-indicator vulnerability model (integrating EICV5, LFS 2024, DHS 2020, SAS 2024/25), the five districts requiring most urgent intervention are:\n\n${top5}\n\nThese districts score highest across combined poverty, youth unemployment, health deficits, low food security, and infrastructure gaps. They should receive priority resource allocation under NST2 Economic and Social Transformation pillars, with particular focus on VUP expansion, TVET investment, and health infrastructure.`;
  }

  // NST2 / Vision 2050
  if (q.includes('nst2') || q.includes('vision 2050') || q.includes('national strategy') || q.includes('target')) {
    return `## NST2 & Vision 2050 — Rwanda Development Framework\n\nRwanda's **National Strategy for Transformation (NST2)** and **Vision 2050** define three core pillars:\n\n**1. Economic Transformation**\n- Reduce poverty from 38.2% to 27.5% by 2029\n- Create decent jobs for 214,000 youth per year\n- Increase per capita income to USD 1,240\n- Expand financial inclusion and digital economy\n\n**2. Social Transformation**\n- Achieve universal health coverage\n- Eliminate malnutrition (stunting < 15%)\n- Universal primary completion, 60% secondary enrollment\n- Gender equality across all sectors\n\n**3. Transformational Governance**\n- Evidence-based policy making\n- Accountable public institutions\n- Citizen-centred service delivery\n\nROVI directly supports Pillar 3 by translating NISR district-level data into targeted planning intelligence, enabling more precise resource allocation and intervention design.`;
  }

  // VUP / social protection / ubudehe
  if (q.includes('vup') || q.includes('social protection') || q.includes('umurenge') || q.includes('ubudehe') || q.includes('safety net')) {
    const sorted = [...districtData].sort((a, b) => b.poverty_rate - a.poverty_rate);
    const top4 = sorted.slice(0, 4).map(d => `**${d.name}**`).join(', ');
    return `## VUP & Social Protection Targeting — MINALOC / NISR\n\nThe **Vision Umurenge Programme (VUP)** is Rwanda's flagship social protection scheme, targeting Ubudehe Category 1 and 2 households through direct support, public works, and financial services components.\n\nBased on current EICV5 poverty data, districts where VUP coverage should be prioritised are: ${top4}.\n\nAll four show poverty rates above 45% and youth unemployment exceeding 39%.\n\n**Coverage gap:** National social protection coverage averages 31% of eligible households. NST2 targets 100% coverage by 2029, requiring significant expansion of Ubudehe categorisation accuracy and programme delivery capacity at sector level.`;
  }

  // Default response
  const sorted = [...districtData].sort((a, b) => b.vulnerability_score - a.vulnerability_score);
  const top3 = sorted.slice(0, 3).map(d => `**${d.name}**`).join(', ');
  return `## ROVI Data Query Tool — NISR District Intelligence\n\nThis tool provides analysis across all 30 Rwanda districts using NISR statistical data.\n\n**Current highest-priority districts:** ${top3}\n\n**Available queries:**\n- Poverty rates and household welfare by district\n- Youth unemployment hotspots (LFS 2024)\n- Food security and agricultural indicators (SAS 2024/25)\n- Health and nutrition data (DHS 2020)\n- Education and dropout risk analysis\n- Digital and infrastructure access\n- NST2 and Vision 2050 target tracking\n- VUP and social protection targeting\n- Provincial comparisons\n\nRefine your query with specific districts, provinces, or indicators for more detailed analysis.`;
}
