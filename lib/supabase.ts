// ============================================
// lib/supabase.ts — Supabase 클라이언트 설정
// 지연 초기화(lazy init) 방식으로 크래시 방지
// ============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// 정책 데이터 타입 정의
// ============================================
export interface Policy {
  id: string;
  title: string;
  category: string;
  region: string;
  age_min: number;
  age_max: number;
  content: string;
  apply_url?: string;
  deadline?: string;
  host?: string;
  benefit?: string;
  similarity?: number;
}

// ============================================
// 카테고리 / 지역 상수
// ============================================
export const CATEGORIES = ['전체', '일자리', '주거', '교육', '창업', '복지', '금융'];

export const REGIONS = [
  '전체',
  '전국',
  '대전광역시',
  '대전 동구',
  '대전 중구',
  '대전 서구',
  '대전 유성구',
  '대전 대덕구',
];

// ============================================
// 환경변수 유무 확인 (크래시 없이 체크)
// ============================================
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url_here'
  );
}

export function isOpenAIConfigured(): boolean {
  return !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  );
}

// ============================================
// 지연 초기화 클라이언트 (모듈 로드 시점에 생성 X)
// 실제 호출될 때만 생성 → 미설정 시 크래시 방지
// ============================================
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

// 하위 호환성 유지 (기존 코드에서 supabase, supabaseAdmin 으로 import 하는 경우)
export const supabase = { get client() { return getSupabase(); } };
export const supabaseAdmin = { get client() { return getSupabaseAdmin(); } };
