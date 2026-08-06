'use client';
// ============================================
// components/PolicyFilter.tsx
// 분야, 지역 필터 UI 컴포넌트
// ============================================

import { CATEGORIES, REGIONS } from '@/lib/supabase';

// 카테고리별 이모지 매핑
const CATEGORY_EMOJI: Record<string, string> = {
  '전체': '🔍',
  '일자리': '💼',
  '주거': '🏠',
  '교육': '📚',
  '창업': '🚀',
  '복지': '❤️',
  '금융': '💰',
};

interface PolicyFilterProps {
  selectedCategory: string;
  selectedRegion: string;
  onCategoryChange: (category: string) => void;
  onRegionChange: (region: string) => void;
}

export default function PolicyFilter({
  selectedCategory,
  selectedRegion,
  onCategoryChange,
  onRegionChange,
}: PolicyFilterProps) {
  return (
    <div className="filter-container">
      {/* 분야 필터 */}
      <div className="filter-section">
        <span className="filter-label">분야</span>
        <div className="filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
            >
              {CATEGORY_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 필터 */}
      <div className="filter-section">
        <span className="filter-label">지역</span>
        <div className="filter-chips">
          {REGIONS.map((reg) => (
            <button
              key={reg}
              onClick={() => onRegionChange(reg)}
              className={`chip ${selectedRegion === reg ? 'chip-active' : ''}`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
