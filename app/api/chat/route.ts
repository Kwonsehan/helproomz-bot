// ============================================
// app/api/chat/route.ts — 챗봇 핵심 API
// OpenAI 미설정 시 데모 응답으로 폴백
// ============================================
import { NextRequest } from 'next/server';
import { searchPolicies, buildSystemPrompt } from '@/lib/rag';
import { isOpenAIConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, category, region } = body;

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // ==========================================
    // RAG: 관련 정책 검색 (Supabase 없으면 로컬)
    // ==========================================
    const relatedPolicies = await searchPolicies(lastUserMessage, {
      category,
      region,
      limit: 5,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        // 관련 정책 먼저 전송
        const policyData = JSON.stringify({
          type: 'policies',
          policies: relatedPolicies,
        });
        controller.enqueue(encoder.encode(`data: ${policyData}\n\n`));

        // ==========================================
        // OpenAI 미설정 → 데모 모드 응답
        // ==========================================
        if (!isOpenAIConfigured()) {
          const demoResponse = buildDemoResponse(lastUserMessage, relatedPolicies);

          // 타이핑 효과를 위해 청크로 나눠서 전송
          const words = demoResponse.split('');
          let buffer = '';
          for (let i = 0; i < words.length; i++) {
            buffer += words[i];
            if (i % 3 === 0 || i === words.length - 1) {
              const textData = JSON.stringify({ type: 'text', content: buffer });
              controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
              buffer = '';
              // 자연스러운 타이핑 속도
              await new Promise(r => setTimeout(r, 12));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // ==========================================
        // OpenAI GPT-4o 스트리밍
        // ==========================================
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = buildSystemPrompt(relatedPolicies);

        const stream = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
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

        // 대화 로그 저장 (Supabase 설정된 경우만)
        try {
          const { getSupabaseAdmin } = await import('@/lib/supabase');
          const adminClient = getSupabaseAdmin();
          if (adminClient && sessionId) {
            await adminClient.from('chat_logs').insert([
              { session_id: sessionId, role: 'user', content: lastUserMessage },
              { session_id: sessionId, role: 'assistant', content: fullResponse },
            ]);
          }
        } catch { /* 로그 저장 실패 무시 */ }

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

// ============================================
// 데모 모드 응답 생성 (OpenAI 미설정 시)
// ============================================
function buildDemoResponse(query: string, policies: { title: string; content: string; benefit?: string; age_min: number; age_max: number; region: string; host?: string; deadline?: string; apply_url?: string; }[]): string {
  if (policies.length === 0) {
    return `"${query}"에 대한 정책 정보를 찾지 못했습니다.\n\n다른 키워드로 검색하거나, 분야/지역 필터를 변경해서 다시 시도해보세요! 😊\n\n**💡 예시 질문:**\n- 대전 취업 지원 프로그램 알려줘\n- 청년 내일채움공제 신청 방법\n- 청년 전세자금 대출 조건\n\n> ⚠️ 현재 데모 모드입니다. OpenAI API 키를 .env.local에 설정하면 AI 실시간 답변이 활성화됩니다.`;
  }

  const top = policies[0];
  return `**"${query}"** 관련해서 찾아봤어요! 🔍\n\n가장 관련성 높은 정책은 **${top.title}**입니다.\n\n**📋 주요 내용**\n${top.content}\n\n**🎁 지원 혜택**\n${top.benefit || '상세 내용 참고'}\n\n**👤 지원 대상:** ${top.age_min}~${top.age_max}세 | **📍 지역:** ${top.region}\n**🏢 주관:** ${top.host || '미상'} | **📅 기간:** ${top.deadline || '상시'}\n\n${top.apply_url ? `👉 **신청하기:** [${top.apply_url}](${top.apply_url})` : ''}\n\n아래에 관련 정책 카드도 확인해보세요! 👇\n\n> ⚠️ 현재 **데모 모드**입니다. OpenAI API 키를 \`.env.local\`에 설정하면 AI가 실시간으로 더 정확한 맞춤 답변을 제공합니다.`;
}
