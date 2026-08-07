// ============================================
// app/api/chat/route.ts — AI 대화 스트리밍 & 추천 정책 조건부 카드 반환 API
// - 맞춤 설정 안함 ➔ '💡 추천 정책 TOP 2' (질문 분야 연관 카테고리 무작위 2개)
// - 맞춤 설정 함 ➔ '💡 맞춤 추천 정책 TOP 2' (사용자 맞춤 필터 반영 2개)
// ============================================

import { getOpenAIClient } from '@/lib/openai';
import { searchPolicies, buildSystemPrompt } from '@/lib/rag';
import { UserSituationFilter } from '@/components/PolicyFilter';

export const runtime = 'nodejs';

// 사용자가 맞춤 필터를 설정했는지 여부 검사 함수
function isCustomFilterApplied(filter?: UserSituationFilter): boolean {
  if (!filter) return false;
  const isRegionSet = filter.region && filter.region !== '선택하세요.';
  const isMaritalSet = filter.maritalStatus && filter.maritalStatus !== '선택하세요.';
  const isAgeSet = Boolean(filter.age && filter.age.trim() !== '');
  const isIncomeSet = Boolean((filter.incomeMin && filter.incomeMin.trim() !== '') || (filter.incomeMax && filter.incomeMax.trim() !== ''));
  const isEduSet = filter.education && filter.education !== '제한없음';
  const isMajorSet = filter.major && filter.major !== '제한없음';
  const isEmpSet = filter.employmentStatus && filter.employmentStatus !== '제한없음';
  const isSpecSet = filter.specialty && filter.specialty !== '제한없음';

  return Boolean(
    isRegionSet || isMaritalSet || isAgeSet || isIncomeSet ||
    isEduSet || isMajorSet || isEmpSet || isSpecSet
  );
}

export async function POST(req: Request) {
  try {
    const { messages, filter } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '메시지가 비어있습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const isCustomFiltered = isCustomFilterApplied(filter);

    // RAG 정책 검색 (맞춤 설정 여부 반영)
    const policies = await searchPolicies(lastUserMessage, {
      category: filter?.category && filter.category !== '전체' ? filter.category : undefined,
      region: filter?.region && filter.region !== '선택하세요.' ? filter.region : undefined,
      limit: 5,
    });

    // 2개 추천 카드 선택 (맞춤 설정 안했을 경우 약간의 셔플 무작위성 부여)
    let top2Policies = policies.slice(0, 2);
    if (!isCustomFiltered && policies.length >= 2) {
      // 맞춤 설정 안 한 경우 연관 정책 중 2개 무작위 믹스
      const shuffled = [...policies].sort(() => 0.5 - Math.random());
      top2Policies = shuffled.slice(0, 2);
    }

    const systemPrompt = buildSystemPrompt(policies);
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
      ],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // 1. 추천 정책 카드 2개 및 맞춤 설정 여부(isCustomFiltered) 클라이언트로 전달
        const policyEvent = `data: ${JSON.stringify({
          type: 'policies',
          policies: top2Policies,
          isCustomFiltered,
        })}\n\n`;
        controller.enqueue(encoder.encode(policyEvent));

        // 2. OpenAI 스트리밍 텍스트 전달
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            const textEvent = `data: ${JSON.stringify({ type: 'text', content: text })}\n\n`;
            controller.enqueue(encoder.encode(textEvent));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('채팅 API 오류:', error);
    return new Response(JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
