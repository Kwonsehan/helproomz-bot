'use client';
// ============================================
// components/PolicyFilter.tsx
// 청년 맞춤 상황 체크 필터 UI 컴포넌트
// 사용자의 지역, 연령, 소득, 학력, 취업상태 등 조건 설정
// ============================================

import React from 'react';

// 상세 사용자 조건 인터페이스 정의
export interface UserSituationFilter {
  region: string;
  maritalStatus: string;
  age: string;
  incomeMin: string;
  incomeMax: string;
  education: string;
  major: string;
  employmentStatus: string;
  specialty: string;
  category: string;
}

interface PolicyFilterProps {
  filter: UserSituationFilter;
  onChangeFilter: (newFilter: UserSituationFilter) => void;
  onResetFilter: () => void;
}

// 옵션 상수 정의
export const EDUCATION_OPTIONS = [
  '제한없음', '고졸 미만', '고교 재학', '고교 예정', '고교 졸업',
  '대학 재학', '대졸 예정', '대학 졸업', '석·박사', '기타'
];

export const MAJOR_OPTIONS = [
  '제한없음', '인문계열', '사회계열', '상경계열', '이학계열',
  '공학계열', '예체능계열', '농산업계열', '기타'
];

export const EMPLOYMENT_OPTIONS = [
  '제한없음', '재직자', '자영업자', '미취업자', '프리랜서',
  '일용근로자', '(예비)창업자', '단기근로자', '영농종사자', '기타'
];

export const SPECIALTY_OPTIONS = [
  '제한없음', '중소기업', '여성', '기초생활수급자', '한부모가정',
  '장애인', '농업인', '군인', '지역인재', '기타'
];

export const REGION_OPTIONS = [
  '선택하세요.', '대전 전체', '대전 동구', '대전 중구', '대전 서구', '대전 유성구', '대전 대덕구', '전국'
];

export const MARITAL_OPTIONS = [
  '선택하세요.', '미혼', '기혼(신혼부부)', '제한없음'
];

export const CATEGORY_OPTIONS = [
  '전체', '일자리', '주거', '교육', '창업', '복지', '금융'
];

export default function PolicyFilter({ filter, onChangeFilter, onResetFilter }: PolicyFilterProps) {
  // 개별 필터 변경 핸들러
  const handleSingleChange = (key: keyof UserSituationFilter, value: string) => {
    onChangeFilter({
      ...filter,
      [key]: value,
    });
  };

  return (
    <div className="situation-filter-box">
      <div className="filter-header-bar">
        <h3 className="filter-title">📋 내 맞춤 상황 체크하기</h3>
        <button type="button" onClick={onResetFilter} className="reset-filter-btn">
          🔄 조건 초기화
        </button>
      </div>

      {/* 1. 지역 & 혼인여부 */}
      <div className="filter-row flex-row">
        <div className="filter-group">
          <label className="filter-label-text">지역</label>
          <select
            value={filter.region}
            onChange={(e) => handleSingleChange('region', e.target.value)}
            className="filter-select"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label-text">혼인여부</label>
          <select
            value={filter.maritalStatus}
            onChange={(e) => handleSingleChange('maritalStatus', e.target.value)}
            className="filter-select"
          >
            {MARITAL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 연령 & 연소득 */}
      <div className="filter-row flex-row">
        <div className="filter-group">
          <label className="filter-label-text">연령</label>
          <div className="input-with-unit">
            <span>만</span>
            <input
              type="number"
              placeholder="예: 25"
              value={filter.age}
              onChange={(e) => handleSingleChange('age', e.target.value)}
              className="filter-input-number"
            />
            <span>세</span>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label-text">연소득 (만원)</label>
          <div className="input-range">
            <input
              type="number"
              placeholder="최소"
              value={filter.incomeMin}
              onChange={(e) => handleSingleChange('incomeMin', e.target.value)}
              className="filter-input-number"
            />
            <span>만원 이상 ~</span>
            <input
              type="number"
              placeholder="최대"
              value={filter.incomeMax}
              onChange={(e) => handleSingleChange('incomeMax', e.target.value)}
              className="filter-input-number"
            />
            <span>만원 이하</span>
          </div>
        </div>
      </div>

      {/* 3. 학력 */}
      <div className="filter-row">
        <label className="filter-label-text">학력</label>
        <div className="chip-group">
          {EDUCATION_OPTIONS.map((edu) => (
            <button
              key={edu}
              type="button"
              onClick={() => handleSingleChange('education', edu)}
              className={`filter-chip ${filter.education === edu ? 'chip-selected' : ''}`}
            >
              {edu}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 전공요건 */}
      <div className="filter-row">
        <label className="filter-label-text">전공요건</label>
        <div className="chip-group">
          {MAJOR_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSingleChange('major', m)}
              className={`filter-chip ${filter.major === m ? 'chip-selected' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 5. 취업상태 */}
      <div className="filter-row">
        <label className="filter-label-text">취업상태</label>
        <div className="chip-group">
          {EMPLOYMENT_OPTIONS.map((emp) => (
            <button
              key={emp}
              type="button"
              onClick={() => handleSingleChange('employmentStatus', emp)}
              className={`filter-chip ${filter.employmentStatus === emp ? 'chip-selected' : ''}`}
            >
              {emp}
            </button>
          ))}
        </div>
      </div>

      {/* 6. 특화분야 */}
      <div className="filter-row">
        <label className="filter-label-text">특화분야</label>
        <div className="chip-group">
          {SPECIALTY_OPTIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => handleSingleChange('specialty', spec)}
              className={`filter-chip ${filter.specialty === spec ? 'chip-selected' : ''}`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
