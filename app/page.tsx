// ============================================
// app/page.tsx — 메인 페이지
// ============================================
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="page-wrapper">
      {/* 배경 장식 요소 */}
      <div className="bg-decoration" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* 메인 채팅창 */}
      <ChatWindow />
    </main>
  );
}
