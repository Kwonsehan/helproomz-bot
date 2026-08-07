// ============================================
// app/api/crawl/route.ts — 대전 5개 구청 크롤링 수집 API
// 수동 실행 및 주기적 수집 결과를 JSON으로 반환
// ============================================

import { NextResponse } from 'next/server';
import { crawlDaejeonDistrictPolicies } from '@/lib/districtCrawler';

export async function GET() {
  try {
    const policies = await crawlDaejeonDistrictPolicies();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '구청 크롤링 실패' },
      { status: 500 }
    );
  }
}
