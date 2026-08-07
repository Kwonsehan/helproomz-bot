// ============================================
// lib/rag.ts — RAG 핵심 로직
// - 온통청년 오픈 API 실시간 연동
// - 대전 5개 자치구청(서구, 유성구, 중구, 동구, 대덕구) 자동 크롤러 연동
// - 대전 공식 10개 청년공간(청춘스럽, 청춘나들목, 청년벙커 등) 데이터 통합
// ============================================
import { Policy, getSupabaseAdmin } from './supabase';
import { fetchYouthCenterPolicies } from './youthcenter';
import { crawlDaejeonDistrictPolicies } from './districtCrawler';
import { crawl10YouthSpaces } from './spaceCrawler';

// ============================================
// 로컬 샘플 데이터 (기본 정책)
// ============================================
const SAMPLE_POLICIES: Policy[] = [
  {
    id: '1', title: '미래두배 청년통장', category: '금융', region: '대전광역시',
    age_min: 18, age_max: 39,
    content: '근로청년이 매월 15만원씩 2년간 저축 시, 대전시가 적립금과 동일한 금액을 매칭 지원하여 목돈 마련을 돕는 사업입니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '연중 (대전청년내일재단 별도 공고)',
    host: '대전광역시 / 대전청년내일재단', benefit: '본인 저축액과 동일금액 매칭 지원',
  },
  {
    id: '2', title: '청년부부 결혼 장려금 지원', category: '복지', region: '대전광역시',
    age_min: 18, age_max: 39,
    content: '고물가 시대에 결혼 무렵 주택마련 및 살림 장만을 위한 비용 부담을 덜어주기 위해 결혼장려금을 지원합니다. 혼인신고일 포함 대전 내 6개월 이상 거주한 초혼 혼인신고자가 대상입니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '상시 신청',
    host: '대전광역시 / 대전청년내일재단', benefit: '1인당 250만원 (부부 합산 최대 500만원)',
  },
  {
    id: '3', title: '대전 청년 월세지원 사업', category: '주거', region: '대전광역시',
    age_min: 19, age_max: 39,
    content: '기준 중위소득 150% 이하인 무주택 청년 1인가구 및 청년부부를 대상으로 월세를 지원합니다. 임차 보증금 1억원 이하, 월세 60만원 이하의 건물에 거주해야 합니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '연중 (분기별 등 별도 공고)',
    host: '대전광역시 / 대전청년내일재단', benefit: '월 최대 20만원씩 최대 12개월 (최대 240만원)',
  },
  {
    id: '4', title: '구직청년 면접용 정장대여 (구해줘! 정장)', category: '일자리', region: '대전광역시',
    age_min: 18, age_max: 39,
    content: '취업 면접을 앞둔 구직 청년들에게 면접에 필요한 정장을 무료로 대여해주는 사업입니다. 남성은 재킷, 셔츠, 넥타이, 바지, 벨트 / 여성은 재킷, 블라우스, 치마, 구두를 대여할 수 있습니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '상시 (예산 소진 시까지)',
    host: '대전청년내일재단', benefit: '면접용 정장 세트 무료 대여 (연 600명 규모)',
  },
  {
    id: '5', title: '청년 주택임차보증금 이자지원', category: '주거', region: '대전광역시',
    age_min: 19, age_max: 39,
    content: '목돈 마련이 어려운 청년들의 주거비용 부담을 완화하기 위해 전월세 주택 임차보증금 대출 추천 및 이자를 지원합니다. 본인 연소득 4천5백만원 이하(부부합산 1억원 이하)가 대상입니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '연중 (자금 소진 시까지)',
    host: '대전광역시 / 대전청년내일재단 / 하나은행', benefit: '대출 이자 지원 (최대 2.25%, 연 최대 250만원)',
  },
  {
    id: '6', title: '대전 정착형 청년일자리 종합 프로젝트', category: '일자리', region: '대전광역시',
    age_min: 18, age_max: 38,
    content: '미래 핵심산업과 연계하여 청년이 일하고 싶은 기업(청끌기업)을 발굴하고, 맞춤형 실무 교육과 일자리 매칭을 통해 청년의 장기근속과 대전 정착을 돕는 프로젝트입니다.',
    apply_url: 'https://www.daejeon.go.kr', deadline: '연중',
    host: '대전광역시', benefit: '실무형 인재양성 교육 및 우수 기업 취업 연계',
  },
  {
    id: '7', title: '대학생 학자금 이자지원 및 신용회복 지원', category: '교육', region: '대전광역시',
    age_min: 18, age_max: 39,
    content: '청년의 학업부담 경감을 위해 대전에 거주하는 대학(원)생을 대상으로 한국장학재단 학자금대출 이자 전액을 지원하며, 신용유의자의 경우 분할상환약정 초입금(10%)을 지원합니다.',
    apply_url: 'https://www.daejeonyouthportal.kr', deadline: '상·하반기 별도 공고',
    host: '대전광역시 / 한국장학재단', benefit: '학자금 대출 이자 발생분 전액 지원 등',
  },
  {
    id: '8', title: '청년 일경험 인턴 지원사업', category: '일자리', region: '전국',
    age_min: 18, age_max: 34,
    content: '취업 경험이 부족한 청년에게 공공기관·민간기업에서의 실무 경험 기회를 제공하는 인턴 연계 사업입니다. 고용24의 일경험지원사업 메뉴에서 참여 기업과 모집 공고를 확인하고 지원할 수 있습니다.',
    apply_url: 'https://yw.work24.go.kr/main.do', deadline: '수시 모집',
    host: '고용노동부 / 한국고용정보원', benefit: '인턴 급여 지원 및 정규직 전환 우대',
  },
  {
    id: '9', title: '청년인재DB 공공기관 청년 취업 연계', category: '일자리', region: '전국',
    age_min: 18, age_max: 34,
    content: '정부가 운영하는 청년인재DB(2030db.go.kr)에 이력서를 등록하면, 공공기관·공기업이 직접 스카우트 제안을 할 수 있습니다. 인사혁신처가 운영하며 공공분야 취업을 목표로 하는 청년에게 유리합니다.',
    apply_url: 'https://www.2030db.go.kr/', deadline: '상시 등록',
    host: '인사혁신처', benefit: '공공기관 스카우트 제안 수령 및 채용 연계',
  },
  {
    id: '10', title: '국민취업지원제도 (청년 우선 지원)', category: '일자리', region: '전국',
    age_min: 15, age_max: 34,
    content: '취업을 원하는 청년에게 취업활동계획 수립, 직업훈련, 일경험, 복지서비스 연계 및 취업촉진수당을 지원합니다. 고용24에서 신청 가능하며 I유형(저소득)은 월 50만원의 구직촉진수당을 지급합니다.',
    apply_url: 'https://www.work24.go.kr', deadline: '수시 (예산 소진 시까지)',
    host: '고용노동부', benefit: '구직촉진수당 월 50만원 × 최대 6개월 (I유형)',
  },
  {
    id: '11', title: '청년도약계좌', category: '금융', region: '전국',
    age_min: 19, age_max: 34,
    content: '만 19~34세 청년이 매월 최대 70만원을 납입하면 정부가 기여금을 지원하여 5년 만기 시 최대 5천만원의 목돈 마련을 지원하는 사업입니다. 개인소득 7,500만원 이하인 근로·사업소득이 있는 청년이 대상입니다.',
    apply_url: 'https://www.youthcenter.go.kr/main', deadline: '매월 신규 가입 신청',
    host: '금융위원회 / 서민금융진흥원', benefit: '5년 만기 최대 5,000만원 + 비과세 혜택',
  },
  {
    id: '12', title: '대전 일자리정보망 (jobdaejeon)', category: '일자리', region: '대전광역시',
    age_min: 18, age_max: 99,
    content: '대전광역시에서 운영하는 지역 특화 취업 포털입니다. 대전 지역 채용 공고, AI 모의면접, 청년 인턴 지원사업 등 다양한 지역 밀착형 일자리 서비스를 무료로 이용할 수 있습니다.',
    apply_url: 'https://www.jobdaejeon.or.kr', deadline: '상시',
    host: '대전광역시', benefit: '지역 특화 채용 공고 및 AI 모의면접 무료 제공',
  },
];

