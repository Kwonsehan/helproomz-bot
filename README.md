# 🤖 대전청년정책 AI 챗봇 (Youth Policy Bot)

> **GPT-4o + RAG 기반 대전광역시 청년정책 안내 AI 챗봇**  
> Next.js 15 · TypeScript · Supabase · OpenAI API

---

## 📌 프로젝트 개요

대전광역시 청년들이 정부/지자체 정책을 **쉽고 빠르게 찾을 수 있도록** 돕는 AI 챗봇입니다.  
GPT-4o와 RAG(검색증강생성) 파이프라인을 통해 정확한 정책 정보를 실시간으로 안내합니다.

---

## 🏗️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| AI | OpenAI GPT-4o + Embeddings |
| 데이터베이스 | Supabase (PostgreSQL + pgvector) |
| 배포 | Vercel |
| 스타일 | 딥 네이비 다크모드 CSS |

---

## 🗂️ 폴더 구조

```
youth-policy-bot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # GPT-4o + RAG 스트리밍 챗봇 API
│   │   └── seed/route.ts        # 정책 데이터 임베딩 생성 API
│   ├── globals.css              # 딥 네이비 다크모드 전체 스타일
│   ├── layout.tsx               # SEO 메타데이터
│   └── page.tsx                 # 메인 페이지
├── components/
│   ├── ChatWindow.tsx           # 대화창 (필터, 추천질문, 스트리밍)
│   ├── MessageBubble.tsx        # 말풍선 컴포넌트
│   ├── PolicyCard.tsx           # 관련 정책 카드
│   └── PolicyFilter.tsx         # 분야/지역 필터 칩
├── lib/
│   ├── openai.ts                # 임베딩 함수
│   ├── rag.ts                   # 벡터 검색 + 폴백 로직
│   └── supabase.ts              # DB 클라이언트 + 타입
├── supabase/migrations/
│   ├── 001_create_policies_table.sql   # 정책 테이블 + pgvector 설정
│   └── 002_seed_sample_policies.sql   # 대전시 실제 정책 샘플 데이터
└── .env.local.example           # 환경변수 예시
```

---

## ⚙️ 설치 및 실행

### 1단계: 환경변수 설정

```bash
# .env.local 파일 생성
cp .env.local.example .env.local
```

`.env.local`에 아래 값을 입력하세요:

```env
OPENAI_API_KEY=sk-proj-xxxx          # OpenAI API 키
NEXT_PUBLIC_SUPABASE_URL=https://xxx  # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx     # Supabase anon 키
SUPABASE_SERVICE_ROLE_KEY=xxx         # Supabase service_role 키
```

### 2단계: 패키지 설치

```bash
npm install
```

### 3단계: Supabase DB 설정

Supabase 대시보드 → SQL Editor에서 아래 순서로 실행:
1. `supabase/migrations/001_create_policies_table.sql`
2. `supabase/migrations/002_seed_sample_policies.sql`

### 4단계: 임베딩 생성 (선택 — Supabase 사용 시)

```bash
# 서버 실행 후 아래 API 1회 호출
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]"
```

### 5단계: 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000 에서 확인

---

## 🎯 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 챗봇** | GPT-4o 기반 대전청년정책 전문 안내봇 |
| **스트리밍 응답** | SSE(Server-Sent Events) 실시간 답변 출력 |
| **RAG 검색** | Supabase pgvector로 관련 정책 벡터 검색 |
| **오프라인 폴백** | Supabase 미설정 시 내장 샘플 데이터로 동작 |
| **분야 필터** | 일자리/주거/교육/금융/복지/창업 |
| **지역 필터** | 대전 5개 구 + 전국 정책 구분 |
| **추천 질문** | 주요 정책별 원클릭 추천 질문 |
| **정책 카드** | 관련 정책 카드 형태로 신청 링크 제공 |

---

## 📋 내장 정책 데이터 (대전광역시 실제 정책)

오프라인 모드(Supabase 미연결)에서도 아래 정책 정보를 안내합니다:

1. **미래두배 청년통장** — 월 15만원 저축 시 동일 금액 매칭 (금융)
2. **청년부부 결혼 장려금** — 1인당 250만원 지원 (복지)
3. **청년 월세지원** — 월 최대 20만원 × 최대 12개월 (주거)
4. **구해줘! 정장** — 면접용 정장 무료 대여 (일자리)
5. **청년 주택임차보증금 이자지원** — 연 최대 250만원 (주거)
6. **대전 정착형 청년일자리** — 실무교육 + 기업 취업 연계 (일자리)
7. **학자금 이자지원** — 한국장학재단 학자금 이자 전액 지원 (교육)
8. **자립준비청년 자립수당** — 월 50만원 × 최대 60회 (복지)

---

## 🚀 Vercel 배포

```bash
npx vercel
```

→ `https://[프로젝트명].vercel.app` 주소로 24시간 무료 배포

---

## 🔗 참고 링크

- [대전청년포털](https://www.daejeonyouthportal.kr)
- [대전광역시 청년정책](https://www.daejeon.go.kr)
- [OpenAI API](https://platform.openai.com)
- [Supabase](https://supabase.com)
