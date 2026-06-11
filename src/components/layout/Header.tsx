import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import imgLogo from '@/assets/logo.svg';

/**
 * Header
 * - 공통 헤더 컴포넌트
 * - 스크롤 시 sticky 처리 (is-sticky 클래스 토글)
 * - 좌측: ToneFit 로고 + 네비게이션 탭
 * - 우측: ToneFit 시작하기 버튼
 */
interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      headerRef.current.classList.toggle('is-sticky', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      id="header"
      className={`header w-full border-b border-border-default px-7 py-5 fixed z-9999 ${className}`}
    >
      <div className="header__bg bg-background-page absolute left-0 top-0 w-full h-full z-[-1] opacity-20" />
      <div className="header__inner flex items-center justify-between">
        {/* 로고 + 네비 */}
        <div className="header__left flex items-center gap-14">
          <Link
            to={ROUTES.DEMO}
            className="header__logo flex items-center gap-5"
          >
            <img
              src={imgLogo}
              alt="ToneFit 아이콘"
              className="w-10 object-contain"
            />
            <span className="text-2xl-plus font-bold leading-9 tracking-[-0.56px] text-text-primary">
              ToneFit
            </span>
          </Link>
          <nav className="header__nav flex items-center gap-5">
            {['기능 소개', '사용 방법'].map((tab) => (
              <button
                key={tab}
                type="button"
                className="px-6 py-2.5 text-xl font-semibold leading-7 tracking-tight text-text-primary text-center hover:text-text-brand transition-colors cursor-pointer"
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* 우측 버튼 */}
        <div className="header__right flex items-center gap-2.5 drop-shadow-sm">
          <a
            href="https://chromewebstore.google.com/category/extensions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2.5 px-4 bg-background-brand rounded-lg text-sm font-semibold leading-5 tracking-tight text-text-inverse hover:opacity-90 transition-opacity"
          >
            ToneFit 시작하기
          </a>
        </div>
      </div>
    </header>
  );
}