// ============================================
// 핵심 홈페이지 DB
// ============================================
export const YOUTH_RESOURCE_SITES = {
  policy: [
    {
      name: '온통청년 (전국 청년정책 통합 포털)',
      url: 'https://www.youthcenter.go.kr/main',
      desc: '중앙부처·지자체의 모든 청년정책을 한 곳에서 검색 가능. 분야별·지역별·나이별 맞춤 필터 제공',
      scope: '전국',
    },
    {
      name: '대전청년포털',
      url: 'https://www.daejeonyouthportal.kr/index.do',
      desc: '대전광역시 청년정책 통합 포털. 월세지원, 미래두배청년통장, 취업지원 등 대전 특화 정책 신청 가능',
      scope: '대전',
    },
  ],
  job: [
    {
      name: '일경험인턴 (고용24 일경험지원사업)',
      url: 'https://yw.work24.go.kr/main.do',
      desc: '공공·민간기업 청년 일경험 인턴 모집 공고 확인 및 신청',
      scope: '전국',
    },
    {
      name: '청년인재DB',
      url: 'https://www.2030db.go.kr/',
      desc: '이력서 등록 시 공공기관이 직접 스카우트 제안. 인사혁신처 운영',
      scope: '전국',
    },
    {
      name: '고용24 (통합 취업 포털)',
      url: 'https://www.work24.go.kr',
      desc: '워크넷+고용보험+내일배움카드+국민취업지원제도 통합. 구직신청, 실업급여, 훈련수강 가능',
      scope: '전국',
    },
    {
      name: '잡알리오 (공공기관 채용)',
      url: 'https://job.alio.go.kr',
      desc: '전국 공기업·준정부기관 채용공고 통합 제공. 공공기관 취업 목표자 필수',
      scope: '전국',
    },
    {
      name: '대전일자리정보망',
      url: 'https://www.jobdaejeon.or.kr',
      desc: '대전시 운영 지역 특화 취업 포털. 채용공고, AI 모의면접, 청년 인턴 지원사업',
      scope: '대전',
    },
  ],
};

