// ============================================
// lib/spaceCrawler.ts — 대전 공식 10개 청년공간 전용 수집 모듈
// 대표님이 전달해주신 10개 공간 맞춤 설명 & 위치 특징 100% 수정 반영
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

// 대전 공식 10개 청년공간 실물 도로명 주소 & 맞춤 혜택/설명 데이터베이스
export const DAEJEON_10_YOUTH_SPACES: YouthSpaceInfo[] = [
  // 1. 대전시 운영 (3개)
  {
    id: 'space_1',
    name: '청춘나들목',
    hostType: '대전광역시 운영',
    district: '대전 동구',
    location: '대전광역시 동구 중앙로 218 지하 3층',
    contact: '042-223-9830',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00 (일요일·공휴일 휴무)',
    description: '대전역근처 I 공간 무료 대여, 스터디, 모임',
    programs: [
      '대전역 근처 청년 스터디룸 및 공간 무료 대여',
      '청년 취업 모임 및 발표 장비 무상 지원',
      '전문 상담사 1:1 이력서 및 자기소개서 클리닉'
    ],
    url: 'https://www.daejeonyouthportal.kr/board/BBSMSTR_000000000253/articleList.do?commonMenuNo=451_452_453_455',
  },
  {
    id: 'space_2',
    name: '청춘너나들이',
    hostType: '대전광역시 운영',
    district: '대전 서구',
    location: '대전광역시 서구 둔산중로 19, 2층(샤크존)',
    contact: '042-488-8540',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '둔산동 I 공간 무료 대여(회의실 등), 스터디, 모임',
    programs: [
      '둔산동 샤크존 2층 회의실 등 공간 무료 대여',
      '청년 스터디 및 커뮤니티 소모임 장소 제공',
      '퍼스널컬러 진단 및 청년 힐링 프로그램'
    ],
    url: 'https://www.daejeonyouthportal.kr/board/BBSMSTR_000000000253/articleList.do?commonMenuNo=451_452_453_455',
  },
  {
    id: 'space_3',
    name: '청춘두두두',
    hostType: '대전광역시 운영',
    district: '대전 서구',
    location: '대전광역시 서구 갈마중로 30번길 67 1층/지하1층',
    contact: '042-224-1535',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '갈마동 I 공간 무료 대여(행사공간, 공유주방 등), 스터디, 모임',
    programs: [
      '갈마동 행사공간, 공유주방 등 공간 무료 대여',
      '청년 스터디 및 문화예술 모임 장소 지원',
      '유튜브·콘텐츠 크리에이터 촬영 스튜디오 무료 제공'
    ],
    url: 'https://www.daejeonyouthportal.kr/board/BBSMSTR_000000000253/articleList.do?commonMenuNo=451_452_453_455',
  },

  // 2. 서구 운영 (3개)
  {
    id: 'space_4',
    name: '청춘스럽 (대전서구 청년공간)',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 계룡로 314 대전일보사 사옥 1층 (갈마동)',
    contact: '042-523-7736',
    hours: '평일 11:00~21:00 / 토요일 11:00~19:00',
    description: '월평역근처 I 취업/진로 프로그램, 청년정책상담, 공간대여(회의실), 스터디룸, 모임',
    programs: [
      '월평역 근처 취업/진로 프로그램 및 청년 정책 상담',
      '회의실, 스터디룸 공간 대여 및 청년 모임 지원',
      '구직청년 무료 면접 정장 대여 (구해줘! 정장 연계)'
    ],
    url: 'https://seoguyouth.kr/',
  },
  {
    id: 'space_5',
    name: '청춘정거장',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 대덕대로 198 프뢰벨빌딩 7층',
    contact: '042-488-9830',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '둔산동 I 공간 무료 대여(회의실), 스터디, 모임',
    programs: [
      '둔산동 프뢰벨빌딩 회의실 공간 무료 대여',
      '청년 몰입형 스터디 및 커뮤니티 모임 좌석 지원',
      '대기업/공기업 현직자 초청 특강 및 멘토링'
    ],
    url: 'https://seoguyouth.kr/',
  },
  {
    id: 'space_6',
    name: '청춘포털',
    hostType: '대전 서구 운영',
    district: '대전 서구',
    location: '대전광역시 서구 사마7길 33 도솔마을어울림플랫폼 2층',
    contact: '042-288-3920',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '도마동 I 공간 무료 대여(회의실,미디어실), 스터디, 모임',
    programs: [
      '도마동 회의실, 미디어실 공간 무료 대여',
      '청년 스터디 및 자유 커뮤니티 모임 지원',
      '서구 청년 정책 통합 모니터링단 운영'
    ],
    url: 'https://seoguyouth.kr/',
  },

  // 3. 동구 운영 (1개)
  {
    id: 'space_7',
    name: '동구동락 (대전 동구 청년공간)',
    hostType: '대전 동구 운영',
    district: '대전 동구',
    location: '대전광역시 동구 백룡로 20 동구 새마을회관 3층',
    contact: '042-680-4880',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '우송대근처 I 스터디, 모임, 휴식공간',
    programs: [
      '우송대 근처 청년 스터디 및 모임 공간 제공',
      '편안하게 쉬어갈 수 있는 청년 휴식 공간 지원',
      '동구 청년 자격증 시험 응시료 지원 상담 및 AI 모의면접'
    ],
    url: 'https://www.dongguyouth.or.kr/',
  },

  // 4. 중구 운영 (1개)
  {
    id: 'space_8',
    name: '청년모아 (대전 중구 청년공간)',
    hostType: '대전 중구 운영',
    district: '대전 중구',
    location: '대전광역시 중구 목중로 70번길 15 2층',
    contact: '042-224-1530',
    hours: '평일 10:00~20:00 / 토요일 10:00~17:00',
    description: '선화동 I 공간 무료 대여(강의장,공유주방,공유오피스), 모임, 강의',
    programs: [
      '선화동/목동 강의장, 공유주방, 공유오피스 공간 무료 대여',
      '청년 커뮤니티 모임 및 역량강화 강의 진행',
      '중구 청년 소상공인 사업장 임차료 지원 상담'
    ],
    url: 'http://www.xn--660b31p2yizuh.com/',
  },

  // 5. 대덕구 운영 (1개)
  {
    id: 'space_9',
    name: '청년벙커 (대전 대덕구 청년공간)',
    hostType: '대전 대덕구 운영',
    district: '대전 대덕구',
    location: '대전광역시 대덕구 대전로 1033번길 20 대덕구청 지하 1층',
    contact: '042-608-6485',
    hours: '평일 10:00~21:00 / 토요일 10:00~18:00',
    description: '대덕구청지하 I 공간 무료 대여(라운지, 회의실, 연습실, 공유주방, 스튜디오)',
    programs: [
      '대덕구청 지하 라운지, 회의실, 연습실, 공유주방, 스튜디오 무료 대여',
      '청년 밴드 음악 연습실 및 댄스/요가 무료 강좌',
      '대덕 청년 팝업 마켓 및 청년의 날 축제'
    ],
    url: 'https://www.ddyouth.net/',
  },

  // 6. 유성구 운영 (1개)
  {
    id: 'space_10',
    name: '유성구청년지원센터 (유성구 청년공간)',
    hostType: '대전 유성구 운영',
    district: '대전 유성구',
    location: '대전광역시 유성구 농대로15번길 20',
    contact: '042-867-8830',
    hours: '평일 09:00~20:00 / 토요일 10:00~17:00',
    description: '궁동 I 공간 무료 대여(회의실,세미나실), 스터디, 모임',
    programs: [
      '궁동 회의실, 세미나실 공간 무료 대여',
      '청년 스터디 및 대학생 동아리 모임 공간 지원',
      '궁동 스타트업 타운 창업 멘토링 & 공유 오피스'
    ],
    url: 'https://www.yuseong.go.kr/ysyouth/index.do',
  },
];

/**
 * 대전 10개 청년공간 실물 도로명 주소 & 맞춤 혜택 문구를 Policy 타입으로 변환
 */
export async function crawl10YouthSpaces(): Promise<Policy[]> {
  console.log('[청년공간 수집] 대전 10개 청년공간 대표 제공 맞춤 설명 100% 반영 로드...');

  return DAEJEON_10_YOUTH_SPACES.map(space => {
    const programListText = space.programs.map((p, i) => `${i + 1}. ${p}`).join('\n');

    return {
      id: space.id,
      title: `[청년공간] ${space.name} (${space.hostType})`,
      category: '복지',
      region: space.district,
      age_min: 18,
      age_max: 39,
      content: `🏛️ **운영 주체:** ${space.hostType}\n📍 **위치 특징 및 주요 혜택:** ${space.description}\n\n📍 **정확한 도로명 주소:** ${space.location}\n⏰ **운영시간:** ${space.hours}\n📞 **문의전화:** ${space.contact}\n🌐 **공식 누리집:** [${space.name} 공식 홈페이지 바로가기](${space.url})\n\n【대표 운영 프로그램】\n${programListText}`,
      apply_url: space.url,
      deadline: '상시 운영',
      host: space.name,
      benefit: space.description,
    };
  });
}
