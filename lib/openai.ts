// ============================================
// lib/openai.ts — OpenAI 클라이언트 설정
// ============================================
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (서버 사이드 전용)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// ============================================
// 텍스트를 임베딩 벡터로 변환하는 함수
// RAG 시스템에서 유사도 검색에 사용됩니다
// ============================================
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 1536차원 벡터
    input: text,
  });

  return response.data[0].embedding;
}