// ============================================
// 로컬 키워드 검색
// ============================================
function localSearch(
  query: string,
  options: { category?: string; region?: string; limit?: number },
  extraPolicies: Policy[] = []
): Policy[] {
  const { category, region, limit = 5 } = options;
  const q = query.toLowerCase();

  const keywords = q.split(/\s+/).filter(k => k.length > 0);
  const allList = [...SAMPLE_POLICIES, ...extraPolicies];

  const scored = allList
    .filter(p => {
      if (category && category !== '전체' && p.category !== category) return false;
      if (region && region !== '전체' && !p.region.includes(region) && p.region !== '전국') return false;
      return true;
    })
    .map(p => {
      const text = `${p.title} ${p.content} ${p.benefit} ${p.category} ${p.region}`.toLowerCase();
      const score = keywords.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);
      return { ...p, similarity: score };
    })
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, limit);

  return scored.length > 0 ? scored : allList.slice(0, limit);
}

// ============================================
// RAG 검색 함수 (메인 export)
// 1. 온통청년 Open API 호출
// 2. 대전 5개 자치구청 자동 크롤러 연동
// 3. 대전 공식 10개 청년공간 및 프로그램 통합 검색
// ============================================
export async function searchPolicies(
  query: string,
  options: {
    category?: string;
    region?: string;
    limit?: number;
  } = {}
): Promise<Policy[]> {
  const { category, region, limit = 5 } = options;

  // 1. 온통청년 API 호출
  let apiPolicies: Policy[] = [];
  try {
    apiPolicies = await fetchYouthCenterPolicies(query, limit);
  } catch (e) {
    console.error('온통청년 API 오류:', e);
  }

  // 2. 대전 5개 자치구청 크롤링 데이터
  let districtPolicies: Policy[] = [];
  try {
    districtPolicies = await crawlDaejeonDistrictPolicies();
  } catch (e) {
    console.error('구청 크롤링 오류:', e);
  }

  // 3. 대전 공식 10개 청년공간 프로그램 데이터
  let spacePolicies: Policy[] = [];
  try {
    spacePolicies = await crawl10YouthSpaces();
  } catch (e) {
    console.error('청년공간 수집 오류:', e);
  }

  // 4. Supabase DB 검색 시도
  const supabaseAdmin = getSupabaseAdmin();
  let dbPolicies: Policy[] = [];

  if (supabaseAdmin) {
    try {
      const { createEmbedding } = await import('./openai');
      const queryEmbedding = await createEmbedding(query);

      const { data, error } = await supabaseAdmin.rpc('match_policies', {
        query_embedding: queryEmbedding,
        match_count: limit,
        filter_category: category && category !== '전체' ? category : null,
        filter_region: region && region !== '전체' ? region : null,
      });

      if (!error && data) dbPolicies = data;
    } catch (err) {
      console.error('Supabase 벡터 검색 오류:', err);
    }
  }

  // 5. 로컬 및 구청/공간 통합 검색
  const extraList = [...districtPolicies, ...spacePolicies];
  const localResults = localSearch(query, options, extraList);

  // 6. 모든 결과 병합 (중복 제거)
  const combined = [...apiPolicies, ...extraList, ...dbPolicies, ...localResults];
  const uniqueMap = new Map<string, Policy>();

  for (const item of combined) {
    if (!uniqueMap.has(item.title)) {
      uniqueMap.set(item.title, item);
    }
  }

  const result = Array.from(uniqueMap.values()).slice(0, limit);
  return result;
}

