import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * Footer
 * - 공통 푸터 컴포넌트
 * - 좌측: CopyRight
 * - 우측: 이용약관 / 개인정보처리방침 / 고객센터 링크
 */
export default function Footer() {
  return (
    <footer className="footer w-full bg-background-page border-t border-border-default px-5 py-3.5 text-base font-normal leading-6 tracking-tight text-text-secondary rounded-b-2xl overflow-hidden">
      <div className="footer__inner flex items-center justify-between">
        <p className="footer__copy p-2.5">
          © 2026 ToneFit Inc. All rights reserved.
        </p>
        <div className="footer__link p-2.5 flex gap-6 items-center">
          <Link
            to={ROUTES.TERMS}
            className="hover:text-text-primary transition-colors"
          >
            이용약관
          </Link>
          <Link
            to={ROUTES.PRIVACY}
            className="hover:text-text-primary transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
