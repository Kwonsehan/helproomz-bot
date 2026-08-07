'use client';
// ============================================
// components/MessageBubble.tsx
// 채팅 말풍선 컴포넌트 (사용자 / AI 구분)
// - AI 로딩 시 귀여운 바운싱 점(● ● ●) 로딩 애니메이션 표시
// - 답변 하단에 관련 추천 정책 2개 배치
// ============================================

import { useEffect, useRef } from 'react';
import PolicyCard from './PolicyCard';
import { Policy } from '@/lib/supabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  policies?: Policy[];   // AI 응답에 포함된 관련 정책
  isStreaming?: boolean; // 스트리밍 중 여부
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 텍스트 포맷팅 함수
  // 1. 마크다운 볼드 **텍스트** → <strong>
  // 2. 마크다운 링크 [이름](https://url) → <a href="...">이름</a>
  // 3. 일반 URL (https://...) → 바로 클릭 가능한 링크로 변환
  // 4. 줄바꿈 \n → <br/>
  // ==========================================
  const formatContent = (text: string) => {
    if (!text) return '';

    let formatted = text;

    // 1. **볼드** 처리
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. 마크다운 형식의 링크 [링크 텍스트](https://url) 처리
    formatted = formatted.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
    );

    // 3. 괄호로 둘러싸인 일반 URL (https://domain.com) 처리
    formatted = formatted.replace(
      /\((https?:\/\/[^\s\)]+)\)/g,
      '(<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>)'
    );

    // 4. 독립적으로 표기된 일반 URL (http:// 또는 https://) 처리 (이미 a태그 내부가 아닌 것)
    const urlRegex = /(?<!href=")(?<!">)(https?:\/\/[^\s<]+)/g;
    formatted = formatted.replace(urlRegex, (url) => {
      if (url.includes('class="chat-link"')) return url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
    });

    // 5. 줄바꿈 처리
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  };

  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}>
      {/* AI 아바타 */}
      {!isUser && (
        <div className="avatar">
          <span>🤖</span>
        </div>
      )}

      <div className={`message-content-area ${isUser ? 'user-area' : 'assistant-area'}`}>
        {/* 말풍선 */}
        <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
          {/* AI 답변 대기/생성 중인데 아직 텍스트가 없을 때: 세련된 바운싱 로딩 애니메이션 표시 */}
          {!isUser && message.isStreaming && !message.content ? (
            <div className="ai-loading-container">
              <span className="loading-text">정책 정보를 찾고 있어요</span>
              <div className="typing-dots">
                <span className="dot dot1" />
                <span className="dot dot2" />
                <span className="dot dot3" />
              </div>
            </div>
          ) : (
            <>
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
              {/* 스트리밍 중일 때 글자 뒤에 부드러운 커서 펄스 표시 */}
              {message.isStreaming && <span className="streaming-pulse-cursor"></span>}
            </>
          )}
        </div>

        {/* 관련 추천 정책 2개 노출 */}
        {!isUser && message.policies && message.policies.length > 0 && !message.isStreaming && (
          <div className="related-policies">
            <p className="related-title">💡 맞춤 추천 정책 TOP 2</p>
            <div className="policy-cards-grid">
              {message.policies.slice(0, 2).map((policy, i) => (
                <PolicyCard key={policy.id} policy={policy} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 사용자 아바타 */}
      {isUser && (
        <div className="avatar avatar-user">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}
