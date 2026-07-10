import { useState } from 'react';
import { ButtonLongV2 } from '@/components/ui';
import MotionBackground from '@/components/ui/MotionBackground';
import type { MotionBackgroundTheme } from '@/components/ui/MotionBackground';
import HeroCardGenerate from './HeroCardGenerate';
import HeroCardCorrect from './HeroCardCorrect';
import HeroCardReply from './HeroCardReply';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/tonefit/hccpncocbnbphkmandkcmnefolgfhcgi';

const TABS: { label: string; theme: MotionBackgroundTheme; bg: string }[] = [
  { label: '초안 생성', theme: 'purple', bg: 'bg-background-surface' },
  { label: '메일 교정', theme: 'blue', bg: 'bg-background-page' },
  { label: '회신 생성', theme: 'yellow', bg: 'bg-background-page' },
];

const CARDS = [HeroCardGenerate, HeroCardCorrect, HeroCardReply];

const Hero = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [animPaused] = useState(false);
  const ActiveCard = CARDS[activeTab];

  return (
    <section id="hero" className="relative pt-25">
      <div className="mx-auto flex flex-col items-center gap-20">
        {/* Copy */}
        <div className="flex flex-col gap-7 flex-1 items-center min-w-0 text-center">
          <h1 className="text-4xl-plus font-bold leading-12 tracking-tight text-text-primary">
            쓰는 법을 몰라도 괜찮아요.
            <br />
            Gmail 안에서 바로 완성해요.
          </h1>
          <p className="text-xl font-normal leading-7 tracking-tight text-text-primary">
            복잡한 고민 없이, 클릭 몇 번으로 초안 생성·교정 제안·회신 생성까지
          </p>

          <ButtonLongV2
            className="max-w-66"
            href={CHROME_STORE_URL}
            target="_blank"
          >
            무료로 설치하기
          </ButtonLongV2>
        </div>

        {/* Product Preview */}
        <div className="relative min-w-0 w-full h-205 flex justify-center rounded-4xl overflow-hidden">
          {/* 배경 — 컨테이너 전체를 채움 */}
          <MotionBackground
            theme={TABS[activeTab].theme}
            minHeight={0}
            style={{ position: 'absolute', inset: 0, borderRadius: 0 }}
          />
          <div className="flex flex-col gap-6 pt-6 items-center">
            {/* 플로팅 모드 스위치 탭 */}
            <div
              className="relative rounded-2xl p-1 border border-white shrink-0"
              style={{
                background: 'rgba(255,255,255,0.20)',
                boxShadow: '4px 2px 24px 0px rgba(124,77,255,0.15)',
              }}
            >
              <div className="relative flex w-86.5 ">
                {/* 슬라이딩 배경 */}
                <div
                  className="absolute top-0 bottom-0 h-full rounded-xl bg-background-surface transition-transform duration-300 ease-in-out"
                  style={{
                    width: `calc(100% / ${TABS.length})`,
                    transform: `translateX(${activeTab * 100}%)`,
                  }}
                />
                {TABS.map((tab, i) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className="relative flex-1 px-2 py-2 text-center rounded-xl z-10"
                  >
                    <span
                      className={`text-sm font-semibold leading-5 tracking-tight transition-colors duration-300 ${
                        i === activeTab
                          ? 'text-text-brand'
                          : 'text-text-placeholder'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* 카드 — 글래스 래퍼 + 실제 카드 */}
            <div
              className="w-126 relative rounded-4xl p-3.75 h-full min-h-320"
              style={{ background: 'rgba(255,255,255,0.44)' }}
            >
              <div
                className={`h-full  rounded-3xl p-3 overflow-hidden shadow-[0px_5.6px_22.4px_0px_rgba(124,77,255,0.14)] ${TABS[activeTab].bg}`}
              >
                <ActiveCard key={activeTab} paused={animPaused} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
