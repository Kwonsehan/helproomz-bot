'use client';
// ============================================
// components/PolicyFilter.tsx
// 이미지 양식 반영 8개 항목 맞춤 상황 체크 필터 컴포넌트
// - 모바일 슬림 콤팩트 디자인 적용 (아담한 폰트 및 칩 패딩)
// ============================================

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

const REGION_OPTIONS = [
  '선택하세요.',
  '대전 전체',
  '대전 서구',
  '대전 유성구',
  '대전 중구',
  '대전 동구',
  '대전 대덕구',
  '전국',
];

const MARITAL_OPTIONS = ['선택하세요.', '미혼', '기혼'];

const EDUCATION_CHIPS = [
  '제한없음',
  '고졸 미만',
  '고교 재학',
  '고교 예정',
  '고교 졸업',
  '대학 재학',
  '대졸 예정',
  '대학 졸업',
  '석·박사',
];

const MAJOR_CHIPS = [
  '제한없음',
  '인문계열',
  '사회계열',
  '상경계열',
  '이공계열',
  '자연계열',
  '예체능계열',
  '농수산계열',
  '의약계열',
];

const EMPLOYMENT_CHIPS = [
  '제한없음',
  '미취업자',
  '구직자',
  '재직자',
  '자영업자/소상공인',
  '예비창업자',
  '단기근로자',
  '영세자영업자',
  '특수형태근로자',
];

const SPECIALTY_CHIPS = [
  '제한없음',
  '여성',
  '장애인',
  '다문화가정',
  '저소득층',
  '한부모가정',
  '자립준비청년',
  '보호연장아동',
  '군인/보훈',
];

export default function PolicyFilter({
  filter,
  onChangeFilter,
  onResetFilter,
}: PolicyFilterProps) {
  const updateField = (key: keyof UserSituationFilter, value: string) => {
    onChangeFilter({ ...filter, [key]: value });
  };

  return (
    <div className="situation-filter-box">
      {/* 필터 헤더 */}
      <div className="filter-header-bar">
        <h3 className="filter-title">📋 내 맞춤 상황 체크하기</h3>
        <button
          type="button"
          onClick={onResetFilter}
          className="reset-filter-btn"
        >
          🔄 조건 초기화
        </button>
      </div>

      {/* 1. 지역 & 2. 혼인여부 */}
      <div className="filter-row flex-row">
        <div className="filter-group">
          <label className="filter-label-text">지역</label>
          <select
            value={filter.region}
            onChange={(e) => updateField('region', e.target.value)}
            className="filter-select"
          >
            {REGION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label-text">혼인여부</label>
          <select
            value={filter.maritalStatus}
            onChange={(e) => updateField('maritalStatus', e.target.value)}
            className="filter-select"
          >
            {MARITAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 연령 & 4. 연소득 */}
      <div className="filter-row flex-row">
        <div className="filter-group">
          <label className="filter-label-text">연령</label>
          <div className="input-with-unit">
            <span>만</span>
            <input
              type="number"
              placeholder="예: 25"
              value={filter.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="filter-input-number"
            />
            <span>세</span>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label-text">연소득(만원)</label>
          <div className="input-range">
            <input
              type="number"
              placeholder="최소"
              value={filter.incomeMin}
              onChange={(e) => updateField('incomeMin', e.target.value)}
              className="filter-input-number"
            />
            <span>만원 이상 ~</span>
            <input
              type="number"
              placeholder="최대"
              value={filter.incomeMax}
              onChange={(e) => updateField('incomeMax', e.target.value)}
              className="filter-input-number"
            />
            <span>만원 이하</span>
          </div>
        </div>
      </div>

      {/* 5. 학력 (10개 칩) */}
      <div className="filter-row">
        <label className="filter-label-text">학력</label>
        <div className="chip-group">
          {EDUCATION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`filter-chip ${filter.education === chip ? 'chip-selected' : ''}`}
              onClick={() => updateField('education', chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 6. 전공 (9개 칩) */}
      <div className="filter-row">
        <label className="filter-label-text">전공</label>
        <div className="chip-group">
          {MAJOR_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`filter-chip ${filter.major === chip ? 'chip-selected' : ''}`}
              onClick={() => updateField('major', chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 7. 취업상태 (10개 칩) */}
      <div className="filter-row">
        <label className="filter-label-text">취업상태</label>
        <div className="chip-group">
          {EMPLOYMENT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`filter-chip ${filter.employmentStatus === chip ? 'chip-selected' : ''}`}
              onClick={() => updateField('employmentStatus', chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 8. 특화분야 (10개 칩) */}
      <div className="filter-row">
        <label className="filter-label-text">특화분야</label>
        <div className="chip-group">
          {SPECIALTY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`filter-chip ${filter.specialty === chip ? 'chip-selected' : ''}`}
              onClick={() => updateField('specialty', chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
