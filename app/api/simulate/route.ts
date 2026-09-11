import { NextRequest, NextResponse } from 'next/server';
import { getDistrictById } from '@/lib/districts';
import { runSimulation } from '@/lib/mlEngine';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { districtId, interventions } = body;

  if (!districtId) {
    return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
  }
  if (!interventions || typeof interventions !== 'object') {
    return NextResponse.json({ error: 'Missing or invalid interventions object' }, { status: 400 });
  }

  const district = getDistrictById(districtId);
  if (!district) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  const result = runSimulation(district, { districtId, interventions });

  return NextResponse.json({
    district: {
      id: district.id,
      name: district.name,
      province: district.province,
    },
    simulation: {
      baseline: {
        score: result.baseline.score,
        level: result.baseline.level,
        pillarScores: result.baseline.pillarScores,
      },
      simulated: {
        score: result.simulated.score,
        level: result.simulated.level,
        pillarScores: result.simulated.pillarScores,
        recommendations: result.simulated.recommendations,
      },
      deltaScore: result.deltaScore,
      impactSummary: result.impactSummary,
    },
    interventionsApplied: interventions,
    timestamp: new Date().toISOString(),
  });
}
