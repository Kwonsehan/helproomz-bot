// ============================================
// app/api/space-crawl/route.ts — 대전 공식 10개 청년공간 API
// 1. 대전시: 청춘나들목, 청춘너나들이, 청춘두두두
// 2. 서구: 청춘정거장, 청춘스럽, 청춘포털
// 3. 동구: 동구동락
// 4. 중구: 청년모아
// 5. 대덕구: 청년벙커
// 6. 유성구: 유성구청년지원센터
// ============================================

import { NextResponse } from 'next/server';
import { DAEJEON_10_YOUTH_SPACES, crawl10YouthSpaces } from '@/lib/spaceCrawler';

export async function GET() {
  try {
    const policies = await crawl10YouthSpaces();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: DAEJEON_10_YOUTH_SPACES.length,
      spaces: DAEJEON_10_YOUTH_SPACES,
      policies,
    });
  } catch (error) {
    console.error('청년공간 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '대전 청년공간 조회 실패' },
      { status: 500 }
    );
  }
}
