import { NextResponse } from 'next/server';
import {
  fetchEducationData,
  totalSchools,
  schoolsUsingICT,
  schoolsWithoutICT,
  smartSchoolsCount,
  primaryAvgRatio,
  secondaryAvgRatio,
} from '@/lib/nisr-education';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchEducationData();

    const summary = {
      // Schools
      totalSchools:          totalSchools(data),
      totalSchoolsYear:      data.schools.totalLatestYear,
      // ICT
      ictPct:                data.ictUse.latestPct,
      ictYear:               data.ictUse.latestYear,
      ictYoY:                data.ictUse.yoyChange,
      usingICT:              schoolsUsingICT(data),
      notUsingICT:           schoolsWithoutICT(data),
      // Smart
      smartPct:              data.smartClassrooms.latestPct,
      smartYear:             data.smartClassrooms.latestYear,
      smartSchools:          smartSchoolsCount(data),
      // Books
      primaryAvgRatio:       primaryAvgRatio(data),
      primaryBooksYear:      data.primaryBooks.latestYear,
      secondaryAvgRatio:     secondaryAvgRatio(data),
      secondaryBooksYear:    data.secondaryBooks.latestYear,
    };

    return NextResponse.json({
      ok: true,
      data,
      summary,
      sources: {
        schools:        'NISR — School Infrastructure/Edu_numb_scho.px',
        ictUse:         'NISR — ICT, Science and Technology/ICT_use.px',
        smartClassrooms:'NISR — ICT, Science and Technology/smart.px',
        primaryBooks:   'NISR — Books And Textbooks/Primary.px',
        secondaryBooks: 'NISR — Books And Textbooks/lower_secondary.px',
      },
      fetchedAt: data.fetchedAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/education]', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
