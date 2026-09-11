import { NextRequest, NextResponse } from 'next/server';
import { districtEducationData } from '@/lib/districtEducation';
import {
  computeEducationPriority, DEFAULT_BENCHMARKS,
} from '@/lib/educationScore';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL   = 'mistral-small-latest';

let lastCall = 0;
const MIN_MS = 1500;

// ── Pre-compute all district scores ──────────────────────────
const scoredDistricts = districtEducationData.map(d => ({
  ...d,
  result: computeEducationPriority(d, DEFAULT_BENCHMARKS),
}));

// ── System prompt ─────────────────────────────────────────────
function buildSystemPrompt(): string {
  const ranked = [...scoredDistricts]
    .sort((a, b) => b.result.priorityScore - a.result.priorityScore);

  const districtLines = ranked.map(d =>
    `- ${d.name} (${d.province}): gap=${d.result.priorityScore}/100 [${d.result.priorityLevel}], ` +
    `ict=${d.ictAdoptionPct}%, smart=${d.smartClassroomPct}%, ` +
    `primaryRatio=${d.primaryBookRatio}:1, schools=${d.totalSchoolsEstimate}, ` +
    `poverty=${d.povertyRate}%, NEET=${d.youthNEET}%`
  ).join('\n');

  return `You are the ROVI Education Data Query Tool — a professional education intelligence assistant for Rwanda. You help policymakers, planners, and researchers understand education gaps across Rwanda's 30 districts using NISR data.

## Platform context
ROVI (Rwanda Opportunity & Vulnerability Intelligence) — Education Sector focuses on:
- Identifying education resource gaps (ICT, infrastructure, textbooks, smart classrooms)
- Priority scoring for intervention targeting
- NST2 and Vision 2050 education target tracking

## National NISR benchmarks (2021/22 — live from NISR PxWeb API)
- ICT adoption: ${DEFAULT_BENCHMARKS.ictPct}% of schools (NISR ICT_use.px)
- Smart classrooms: ${DEFAULT_BENCHMARKS.smartPct}% of schools (NISR smart.px)
- Primary textbook ratio: ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 students/book (NISR Primary.px)
- NST2 target: 100% ICT, 100% smart, 1:1 textbook ratio by 2029

## Education Gap Scoring methodology
Composite score 0–100 (higher = larger gap = more intervention needed):
- ICT Readiness: 35% weight
- School Infrastructure: 30% weight
- Learning Resources (books): 20% weight
- Digital Equity (smart classrooms): 15% weight

## All 30 Rwanda districts — education gap data
${districtLines}

## Response guidelines
- Always cite NISR data sources (ICT_use.px, smart.px, Primary.px, Edu_numb_scho.px, EICV5)
- Reference NST2 targets when relevant
- Be specific with district names and numbers
- Provide actionable recommendations linked to REB/RNEC/Smart Rwanda programmes
- Do NOT mention AI, language models, or that you are automated
- Format with **bold** for district names and key figures
- Keep responses concise and professional — this is a planning tool`;
}

