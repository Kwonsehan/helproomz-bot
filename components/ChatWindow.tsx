'use client';
// ============================================
// components/ChatWindow.tsx
// 메인 채팅창 컴포넌트
// - 헤더: 청춘스럽 실물 로고 + '청춘스럽 정책안내 AI봇'
// - 분야별 2단계 추천 질문 탭 (4개 분야 x 8개 질문 풀 = 총 32개 질문)
// - 추천 질문 탭 열고 닫기(토글) 및 🔄 새로고침 기능
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble, { Message } from './MessageBubble';
import PolicyFilter, { UserSituationFilter } from './PolicyFilter';
import { Policy } from '@/lib/supabase';

// 분야별 대분류 정의
export type CategoryTab = '일자리' | '주거금융' | '창업복지' | '청년공간';

export interface CategoryTabInfo {
  id: CategoryTab;
  label: string;
  icon: string;
}

export const CATEGORY_TABS: CategoryTabInfo[] = [
  { id: '일자리', label: '일자리·취업', icon: '💼' },
  { id: '주거금융', label: '주거·금융', icon: '🏠' },
  { id: '창업복지', label: '창업·복지', icon: '🚀' },
  { id: '청년공간', label: '대전 청년공간', icon: '🏛️' },
];

// 분야별 8개 세부 질문 풀 데이터베이스 (총 32개 질문)
export const CATEGORY_QUESTION_POOLS: Record<CategoryTab, string[]> = {
  '일자리': [
    '취업관련 홈페이지 알려줘',
    '대전 청년 취업 지원 프로그램 알려줘',
    '구직청년 무료 면접 정장 대여 어떻게 해?',
    '청년 내일채움공제 어떻게 신청해?',
    '청년 일경험 인턴 지원사업 신청 방법',
    '청년인재DB 공공기관 스카우트 등록법',
    '국민취업지원제도 구직촉진수당 자격 조건',
    '잡알리오 공공기관 채용공고 보는 법',
  ],
  '주거금융': [
    '대전 청년 월세 지원 금액이랑 기간 알려줘',
    '청년 전세자금 대출 조건이 뭐야?',
    '미래두배 청년통장 자격 조건이 뭐야?',
    '청년도약계좌 가입 조건 및 혜택 알려줘',
    '청년 주택 임차보증금 이자 지원 사업 안내',
    '대전 무주택 청년 주거 정책 추천해줘',
    '대전 청년부부 결혼 장려금 신청 자격',
    '대전 청년 학자금 대출 이자 지원 대상',
  ],
  '창업복지': [
    '대전 창업 지원 및 보육 공간 알려줘',
    '청년 소상공인 임차료 지원 사업 내용',
    '대전 청년 마음건강 무료 심리상담 신청법',
    '자립준비청년 자립수당 신청 자격',
    '대전 청년 예술가 문화 오디션 지원',
    '대전 청년 커뮤니티 동아리 지원사업',
    '서구/유성구 청년 자격증 응시료 지원',
    '대전 청년 소상공인 창업 컨설팅 지원',
  ],
  '청년공간': [
    '대전 서구 청년공간 청춘스럽 위치와 프로그램',
    '대전 공식 10개 청년공간 전체 리스트 알려줘',
    '대전역 지하상가 청춘나들목 이용 방법',
    '대덕구 청년벙커 밴드연습실/요가 교실 신청',
    '둔산동 청춘너나들이 동아리 스터디룸 예약',
    '대흥동 청춘다락 청년 예술 지원 안내',
    '유성구청년지원센터 및 궁동 창업클러스터',
    '동구동락 / 중구 청년모아 위치 및 혜택',
  ],
};

