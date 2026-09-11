// ============================================================
// NISR-informed synthetic dataset for all 30 Rwanda districts
// Sources: EICV5, LFS 2024, RPHC4, DHS 2020, SAS 2024/25
// Indicators scaled 0-100 unless noted.
// ============================================================

export interface DistrictData {
  id: string;
  name: string;
  province: string;
  population: number;        // thousands
  urban_pct: number;         // % urban population

  // Economic
  poverty_rate: number;      // % below national poverty line (EICV5)
  unemployment_rate: number; // % LFS 2024
  youth_unemployment: number;// % 16-30 LFS 2024
  household_income: number;  // avg monthly income (RWF thousands)
  financial_inclusion: number; // % with formal financial account

  // Education
  primary_completion: number;  // %
  secondary_enrollment: number;// %
  dropout_risk: number;        // composite score 0-100 (higher = worse)
  literacy_rate: number;       // %

  // Health
  health_center_access: number;// % within 5km
  under5_mortality: number;    // per 1000 live births
  malnutrition_rate: number;   // stunting % under-5
  immunization_rate: number;   // %

  // Agriculture
  agri_productivity: number;   // index 0-100
  food_security: number;       // % food secure
  irrigation_coverage: number; // % irrigated land
  climate_risk: number;        // composite risk 0-100

  // Infrastructure
  internet_access: number;     // % households
  electricity_access: number;  // %
  clean_water_access: number;  // %
  road_quality: number;        // index 0-100

  // Social
  gender_gap: number;          // composite 0-100 (higher = worse gap)
  social_protection_coverage: number; // % of vulnerable receiving support

  // Computed
  vulnerability_score: number; // 0-100 (computed by ML engine)
  vulnerability_level: 'Low' | 'Medium' | 'High';
  lat: number;
  lng: number;
}

