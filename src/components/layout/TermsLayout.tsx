import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface TermsLayoutProps {
  /** 약관 제목 (예: "서비스 이용약관") */
  title: string;
  /** 약관 한 줄 설명 */
  description: string;
  /** 약관 본문 (텍스트 또는 JSX) */
  children: ReactNode;
  /** 하단 "약관 동의" 버튼 노출 여부 (회원가입 흐름 등에서 사용) */
  showAgreementButton?: boolean;
  /** "약관 동의" 버튼 클릭 핸들러 */
  onAgree?: () => void;
}

/**
 * TermsLayout
 *
 * 서비스 이용약관, 개인정보처리방침 등 약관·정책 페이지 공통 레이아웃.
 * - 헤더 / 푸터: 기존 공통 컴포넌트 재사용
 * - 중앙 카드: 제목 + 설명 + 스크롤 본문 영역
 * - showAgreementButton=true 시 하단 "약관 동의" 버튼 노출
 */
const TermsLayout = ({ title, description, children }: TermsLayoutProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsAtBottom(atBottom);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(162deg, rgba(255,255,255,0.2) 11%, rgba(187,166,255,0.2) 27%, rgba(124,77,255,0.2) 94%), #f8f8fb',
      }}
    >
      <Header className="!relative" />

      {/* 본문 */}
      <main className="flex-1 flex items-stretch justify-center px-5 py-13">
        <div
          className="bg-background-surface border border-border-default rounded-3xl flex flex-col gap-9 w-full max-w-206 overflow-hidden p-8 max-h-[75vh] min-h-[550px]"
          style={{
            boxShadow: '0px 8px 24px -2px rgba(124, 77, 255, 0.16)',
          }}
        >
          {/* 제목 + 설명 */}
          <div className="flex flex-col gap-3.5 w-full">
            <h1 className="text-2xl font-bold leading-8 tracking-tight text-black">
              {title}
            </h1>
            <p className="text-sm font-normal leading-[22px] tracking-tight text-text-primary">
              {description}
            </p>
          </div>

          {/* 본문 스크롤 영역 */}
          <div className="relative border border-border-default rounded-xl flex-1 min-h-0 overflow-hidden h-full">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto p-2.5 pr-3 scrollbar-thin"
            >
              <div className="text-sm font-normal leading-[22px] tracking-tight text-text-secondary whitespace-pre-wrap break-keep">
                {children}
              </div>
            </div>
            {/* 하단 그라데이션 페이드 — 하단 도달 시 숨김 */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-opacity duration-300"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
                opacity: isAtBottom ? 0 : 1,
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsLayout;
