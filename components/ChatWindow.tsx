'use client';
// ============================================
// components/ChatWindow.tsx
// 메인 채팅창 컴포넌트
// - 맞춤 상황 체크 필터 연동
// - 3개 추천 질문 + 🔄 새로고침 (랜덤 바뀜) 기능
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble, { Message } from './MessageBubble';
import PolicyFilter, { UserSituationFilter } from './PolicyFilter';
import { Policy } from '@/lib/supabase';

// 모든 추천 질문 목록 (풀)
const ALL_SUGGESTED_QUESTIONS = [
  '취업관련 홈페이지 알려줘',
  '대전 청년 취업 지원 프로그램 알려줘',
  '청년 내일채움공제 어떻게 신청해?',
  '청년 전세자금 대출 조건이 뭐야?',
  '청년도약계좌 가입하고 싶어',
  '대전 창업 지원 뭐 있어?',
  '청년 마음건강 상담 지원받고 싶어',
  '미래두배 청년통장 자격 조건이 뭐야?',
  '대전 청년 월세 지원 금액이랑 기간 알려줘',
  '구직청년 무료 면접 정장 대여 어떻게 해?',
  '청년 주택 임차보증금 이자 지원 사업 안내해줘',
];

// 초기 기본 3개 추천 질문 선택
function getRandomThreeQuestions(): string[] {
  const shuffled = [...ALL_SUGGESTED_QUESTIONS].sort(() => 0.5 - Math.random());
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
      content: `안녕하세요! 👋 **대전 서구 청년공간 청춘스럽** 청년정책 AI 안내봇입니다.\n\n청춘스럽은 대전 청년들의 자유로운 활동을 다양하게 지원하는 복합문화 공간입니다.\n\n상단 **[📋 내 맞춤 상황 체크]**를 설정하시면 본인의 연령·소득·취업상태에 꼭 맞는 최고의 정책을 찾아드립니다! 궁금한 점을 편하게 물어보세요. 😊`,
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
  // 3개 랜덤 추천 질문 상태
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  // 세션 ID
  const [sessionId] = useState(() => uuidv4());

  // 마운트 시 3개 질문 랜덤 세팅
  useEffect(() => {
    setSuggestedQuestions(getRandomThreeQuestions());
  }, []);

  // 새로고침 클릭 시 질문 3개 랜덤 변경
  const handleRefreshQuestions = () => {
    setSuggestedQuestions(getRandomThreeQuestions());
  };

  // 스크롤 및 입력창 레프
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================
  // 메시지 전송 핸들러 (맞춤 필터 정보 함께 전달)
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
      // API 호출 (상세 맞춤 필터 포함)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text.trim() },
          ],
          sessionId,
          filter, // 맞춤 상황 체크 필터 전달
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
      {/* ========== 헤더 ========== */}
      <header className="chat-header">
        <div className="header-left">
          <div className="header-title-group">
            <h1 className="header-main-text">대전 서구 청년공간</h1>
            <div className="chungchun-pill-badge">
              <span>청춘스럽</span>
            </div>
          </div>
        </div>
        <button
          className={`filter-toggle ${isFilterOpen ? 'filter-toggle-active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          📋 내 맞춤 상황 체크 {isFilterOpen ? '닫기' : '설정'}
        </button>
      </header>

      {/* ========== 공간 안내 정보 바 ========== */}
      <div className="space-info-bar">
        <div className="space-info-item">
          <span className="space-info-icon">📍</span>
          <span><strong>장소:</strong> 대전광역시 서구 계룡로 314 대전일보사 1층</span>
        </div>
        <div className="space-info-item">
          <span className="space-info-icon">⏰</span>
          <span><strong>시간:</strong> 평일 11:00-21:00 / 토 11:00-19:00</span>
        </div>
        <div className="space-info-item">
          <span className="space-info-icon">💛</span>
          <span><strong>문의:</strong> 042.523.7736</span>
        </div>
      </div>

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

      {/* ========== 메시지 영역 ========== */}
      <main className="messages-area">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </main>

      {/* ========== 추천 질문 3개 + 새로고침 탭 (요구사항 3 반영) ========== */}
      <div className="suggestions">
        <div className="suggestions-header">
          <span className="suggestions-label">💬 이런 것들을 물어볼 수 있어요</span>
          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefreshQuestions}
            title="새로운 질문 추천받기"
          >
            🔄 새로고침
          </button>
        </div>
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

      {/* ========== 입력창 ========== */}
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
