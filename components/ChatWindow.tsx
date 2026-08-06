'use client';
// ============================================
// components/ChatWindow.tsx
// 메인 채팅창 컴포넌트
// 사용자 입력 → API 호출 → 스트리밍 응답 표시
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble, { Message } from './MessageBubble';
import PolicyFilter from './PolicyFilter';
import { Policy } from '@/lib/supabase';

// 추천 질문 목록
const SUGGESTED_QUESTIONS = [
  '취업관련 홈페이지 알려줘',
  '대전 청년 취업 지원 프로그램 알려줘',
  '청년 내일채움공제 어떻게 신청해?',
  '청년 전세자금 대출 조건이 뭐야?',
  '청년도약계좌 가입하고 싶어',
  '대전 창업 지원 뭐 있어?',
  '청년 마음건강 상담 지원받고 싶어',
];

export default function ChatWindow() {
  // 대화 메시지 목록
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: `안녕하세요! 👋 **대전 서구 청년공간 청춘스럽** 청년정책 AI 안내봇입니다.\n\n청춘스럽은 대전 청년들의 자유로운 활동을 다양하게 지원하는 복합문화 공간입니다.\n\n청년을 위한 일자리, 주거, 교육, 창업, 복지, 금융 정책 정보를 친절히 안내해 드릴게요! 궁금한 것을 편하게 물어보세요. 😊`,
    },
  ]);

  // 입력창 텍스트
  const [input, setInput] = useState('');
  // AI 응답 중 여부
  const [isLoading, setIsLoading] = useState(false);
  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  // 필터 패널 열림 여부
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 세션 ID (대화 로그 구분)
  const [sessionId] = useState(() => uuidv4());

  // 메시지 목록 자동 스크롤
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

    // 사용자 메시지 추가
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // AI 응답 플레이스홀더 추가
    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text.trim() },
          ],
          sessionId,
          category: selectedCategory !== '전체' ? selectedCategory : undefined,
          region: selectedRegion !== '전체' ? selectedRegion : undefined,
        }),
      });

      if (!response.ok) throw new Error('API 오류');

      // SSE 스트리밍 읽기
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
              // 관련 정책 데이터 수신
              relatedPolicies = parsed.policies;
            } else if (parsed.type === 'text') {
              // 텍스트 스트리밍 수신
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                )
              );
            }
          } catch {
            // JSON 파싱 오류 무시
          }
        }
      }

      // 스트리밍 완료: 정책 카드 추가, 커서 제거
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, isStreaming: false, policies: relatedPolicies }
            : m
        )
      );
    } catch (error) {
      // 오류 처리
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
  }, [messages, sessionId, selectedCategory, selectedRegion, isLoading]);

  // 엔터 키 처리 (Shift+Enter = 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // textarea 높이 자동 조절
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-container">
      {/* ========== 헤더 (실물 청춘스럽 타이틀 & 알약 뱃지 디자인) ========== */}
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
          🔍 정책 필터 {isFilterOpen ? '닫기' : '열기'}
        </button>
      </header>

      {/* ========== 공간 안내 정보 바 (캡처 이미지 하단 정보 반영) ========== */}
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


      {/* ========== 필터 패널 ========== */}
      {isFilterOpen && (
        <div className="filter-panel">
          <PolicyFilter
            selectedCategory={selectedCategory}
            selectedRegion={selectedRegion}
            onCategoryChange={setSelectedCategory}
            onRegionChange={setSelectedRegion}
          />
          {(selectedCategory !== '전체' || selectedRegion !== '전체') && (
            <div className="active-filters">
              <span className="active-filter-label">적용된 필터:</span>
              {selectedCategory !== '전체' && (
                <span className="active-filter-chip">{selectedCategory}</span>
              )}
              {selectedRegion !== '전체' && (
                <span className="active-filter-chip">{selectedRegion}</span>
              )}
              <button
                className="clear-filter"
                onClick={() => { setSelectedCategory('전체'); setSelectedRegion('전체'); }}
              >
                초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========== 메시지 영역 ========== */}
      <main className="messages-area">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </main>

      {/* ========== 추천 질문 (메시지가 1개일 때만 표시) ========== */}
      {messages.length === 1 && (
        <div className="suggestions">
          <p className="suggestions-label">💬 이런 것들을 물어볼 수 있어요</p>
          <div className="suggestions-grid">
            {SUGGESTED_QUESTIONS.map((q) => (
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