export const districts: DistrictData[] = [
  // ── CITY OF KIGALI ─────────────────────────────────────────
  {
    id: 'nyarugenge', name: 'Nyarugenge', province: 'Kigali City',
    population: 368, urban_pct: 98,
    poverty_rate: 8, unemployment_rate: 11, youth_unemployment: 18,
    household_income: 142, financial_inclusion: 82,
    primary_completion: 95, secondary_enrollment: 72, dropout_risk: 15, literacy_rate: 93,
    health_center_access: 98, under5_mortality: 28, malnutrition_rate: 12, immunization_rate: 95,
    agri_productivity: 30, food_security: 88, irrigation_coverage: 10, climate_risk: 18,
    internet_access: 68, electricity_access: 92, clean_water_access: 95, road_quality: 90,
    gender_gap: 20, social_protection_coverage: 45,
    vulnerability_score: 18, vulnerability_level: 'Low',
    lat: -1.9441, lng: 30.0619
  },
  {
    id: 'kicukiro', name: 'Kicukiro', province: 'Kigali City',
    population: 354, urban_pct: 97,
    poverty_rate: 9, unemployment_rate: 10, youth_unemployment: 17,
    household_income: 138, financial_inclusion: 80,
    primary_completion: 94, secondary_enrollment: 70, dropout_risk: 16, literacy_rate: 92,
    health_center_access: 97, under5_mortality: 30, malnutrition_rate: 13, immunization_rate: 94,
    agri_productivity: 32, food_security: 87, irrigation_coverage: 8, climate_risk: 20,
    internet_access: 65, electricity_access: 91, clean_water_access: 94, road_quality: 88,
    gender_gap: 22, social_protection_coverage: 43,
    vulnerability_score: 20, vulnerability_level: 'Low',
    lat: -1.9706, lng: 30.1044
  },
  {
    id: 'gasabo', name: 'Gasabo', province: 'Kigali City',
    population: 692, urban_pct: 85,
    poverty_rate: 12, unemployment_rate: 12, youth_unemployment: 20,
    household_income: 118, financial_inclusion: 76,
    primary_completion: 93, secondary_enrollment: 68, dropout_risk: 20, literacy_rate: 90,
    health_center_access: 95, under5_mortality: 32, malnutrition_rate: 14, immunization_rate: 93,
    agri_productivity: 40, food_security: 85, irrigation_coverage: 15, climate_risk: 22,
    internet_access: 60, electricity_access: 89, clean_water_access: 92, road_quality: 85,
    gender_gap: 24, social_protection_coverage: 40,
    vulnerability_score: 24, vulnerability_level: 'Low',
    lat: -1.9018, lng: 30.0786
  },

  // ── EASTERN PROVINCE ───────────────────────────────────────
  {
    id: 'bugesera', name: 'Bugesera', province: 'Eastern Province',
    population: 448, urban_pct: 14,
    poverty_rate: 38, unemployment_rate: 18, youth_unemployment: 32,
    household_income: 58, financial_inclusion: 42,
    primary_completion: 74, secondary_enrollment: 38, dropout_risk: 58, literacy_rate: 72,
    health_center_access: 68, under5_mortality: 52, malnutrition_rate: 38, immunization_rate: 84,
    agri_productivity: 48, food_security: 61, irrigation_coverage: 22, climate_risk: 65,
    internet_access: 18, electricity_access: 40, clean_water_access: 68, road_quality: 48,
    gender_gap: 48, social_protection_coverage: 28,
    vulnerability_score: 62, vulnerability_level: 'High',
    lat: -2.2084, lng: 30.1594
  },
  {
    id: 'gatsibo', name: 'Gatsibo', province: 'Eastern Province',
    population: 429, urban_pct: 8,
    poverty_rate: 42, unemployment_rate: 20, youth_unemployment: 35,
    household_income: 52, financial_inclusion: 38,
    primary_completion: 72, secondary_enrollment: 35, dropout_risk: 62, literacy_rate: 68,
    health_center_access: 60, under5_mortality: 58, malnutrition_rate: 42, immunization_rate: 81,
    agri_productivity: 44, food_security: 55, irrigation_coverage: 12, climate_risk: 70,
    internet_access: 12, electricity_access: 28, clean_water_access: 62, road_quality: 40,
    gender_gap: 55, social_protection_coverage: 24,
    vulnerability_score: 70, vulnerability_level: 'High',
    lat: -1.5783, lng: 30.4271
  },
  {
    id: 'kayonza', name: 'Kayonza', province: 'Eastern Province',
    population: 363, urban_pct: 10,
    poverty_rate: 40, unemployment_rate: 19, youth_unemployment: 33,
    household_income: 55, financial_inclusion: 40,
    primary_completion: 73, secondary_enrollment: 37, dropout_risk: 60, literacy_rate: 70,
    health_center_access: 62, under5_mortality: 56, malnutrition_rate: 40, immunization_rate: 82,
    agri_productivity: 46, food_security: 58, irrigation_coverage: 14, climate_risk: 68,
    internet_access: 14, electricity_access: 30, clean_water_access: 64, road_quality: 42,
    gender_gap: 52, social_protection_coverage: 26,
    vulnerability_score: 68, vulnerability_level: 'High',
    lat: -1.8932, lng: 30.6483
  },
  {
    id: 'kirehe', name: 'Kirehe', province: 'Eastern Province',
    population: 373, urban_pct: 7,
    poverty_rate: 45, unemployment_rate: 22, youth_unemployment: 38,
    household_income: 48, financial_inclusion: 35,
    primary_completion: 70, secondary_enrollment: 32, dropout_risk: 66, literacy_rate: 65,
    health_center_access: 58, under5_mortality: 62, malnutrition_rate: 44, immunization_rate: 79,
    agri_productivity: 42, food_security: 52, irrigation_coverage: 10, climate_risk: 72,
    internet_access: 10, electricity_access: 24, clean_water_access: 60, road_quality: 38,
    gender_gap: 58, social_protection_coverage: 22,
    vulnerability_score: 74, vulnerability_level: 'High',
    lat: -2.0943, lng: 30.7076
  },
  {
    id: 'ngoma', name: 'Ngoma', province: 'Eastern Province',
    population: 335, urban_pct: 12,
    poverty_rate: 35, unemployment_rate: 17, youth_unemployment: 30,
    household_income: 62, financial_inclusion: 44,
    primary_completion: 76, secondary_enrollment: 40, dropout_risk: 55, literacy_rate: 74,
    health_center_access: 70, under5_mortality: 50, malnutrition_rate: 36, immunization_rate: 85,
    agri_productivity: 50, food_security: 64, irrigation_coverage: 18, climate_risk: 60,
    internet_access: 20, electricity_access: 42, clean_water_access: 70, road_quality: 50,
    gender_gap: 45, social_protection_coverage: 30,
    vulnerability_score: 58, vulnerability_level: 'High',
    lat: -2.1578, lng: 30.4898
  },
  {
    id: 'nyagatare', name: 'Nyagatare', province: 'Eastern Province',
    population: 706, urban_pct: 18,
    poverty_rate: 30, unemployment_rate: 15, youth_unemployment: 26,
    household_income: 75, financial_inclusion: 50,
    primary_completion: 80, secondary_enrollment: 45, dropout_risk: 48, literacy_rate: 78,
    health_center_access: 72, under5_mortality: 46, malnutrition_rate: 32, immunization_rate: 87,
    agri_productivity: 62, food_security: 70, irrigation_coverage: 28, climate_risk: 52,
    internet_access: 25, electricity_access: 50, clean_water_access: 74, road_quality: 55,
    gender_gap: 40, social_protection_coverage: 35,
    vulnerability_score: 48, vulnerability_level: 'Medium',
    lat: -1.2952, lng: 30.3280
  },
  {
    id: 'rwamagana', name: 'Rwamagana', province: 'Eastern Province',
    population: 349, urban_pct: 22,
    poverty_rate: 28, unemployment_rate: 14, youth_unemployment: 24,
    household_income: 80, financial_inclusion: 54,
    primary_completion: 82, secondary_enrollment: 48, dropout_risk: 44, literacy_rate: 80,
    health_center_access: 76, under5_mortality: 44, malnutrition_rate: 30, immunization_rate: 88,
    agri_productivity: 58, food_security: 72, irrigation_coverage: 20, climate_risk: 48,
    internet_access: 28, electricity_access: 54, clean_water_access: 76, road_quality: 60,
    gender_gap: 38, social_protection_coverage: 36,
    vulnerability_score: 44, vulnerability_level: 'Medium',
    lat: -1.9490, lng: 30.4356
  },

  // ── NORTHERN PROVINCE ──────────────────────────────────────
  {
    id: 'burera', name: 'Burera', province: 'Northern Province',
    population: 378, urban_pct: 6,
    poverty_rate: 44, unemployment_rate: 21, youth_unemployment: 36,
    household_income: 50, financial_inclusion: 36,
    primary_completion: 71, secondary_enrollment: 34, dropout_risk: 64, literacy_rate: 66,
    health_center_access: 60, under5_mortality: 60, malnutrition_rate: 43, immunization_rate: 80,
    agri_productivity: 43, food_security: 54, irrigation_coverage: 8, climate_risk: 75,
    internet_access: 11, electricity_access: 22, clean_water_access: 58, road_quality: 36,
    gender_gap: 56, social_protection_coverage: 23,
    vulnerability_score: 72, vulnerability_level: 'High',
    lat: -1.4692, lng: 29.8439
  },
  {
    id: 'gakenke', name: 'Gakenke', province: 'Northern Province',
    population: 367, urban_pct: 7,
    poverty_rate: 43, unemployment_rate: 20, youth_unemployment: 35,
    household_income: 51, financial_inclusion: 37,
    primary_completion: 72, secondary_enrollment: 35, dropout_risk: 62, literacy_rate: 67,
    health_center_access: 62, under5_mortality: 58, malnutrition_rate: 41, immunization_rate: 81,
    agri_productivity: 44, food_security: 56, irrigation_coverage: 9, climate_risk: 73,
    internet_access: 12, electricity_access: 24, clean_water_access: 60, road_quality: 38,
    gender_gap: 54, social_protection_coverage: 24,
    vulnerability_score: 70, vulnerability_level: 'High',
    lat: -1.6877, lng: 29.7789
  },
  {
    id: 'gicumbi', name: 'Gicumbi', province: 'Northern Province',
    population: 484, urban_pct: 11,
    poverty_rate: 38, unemployment_rate: 18, youth_unemployment: 31,
    household_income: 58, financial_inclusion: 42,
    primary_completion: 75, secondary_enrollment: 39, dropout_risk: 57, literacy_rate: 73,
    health_center_access: 66, under5_mortality: 54, malnutrition_rate: 38, immunization_rate: 83,
    agri_productivity: 47, food_security: 60, irrigation_coverage: 13, climate_risk: 65,
    internet_access: 15, electricity_access: 32, clean_water_access: 64, road_quality: 44,
    gender_gap: 50, social_protection_coverage: 27,
    vulnerability_score: 64, vulnerability_level: 'High',
    lat: -1.5794, lng: 30.0638
  },
  {
    id: 'musanze', name: 'Musanze', province: 'Northern Province',
    population: 370, urban_pct: 28,
    poverty_rate: 25, unemployment_rate: 13, youth_unemployment: 22,
    household_income: 88, financial_inclusion: 60,
    primary_completion: 85, secondary_enrollment: 52, dropout_risk: 38, literacy_rate: 84,
    health_center_access: 82, under5_mortality: 40, malnutrition_rate: 26, immunization_rate: 90,
    agri_productivity: 55, food_security: 75, irrigation_coverage: 22, climate_risk: 42,
    internet_access: 35, electricity_access: 60, clean_water_access: 80, road_quality: 65,
    gender_gap: 34, social_protection_coverage: 38,
    vulnerability_score: 38, vulnerability_level: 'Medium',
    lat: -1.4997, lng: 29.6346
  },
  {
    id: 'rulindo', name: 'Rulindo', province: 'Northern Province',
    population: 278, urban_pct: 9,
    poverty_rate: 40, unemployment_rate: 19, youth_unemployment: 33,
    household_income: 54, financial_inclusion: 39,
    primary_completion: 73, secondary_enrollment: 36, dropout_risk: 61, literacy_rate: 69,
    health_center_access: 63, under5_mortality: 56, malnutrition_rate: 39, immunization_rate: 82,
    agri_productivity: 45, food_security: 57, irrigation_coverage: 11, climate_risk: 67,
    internet_access: 13, electricity_access: 28, clean_water_access: 62, road_quality: 40,
    gender_gap: 53, social_protection_coverage: 25,
    vulnerability_score: 67, vulnerability_level: 'High',
    lat: -1.7248, lng: 29.9960
  },

  // ── SOUTHERN PROVINCE ──────────────────────────────────────
  {
    id: 'gisagara', name: 'Gisagara', province: 'Southern Province',
    population: 356, urban_pct: 8,
    poverty_rate: 46, unemployment_rate: 23, youth_unemployment: 40,
    household_income: 46, financial_inclusion: 33,
    primary_completion: 69, secondary_enrollment: 30, dropout_risk: 68, literacy_rate: 63,
    health_center_access: 56, under5_mortality: 64, malnutrition_rate: 46, immunization_rate: 78,
    agri_productivity: 40, food_security: 50, irrigation_coverage: 8, climate_risk: 74,
    internet_access: 9, electricity_access: 22, clean_water_access: 58, road_quality: 36,
    gender_gap: 60, social_protection_coverage: 21,
    vulnerability_score: 76, vulnerability_level: 'High',
    lat: -2.5798, lng: 29.8366
  },
  {
    id: 'huye', name: 'Huye', province: 'Southern Province',
    population: 321, urban_pct: 24,
    poverty_rate: 26, unemployment_rate: 13, youth_unemployment: 22,
    household_income: 86, financial_inclusion: 62,
    primary_completion: 86, secondary_enrollment: 55, dropout_risk: 35, literacy_rate: 86,
    health_center_access: 84, under5_mortality: 38, malnutrition_rate: 24, immunization_rate: 91,
    agri_productivity: 56, food_security: 76, irrigation_coverage: 24, climate_risk: 40,
    internet_access: 38, electricity_access: 62, clean_water_access: 82, road_quality: 68,
    gender_gap: 32, social_protection_coverage: 40,
    vulnerability_score: 36, vulnerability_level: 'Medium',
    lat: -2.5936, lng: 29.7375
  },
  {
    id: 'kamonyi', name: 'Kamonyi', province: 'Southern Province',
    population: 358, urban_pct: 12,
    poverty_rate: 35, unemployment_rate: 17, youth_unemployment: 29,
    household_income: 63, financial_inclusion: 45,
    primary_completion: 77, secondary_enrollment: 41, dropout_risk: 54, literacy_rate: 75,
    health_center_access: 71, under5_mortality: 50, malnutrition_rate: 35, immunization_rate: 86,
    agri_productivity: 51, food_security: 65, irrigation_coverage: 19, climate_risk: 58,
    internet_access: 21, electricity_access: 44, clean_water_access: 72, road_quality: 52,
    gender_gap: 44, social_protection_coverage: 31,
    vulnerability_score: 56, vulnerability_level: 'High',
    lat: -2.0048, lng: 29.8786
  },
  {
    id: 'muhanga', name: 'Muhanga', province: 'Southern Province',
    population: 333, urban_pct: 20,
    poverty_rate: 28, unemployment_rate: 14, youth_unemployment: 24,
    household_income: 82, financial_inclusion: 56,
    primary_completion: 83, secondary_enrollment: 50, dropout_risk: 42, literacy_rate: 82,
    health_center_access: 78, under5_mortality: 43, malnutrition_rate: 29, immunization_rate: 89,
    agri_productivity: 57, food_security: 74, irrigation_coverage: 21, climate_risk: 46,
    internet_access: 30, electricity_access: 56, clean_water_access: 78, road_quality: 62,
    gender_gap: 36, social_protection_coverage: 37,
    vulnerability_score: 42, vulnerability_level: 'Medium',
    lat: -2.0841, lng: 29.7509
  },
  {
    id: 'nyamagabe', name: 'Nyamagabe', province: 'Southern Province',
    population: 382, urban_pct: 9,
    poverty_rate: 48, unemployment_rate: 24, youth_unemployment: 41,
    household_income: 44, financial_inclusion: 31,
    primary_completion: 68, secondary_enrollment: 29, dropout_risk: 70, literacy_rate: 62,
    health_center_access: 54, under5_mortality: 66, malnutrition_rate: 47, immunization_rate: 77,
    agri_productivity: 38, food_security: 48, irrigation_coverage: 7, climate_risk: 76,
    internet_access: 8, electricity_access: 20, clean_water_access: 56, road_quality: 34,
    gender_gap: 62, social_protection_coverage: 20,
    vulnerability_score: 79, vulnerability_level: 'High',
    lat: -2.4742, lng: 29.4846
  },
  {
    id: 'nyanza', name: 'Nyanza', province: 'Southern Province',
    population: 320, urban_pct: 14,
    poverty_rate: 32, unemployment_rate: 16, youth_unemployment: 27,
    household_income: 68, financial_inclusion: 48,
    primary_completion: 79, secondary_enrollment: 43, dropout_risk: 50, literacy_rate: 77,
    health_center_access: 74, under5_mortality: 47, malnutrition_rate: 33, immunization_rate: 87,
    agri_productivity: 53, food_security: 68, irrigation_coverage: 20, climate_risk: 55,
    internet_access: 22, electricity_access: 46, clean_water_access: 74, road_quality: 54,
    gender_gap: 42, social_protection_coverage: 32,
    vulnerability_score: 52, vulnerability_level: 'Medium',
    lat: -2.3499, lng: 29.7478
  },
  {
    id: 'nyaruguru', name: 'Nyaruguru', province: 'Southern Province',
    population: 323, urban_pct: 7,
    poverty_rate: 50, unemployment_rate: 25, youth_unemployment: 43,
    household_income: 42, financial_inclusion: 30,
    primary_completion: 67, secondary_enrollment: 28, dropout_risk: 72, literacy_rate: 60,
    health_center_access: 52, under5_mortality: 68, malnutrition_rate: 48, immunization_rate: 76,
    agri_productivity: 36, food_security: 46, irrigation_coverage: 6, climate_risk: 78,
    internet_access: 7, electricity_access: 18, clean_water_access: 54, road_quality: 32,
    gender_gap: 64, social_protection_coverage: 19,
    vulnerability_score: 82, vulnerability_level: 'High',
    lat: -2.6891, lng: 29.5410
  },
  {
    id: 'ruhango', name: 'Ruhango', province: 'Southern Province',
    population: 338, urban_pct: 11,
    poverty_rate: 36, unemployment_rate: 17, youth_unemployment: 30,
    household_income: 60, financial_inclusion: 43,
    primary_completion: 76, secondary_enrollment: 40, dropout_risk: 56, literacy_rate: 74,
    health_center_access: 69, under5_mortality: 52, malnutrition_rate: 37, immunization_rate: 85,
    agri_productivity: 49, food_security: 63, irrigation_coverage: 17, climate_risk: 61,
    internet_access: 17, electricity_access: 38, clean_water_access: 69, road_quality: 48,
    gender_gap: 47, social_protection_coverage: 28,
    vulnerability_score: 60, vulnerability_level: 'High',
    lat: -2.2273, lng: 29.7757
  },

  // ── WESTERN PROVINCE ───────────────────────────────────────
  {
    id: 'karongi', name: 'Karongi', province: 'Western Province',
    population: 370, urban_pct: 13,
    poverty_rate: 39, unemployment_rate: 18, youth_unemployment: 32,
    household_income: 57, financial_inclusion: 41,
    primary_completion: 74, secondary_enrollment: 38, dropout_risk: 59, literacy_rate: 71,
    health_center_access: 66, under5_mortality: 54, malnutrition_rate: 39, immunization_rate: 83,
    agri_productivity: 46, food_security: 59, irrigation_coverage: 14, climate_risk: 66,
    internet_access: 16, electricity_access: 34, clean_water_access: 65, road_quality: 44,
    gender_gap: 51, social_protection_coverage: 26,
    vulnerability_score: 65, vulnerability_level: 'High',
    lat: -2.0645, lng: 29.3657
  },
  {
    id: 'ngororero', name: 'Ngororero', province: 'Western Province',
    population: 344, urban_pct: 8,
    poverty_rate: 44, unemployment_rate: 21, youth_unemployment: 37,
    household_income: 50, financial_inclusion: 35,
    primary_completion: 71, secondary_enrollment: 33, dropout_risk: 64, literacy_rate: 66,
    health_center_access: 60, under5_mortality: 60, malnutrition_rate: 42, immunization_rate: 80,
    agri_productivity: 43, food_security: 54, irrigation_coverage: 9, climate_risk: 72,
    internet_access: 11, electricity_access: 24, clean_water_access: 59, road_quality: 37,
    gender_gap: 57, social_protection_coverage: 23,
    vulnerability_score: 71, vulnerability_level: 'High',
    lat: -1.8700, lng: 29.5316
  },
  {
    id: 'nyabihu', name: 'Nyabihu', province: 'Western Province',
    population: 305, urban_pct: 10,
    poverty_rate: 41, unemployment_rate: 20, youth_unemployment: 34,
    household_income: 53, financial_inclusion: 38,
    primary_completion: 72, secondary_enrollment: 36, dropout_risk: 61, literacy_rate: 68,
    health_center_access: 62, under5_mortality: 57, malnutrition_rate: 40, immunization_rate: 82,
    agri_productivity: 45, food_security: 56, irrigation_coverage: 11, climate_risk: 69,
    internet_access: 13, electricity_access: 27, clean_water_access: 62, road_quality: 41,
    gender_gap: 53, social_protection_coverage: 25,
    vulnerability_score: 68, vulnerability_level: 'High',
    lat: -1.6626, lng: 29.4995
  },
  {
    id: 'nyamasheke', name: 'Nyamasheke', province: 'Western Province',
    population: 421, urban_pct: 9,
    poverty_rate: 47, unemployment_rate: 23, youth_unemployment: 40,
    household_income: 47, financial_inclusion: 33,
    primary_completion: 69, secondary_enrollment: 31, dropout_risk: 67, literacy_rate: 63,
    health_center_access: 57, under5_mortality: 63, malnutrition_rate: 45, immunization_rate: 78,
    agri_productivity: 41, food_security: 51, irrigation_coverage: 8, climate_risk: 74,
    internet_access: 9, electricity_access: 21, clean_water_access: 57, road_quality: 35,
    gender_gap: 59, social_protection_coverage: 22,
    vulnerability_score: 75, vulnerability_level: 'High',
    lat: -2.3379, lng: 29.1513
  },
  {
    id: 'rubavu', name: 'Rubavu', province: 'Western Province',
    population: 488, urban_pct: 35,
    poverty_rate: 22, unemployment_rate: 12, youth_unemployment: 20,
    household_income: 95, financial_inclusion: 64,
    primary_completion: 87, secondary_enrollment: 56, dropout_risk: 32, literacy_rate: 87,
    health_center_access: 86, under5_mortality: 36, malnutrition_rate: 22, immunization_rate: 92,
    agri_productivity: 58, food_security: 78, irrigation_coverage: 26, climate_risk: 38,
    internet_access: 42, electricity_access: 65, clean_water_access: 84, road_quality: 70,
    gender_gap: 30, social_protection_coverage: 42,
    vulnerability_score: 32, vulnerability_level: 'Low',
    lat: -1.6838, lng: 29.2606
  },
  {
    id: 'rusizi', name: 'Rusizi', province: 'Western Province',
    population: 486, urban_pct: 30,
    poverty_rate: 24, unemployment_rate: 13, youth_unemployment: 21,
    household_income: 90, financial_inclusion: 62,
    primary_completion: 85, secondary_enrollment: 53, dropout_risk: 36, literacy_rate: 85,
    health_center_access: 83, under5_mortality: 39, malnutrition_rate: 25, immunization_rate: 91,
    agri_productivity: 57, food_security: 77, irrigation_coverage: 25, climate_risk: 41,
    internet_access: 38, electricity_access: 63, clean_water_access: 83, road_quality: 67,
    gender_gap: 32, social_protection_coverage: 40,
    vulnerability_score: 34, vulnerability_level: 'Low',
    lat: -2.4800, lng: 28.9069
  },
  {
    id: 'rutsiro', name: 'Rutsiro', province: 'Western Province',
    population: 322, urban_pct: 7,
    poverty_rate: 46, unemployment_rate: 22, youth_unemployment: 39,
    household_income: 48, financial_inclusion: 34,
    primary_completion: 70, secondary_enrollment: 32, dropout_risk: 65, literacy_rate: 65,
    health_center_access: 59, under5_mortality: 61, malnutrition_rate: 43, immunization_rate: 80,
    agri_productivity: 42, food_security: 53, irrigation_coverage: 9, climate_risk: 73,
    internet_access: 10, electricity_access: 23, clean_water_access: 59, road_quality: 37,
    gender_gap: 58, social_protection_coverage: 22,
    vulnerability_score: 73, vulnerability_level: 'High',
    lat: -1.9283, lng: 29.3790
  },
];

// ── Aggregate national indicators ─────────────────────────
export const nationalStats = {
  totalPopulation: 14_823_000,
  povertyRate: 38.2,
  youthUnemployment: 28.6,
  internetAccess: 22.4,
  primaryCompletion: 78.3,
  foodSecurity: 63.4,
  avgVulnerabilityScore: 56.8,
  highVulnerabilityDistricts: 0, // computed below
  mediumVulnerabilityDistricts: 0,
  lowVulnerabilityDistricts: 0,
};

nationalStats.highVulnerabilityDistricts = districts.filter(d => d.vulnerability_level === 'High').length;
nationalStats.mediumVulnerabilityDistricts = districts.filter(d => d.vulnerability_level === 'Medium').length;
nationalStats.lowVulnerabilityDistricts = districts.filter(d => d.vulnerability_level === 'Low').length;

export const topVulnerableDistricts = [...districts]
  .sort((a, b) => b.vulnerability_score - a.vulnerability_score)
  .slice(0, 8);

export function getDistrictById(id: string): DistrictData | undefined {
  return districts.find(d => d.id === id);
}

export function getDistrictsByProvince(province: string): DistrictData[] {
  return districts.filter(d => d.province === province);
}

export const provinces = [...new Set(districts.map(d => d.province))];
