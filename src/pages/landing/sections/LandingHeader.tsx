import logo from '@/assets/logo.svg';
import { ButtonCoreV2 } from '@/components/ui';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/tonefit/hccpncocbnbphkmandkcmnefolgfhcgi';

const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-md border-b border-border-subtle pt-3.5">
      <div className="flex items-center justify-between px-7 py-5">
        <a href="/" className="flex items-center gap-5 cursor-pointer">
          <img src={logo} alt="ToneFit" className="h-10 w-10 object-contain" />
          <span className="text-2xl-plus font-bold leading-9 tracking-tight text-text-secondary">
            ToneFit
          </span>
        </a>
        <ButtonCoreV2
          className="max-w-30"
          size="md"
          href={CHROME_STORE_URL}
          target="_blank"
        >
          무료로 설치하기
        </ButtonCoreV2>
      </div>
    </header>
  );
};

export default LandingHeader;
