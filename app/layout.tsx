// ============================================
// app/layout.tsx — 루트 레이아웃
// ============================================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '대전서구 청년공간 청춘스럽 AI봇 | 청년을 위한 맞춤 정책 안내',
  description:
    '대전서구 청년공간 청춘스럽 AI 정책 안내 서비스. 일자리, 주거, 교육, 창업, 복지, 금융 정책을 쉽고 빠르게 확인하세요.',
  keywords: ['대전서구', '청춘스럽', '청년정책', 'AI챗봇', '취업', '일자리', '청년지원'],
  openGraph: {
    title: '대전서구 청년공간 청춘스럽 AI봇',
    description: '대전서구 청년공간 청춘스럽 맞춤 정책 안내 서비스',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Google Fonts - Pretendard (한국어 최적화 폰트) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