// ============================================
// 홈페이지 DB를 문자열로 변환 (시스템 프롬프트용)
// ============================================
function buildSiteDirectory(): string {
  const policyLinks = YOUTH_RESOURCE_SITES.policy
    .map(s => `- [${s.scope}] ${s.name}: ${s.url}\n  → ${s.desc}`)
    .join('\n');

  const jobLinks = YOUTH_RESOURCE_SITES.job
    .map(s => `- [${s.scope}] ${s.name}: ${s.url}\n  → ${s.desc}`)
    .join('\n');

  return `【청년정책 홈페이지】
${policyLinks}

【일자리·취업 홈페이지】
${jobLinks}`;
}

// ============================================
// GPT-4o 시스템 프롬프트 생성
// ============================================
export function buildSystemPrompt(policies: Policy[]): string {
  const policyContext = policies.length > 0
    ? policies.map((p, i) =>
        `[정책/공간 ${i + 1}] ${p.title}
분야: ${p.category} | 지역: ${p.region} | 대상: ${p.age_min}~${p.age_max}세
혜택: ${p.benefit || '상세 내용 참고'}
내용: ${p.content}
신청: ${p.apply_url || 'https://www.youthcenter.go.kr/main'} | 기간: ${p.deadline || '상시'}
주관: ${p.host || '정부/지자체'}`
      ).join('\n\n---\n\n')
    : '현재 해당하는 정책/공간 정보를 찾지 못했습니다.';

  const siteDirectory = buildSiteDirectory();

  return `당신은 대전서구 청년공간 청춘스럽의 청년정책 전문 AI 안내봇입니다.
청년들에게 중앙정부, 대전광역시, 대전 5개 자치구청(서구, 유성구, 중구, 동구, 대덕구) 정책과 대전 공식 10개 청년공간 정보를 친절하고 정확하게 안내합니다.

【대전 공식 10개 청년공간 개요】
1. 대전시 운영: 청춘나들목(대전역 지하상가), 청춘너나들이(서구 둔산동), 청춘두두두(중구 대전도시공사 지하)
2. 서구 운영: 청춘스럽(서구 계룡로 대표공간), 청춘정거장(궁동/둔산), 청춘포털(갈마)
3. 동구 운영: 동구동락(자양동)
4. 중구 운영: 청년모아(선화동)
5. 대덕구 운영: 청년벙커(대덕구청 지하)
6. 유성구 운영: 유성구청년지원센터(궁동)

【답변 규칙】
1. 검색된 최신 정책 및 10개 청년공간 프로그램 정보를 최우선으로 활용하여 답변하세요
2. 사용자가 대전 청년공간 위치, 프로그램, 운영시간을 물어보면 위 10개 공식 청년공간 정보를 한눈에 알아보기 쉽게 안내하세요
3. 관련 링크가 있으면 반드시 [사이트이름](URL) 형식으로 클릭 시 이동하도록 작성하세요

【청년정책·일자리 핵심 홈페이지 디렉토리】
${siteDirectory}

【현재 검색된 대전 정책 및 10개 청년공간 데이터】
${policyContext}

위 정보를 바탕으로 청년들의 질문에 성실하게 답변해주세요.`;
}