// 특정 분야 질문 8개 중 3개를 랜덤 선택하는 함수
function getRandomThreeForCategory(cat: CategoryTab): string[] {
  const pool = CATEGORY_QUESTION_POOLS[cat];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// 초기 맞춤 상황 체크 필터값
const initialFilter: UserSituationFilter = {
  region: '선택하세요.',
  maritalStatus: '선택하세요.',
  age: '',
  incomeMin: '',
  incomeMax: '',
  education: '제한없음',
  major: '제한없음',
  employmentStatus: '제한없음',
  specialty: '제한없음',
  category: '전체',
};

export default function ChatWindow() {
  // 대화 메시지 목록
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: `안녕하세요! 👋 **청춘스럽 정책안내 AI봇**입니다.\n\n대전 청년들을 위해 일자리, 주거, 교육, 창업, 복지, 금융 정책 정보와 대전 10개 청년공간 소식을 정확하고 친절하게 안내해 드려요.\n\n상단 **[📋 내 맞춤 상황 체크]**를 설정하시면 연령·소득·취업상태에 딱 맞는 맞춤 정책을 찾아드립니다! 하단 분야별 탭을 클릭하여 궁금한 내용을 바로 물어보세요. 😊`,
    },
  ]);

  // 입력창 텍스트
  const [input, setInput] = useState('');
  // AI 응답 중 여부
  const [isLoading, setIsLoading] = useState(false);
  // 맞춤 상황 체크 필터 상태
  const [filter, setFilter] = useState<UserSituationFilter>(initialFilter);
  // 필터 패널 열림 여부
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 분야별 탭 선택 상태 (기본값: '일자리')
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryTab>('일자리');
  // 현재 분야의 랜덤 3개 추천 질문
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  // 추천 질문 탭 열림/닫힘(접기) 상태 (기본값: 열림)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  
  // 세션 ID
  const [sessionId] = useState(() => uuidv4());

  // 분야 탭 변경 또는 마운트 시 질문 3개 추출
  useEffect(() => {
    setSuggestedQuestions(getRandomThreeForCategory(activeCategoryTab));
  }, [activeCategoryTab]);

  // 해당 분야 안에서 질문 3개 새로고침
  const handleRefreshQuestions = () => {
    setSuggestedQuestions(getRandomThreeForCategory(activeCategoryTab));
  };

  // 스크롤 및 입력창 레프
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================
  // 메시지 전송 핸들러
  // ==========================================
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text.trim() },
          ],
          sessionId,
          filter,
        }),
      });

      if (!response.ok) throw new Error('API 오류');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let relatedPolicies: Policy[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'policies') {
              relatedPolicies = parsed.policies;
            } else if (parsed.type === 'text') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                )
              );
            }
          } catch {
            // 파싱 에러 무시
          }
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, isStreaming: false, policies: relatedPolicies }
            : m
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: '죄송합니다. 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 🙏',
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [messages, sessionId, filter, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-container">
      {/* ========== 헤더 (실물 로고 + 청춘스럽 정책안내 AI봇) ========== */}
      <header className="chat-header">
        <div className="header-left">
          <div className="header-title-group">
            <div className="header-logo-container">
              <img
                src="/logo.png"
                alt="청춘스럽 로고"
                className="header-logo-img"
              />
            </div>
            <h1 className="header-main-text">청춘스럽 정책안내 AI봇</h1>
          </div>
        </div>
        <button
          className={`filter-toggle ${isFilterOpen ? 'filter-toggle-active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          📋 내 맞춤 상황 체크 {isFilterOpen ? '닫기' : '설정'}
        </button>
      </header>

      {/* ========== 맞춤 상황 체크 필터 패널 ========== */}
      {isFilterOpen && (
        <div className="filter-panel">
          <PolicyFilter
            filter={filter}
            onChangeFilter={setFilter}
            onResetFilter={() => setFilter(initialFilter)}
          />
        </div>
      )}

      {/* ========== 메시지 대화 영역 ========== */}
      <main className="messages-area">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </main>

      {/* ========== 분야별 2단계 추천 질문 탭 ========== */}
      <div className="suggestions">
        <div className="suggestions-header">
          <button
            type="button"
            className="suggestions-toggle-btn"
            onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
          >
            <span className="suggestions-label">💬 이런 것들을 물어볼 수 있어요</span>
            <span className="toggle-icon">{isSuggestionsOpen ? '▲ 접기' : '▼ 펼치기'}</span>
          </button>

          {isSuggestionsOpen && (
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefreshQuestions}
              title="현재 분야 질문 새로고침"
            >
              🔄 새로고침
            </button>
          )}
        </div>

        {/* 접기/펼치기 토글 콘텐츠 */}
        {isSuggestionsOpen && (
          <div className="suggestions-content">
            {/* 1단계: 분야별 카테고리 탭 (4개 선택) */}
            <div className="category-tab-bar">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`category-tab-btn ${activeCategoryTab === tab.id ? 'active-cat-tab' : ''}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 2단계: 선택된 분야의 3개 세부 질문 칩 */}
            <div className="suggestions-grid-3">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  className="suggestion-chip"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== 입력창 영역 ========== */}
      <footer className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="청년정책에 대해 무엇이든 물어보세요... (Enter로 전송)"
            className="input-textarea"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            {isLoading ? (
              <span className="loading-dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              '↑'
            )}
          </button>
        </div>
        <p className="input-hint">Shift+Enter로 줄바꿈 | AI 답변은 참고용이며, 정확한 정보는 해당 기관에 확인하세요</p>
      </footer>
    </div>
  );
}
