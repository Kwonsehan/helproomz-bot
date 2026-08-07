'use client';
// ============================================
// components/PolicyCard.tsx
// AI 맞춤 추천 정책 미니 컴포넌트 (슬림 컴팩트 디자인)
// ============================================

import { Policy } from '@/lib/supabase';

interface PolicyCardProps {
  policy: Policy;
  index: number;
}

export default function PolicyCard({ policy, index }: PolicyCardProps) {
  return (
    <div
      className="policy-card-compact"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* 뱃지 & 지역 (슬림 한 줄) */}
      <div className="card-compact-header">
        <span className="compact-badge">{policy.category}</span>
        <span className="compact-region">📍 {policy.region}</span>
      </div>

      {/* 정책 제목 */}
      <h4 className="compact-title">{policy.title}</h4>

      {/* 혜택 요약 (있을 때만) */}
      {policy.benefit && (
        <p className="compact-benefit">🎁 {policy.benefit}</p>
      )}

      {/* 가로 슬림 메타 & 신청 링크 */}
      <div className="compact-footer">
        <span className="compact-target">👤 {policy.age_min}~{policy.age_max}세</span>
        {policy.apply_url && (
          <a
            href={policy.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="compact-link"
          >
            신청하기 ➔
          </a>
        )}
      </div>
    </div>
  );
}
