import { NextRequest, NextResponse } from 'next/server';
import { getDistrictById } from '@/lib/districts';
import { computeVulnerabilityScore } from '@/lib/mlEngine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('district');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing district query parameter' },
      { status: 400 }
    );
  }

  const district = getDistrictById(id);
  if (!district) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  const result = computeVulnerabilityScore(district);

  return NextResponse.json({
    district: {
      id: district.id,
      name: district.name,
      province: district.province,
      population: district.population,
    },
    vulnerability: result,
    dataSource: 'NISR EICV5, LFS 2024, DHS 2020, SAS 2024/25, RPHC4',
    modelVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { districtId } = body;

  if (!districtId) {
    return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
  }

  const district = getDistrictById(districtId);
  if (!district) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  const result = computeVulnerabilityScore(district);

  return NextResponse.json({
    district: {
      id: district.id,
      name: district.name,
      province: district.province,
    },
    vulnerability: result,
    indicators: {
      poverty_rate: district.poverty_rate,
      youth_unemployment: district.youth_unemployment,
      food_security: district.food_security,
      internet_access: district.internet_access,
      electricity_access: district.electricity_access,
    },
    timestamp: new Date().toISOString(),
  });
}
