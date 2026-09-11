import { NextRequest, NextResponse } from 'next/server';
import { getDistrictById } from '@/lib/districtEducation';
import { computeEducationPriority, DEFAULT_BENCHMARKS } from '@/lib/educationScore';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL   = 'mistral-small-latest';

let lastCall = 0;
const MIN_MS = 1500;

async function callMistral(prompt: string): Promise<string | null> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    const wait = MIN_MS - (Date.now() - lastCall);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCall = Date.now();

    try {
      const res = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.4,
        }),
      });

      if (res.status === 429) {
        const retry = parseInt(res.headers.get('retry-after') || '3', 10) * 1000;
        if (attempt < 2) { await new Promise(r => setTimeout(r, Math.max(retry, 2000 * (attempt + 1)))); continue; }
        return null;
      }
      if (!res.ok) { console.error('[recommend] Mistral', res.status, await res.text()); return null; }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch (e) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are an expert education policy analyst for Rwanda, specializing in NST2 and Vision 2050 education targets.

You generate concise, actionable, evidence-based intervention recommendations for district education planners.

Rules:
- Give exactly 4 recommendations, each on a new line starting with a number (1. 2. 3. 4.)
- Each recommendation must be specific, actionable, and reference a real Rwanda programme or institution (REB, RNEC, Smart Rwanda, MINEDUC, REG, VUP, etc.)
- Connect each recommendation to the specific gap indicator (ICT %, smart classroom %, textbook ratio, or school density)
- Reference the NST2 or Vision 2050 target it addresses
- Keep each recommendation to 1-2 sentences maximum
- Do NOT use bullet points, asterisks, or markdown headers
- Do NOT mention AI, language models, or that you are automated
- Write as a professional policy analyst, not as an AI assistant`;

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

  const result = computeEducationPriority(district, DEFAULT_BENCHMARKS);

  // Build a rich context prompt for Mistral
  const prompt = `Generate 4 priority education intervention recommendations for ${district.name} District, ${district.province}, Rwanda.

DISTRICT EDUCATION GAP DATA (from NISR):
- Education Priority Score: ${result.priorityScore}/100 (${result.priorityLevel} priority)
- ICT adoption rate: ${district.ictAdoptionPct}% of schools (national average: ${DEFAULT_BENCHMARKS.ictPct}%, NST2 target: 100%)
- Smart classroom coverage: ${district.smartClassroomPct}% of schools (national average: ${DEFAULT_BENCHMARKS.smartPct}%, NST2 target: 100%)
- Primary textbook ratio: ${district.primaryBookRatio}:1 students per book (NST2 target: 1:1)
- Secondary textbook ratio: ${district.secondaryBookRatio}:1 students per book
- Schools per 1,000 school-age children: ${district.schoolsPer1000Children} (NST2 target: 5.0)
- Education level coverage: ${district.educationLevelCoverage}% of expected levels
- Estimated total schools: ${district.totalSchoolsEstimate}
- School-age population: ${district.schoolAgePopulation}K (ages 3-18)
- Poverty rate: ${district.povertyRate}% (NISR EICV5 2023/24)
- Rural population: ${district.ruralPct}%
- Youth NEET rate: ${district.youthNEET}% (NISR LFS 2024)

TOP GAP DRIVERS:
${result.topDrivers.map(d => `- ${d.pillar}: ${d.indicator} = ${d.districtValue}${d.unit.includes('%') ? '%' : ''} vs ${d.nationalValue}${d.unit.includes('%') ? '%' : ''} national (${d.severity} severity)`).join('\n')}

Generate 4 specific, actionable recommendations addressing these gaps, referencing relevant Rwanda programmes and NST2 targets.`;

  // Try Mistral first
  if (MISTRAL_API_KEY) {
    const mistralResponse = await callMistral(prompt);
    if (mistralResponse) {
      // Parse numbered recommendations from Mistral response
      const lines = mistralResponse
        .split('\n')
        .map(l => l.trim())
        .filter(l => /^[1-4][\.\)]\s/.test(l))
        .map(l => l.replace(/^[1-4][\.\)]\s+/, '').trim());

      const recommendations = lines.length >= 2 ? lines : mistralResponse
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 20)
        .slice(0, 4);

      return NextResponse.json({
        recommendations,
        source: 'mistral',
        model: MISTRAL_MODEL,
        district: { id: district.id, name: district.name, province: district.province },
        priorityScore: result.priorityScore,
        priorityLevel: result.priorityLevel,
      });
    }
  }

  // Fallback: use pre-computed recommendations from the scoring engine
  return NextResponse.json({
    recommendations: result.recommendations,
    source: 'local',
    district: { id: district.id, name: district.name, province: district.province },
    priorityScore: result.priorityScore,
    priorityLevel: result.priorityLevel,
  });
}
