// ============================================
// app/api/chat/route.ts — 챗봇 핵심 API
// 사용자의 상세 맞춤 상황 조건(나이, 소득, 취업상태 등)을 고려한 AI 맞춤 답변
// ============================================
import { NextRequest } from 'next/server';
import { searchPolicies, buildSystemPrompt } from '@/lib/rag';
import { isOpenAIConfigured } from '@/lib/supabase';
import { getOpenAIClient } from '@/lib/openai';
import { UserSituationFilter } from '@/components/PolicyFilter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, filter } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      sessionId: string;
      filter?: UserSituationFilter;
    };

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // 사용자 맞춤 조건 텍스트 구성
    let situationSummary = '';
    if (filter) {
      const parts = [];
      if (filter.region && filter.region !== '선택하세요.') parts.push(`지역: ${filter.region}`);
      if (filter.maritalStatus && filter.maritalStatus !== '선택하세요.') parts.push(`혼인여부: ${filter.maritalStatus}`);
      if (filter.age) parts.push(`연령: 만 ${filter.age}세`);
      if (filter.incomeMin || filter.incomeMax) {
        parts.push(`연소득: ${filter.incomeMin || '0'}~${filter.incomeMax || '제한없음'}만원`);
      }
      if (filter.education && filter.education !== '제한없음') parts.push(`학력: ${filter.education}`);
      if (filter.major && filter.major !== '제한없음') parts.push(`전공: ${filter.major}`);
      if (filter.employmentStatus && filter.employmentStatus !== '제한없음') parts.push(`취업상태: ${filter.employmentStatus}`);
      if (filter.specialty && filter.specialty !== '제한없음') parts.push(`특화분야: ${filter.specialty}`);

      if (parts.length > 0) {
        situationSummary = `[사용자의 상황 필터 조건: ${parts.join(' | ')}]`;
      }
    }

    // RAG 검색 (키워드 + 사용자 상황 결합)
    const searchQuery = `${lastUserMessage} ${situationSummary}`;
    const relatedPolicies = await searchPolicies(searchQuery, {
      category: filter?.category,
      region: filter?.region !== '선택하세요.' ? filter?.region : undefined,
      limit: 5,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        // 관련 정책 데이터 먼저 전송 (상위 2개 카드로 렌더링됨)
        const policyData = JSON.stringify({
          type: 'policies',
          policies: relatedPolicies,
        });
        controller.enqueue(encoder.encode(`data: ${policyData}\n\n`));

        // OpenAI 미설정 시 데모 모드 응답
        if (!isOpenAIConfigured()) {
          const demoResponse = buildDemoResponse(lastUserMessage, relatedPolicies, situationSummary);

          const words = demoResponse.split('');
          let buffer = '';
          for (let i = 0; i < words.length; i++) {
            buffer += words[i];
            if (i % 3 === 0 || i === words.length - 1) {
              const textData = JSON.stringify({ type: 'text', content: buffer });
              controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
              buffer = '';
              await new Promise(r => setTimeout(r, 12));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // GPT-4o 스트리밍 호출
        const openai = getOpenAIClient();
        let baseSystemPrompt = buildSystemPrompt(relatedPolicies);

        if (situationSummary) {
          baseSystemPrompt += `\n\n【현재 질문한 청년의 맞춤 상황 조건】\n${situationSummary}\n반드시 위 상황 조건(나이, 취업상태, 소득, 학력 등)에 딱 맞는 정책을 우선적으로 강조하여 친절히 안내하세요!`;
        }

        const stream = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: baseSystemPrompt },
            ...messages.slice(-10),
          ],
          stream: true,
          temperature: 0.3,
          max_tokens: 1000,
        });

        let fullResponse = '';

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullResponse += delta;
            const textData = JSON.stringify({ type: 'text', content: delta });
            controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
          }
        }

        try {
          const { getSupabaseAdmin } = await import('@/lib/supabase');
          const adminClient = getSupabaseAdmin();
          if (adminClient && sessionId) {
            await adminClient.from('chat_logs').insert([
              { session_id: sessionId, role: 'user', content: lastUserMessage },
              { session_id: sessionId, role: 'assistant', content: fullResponse },
            ]);
          }
        } catch { /* 실패 무시 */ }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 데모 모드 응답 생성
function buildDemoResponse(
  query: string,
  policies: { title: string; content: string; benefit?: string; age_min: number; age_max: number; region: string; host?: string; deadline?: string; apply_url?: string; }[],
  situationSummary: string
): string {
  if (policies.length === 0) {
    return `"${query}"에 대한 맞춤 정책 정보를 찾지 못했습니다.\n\n다른 키워드로 검색하거나, 맞춤 상황 체크 필터를 조정해보세요! 😊`;
  }

  const top = policies[0];
  return `${situationSummary ? `💡 **맞춤 조건 적용:** ${situationSummary}\n\n` : ''}**"${query}"**에 가장 적합한 추천 정책은 **${top.title}**입니다.

**📋 주요 내용**
${top.content}

**🎁 지원 혜택**
${top.benefit || '상세 내용 참고'}

**👤 지원 대상:** ${top.age_min}~${top.age_max}세 | **📍 지역:** ${top.region}
**🏢 주관:** ${top.host || '정부/지자체'} | **📅 기간:** ${top.deadline || '상시'}

${top.apply_url ? `👉 **신청하기:** [${top.apply_url}](${top.apply_url})` : ''}

아래 맞춤 추천 정책 TOP 2 카드도 확인해보세요! 👇`;
}
