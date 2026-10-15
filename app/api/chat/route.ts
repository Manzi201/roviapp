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

  return `You are the EduGap Rwanda Data Query Assistant — a knowledgeable education intelligence assistant for Rwanda. You help policymakers, planners, researchers, and students understand Rwanda's education sector using NISR data and national development goals.

## Platform
EduGap Rwanda — Education Gap Intelligence & Priority Platform, powered by live NISR PxWeb API data.

## Your knowledge covers
- Rwanda education system (pre-primary, primary, secondary, TVET, higher)
- NISR Education data: ICT adoption, smart classrooms, textbook ratios, school counts
- Rwanda NST2 (National Strategy for Transformation) and Vision 2050 education targets
- District-level education gap analysis across all 30 Rwanda districts
- Rwanda education policy: REB, MINEDUC, RNEC, Smart Rwanda programme
- General Rwanda geography, culture, and development context
- Connections between education and economic outcomes (employment, poverty)

## National NISR benchmarks (2021/22 — live NISR PxWeb API)
- ICT adoption: ${DEFAULT_BENCHMARKS.ictPct}% of schools (NISR ICT_use.px)
- Smart classrooms: ${DEFAULT_BENCHMARKS.smartPct}% of schools (NISR smart.px)
- Primary textbook ratio: ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 students/book (NISR Primary.px)
- Total schools: ~4,842 (NISR Edu_numb_scho.px 2021)
- NST2 targets by 2029: 100% ICT, 100% smart classrooms, 1:1 textbook ratio

## Education Gap Score (EduGap model)
Score 0–100 per district — higher = larger gap = more urgent intervention:
- ICT Readiness: 35% | Infrastructure: 30% | Learning Resources: 20% | Digital Equity: 15%
- Critical ≥58 | High 42–57 | Moderate 25–41 | Low <25

## All 30 Rwanda districts — education gap data
${districtLines}

## Response style
- Be helpful, clear, and informative — answer ANY question asked
- For education/NISR topics: cite specific data sources and numbers
- For general Rwanda topics: use your knowledge confidently  
- For policy questions: reference NST2, Vision 2050, REB, MINEDUC
- Use **bold** for key figures and district names
- Keep answers focused and professional
- You may answer questions about Rwanda history, culture, geography, government, economy etc.
- If asked something outside Rwanda/education, still try to be helpful and answer`;
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
    return `## Districts with Lowest Smart Classroom Coverage — NISR smart.px 2021/22\n\n${lines}\n\n**National average:** ${DEFAULT_BENCHMARKS.smartPct}% · **NST2 target:** 100% by 2029`;
  }
  if (q.includes('book') || q.includes('textbook') || q.includes('ratio') || q.includes('resource')) {
    const high = [...scoredDistricts].sort((a, b) => b.primaryBookRatio - a.primaryBookRatio).slice(0, 5);
    const lines = high.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — ${d.primaryBookRatio}:1 students per book`).join('\n');
    return `## Districts with Highest Textbook Shortage — NISR Primary.px 2021/22\n\n${lines}\n\n**National average:** ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 · **NST2 target:** 1:1 ratio`;
  }
  if (q.includes('infrastructure') || q.includes('school') || q.includes('construction')) {
    const low = [...scoredDistricts].sort((a, b) => a.schoolsPer1000Children - b.schoolsPer1000Children).slice(0, 5);
    const lines = low.map((d, i) => `${i + 1}. **${d.name}** — ${d.schoolsPer1000Children} schools/1000 children`).join('\n');
    return `## Districts with Lowest School Density — NISR Edu_numb_scho.px\n\n${lines}\n\nNST2 targets expanding school access especially in rural areas.`;
  }
  if (q.includes('priority') || q.includes('gap') || q.includes('worst') || q.includes('critical') || q.includes('intervention')) {
    const top5 = [...scoredDistricts].sort((a, b) => b.result.priorityScore - a.result.priorityScore).slice(0, 5);
    const lines = top5.map((d, i) => `${i + 1}. **${d.name}** (${d.province}) — Gap Score ${d.result.priorityScore}/100 [${d.result.priorityLevel}]`).join('\n');
    return `## Top Priority Districts for Education Intervention\n\n${lines}\n\nThese districts score highest on combined ICT deficit, infrastructure shortage, textbook gap, and digital equity indicators.`;
  }
  if (q.includes('nst2') || q.includes('target') || q.includes('vision 2050') || q.includes('progress')) {
    return `## NST2 Education Targets — Progress Status\n\n- **ICT in all schools:** ${DEFAULT_BENCHMARKS.ictPct}% / 100% — ${(100 - DEFAULT_BENCHMARKS.ictPct).toFixed(1)} pp remaining\n- **Smart classrooms:** ${DEFAULT_BENCHMARKS.smartPct}% / 100% — ${(100 - DEFAULT_BENCHMARKS.smartPct).toFixed(1)} pp remaining\n- **Primary textbook ratio:** ${DEFAULT_BENCHMARKS.primaryBookRatio}:1 → target 1:1\n\n*Sources: NISR ICT_use.px, smart.px, Primary.px — 2021/22*`;
  }
  if (q.includes('province') || q.includes('kigali') || q.includes('eastern') || q.includes('northern') || q.includes('southern') || q.includes('western')) {
    const allProvinces = [...new Set(districtEducationData.map(d => d.province))];
    const summary = allProvinces.map(p => {
      const ds = scoredDistricts.filter(d => d.province === p);
      const avg = Math.round(ds.reduce((s, d) => s + d.result.priorityScore, 0) / ds.length);
      const avgICT = Math.round(ds.reduce((s, d) => s + d.ictAdoptionPct, 0) / ds.length);
      return `- **${p}**: avg gap ${avg}/100, avg ICT ${avgICT}%`;
    }).join('\n');
    return `## Education Gap by Province\n\n${summary}`;
  }
  // General fallback — helpful broad response
  const top3 = [...scoredDistricts].sort((a, b) => b.result.priorityScore - a.result.priorityScore).slice(0, 3);
  return `## EduGap Rwanda — Education Intelligence Platform\n\nI can help you with any question about Rwanda's education sector, NISR data, or national development goals.\n\n**Current top priority districts:** ${top3.map(d => `**${d.name}** (score ${d.result.priorityScore})`).join(', ')}\n\n**Try asking about:**\n- ICT adoption or smart classrooms by district\n- Textbook ratios and shortages\n- School infrastructure gaps\n- NST2 education targets\n- Provincial comparisons\n- Rwanda education policy (REB, MINEDUC, Smart Rwanda)\n- Any Rwanda education topic\n\n*Data: NISR ICT_use.px · smart.px · Primary.px · Edu_numb_scho.px*`;
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
