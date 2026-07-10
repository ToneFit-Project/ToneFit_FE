import { useEffect, useState } from 'react';
import painPointImg from '@/assets/landing-painpoint.png';

// ── 타이밍 설정 (ms) ──────────────────────────────────────
const TIMING = {
  disabled: true, // ← true로 바꾸면 애니메이션 OFF (말풍선 항상 표시)
  bubble2FadeIn: 400, // bubble2 페이드인 지속
  bubble1Delay: 600, // bubble2 등장 후 bubble1까지 딜레이
  bubble1FadeIn: 400, // bubble1 페이드인 지속
  holdDuration: 2000, // 둘 다 보이는 유지 시간
  fadeOut: 500, // 동시 페이드아웃 지속
  loopDelay: 800, // 페이드아웃 후 다음 루프 전 대기
};
// ─────────────────────────────────────────────────────────

type BubbleState = 'hidden' | 'visible';

const PainPoint = () => {
  const [b2, setB2] = useState<BubbleState>('hidden');
  const [b1, setB1] = useState<BubbleState>('hidden');

  useEffect(() => {
    let cancelled = false;

    const delay = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));

    // if (TIMING.disabled) {
    //   setB2('visible');
    //   setB1('visible');
    //   return;
    // }

    const loop = async () => {
      while (!cancelled) {
        // bubble2 페이드인
        setB2('visible');
        await delay(TIMING.bubble2FadeIn + TIMING.bubble1Delay);

        if (cancelled) break;

        // bubble1 페이드인
        setB1('visible');
        await delay(TIMING.bubble1FadeIn + TIMING.holdDuration);

        if (cancelled) break;

        // 둘 다 동시 페이드아웃
        setB2('hidden');
        setB1('hidden');
        await delay(TIMING.fadeOut + TIMING.loopDelay);
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, []);

  const bubbleBase =
    'bg-background-disabled text-text-secondary text-xl font-semibold leading-7 tracking-tight px-6 py-2.5 rounded-full whitespace-nowrap z-10 absolute';

  const bubbleStyle = (state: BubbleState, dir: 'up' | 'down') => ({
    transition: `opacity ${state === 'visible' ? TIMING.bubble2FadeIn : TIMING.fadeOut}ms ease, transform ${state === 'visible' ? TIMING.bubble2FadeIn : TIMING.fadeOut}ms ease`,
    opacity: state === 'visible' ? 1 : 0,
    transform:
      state === 'visible'
        ? 'translateY(0)'
        : dir === 'up'
          ? 'translateY(-12px)'
          : 'translateY(12px)',
  });

  return (
    <section id="painpoint" className="bg-background-surface overflow-hidden">
      <div className="max-w-325 mx-auto px-2.5 flex items-center justify-between gap-20">
        {/* Left: Copy */}
        <h2 className="text-4xl-plus font-bold leading-12 tracking-tight text-text-primary">
          업무 메일 앞에서 <br />
          멈칫하는 순간이 있지 않으셨나요?
        </h2>

        {/* Right: Illustration + Speech bubbles */}
        <div className="relative flex-1 min-w-0 flex justify-center">
          {/* Speech bubble 1 — 나중에 등장, 위쪽 */}
          <div
            className={`${bubbleBase} top-30 right-0 translate-x-2/3`}
            style={bubbleStyle(b1, 'down')}
          >
            내 요청이 너무 세게 들리진 않을까?
          </div>

          {/* Illustration */}
          <img
            src={painPointImg}
            alt="업무 메일 앞에서 고민하는 모습"
            className="w-full max-w-lg object-contain mt-16"
          />

          {/* Speech bubble 2 — 먼저 등장, 아래쪽 */}
          <div
            className={`${bubbleBase} top-50 left-0 lg:left-40`}
            style={bubbleStyle(b2, 'down')}
          >
            표현이 너무 가벼운가...
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoint;
