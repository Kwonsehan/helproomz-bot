// ============================================
// lib/spaceCrawler.ts — 대전 공식 10개 청년공간 및 프로그램 수집 모듈
// 1. 대전시 운영: 청춘나들목, 청춘너나들이, 청춘두두두
// 2. 서구 운영: 청춘정거장, 청춘스럽, 청춘포털
// 3. 동구 운영: 동구동락
// 4. 중구 운영: 청년모아
// 5. 대덕구 운영: 청년벙커
// 6. 유성구 운영: 유성구청년지원센터
// ============================================

import { Policy } from './supabase';

export interface YouthSpaceInfo {
  id: string;
  name: string;
  hostType: string;
  district: string;
  location: string;
  contact: string;
  hours: string;
  description: string;
  programs: string[];
  url: string;
}

// 대전 공식 10개 청년공간 데이터베이스
export const DAEJEON_10_YOUTH_SPACES: YouthSpaceInfo[] = [
  // 1. 대전시 운영 (3개)
  {
    id: 'space_1',
    name: '청춘나들목',
    hostType: '대전광역시 운영',
    district: '대전 동구',
    location: '대전광역시 동구 중앙로 218 대전역 지하상가 내',
    contact: '042-223-9830',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00 (일요일·공휴일 휴무)',
    description: '대전역 지하상가 내 위치하여 구직 청년 스터디, 모임, 1:1 취업 컨설팅을 지원하는 역세권 청년 공간입니다.',
    programs: [
      '청년 취업 스터디룸 및 발표 장비 무상 지원',
      '전문 상담사 1:1 이력서 및 자기소개서 클리닉',
      '청년 취미 및 원데이 클래스 강좌 지원'
    ],
    url: 'https://www.daejeonyouthportal.kr',
  },
  {
    id: 'space_2',
    name: '청춘너나들이',
    hostType: '대전광역시 운영',
    district: '대전 서구',
    location: '대전광역시 서구 둔산중로 134 샤크존 2층',
    contact: '042-488-8540',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '둔산동 중심가에서 청년들의 자율 커뮤니티 활동, 동아리 모임, 소통을 보장하는 청년 거점 공간입니다.',
    programs: [
      '청년 커뮤니티 및 소모임 활동비 지원사업',
      '퍼스널컬러 진단, 이미지메이킹 워크숍',
      '자율 학습 스터디 공간 및 공유 서가 제공'
    ],
    url: 'https://www.daejeonyouthportal.kr',
  },
  {
    id: 'space_3',
    name: '청춘두두두',
    hostType: '대전광역시 운영',
    district: '대전 중구',
    location: '대전광역시 중구 중앙로 101 대전도시공사 지하 1층',
    contact: '042-224-1535',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '청년들의 문화예술, 공연, 영상 콘텐츠 제작 및 사회적 교류를 전폭 지원하는 다목적 공간입니다.',
    programs: [
      '청년 인디 음악 및 버스킹 공연 무대 제공',
      '유튜브·콘텐츠 크리에이터 촬영 스튜디오 지원',
      '청년 소통 기획 프로그램 및 토크콘서트'
    ],
    url: 'https://www.daejeonyouthportal.kr',
  },

  // 2. 서구 운영 (3개)
  {
    id: 'space_4',
    name: '청춘스럽 (대전서구 청년공간)',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 계룡로 314 대전일보사 1층',
    contact: '042-523-7736',
    hours: '평일 11:00~21:00 / 토요일 11:00~19:00',
    description: '대전 서구 청년들을 위한 대표 청년 공간으로, 무료 면접 정장 대여 연계 및 맞춤 취업·창업을 지원합니다.',
    programs: [
      '구직청년 무료 면접 정장 대여 (구해줘! 정장)',
      '서구 청년 취업 역량강화 멘토링 & 자격증 응시료 지원',
      '청년 힐링 공예 클래스 및 취미 소모임'
    ],
    url: 'https://www.seogu.go.kr',
  },
  {
    id: 'space_5',
    name: '청춘정거장',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 대학로 99 (궁동/둔산권)',
    contact: '042-825-9830',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '대학생과 구직 청년들이 편안하게 공부하고 역량을 키울 수 있도록 마련된 서구 청년 학습 정거장입니다.',
    programs: [
      '청년 국가 자격증 및 어학 스터디반 운영',
      '대기업/공기업 현직자 초청 특강 및 멘토링',
      '개인 몰입형 공부 및 노트북 스터디 좌석'
    ],
    url: 'https://www.seogu.go.kr',
  },
  {
    id: 'space_6',
    name: '청춘포털',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 갈마역로 25',
    contact: '042-288-3920',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '서구 지역 청년들의 취업 및 소상공인 창업 정보 공유와 교류를 지원하는 온라인/오프라인 청년 거점입니다.',
    programs: [
      '청년 예비 창업가 상권 분석 및 1:1 창업 컨설팅',
      '서구 청년 정책 통합 모니터링단',
      '청년 공유 오피스 및 세미나실 무료 대여'
    ],
    url: 'https://www.seogu.go.kr',
  },

  // 3. 동구 운영 (1개)
  {
    id: 'space_7',
    name: '동구동락 (대전 동구 청년공간)',
    hostType: '대전 동구 운영',
    district: '대전 동구',
    location: '대전광역시 동구 동대전로 114 (자양동)',
    contact: '042-680-4880',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '동구 지역 청년들이 함께 모여 즐기고(樂) 성장하는 동구 전용 청년 복합 문화 공간입니다.',
    programs: [
      '동구 청년 자격증 시험 응시료 지원 상담',
      'AI 모의면접 체험관 및 VR 면접 피드백',
      '청년 커뮤니티 지원사업 및 동구 청년 교류의 날'
    ],
    url: 'https://www.donggu.go.kr',
  },

  // 4. 중구 운영 (1개)
  {
    id: 'space_8',
    name: '청년모아 (대전 중구 청년공간)',
    hostType: '대전 중구 운영',
    district: '대전 중구',
    location: '대전광역시 중구 보문로 268 (선화동)',
    contact: '042-224-1530',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '중구 청년들이 모여 꿈을 나누고 청년 소상공인 지원 및 자립 기반을 다지는 공간입니다.',
    programs: [
      '중구 청년 소상공인 사업장 임차료 지원 상담',
      '청년 가죽·목공 예술 체험 클래스',
      '청년 1인가구 건강 식습관 및 밀키트 교실'
    ],
    url: 'https://www.djjunggu.go.kr',
  },

  // 5. 대덕구 운영 (1개)
  {
    id: 'space_9',
    name: '청년벙커 (대전 대덕구 청년공간)',
    hostType: '대전 대덕구 운영',
    district: '대전 대덕구',
    location: '대전광역시 대덕구 오정로 63 대덕구청 청사 지하 1층',
    contact: '042-608-6485',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '대덕구청 지하에 위치한 문화·예술·스포츠 청년 전용 지하 벙커형 복합 커뮤니티 공간입니다.',
    programs: [
      '대덕 청년밴드 음악 연습실 및 댄스 스튜디오 운영',
      '청년 체육 요가·필라테스 무료 강좌',
      '대덕 청년 팝업 마켓 및 청년의 날 축제'
    ],
    url: 'https://www.daedeok.go.kr',
  },

  // 6. 유성구 운영 (1개)
  {
    id: 'space_10',
    name: '유성구청년지원센터 (유성구 청년공간)',
    hostType: '대전 유성구 운영',
    district: '대전 유성구',
    location: '대전광역시 유성구 궁동로 18 (궁동)',
    contact: '042-867-8830',
    hours: '평일 09:00~20:00 / 토요일 10:00~17:00',
    description: '유성구 청년들의 일자리, 주거, 동아리 활동을 총괄 지원하는 유성구 공식 청년 거점 센터입니다.',
    programs: [
      '유성 청년 마을 활동가 및 동아리 지원사업',
      '궁동 스타트업 타운 창업 멘토링 & 공유 오피스',
      '대학생 맞춤 취업 역량 캠프'
    ],
    url: 'https://www.yuseong.go.kr',
  },
];

/**
 * 대전 공식 10개 청년공간 데이터를 Policy 타입으로 규격화하여 RAG 파이프라인에 공급
 */
export async function crawl10YouthSpaces(): Promise<Policy[]> {
  console.log('[청년공간 수집 모듈] 대전 공식 10개 청년공간 및 프로그램 로드...');

  return DAEJEON_10_YOUTH_SPACES.map(space => {
    const programListText = space.programs.map((p, i) => `${i + 1}. ${p}`).join('\n');

    return {
      id: space.id,
      title: `[청년공간] ${space.name} (${space.hostType})`,
      category: '복지',
      region: space.district,
      age_min: 18,
      age_max: 39,
      content: `🏛️ **운영 주체:** ${space.hostType}\n${space.description}\n\n📍 **위치:** ${space.location}\n⏰ **운영시간:** ${space.hours}\n📞 **문의전화:** ${space.contact}\n\n【주요 대표 프로그램】\n${programListText}`,
      apply_url: space.url,
      deadline: '상시 운영',
      host: space.name,
      benefit: '공간 및 스터디룸 무료 이용, 취업/창업/문화 강좌 무료 참여',
    };
  });
}
