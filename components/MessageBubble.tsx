'use client';
// ============================================
// components/MessageBubble.tsx
// 채팅 말풍선 컴포넌트 (사용자 / AI 구분)
// - 마크다운 볼드 및 URL 링크 클릭 자동 변환
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
      // 이미 a 태그 안에 들어있는 URL인지 간단히 검사
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
          <div
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          {/* 스트리밍 중 깜빡임 커서 */}
          {message.isStreaming && <span className="cursor">▌</span>}
        </div>

        {/* 관련 정책 카드 (AI 응답에만 표시) */}
        {!isUser && message.policies && message.policies.length > 0 && !message.isStreaming && (
          <div className="related-policies">
            <p className="related-title">💡 관련 정책도 확인해보세요</p>
            <div className="policy-cards-grid">
              {message.policies.slice(0, 3).map((policy, i) => (
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