// ── Mistral call with retry ───────────────────────────────────
async function callMistral(messages: { role: string; content: string }[]): Promise<string | null> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    const wait = MIN_MS - (Date.now() - lastCall);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCall = Date.now();

    try {
      const res = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MISTRAL_API_KEY}` },
        body: JSON.stringify({ model: MISTRAL_MODEL, messages, max_tokens: 600, temperature: 0.3 }),
      });

      if (res.status === 429) {
        const retry = parseInt(res.headers.get('retry-after') || '3', 10) * 1000;
        if (attempt < 2) { await new Promise(r => setTimeout(r, Math.max(retry, 2000 * (attempt + 1)))); continue; }
        return null;
      }
      if (!res.ok) { console.error('[chat] Mistral', res.status); return null; }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch (e) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

// ── Local fallback engine ─────────────────────────────────────
function localResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('ict') || q.includes('computer') || q.includes('internet') || q.includes('digital')) {
    const low = [...scoredDistricts].sort((a, b) => a.ictAdoptionPct - b.ictAdoptionPct).slice(0, 5);
    const lines = low.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — ${d.ictAdoptionPct}% ICT adoption`).join('\n');
    return `## Districts with Lowest ICT Adoption — NISR ICT_use.px 2021/22\n\n${lines}\n\n**National average:** ${DEFAULT_BENCHMARKS.ictPct}% · **NST2 target:** 100% by 2029\n\nThese districts require priority ICT equipment deployment and teacher training under the REB/RNEC ICT integration programme.`;
  }

  if (q.includes('smart') || q.includes('classroom')) {
    const low = [...scoredDistricts].sort((a, b) => a.smartClassroomPct - b.smartClassroomPct).slice(0, 5);
    const lines = low.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — ${d.smartClassroomPct}% smart classroom coverage`).join('\n');
    return `## Districts with Lowest Smart Classroom Coverage — NISR smart.px 2021/22\n\n${lines}\n\n**National average:** ${DEFAULT_BENCHMARKS.smartPct}% · **NST2 target:** 100% by 2029\n\nSmart Rwanda programme rollout should prioritise these districts, focusing on secondary and TVET levels where digital skills directly link to employment.`;
  }

  if (q.includes('book') || q.includes('textbook') || q.includes('ratio') || q.includes('resource')) {
    const high = [...scoredDistricts].sort((a, b) => b.primaryBookRatio - a.primaryBookRatio).slice(0, 5);
    const lines = high.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — ${d.primaryBookRatio}:1 students per book`).join('\n');
    return `## Districts with Highest Textbook Shortage — NISR Primary.px 2021/22\n\n${lines}\n\n**National average:** ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 · **NST2 target:** 1:1 ratio\n\nREB textbook procurement should prioritise these districts. Digital content libraries via OneLeap/eLearning platforms can serve as immediate supplements.`;
  }

  if (q.includes('infrastructure') || q.includes('school') || q.includes('construction') || q.includes('building')) {
    const low = [...scoredDistricts].sort((a, b) => a.schoolsPer1000Children - b.schoolsPer1000Children).slice(0, 5);
    const lines = low.map((d, i) => `${i + 1}. **${d.name}** — ${d.schoolsPer1000Children} schools/1000 children, ${d.totalSchoolsEstimate} total schools est.`).join('\n');
    return `## Districts with Lowest School Density — NISR RPHC4 2022 + Edu_numb_scho.px\n\n${lines}\n\nNST2 targets expanding school access especially in rural areas. MINEDUC school construction programme should prioritise these districts to reduce catchment distances and improve enrollment rates.`;
  }

  if (q.includes('priority') || q.includes('gap') || q.includes('worst') || q.includes('critical') || q.includes('intervention')) {
    const top5 = [...scoredDistricts].sort((a, b) => b.result.priorityScore - a.result.priorityScore).slice(0, 5);
    const lines = top5.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — Gap Score ${d.result.priorityScore}/100 [${d.result.priorityLevel}]`).join('\n');
    const drivers = top5[0].result.topDrivers.map(dr => `- ${dr.indicator}: ${dr.districtValue}${dr.unit.includes('%') ? '%' : ''}`).join('\n');
    return `## Top Priority Districts for Education Intervention — ROVI Model\n\n${lines}\n\n**Top gap drivers in ${top5[0].name}:**\n${drivers}\n\nThese districts score highest on combined ICT deficit, infrastructure shortage, textbook gap, and digital equity indicators. Resource allocation under NST2 Social and Digital Transformation pillars should target these areas first.`;
  }

  if (q.includes('nst2') || q.includes('target') || q.includes('vision 2050') || q.includes('progress')) {
    return `## NST2 Education Targets — Progress Status\n\n**ICT in all schools:** ${DEFAULT_BENCHMARKS.ictPct}% / 100% target · ${(100 - DEFAULT_BENCHMARKS.ictPct).toFixed(1)} pp remaining\n\n**Smart classrooms:** ${DEFAULT_BENCHMARKS.smartPct}% / 100% target · ${(100 - DEFAULT_BENCHMARKS.smartPct).toFixed(1)} pp remaining\n\n**Primary textbook ratio:** ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 / 1:1 target\n\n*Sources: NISR ICT_use.px, smart.px, Primary.px — 2021/22*\n\nAt current trajectory, ICT adoption improved by ${DEFAULT_BENCHMARKS.ictPct - 34.9} pp from 2017 to 2021/22. Maintaining this pace, full coverage could be achieved by 2027–2028.`;
  }

  if (q.includes('province') || q.includes('region') || q.includes('kigali') || q.includes('eastern') || q.includes('northern') || q.includes('southern') || q.includes('western')) {
    const allProvinces = [...new Set(districtEducationData.map(d => d.province))];
    const summary = allProvinces.map(p => {
      const ds = scoredDistricts.filter(d => d.province === p);
      const avgScore = Math.round(ds.reduce((s, d) => s + d.result.priorityScore, 0) / ds.length);
      const avgICT = Math.round(ds.reduce((s, d) => s + d.ictAdoptionPct, 0) / ds.length);
      return `- **${p}**: avg gap score ${avgScore}/100, avg ICT ${avgICT}%`;
    }).join('\n');
    return `## Education Gap by Province — ROVI Model\n\n${summary}\n\nKigali City has the lowest average gap score due to higher ICT infrastructure and lower poverty rates (NISR EICV5). Southern and Northern provinces show the highest average gaps, driven by low ICT adoption, limited school density, and higher textbook shortages.`;
  }

  // Default
  const top3 = [...scoredDistricts].sort((a, b) => b.result.priorityScore - a.result.priorityScore).slice(0, 3);
  return `## ROVI Education Data Query Tool\n\nThis tool provides evidence-based education gap analysis across Rwanda's 30 districts using NISR data.\n\n**Top 3 priority districts:** ${top3.map(d => `**${d.name}** (${d.result.priorityScore})`).join(', ')}\n\n**Available queries:**\n- ICT adoption gaps by district\n- Smart classroom coverage\n- Textbook ratio shortfalls\n- School infrastructure density\n- Priority districts for intervention\n- NST2 education target progress\n- Provincial comparisons\n\n*Data: NISR ICT_use.px · smart.px · Primary.px · Edu_numb_scho.px · EICV5 · RPHC4*`;
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, history } = body;

  if (!message || typeof message !== 'string')
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });

  // Try Mistral if key is configured
  if (MISTRAL_API_KEY) {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...(Array.isArray(history) ? history.slice(-6).filter(m => m.role === 'user' || m.role === 'assistant') : []),
      { role: 'user', content: message },
    ];

    const mistralResp = await callMistral(messages);
    if (mistralResp) {
      return NextResponse.json({
        response: mistralResp, source: 'mistral', model: MISTRAL_MODEL,
        timestamp: new Date().toISOString(),
        dataSource: 'NISR ICT_use.px · smart.px · Primary.px · EICV5',
      });
    }
  }

  // Local fallback
  return NextResponse.json({
    response: localResponse(message), source: 'local',
    timestamp: new Date().toISOString(),
    dataSource: 'NISR ICT_use.px · smart.px · Primary.px · EICV5 · RPHC4',
  });
}
