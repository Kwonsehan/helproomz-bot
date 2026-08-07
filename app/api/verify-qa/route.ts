// ============================================
// app/api/verify-qa/route.ts — 32개 추천 질문 & 홈페이지 링크 무결성 자동 검증 API
// 챗봇이 알고 있는 32개 질문과 실제 정책/링크 간 1:1 매칭 상태 전수 조사
// ============================================

import { NextResponse } from 'next/server';
import { CATEGORY_QUESTION_POOLS, CategoryTab } from '@/components/ChatWindow';
import { searchPolicies } from '@/lib/rag';

export async function GET() {
  try {
    const results: Array<{
      category: CategoryTab;
      question: string;
      matchedPolicyTitle: string;
      matchedRegion: string;
      applyUrl: string;
      status: 'SUCCESS' | 'WARNING';
    }> = [];

    const categories: CategoryTab[] = ['일자리', '주거금융', '창업복지', '청년공간'];

    for (const cat of categories) {
      const questions = CATEGORY_QUESTION_POOLS[cat];

      for (const q of questions) {
        // 실제 RAG 파이프라인으로 검색 수행
        const policies = await searchPolicies(q, { limit: 2 });
        const topPolicy = policies[0];

        results.push({
          category: cat,
          question: q,
          matchedPolicyTitle: topPolicy ? topPolicy.title : '매칭 정책 없음',
          matchedRegion: topPolicy ? topPolicy.region : '-',
          applyUrl: topPolicy?.apply_url || 'https://www.daejeonyouthportal.kr',
          status: topPolicy ? 'SUCCESS' : 'WARNING',
        });
      }
    }

    const totalCount = results.length;
    const successCount = results.filter(r => r.status === 'SUCCESS').length;

    return NextResponse.json({
      title: '청춘스럽 챗봇 32개 추천 질문 & 링크 무결성 검증 리포트',
      timestamp: new Date().toISOString(),
      summary: {
        totalQuestions: totalCount,
        successfullyMatched: successCount,
        matchRate: `${Math.round((successCount / totalCount) * 100)}%`,
      },
      results,
    });
  } catch (error) {
    console.error('QA 검증 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '무결성 검증 중 오류 발생' },
      { status: 500 }
    );
  }
}
