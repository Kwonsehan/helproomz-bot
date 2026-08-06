// ============================================
// lib/youthcenter.ts
// 온통청년(한국고용정보원) OPEN API 연동 모듈
// 1. 청년정책 API (openApiVcntId: 3b0ae4e4-a7ce-4d47-b688-7b2309ed0d52)
// 2. 청년센터 API (openApiVcntId: 11ced997-421b-465b-8779-7d5f466d3125)
// ============================================

import { Policy } from './supabase';

// 온통청년 API 키 (환경변수에서 읽어옴)
const YOUTH_POLICY_API_KEY = process.env.YOUTH_POLICY_API_KEY || '3b0ae4e4-a7ce-4d47-b688-7b2309ed0d52';
const YOUTH_CENTER_API_KEY = process.env.YOUTH_CENTER_API_KEY || '11ced997-421b-465b-8779-7d5f466d3125';

// 간이 XML 태그 추출 유틸리티 (외부 라이브러리 없이 빠른 파싱)
function getXmlTagValue(xmlStr: string, tagName: string): string {
  const match = xmlStr.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

// XML 내 반복 항목 추출 유틸리티
function getXmlItemArray(xmlStr: string, parentTag: string): string[] {
  const regex = new RegExp(`<${parentTag}>([\\s\\S]*?)<\\/${parentTag}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xmlStr)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

// 온통청년 정책 카테고리 매핑
function mapCategory(bizTycdNm: string): '일자리' | '주거' | '교육' | '금융' | '복지' | '창업' | '기타' {
  if (bizTycdNm.includes('일자리') || bizTycdNm.includes('취업')) return '일자리';
  if (bizTycdNm.includes('주거')) return '주거';
  if (bizTycdNm.includes('교육')) return '교육';
  if (bizTycdNm.includes('금융') || bizTycdNm.includes('자산')) return '금융';
  if (bizTycdNm.includes('복지') || bizTycdNm.includes('건강')) return '복지';
  if (bizTycdNm.includes('창업')) return '창업';
  return '기타';
}

/**
 * 온통청년 API에서 실제 청년정책 데이터 검색
 * @param query 검색 키워드 (예: 대전, 월세, 인턴 등)
 * @param display 가져올 정책 수 (기본 10개)
 */
export async function fetchYouthCenterPolicies(query: string, display: number = 10): Promise<Policy[]> {
  try {
    // 온통청년 청년정책 API Endpoint (XML 응답)
    const url = new URL('https://www.youthcenter.go.kr/opi/empList.do');
    url.searchParams.append('openApiVcntId', YOUTH_POLICY_API_KEY);
    url.searchParams.append('pageIndex', '1');
    url.searchParams.append('display', display.toString());
    url.searchParams.append('query', query || '대전');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
      },
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      console.warn(`[온통청년 API] 호출 실패: ${response.status} ${response.statusText}`);
      return [];
    }

    const xmlText = await response.text();

    // XML 항목 파싱
    const empXmlItems = getXmlItemArray(xmlText, 'emp');
    if (empXmlItems.length === 0) {
      console.log('[온통청년 API] 검색 결과 없음');
      return [];
    }

    const policies: Policy[] = empXmlItems.map((itemXml, idx) => {
      const id = getXmlTagValue(itemXml, 'bizId') || `yc_${idx + 1}`;
      const title = getXmlTagValue(itemXml, 'polyBizSjnm') || '청년정책 지원사업';
      const content = getXmlTagValue(itemXml, 'polyBizCn') || getXmlTagValue(itemXml, 'sporCn') || '상세 정책 내용 참조';
      const benefit = getXmlTagValue(itemXml, 'sporCn') || '지원 내용 안내';
      const categoryRaw = getXmlTagValue(itemXml, 'polyRqnScssCn') || getXmlTagValue(itemXml, 'plcyTpNm');
      const region = getXmlTagValue(itemXml, 'polyBizSecd') || '대전광역시/전국';
      const applyUrl = getXmlTagValue(itemXml, 'rqutUrla') || 'https://www.youthcenter.go.kr/main';
      const deadline = getXmlTagValue(itemXml, 'rqutPrdCn') || '공고문 참조';
      const host = getXmlTagValue(itemXml, 'mngtMsonNm') || getXmlTagValue(itemXml, 'cnsgNmor') || '정부/지자체';

      // 나이 추출
      const ageMin = parseInt(getXmlTagValue(itemXml, 'ageInfo') || '18', 10) || 18;
      const ageMax = 39;

      return {
        id,
        title,
        category: mapCategory(categoryRaw || title),
        region: region.includes('대전') ? '대전광역시' : '전국',
        age_min: ageMin,
        age_max: ageMax,
        content: content.replace(/<[^>]*>?/gm, '').trim(), // HTML 태그 제거
        benefit: benefit.replace(/<[^>]*>?/gm, '').trim(),
        apply_url: applyUrl.startsWith('http') ? applyUrl : 'https://www.youthcenter.go.kr/main',
        deadline,
        host,
      };
    });

    console.log(`[온통청년 API] 성공적으로 ${policies.length}개의 최신 정책을 가져왔습니다.`);
    return policies;

  } catch (error) {
    console.error('[온통청년 API Error]:', error);
    return [];
  }
}

/**
 * 온통청년 청년공간(청년센터) 정보 검색 API
 */
export async function fetchYouthCenterInfo(query: string = '대전'): Promise<any[]> {
  try {
    const url = new URL('https://www.youthcenter.go.kr/opi/spaceList.do');
    url.searchParams.append('openApiVcntId', YOUTH_CENTER_API_KEY);
    url.searchParams.append('pageIndex', '1');
    url.searchParams.append('display', '5');
    url.searchParams.append('query', query);

    const response = await fetch(url.toString(), { method: 'GET' });
    if (!response.ok) return [];

    const xmlText = await response.text();
    const spaceItems = getXmlItemArray(xmlText, 'space');

    return spaceItems.map(item => ({
      name: getXmlTagValue(item, 'spcName') || '대전 청년공간',
      address: getXmlTagValue(item, 'address') || '대전광역시',
      tel: getXmlTagValue(item, 'telNo') || '042-523-7736',
      url: getXmlTagValue(item, 'siteUrl') || 'https://www.daejeonyouthportal.kr',
    }));
  } catch (error) {
    console.error('[온통청년 센터 API Error]:', error);
    return [];
  }
}
