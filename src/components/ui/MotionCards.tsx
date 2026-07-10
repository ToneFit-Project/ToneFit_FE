import draftGenerationAfterSvg from '@/tonefit-draft-generation-after.svg';
import correctionSuggestionAfterSvg from '@/tonefit-correction-suggestion-after.svg';
import replyGenerationAfterSvg from '@/tonefit-reply-generation-after.svg';

export function DraftGenerationAfterCard() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={draftGenerationAfterSvg}
        alt="ToneFit 초안 생성 after"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function CorrectionSuggestionAfterCard() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={correctionSuggestionAfterSvg}
        alt="ToneFit 교정 제안 after"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function ReplyGenerationAfterCard() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={replyGenerationAfterSvg}
        alt="ToneFit 회신 생성 after"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function DraftGenerationCard() {
  return (
    <div className="relative w-full overflow-hidden h-full">
      <style>{`
        .dg-window {
          animation: dgSlide 6.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          will-change: transform;
        }
        @keyframes dgSlide {
          0%, 14%   { transform: translateY(110%); }
          24%, 78%  { transform: translateY(0%); }
          90%, 100% { transform: translateY(110%); }
        }
        .dg-cursor {
          animation: dgBlink 1s steps(1, end) infinite;
        }
        @keyframes dgBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dg-window { animation: none; transform: translateY(0%); }
          .dg-cursor { animation: none; opacity: 0; }
        }
      `}</style>

      {/* 배경 그라디언트 힌트 */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-brand-subtle/30 to-background-surface pointer-events-none" />

      {/* Gmail 작성 창 */}
      <div
        className="dg-window absolute bottom-0 left-6 right-6 rounded-t-2xl shadow-[0px_8px_24px_-2px_rgba(124,77,255,0.16),0px_2px_8px_rgba(0,0,0,0.06)] bg-background-surface border border-border-subtle overflow-hidden"
        style={{ maxWidth: 480, margin: '0 auto' }}
      >
        {/* 헤더 */}
        <div className="bg-background-brand-subtle flex items-center justify-between px-5 py-3.5 rounded-t-2xl border-b border-border-subtle">
          <span className="text-text-brand-strong font-semibold text-lg leading-7 tracking-tight">
            새 메일
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-background-hover transition-colors">
              <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                <path
                  d="M1 1H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-text-tertiary"
                />
              </svg>
            </button>
            <button className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-background-hover transition-colors">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M9 2L2 9M9 8V2H3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-tertiary"
                />
              </svg>
            </button>
            <button className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-background-hover transition-colors">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M2 2L9 9M9 2L2 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-text-tertiary"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 받는 사람 */}
        <div className="flex flex-col px-5 pt-3">
          <p className="text-text-placeholder font-semibold text-base leading-6 tracking-tight py-2">
            ToneFit@tonefit.kr
          </p>
          <div className="border-b border-border-subtle" />
        </div>

        {/* 제목 */}
        <div className="flex flex-col px-5">
          <p className="text-text-placeholder font-semibold text-base leading-6 tracking-tight py-2">
            제목
          </p>
          <div className="border-b border-border-subtle" />
        </div>

        {/* 본문 */}
        <div className="px-5 pt-3 pb-2 min-h-28 relative">
          <p className="text-text-placeholder text-base leading-7 tracking-tight">
            메일을 작성해주세요.
            <span className="dg-cursor text-text-primary">|</span>
          </p>
          {/* 하단 페이드 */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background-surface to-transparent pointer-events-none" />
        </div>

        {/* 하단 액션바 */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border-subtle bg-background-surface">
          <button className="bg-background-brand text-text-inverse text-sm font-semibold leading-5 tracking-tight px-4 py-2 rounded-full flex items-center gap-1.5">
            보내기
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 4L5 7L8 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-1 ml-1">
            {[
              <path
                key="a"
                d="M3 1H1V9H9V7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />,
              <>
                <path
                  key="b1"
                  d="M5 1L9 1M9 1V5M9 1L5 5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>,
              <>
                <path
                  key="c1"
                  d="M5 5H9M7 3V7"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </>,
              <path
                key="d"
                d="M1 5C1 5 2 2 5 2C8 2 9 5 9 5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />,
            ].map((icon, i) => (
              <button
                key={i}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-background-hover transition-colors text-text-tertiary"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  {icon}
                </svg>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background-hover text-text-tertiary transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 2V5L7 7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle
                cx="5"
                cy="5"
                r="4"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DraftGenerationBeforeCard() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1213 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ToneFit draft generation before"
    >
      <style>{`
        .stage-glow-a {
          transform-box: fill-box;
          transform-origin: center;
          animation: stageGlowA 8s ease-in-out infinite;
        }
        .stage-glow-b {
          transform-box: fill-box;
          transform-origin: center;
          animation: stageGlowB 9s ease-in-out infinite;
        }
        .gmail-motion {
          transform-box: fill-box;
          transform-origin: center;
          animation: gmailSlide 6.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          filter: drop-shadow(0 8px 12px rgba(124, 77, 255, 0.16));
          will-change: transform;
        }
        .state-text {
          opacity: 0;
          animation: typedState 6.2s steps(1, end) infinite;
        }
        .state-1 { --show-state-1: 1; }
        .state-2 { --show-state-2: 1; }
        .state-3 { --show-state-3: 1; }
        .state-4 { --show-state-4: 1; }
        .mail-title {
          font-family: Pretendard, "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 26.931px;
          font-weight: 600;
          letter-spacing: -0.5386px;
          fill: #5130B8;
        }
        .field-label {
          font-family: Pretendard, "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 26.931px;
          font-weight: 600;
          letter-spacing: -0.5386px;
          fill: #9AA1B2;
        }
        .body-text {
          font-family: Pretendard, "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 26.931px;
          font-weight: 400;
          letter-spacing: -0.5386px;
          fill: #303849;
        }
        .window-icon {
          stroke: #303849;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        @keyframes gmailSlide {
          0%, 16% { transform: translateY(622px); }
          27%, 75% { transform: translateY(83px); }
          88%, 100% { transform: translateY(609px); }
        }
        @keyframes typedState {
          0%, 28% { opacity: 0; }
          29%, 39% { opacity: var(--show-state-1, 0); }
          40%, 51% { opacity: var(--show-state-2, 0); }
          52%, 63% { opacity: var(--show-state-3, 0); }
          64%, 76% { opacity: var(--show-state-4, 0); }
          77%, 100% { opacity: 0; }
        }
        @keyframes stageGlowA {
          0%, 100% { transform: translate(-10px, 0) scale(1); }
          50% { transform: translate(18px, -10px) scale(1.06); }
        }
        @keyframes stageGlowB {
          0%, 100% { transform: translate(8px, 8px) scale(1); }
          50% { transform: translate(-16px, -8px) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stage-glow-a, .stage-glow-b, .gmail-motion, .state-text { animation: none; }
          .gmail-motion { transform: translateY(83px); }
          .state-4 { opacity: 1; }
        }
      `}</style>

      <defs>
        <linearGradient
          id="mc-stage-bg"
          x1="42"
          y1="36"
          x2="1148"
          y2="585"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#211A35" />
          <stop offset="0.52" stopColor="#302447" />
          <stop offset="1" stopColor="#211A35" />
        </linearGradient>
        <radialGradient
          id="mc-soft-purple-a"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(860 302) rotate(90) scale(390 520)"
        >
          <stop stopColor="#6F46D9" stopOpacity="0.34" />
          <stop offset="0.58" stopColor="#5130B8" stopOpacity="0.12" />
          <stop offset="1" stopColor="#211A35" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="mc-soft-purple-b"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(270 190) rotate(90) scale(320 430)"
        >
          <stop stopColor="#C2AFFF" stopOpacity="0.13" />
          <stop offset="0.62" stopColor="#7C4DFF" stopOpacity="0.08" />
          <stop offset="1" stopColor="#211A35" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="mc-stage-vignette"
          x1="606.5"
          y1="0"
          x2="606.5"
          y2="600"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F0B1E" stopOpacity="0.16" />
          <stop offset="0.34" stopColor="#0F0B1E" stopOpacity="0" />
          <stop offset="0.72" stopColor="#0F0B1E" stopOpacity="0" />
          <stop offset="1" stopColor="#0F0B1E" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient
          id="mc-compose-fade"
          x1="403.5"
          y1="392"
          x2="403.5"
          y2="652"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.62" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <clipPath id="mc-stage-clip">
          <rect width="1213" height="600" rx="16" />
        </clipPath>
      </defs>

      <g clipPath="url(#mc-stage-clip)">
        <rect width="1213" height="600" rx="16" fill="url(#mc-stage-bg)" />
        <ellipse
          className="stage-glow-a"
          cx="842"
          cy="350"
          rx="470"
          ry="330"
          fill="url(#mc-soft-purple-a)"
        />
        <ellipse
          className="stage-glow-b"
          cx="288"
          cy="174"
          rx="390"
          ry="278"
          fill="url(#mc-soft-purple-b)"
        />
        <rect width="1213" height="600" fill="url(#mc-stage-vignette)" />

        <g transform="translate(203.63 0)">
          <g className="gmail-motion">
            <rect
              x="0"
              y="0"
              width="807.029"
              height="777"
              rx="12.95"
              fill="#FFFFFF"
            />
            <rect
              x="0.5"
              y="0.5"
              width="806.029"
              height="776"
              rx="12.45"
              stroke="#ECEEF4"
            />

            <rect
              x="0"
              y="0"
              width="807.029"
              height="64.75"
              rx="12.95"
              fill="#F6F2FF"
            />
            <path d="M0 64.75H807.029" stroke="#ECEEF4" strokeWidth="1" />
            <text className="mail-title" x="21.583" y="42.5">
              새 메일
            </text>

            <g opacity="0.95" transform="translate(706 21)">
              <path className="window-icon" d="M0 11H13" />
              <path className="window-icon" d="M34 14L45 3" />
              <path className="window-icon" d="M34 5V14H43" />
              <path className="window-icon" d="M66 3L78 15M78 3L66 15" />
            </g>

            <g transform="translate(21.583 83.42)">
              <text className="field-label" x="0" y="26">
                ToneFit@tonefit.kr
              </text>
              <path d="M0 47.5H763.863" stroke="#ECEEF4" strokeWidth="1.08" />
            </g>

            <g transform="translate(21.583 148.5)">
              <text className="field-label" x="0" y="26">
                제목
              </text>
              <path d="M0 47.5H763.863" stroke="#ECEEF4" strokeWidth="1.08" />
            </g>

            <g transform="translate(21.583 232)">
              <text className="body-text state-text state-1" x="0" y="31">
                |
              </text>
              <text className="body-text state-text state-2" x="0" y="31">
                .|
              </text>
              <text className="body-text state-text state-3" x="0" y="31">
                ..|
              </text>
              <text className="body-text state-text state-4" x="0" y="31">
                ...|
              </text>
            </g>

            <rect
              x="0"
              y="392"
              width="807.029"
              height="260"
              fill="url(#mc-compose-fade)"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
