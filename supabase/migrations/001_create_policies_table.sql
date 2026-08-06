-- ============================================
-- 001: pgvector 확장 활성화
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- pgvector 확장 활성화 (벡터 유사도 검색을 위해 필요)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 정책 정보 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS policies (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,                    -- 정책명
  category    TEXT        NOT NULL DEFAULT '기타',     -- 분야 (일자리/주거/교육/복지/창업/금융)
  region      TEXT        NOT NULL DEFAULT '전국',     -- 지역 (전국/대전광역시/대전 동구 등)
  age_min     INTEGER     NOT NULL DEFAULT 19,         -- 지원 연령 하한
  age_max     INTEGER     NOT NULL DEFAULT 39,         -- 지원 연령 상한
  content     TEXT        NOT NULL,                    -- 정책 상세 내용
  apply_url   TEXT,                                    -- 신청 링크
  deadline    TEXT,                                    -- 신청 기간 (예: "2024-12-31" 또는 "상시")
  host        TEXT,                                    -- 주관 기관
  benefit     TEXT,                                    -- 혜택/지원 내용 요약
  embedding   vector(1536),                            -- OpenAI text-embedding-3-small 벡터
  source      TEXT        DEFAULT 'manual',            -- 데이터 출처 (manual/work24/bokjiro/youthcenter)
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 인덱스 생성 (검색 성능 향상)
-- ============================================

-- 벡터 유사도 검색용 인덱스 (IVFFlat 방식)
CREATE INDEX IF NOT EXISTS policies_embedding_idx
  ON policies USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 카테고리, 지역 필터용 인덱스
CREATE INDEX IF NOT EXISTS policies_category_idx ON policies(category);
CREATE INDEX IF NOT EXISTS policies_region_idx ON policies(region);

-- ============================================
-- 벡터 유사도 검색 함수 (RAG 핵심)
-- ============================================
CREATE OR REPLACE FUNCTION match_policies(
  query_embedding  vector(1536),   -- 사용자 질문의 임베딩 벡터
  match_count      INT DEFAULT 5,  -- 반환할 결과 수
  filter_category  TEXT DEFAULT NULL, -- 분야 필터 (NULL이면 전체)
  filter_region    TEXT DEFAULT NULL  -- 지역 필터 (NULL이면 전체)
)
RETURNS TABLE (
  id          UUID,
  title       TEXT,
  category    TEXT,
  region      TEXT,
  age_min     INTEGER,
  age_max     INTEGER,
  content     TEXT,
  apply_url   TEXT,
  deadline    TEXT,
  host        TEXT,
  benefit     TEXT,
  similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.category,
    p.region,
    p.age_min,
    p.age_max,
    p.content,
    p.apply_url,
    p.deadline,
    p.host,
    p.benefit,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM policies p
  WHERE
    -- 카테고리 필터 (NULL이면 전체 검색)
    (filter_category IS NULL OR p.category = filter_category)
    AND
    -- 지역 필터 (NULL이면 전체, '전국'은 항상 포함)
    (filter_region IS NULL OR p.region = filter_region OR p.region = '전국')
    AND
    -- 임베딩이 있는 데이터만 검색
    p.embedding IS NOT NULL
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 대화 로그 테이블 (사용자 질문 통계용)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT        NOT NULL,    -- 세션 구분자
  role        TEXT        NOT NULL,    -- 'user' 또는 'assistant'
  content     TEXT        NOT NULL,    -- 메시지 내용
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
