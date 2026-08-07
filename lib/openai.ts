// ============================================
// lib/openai.ts — OpenAI 클라이언트 설정
// 지연 초기화(Lazy init) 방식으로 빌드 시 크래시 방지
// 빌드 시점에는 생성하지 않고, 실제 호출 시에만 초기화
// ============================================
import OpenAI from 'openai';

// 모듈 최상단에서 즉시 new OpenAI()를 호출하면
// Vercel 빌드 시 환경변수가 없어 크래시 발생
// → 싱글턴 지연 초기화(Lazy Singleton) 패턴으로 해결
let _openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openaiInstance) {
    _openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return _openaiInstance;
}

// ============================================
// 텍스트를 임베딩 벡터로 변환하는 함수
// RAG 시스템에서 유사도 검색에 사용됩니다
// ============================================
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 1536차원 벡터
    input: text,
  });

  return response.data[0].embedding;
}
