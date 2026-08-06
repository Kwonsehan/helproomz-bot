'use client';
// ============================================
// components/PolicyCard.tsx
// AI가 찾아준 관련 정책 카드 컴포넌트
// ============================================

import { Policy } from '@/lib/supabase';

// 카테고리별 색상 클래스
const CATEGORY_COLORS: Record<string, string> = {
  '일자리': 'badge-job',
  '주거': 'badge-house',
  '교육': 'badge-edu',
  '창업': 'badge-startup',
  '복지': 'badge-welfare',
  '금융': 'badge-finance',
  '기타': 'badge-etc',
};

interface PolicyCardProps {
  policy: Policy;
  index: number;
}

export default function PolicyCard({ policy, index }: PolicyCardProps) {
  return (
    <div
      className="policy-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 카드 헤더 */}
      <div className="policy-card-header">
        <span className={`badge ${CATEGORY_COLORS[policy.category] || 'badge-etc'}`}>
          {policy.category}
        </span>
        <span className="policy-region">📍 {policy.region}</span>
      </div>

      {/* 정책명 */}
      <h3 className="policy-title">{policy.title}</h3>

      {/* 혜택 요약 */}
      {policy.benefit && (
        <div className="policy-benefit">
          <span className="benefit-icon">🎁</span>
          <span className="benefit-text">{policy.benefit}</span>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="policy-meta">
        <span>👤 {policy.age_min}~{policy.age_max}세</span>
        {policy.deadline && <span>📅 {policy.deadline}</span>}
        {policy.host && <span>🏢 {policy.host}</span>}
      </div>

      {/* 신청 버튼 */}
      {policy.apply_url && (
        <a
          href={policy.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="apply-btn"
        >
          신청하기 →
        </a>
      )}
    </div>
  );
}
