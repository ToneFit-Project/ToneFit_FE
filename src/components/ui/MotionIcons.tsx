interface MailPackingIconProps {
  size?: number;
  title?: string;
}

export function MailPackingIcon({
  size = 88,
  title = '메일 담기 중',
}: MailPackingIconProps) {
  return (
    <svg
      width={size}
      height={(size * 99) / 88}
      viewBox="0 0 88 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-mail-paper {
          transform-origin: 44px 49px;
          animation: tf-mail-paper-pack 3.2s cubic-bezier(.22, .9, .2, 1) infinite;
        }
        @keyframes tf-mail-paper-pack {
          0%, 10% { transform: translateY(0); opacity: 1; }
          58%, 100% { transform: translateY(30px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-mail-paper { animation: none; }
        }
      `}</style>
      <path
        d="M41.1473 9.73406L7.009 43.1411C4.44707 45.6482 6.22211 50 9.80665 50H78.1746C81.7617 50 83.5355 45.6428 80.9684 43.1374L46.7387 9.73033C45.1834 8.21236 42.7006 8.21402 41.1473 9.73406Z"
        fill="#BFA7FF"
        stroke="#7C4DFF"
        strokeWidth="6"
      />
      <g className="tf-mail-paper">
        <path
          d="M30.5283 2.56641H57.4717C67.392 2.56641 75.4336 10.608 75.4336 20.5283V47.4717C75.4336 57.392 67.392 65.4336 57.4717 65.4336H30.5283C20.608 65.4336 12.5664 57.392 12.5664 47.4717V20.5283C12.5664 10.608 20.608 2.56641 30.5283 2.56641Z"
          fill="white"
        />
        <path
          d="M30.5283 2.56641H57.4717C67.392 2.56641 75.4336 10.608 75.4336 20.5283V47.4717C75.4336 57.392 67.392 65.4336 57.4717 65.4336H30.5283C20.608 65.4336 12.5664 57.392 12.5664 47.4717V20.5283C12.5664 10.608 20.608 2.56641 30.5283 2.56641Z"
          stroke="#7C4DFF"
          strokeWidth="5.13208"
        />
        <path
          d="M24.1133 21.1697C24.1133 19.3982 25.5493 17.9622 27.3208 17.9622H60.6793C62.4508 17.9622 63.8869 19.3982 63.8869 21.1697C63.8869 22.9412 62.4508 24.3773 60.6793 24.3773H27.3208C25.5494 24.3773 24.1133 22.9412 24.1133 21.1697Z"
          fill="#7C4DFF"
        />
        <path
          d="M24.1133 33.9998C24.1133 32.2283 25.5493 30.7922 27.3208 30.7922H60.6793C62.4508 30.7922 63.8869 32.2283 63.8869 33.9998C63.8869 35.7713 62.4508 37.2073 60.6793 37.2073H27.3208C25.5494 37.2073 24.1133 35.7713 24.1133 33.9998Z"
          fill="#9B78FF"
        />
        <path
          d="M24.1133 46.8301C24.1133 45.0586 25.5493 43.6226 27.3208 43.6226H60.6793C62.4508 43.6226 63.8869 45.0586 63.8869 46.8301C63.8869 48.6016 62.4508 50.0377 60.6793 50.0377H27.3208C25.5494 50.0377 24.1133 48.6016 24.1133 46.8301Z"
          fill="#BFA7FF"
        />
      </g>
      <path
        d="M42.4412 64.476L11.1887 44.0457C8.52827 42.3065 5 44.2153 5 47.3937V92C5 94.2091 6.79086 96 9 96H79C81.2091 96 83 94.2091 83 92V47.5353C83 44.3282 79.415 42.4252 76.7587 44.2222L46.8712 64.4411C45.5364 65.344 43.7901 65.3578 42.4412 64.476Z"
        fill="white"
        stroke="#7C4DFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AIPencilWritingIconProps {
  size?: number;
  title?: string;
}

export function AIPencilWritingIcon({
  size = 160,
  title = 'AI가 작성 중',
}: AIPencilWritingIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-ai-pencil {
          transform-origin: 80px 80px;
          animation: tf-ai-pencil-write 1.85s cubic-bezier(.42, 0, .2, 1) infinite;
        }
        .tf-ai-dot {
          transform-origin: center;
          animation: tf-ai-dot-appear 1.85s ease-in-out infinite;
        }
        .tf-ai-dot-1 { animation-delay: .38s; }
        .tf-ai-dot-2 { animation-delay: .58s; }
        .tf-ai-dot-3 { animation-delay: .78s; }
        @keyframes tf-ai-pencil-write {
          0%, 14% { transform: translateX(0); }
          34% { transform: translateX(-2px); }
          54% { transform: translateX(-4.5px); }
          74%, 100% { transform: translateX(-7px); }
        }
        @keyframes tf-ai-dot-appear {
          0%, 22% { opacity: 0; transform: scale(.7); }
          32%, 82% { opacity: 1; transform: scale(1); }
          100% { opacity: .3; transform: scale(.92); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-ai-pencil, .tf-ai-dot { animation: none; }
        }
      `}</style>
      <g className="tf-ai-pencil">
        <path
          d="M95.7161 77.5921L69.3161 103.992H58.0014V92.6774L84.4014 66.2774L95.7161 77.5921ZM93.8308 56.8481C94.3308 56.3482 95.009 56.0673 95.7161 56.0673C96.4232 56.0673 97.1014 56.3482 97.6014 56.8481L105.143 64.3948C105.643 64.8948 105.924 65.573 105.924 66.2801C105.924 66.9872 105.643 67.6653 105.143 68.1654L99.4868 73.8188L88.1721 62.5068L93.8308 56.8481ZM62.0788 51.5201C62.1789 51.2688 62.3521 51.0533 62.576 50.9014C62.7999 50.7496 63.0642 50.6685 63.3348 50.6685C63.6053 50.6685 63.8696 50.7496 64.0935 50.9014C64.3174 51.0533 64.4906 51.2688 64.5908 51.5201L65.2654 53.1521C66.398 55.9113 68.5454 58.1312 71.2654 59.3548L73.1801 60.2081C73.4249 60.3214 73.6322 60.5023 73.7774 60.7296C73.9227 60.9569 73.9999 61.221 73.9999 61.4908C73.9999 61.7605 73.9227 62.0246 73.7774 62.2519C73.6322 62.4792 73.4249 62.6601 73.1801 62.7734L71.1534 63.6748C68.5011 64.865 66.3909 67.0056 65.2388 69.6748L64.5801 71.1841C64.4776 71.4299 64.3046 71.6398 64.083 71.7875C63.8614 71.9352 63.6011 72.014 63.3348 72.014C63.0685 72.014 62.8081 71.9352 62.5865 71.7875C62.3649 71.6398 62.1919 71.4299 62.0894 71.1841L61.4308 69.6774C60.2786 67.0068 58.1673 64.8651 55.5134 63.6748L53.4868 62.7734C53.2412 62.6605 53.0332 62.4795 52.8874 62.2519C52.7416 62.0243 52.6641 61.7597 52.6641 61.4894C52.6641 61.2191 52.7416 60.9545 52.8874 60.7269C53.0332 60.4994 53.2412 60.3184 53.4868 60.2054L55.4014 59.3521C58.122 58.1297 60.2703 55.9108 61.4041 53.1521L62.0788 51.5201Z"
          fill="#7C4DFF"
        />
      </g>
      <circle
        className="tf-ai-dot tf-ai-dot-1"
        cx="82"
        cy="102"
        r="4"
        fill="#EEE7FF"
      />
      <circle
        className="tf-ai-dot tf-ai-dot-2"
        cx="95"
        cy="102"
        r="4"
        fill="#EEE7FF"
      />
      <circle
        className="tf-ai-dot tf-ai-dot-3"
        cx="108"
        cy="102"
        r="4"
        fill="#EEE7FF"
      />
    </svg>
  );
}

interface LoginExpiredIconProps {
  size?: number;
  title?: string;
}

export function LoginExpiredIcon({
  size = 160,
  title = '로그인 만료',
}: LoginExpiredIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-login-lock {
          transform-origin: 78px 84px;
          animation: tf-login-lock 5.8s cubic-bezier(.22,.9,.2,1) infinite;
        }
        .tf-login-shackle {
          stroke-dasharray: 92;
          stroke-dashoffset: 92;
          animation: tf-login-shackle 5.8s cubic-bezier(.42,0,.2,1) infinite;
        }
        .tf-login-key {
          transform-origin: 114px 92px;
          animation: tf-login-key 5.8s cubic-bezier(.22,.9,.2,1) infinite;
        }
        @keyframes tf-login-shackle {
          0%,8%  { stroke-dashoffset:92; opacity:.55; }
          20%,88%{ stroke-dashoffset:0;  opacity:1;   }
          100%   { stroke-dashoffset:92; opacity:.55; }
        }
        @keyframes tf-login-key {
          0%,20% { opacity:0; transform:translateX(22px) rotate(0deg);  }
          32%    { opacity:1; transform:translateX(0)    rotate(0deg);   }
          43%    { opacity:1; transform:translateX(-4px) rotate(-7deg);  }
          52%    { opacity:1; transform:translateX(7px)  rotate(8deg);   }
          64%,86%{ opacity:1; transform:translateX(14px) rotate(0deg);   }
          100%   { opacity:0; transform:translateX(22px) rotate(0deg);   }
        }
        @keyframes tf-login-lock {
          0%,36%   { transform:translateX(0)     rotate(0deg);    }
          43%      { transform:translateX(-1.8px) rotate(-1.2deg); }
          50%      { transform:translateX(1.8px)  rotate(1.2deg);  }
          57%,100% { transform:translateX(0)     rotate(0deg);    }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-login-lock,.tf-login-shackle,.tf-login-key { animation:none; }
          .tf-login-shackle,.tf-login-key { opacity:1; }
        }
      `}</style>
      <defs>
        <clipPath id="tf-login-shackle-clip">
          <rect x="0" y="0" width="160" height="74" />
        </clipPath>
      </defs>
      <g className="tf-login-lock">
        <path
          className="tf-login-shackle"
          clipPath="url(#tf-login-shackle-clip)"
          d="M58 76V66C58 53.8497 67.8497 44 80 44C92.1503 44 102 53.8497 102 66V76"
          stroke="#7C4DFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect
          x="46"
          y="72"
          width="68"
          height="52"
          rx="16"
          fill="#F2EDFF"
          stroke="#7C4DFF"
          strokeWidth="6"
        />
        <circle cx="80" cy="95" r="6" fill="#7C4DFF" />
        <rect x="77" y="99" width="6" height="13" rx="3" fill="#7C4DFF" />
      </g>
      <g className="tf-login-key">
        <circle
          cx="122"
          cy="92"
          r="9"
          fill="white"
          stroke="#7C4DFF"
          strokeWidth="5"
        />
        <rect x="91" y="89" width="28" height="6" rx="3" fill="#7C4DFF" />
        <path
          d="M94 92V101"
          stroke="#7C4DFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M102 92V98"
          stroke="#7C4DFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

interface ErrorNoticeIconProps {
  size?: number;
  title?: string;
}

export function ErrorNoticeIcon({
  size = 160,
  title = '오류 발생',
}: ErrorNoticeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-error-halo {
          transform-origin: 80px 80px;
          animation: tf-error-halo 5.2s ease-in-out infinite;
        }
        .tf-error-doc {
          transform-origin: 78px 82px;
          animation: tf-error-doc 5.2s cubic-bezier(.22,.9,.2,1) infinite;
        }
        .tf-error-line-1,.tf-error-line-2,.tf-error-line-3 {
          animation: tf-error-line 5.2s ease-in-out infinite;
        }
        .tf-error-line-2 { animation-delay:.1s; }
        .tf-error-line-3 { animation-delay:.2s; }
        .tf-error-badge {
          transform-origin: 108px 106px;
          animation: tf-error-badge 5.2s cubic-bezier(.22,.9,.2,1) infinite;
        }
        .tf-error-ring {
          transform-origin: 108px 106px;
          animation: tf-error-ring 5.2s ease-out infinite;
        }
        .tf-error-mark {
          transform-origin: 108px 106px;
          animation: tf-error-mark 5.2s cubic-bezier(.22,.9,.2,1) infinite;
        }
        @keyframes tf-error-halo {
          0%,12%   { opacity:.2;  transform:scale(.92); }
          30%,82%  { opacity:.48; transform:scale(1);   }
          100%     { opacity:.2;  transform:scale(.92); }
        }
        @keyframes tf-error-doc {
          0%,8%    { opacity:.78; transform:translateY(4px) scale(.97); }
          20%,84%  { opacity:1;   transform:translateY(0)   scale(1);   }
          100%     { opacity:.78; transform:translateY(4px) scale(.97); }
        }
        @keyframes tf-error-line {
          0%,16%   { opacity:.38; }
          32%,84%  { opacity:1;   }
          100%     { opacity:.38; }
        }
        @keyframes tf-error-badge {
          0%,24%   { opacity:0; transform:translateY(5px) scale(.82); }
          34%      { opacity:1; transform:translateY(0)   scale(1.06); }
          42%,86%  { opacity:1; transform:translateY(0)   scale(1);    }
          100%     { opacity:0; transform:translateY(5px) scale(.88);  }
        }
        @keyframes tf-error-ring {
          0%,35%   { opacity:0;   transform:scale(.74);  }
          44%      { opacity:.42;                        }
          66%,100% { opacity:0;   transform:scale(1.34); }
        }
        @keyframes tf-error-mark {
          0%,34%   { transform:scale(.9);  }
          43%      { transform:scale(1.08);}
          52%,100% { transform:scale(1);  }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-error-halo,.tf-error-doc,.tf-error-line-1,.tf-error-line-2,
          .tf-error-line-3,.tf-error-badge,.tf-error-ring,.tf-error-mark { animation:none; }
          .tf-error-halo { opacity:.38; }
          .tf-error-doc,.tf-error-line-1,.tf-error-line-2,.tf-error-line-3,.tf-error-badge { opacity:1; }
          .tf-error-ring { opacity:0; }
        }
      `}</style>
      <circle className="tf-error-halo" cx="80" cy="80" r="52" fill="#F2EDFF" />
      <g className="tf-error-doc">
        <rect
          x="46"
          y="46"
          width="68"
          height="68"
          rx="18"
          fill="#F2EDFF"
          stroke="#7C4DFF"
          strokeWidth="6"
        />
        <rect
          className="tf-error-line-1"
          x="61"
          y="63"
          width="39"
          height="6"
          rx="3"
          fill="#7C4DFF"
        />
        <rect
          className="tf-error-line-2"
          x="61"
          y="78"
          width="33"
          height="6"
          rx="3"
          fill="#9B78FF"
        />
        <rect
          className="tf-error-line-3"
          x="61"
          y="93"
          width="24"
          height="6"
          rx="3"
          fill="#BFA7FF"
        />
      </g>
      <circle
        className="tf-error-ring"
        cx="108"
        cy="106"
        r="22"
        stroke="#9B78FF"
        strokeWidth="6"
      />
      <g className="tf-error-badge">
        <circle cx="108" cy="106" r="23" fill="white" />
        <circle cx="108" cy="106" r="18" fill="#7C4DFF" />
        <g className="tf-error-mark">
          <rect
            x="105.4"
            y="93.5"
            width="5.2"
            height="15.5"
            rx="2.6"
            fill="white"
          />
          <circle cx="108" cy="115" r="3.1" fill="white" />
        </g>
      </g>
    </svg>
  );
}

interface MailReadingIconProps {
  size?: number;
  title?: string;
}

export function MailReadingIcon({
  size = 60,
  title = '메일 읽는 중',
}: MailReadingIconProps) {
  return (
    <svg
      width={size}
      height={(size * 53) / 60}
      viewBox="0 0 60 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-line-1, .tf-line-2, .tf-line-3 {
          animation: tf-reading-line 2.6s ease-in-out infinite;
        }
        .tf-line-2 { animation-delay: .15s; }
        .tf-line-3 { animation-delay: .3s; }
        .tf-lens {
          transform-origin: 46.5px 26.5px;
          animation: tf-reading-lens 2.6s cubic-bezier(.42, 0, .2, 1) infinite;
        }
        @keyframes tf-reading-line {
          0%, 100% { opacity: .58; }
          36%, 58% { opacity: 1; }
        }
        @keyframes tf-reading-lens {
          0%, 18% { transform: translateY(-11px); opacity: 1; }
          46%, 58% { transform: translateY(0); opacity: 1; }
          84%, 91% { transform: translateY(10px); opacity: 1; }
          96% { transform: translateY(10px); opacity: 0; }
          97% { transform: translateY(-11px); opacity: 0; }
          100% { transform: translateY(-11px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-line-1, .tf-line-2, .tf-line-3, .tf-lens { animation: none; }
        }
      `}</style>
      <path
        d="M16 2H37C44.732 2 51 8.26801 51 16V37C51 44.732 44.732 51 37 51H16C8.26801 51 2 44.732 2 37V16C2 8.26801 8.26801 2 16 2Z"
        stroke="#7C4DFF"
        strokeWidth="4"
      />
      <path
        className="tf-line-1"
        d="M11 16.5C11 15.1193 12.1193 14 13.5 14H39.5C40.8807 14 42 15.1193 42 16.5C42 17.8807 40.8807 19 39.5 19H13.5C12.1193 19 11 17.8807 11 16.5Z"
        fill="#7C4DFF"
      />
      <path
        className="tf-line-2"
        d="M11 26.5C11 25.1193 12.1193 24 13.5 24H39.5C40.8807 24 42 25.1193 42 26.5C42 27.8807 40.8807 29 39.5 29H13.5C12.1193 29 11 27.8807 11 26.5Z"
        fill="#9B78FF"
      />
      <path
        className="tf-line-3"
        d="M11 36.5C11 35.1193 12.1193 34 13.5 34H39.5C40.8807 34 42 35.1193 42 36.5C42 37.8807 40.8807 39 39.5 39H13.5C12.1193 39 11 37.8807 11 36.5Z"
        fill="#BFA7FF"
      />
      <g className="tf-lens">
        <path
          d="M46.5 14C53.4036 14 59 19.5964 59 26.5C59 29.8971 57.6426 32.9755 55.4434 35.2285L59.0615 39.751C59.7514 40.6135 59.6115 41.8715 58.749 42.5615C57.8865 43.2514 56.6285 43.1115 55.9385 42.249L52.2266 37.6094C50.5105 38.4958 48.5646 39 46.5 39C39.5964 39 34 33.4036 34 26.5C34 19.5964 39.5964 14 46.5 14Z"
          fill="#7C4DFF"
        />
        <circle cx="46.5" cy="26.5" r="9.5" fill="#FBFAFF" />
      </g>
    </svg>
  );
}
interface DraftGenerationIconProps {
  size?: number;
  title?: string;
}

export function DraftGenerationIcon({
  size = 276,
  title = '초안 생성',
}: DraftGenerationIconProps) {
  return (
    <svg
      width={size}
      height={(size * 222) / 276}
      viewBox="0 0 276 222"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .draft-white-reveal {
          transform-box: fill-box;
          transform-origin: left center;
          animation: draftReveal 3.6s ease-in-out infinite;
        }
        .draft-pen {
          transform-box: fill-box;
          transform-origin: center;
          animation: draftPen 3.6s ease-in-out infinite;
        }
        @keyframes draftReveal {
          0%, 12% { transform: scaleX(0); }
          58%, 78% { transform: scaleX(1); }
          86%, 100% { transform: scaleX(0); }
        }
        @keyframes draftPen {
          0%, 12% { transform: translate(-92px, 2px) rotate(-2deg); opacity: 1; }
          58%, 78% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          84% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          85% { transform: translate(-92px, 2px) rotate(-2deg); opacity: 0; }
          92%, 100% { transform: translate(-92px, 2px) rotate(-2deg); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .draft-white-reveal, .draft-pen { animation: none; }
          .draft-white-reveal { transform: scaleX(1); }
        }
      `}</style>
      <defs>
        <linearGradient
          id="draft-card-fill"
          x1="19.2933"
          y1="0"
          x2="222.165"
          y2="208.718"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E7E0FF" />
          <stop offset="1" stopColor="#D1C6FF" />
        </linearGradient>
        <linearGradient
          id="draft-pen-fill"
          x1="253.703"
          y1="21.0264"
          x2="219.793"
          y2="226.821"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7D4FFF" />
          <stop offset="1" stopColor="#BFA7FF" />
        </linearGradient>
        <clipPath id="draft-white-line-clip">
          <rect
            className="draft-white-reveal"
            x="46.0757"
            y="136"
            width="114"
            height="38"
          />
        </clipPath>
      </defs>
      <path
        d="M67.0186 8.37695H154.981C187.368 8.37712 213.623 34.632 213.623 67.0186V154.981C213.623 187.368 187.368 213.623 154.981 213.623H67.0186C34.632 213.623 8.37713 187.368 8.37695 154.981V67.0186C8.37712 34.632 34.632 8.37713 67.0186 8.37695Z"
        fill="url(#draft-card-fill)"
      />
      <path
        d="M67.0186 8.37695H154.981C187.368 8.37712 213.623 34.632 213.623 67.0186V154.981C213.623 187.368 187.368 213.623 154.981 213.623H67.0186C34.632 213.623 8.37713 187.368 8.37695 154.981V67.0186C8.37712 34.632 34.632 8.37713 67.0186 8.37695Z"
        stroke="#7C4DFF"
        strokeWidth="16.7547"
      />
      <path
        d="M46.0757 69.1123C46.0757 63.329 50.764 58.6406 56.5474 58.6406H165.453C171.236 58.6406 175.925 63.329 175.925 69.1123C175.925 74.8957 171.236 79.584 165.453 79.584H56.5474C50.764 79.584 46.0757 74.8957 46.0757 69.1123Z"
        fill="#7C4DFF"
      />
      <path
        d="M46.0757 110.999C46.0757 105.216 50.764 100.527 56.5474 100.527H165.453C171.236 100.527 175.925 105.216 175.925 110.999C175.925 116.782 171.236 121.471 165.453 121.471H56.5474C50.764 121.471 46.0757 116.782 46.0757 110.999Z"
        fill="#9B78FF"
      />
      <g clipPath="url(#draft-white-line-clip)">
        <path
          d="M46.0757 152.675C46.0757 147.008 50.6695 142.414 56.3362 142.414H131.615C137.282 142.414 141.876 147.008 141.876 152.675C141.876 158.341 137.282 162.935 131.615 162.935H56.3362C50.6695 162.935 46.0757 158.341 46.0757 152.675Z"
          fill="#FBFAFF"
        />
        <ellipse
          cx="142.279"
          cy="153.222"
          rx="17.7849"
          ry="17.7849"
          fill="#FBFAFF"
        />
      </g>
      <path
        className="draft-pen"
        d="M247.36 80.1016L175.009 153.203H144V121.872L216.351 48.7715L247.36 80.1016ZM242.193 22.6619C243.564 21.2776 245.422 20.5 247.36 20.5C249.298 20.5 251.157 21.2776 252.527 22.6619L273.195 43.5585C274.565 44.9431 275.334 46.8209 275.334 48.7789C275.334 50.7369 274.565 52.6147 273.195 53.9993L257.694 69.6533L226.685 38.3306L242.193 22.6619Z"
        fill="url(#draft-pen-fill)"
      />
    </svg>
  );
}

interface CorrectionSuggestionIconProps {
  size?: number;
  title?: string;
}

export function CorrectionSuggestionIcon({
  size = 238,
  title = '교정 제안',
}: CorrectionSuggestionIconProps) {
  return (
    <svg
      width={size}
      height={(size * 212) / 238}
      viewBox="0 0 238 212"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .correction-magnifier {
          transform-box: view-box;
          transform-origin: 186px 62px;
          animation: correctionMagnifierRead 6.2s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          will-change: transform;
        }
        @keyframes correctionMagnifierRead {
          0%, 8% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-46px, 0) scale(1.01); }
          32% { transform: translate(-92px, 0) scale(1.02); }
          44% { transform: translate(-92px, 40px) scale(1.02); }
          56% { transform: translate(-46px, 40px) scale(1.01); }
          68% { transform: translate(-92px, 80px) scale(1.02); }
          80% { transform: translate(-42px, 80px) scale(1.01); }
          92%, 100% { transform: translate(0, 0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .correction-magnifier { animation: none; }
        }
      `}</style>
      <defs>
        <linearGradient
          id="paint0_linear_correction_icon"
          x1="106"
          y1="0"
          x2="106"
          y2="212"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8E2FF" />
          <stop offset="1" stopColor="#D0C5FE" />
        </linearGradient>
      </defs>
      <path
        d="M64 8H148C178.928 8 204 33.0721 204 64V148C204 178.928 178.928 204 148 204H64C33.0721 204 8 178.928 8 148V64C8 33.0721 33.0721 8 64 8Z"
        fill="url(#paint0_linear_correction_icon)"
      />
      <path
        d="M64 8H148C178.928 8 204 33.0721 204 64V148C204 178.928 178.928 204 148 204H64C33.0721 204 8 178.928 8 148V64C8 33.0721 33.0721 8 64 8Z"
        stroke="#7C4DFF"
        strokeWidth="16"
      />
      <path
        d="M44 66C44 60.4772 48.4772 56 54 56H158C163.523 56 168 60.4772 168 66C168 71.5228 163.523 76 158 76H54C48.4772 76 44 71.5228 44 66Z"
        fill="#7C4DFF"
      />
      <path
        d="M44 106C44 100.477 48.4772 96 54 96H158C163.523 96 168 100.477 168 106C168 111.523 163.523 116 158 116H54C48.4772 116 44 111.523 44 106Z"
        fill="#9B78FF"
      />
      <path
        d="M44 146C44 140.477 48.4772 136 54 136H158C163.523 136 168 140.477 168 146C168 151.523 163.523 156 158 156H54C48.4772 156 44 151.523 44 146Z"
        fill="#BFA7FF"
      />
      <g className="correction-magnifier">
        <path
          d="M186 12C213.614 12 236 34.3858 236 62C236 75.588 230.577 87.907 221.78 96.9189L236.247 115.002C239.007 118.452 238.448 123.487 234.998 126.247C231.548 129.007 226.513 128.448 223.753 124.998L208.914 106.449C202.049 109.995 194.259 112 186 112C158.386 112 136 89.6142 136 62C136 34.3858 158.386 12 186 12Z"
          fill="#7C4DFF"
        />
        <circle cx="186" cy="62" r="38" fill="#FBFAFF" />
      </g>
    </svg>
  );
}

interface ReplyGenerationIconProps {
  size?: number;
  title?: string;
}

export function ReplyGenerationIcon({
  size = 462,
  title = '회신 생성',
}: ReplyGenerationIconProps) {
  return (
    <svg
      width={size}
      height={(size * 237) / 462}
      viewBox="0 0 462 237"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .reply-envelope-flap {
          transform-box: view-box;
          transform-origin: 220px 118px;
          animation: replyEnvelopeSpread 5.8s ease-in-out infinite;
          will-change: transform;
        }
        .reply-mail-sheet {
          transform-box: view-box;
          transform-origin: 220px 82px;
          animation: replyMailSpread 5.8s ease-in-out infinite;
          will-change: transform;
        }
        .reply-envelope-body {
          transform-box: view-box;
          transform-origin: 220px 180px;
          animation: replyBodySpread 5.8s ease-in-out infinite;
          will-change: transform;
        }
        .reply-source-top {
          transform-box: view-box;
          transform-origin: 378px 51px;
          animation: replyTopCardSpread 5.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .reply-source-bottom {
          transform-box: view-box;
          transform-origin: 90px 173px;
          animation: replyBottomCardSpread 5.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes replyTopCardSpread {
          0% { transform: translate(-38px, 30px) scale(0.96); opacity: 0.78; }
          52% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-38px, 30px) scale(0.96); opacity: 0.78; }
        }
        @keyframes replyBottomCardSpread {
          0% { transform: translate(48px, -24px) scale(0.96); opacity: 0.78; }
          56% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(48px, -24px) scale(0.96); opacity: 0.78; }
        }
        @keyframes replyMailSpread {
          0% { transform: translate(0, 12px) scale(0.97); }
          54% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(0, 12px) scale(0.97); }
        }
        @keyframes replyEnvelopeSpread {
          0% { transform: translate(0, 3px) scaleY(0.99); }
          52% { transform: translate(0, 0) scaleY(1); }
          100% { transform: translate(0, 3px) scaleY(0.99); }
        }
        @keyframes replyBodySpread {
          0% { transform: translate(0, 2px) scale(1.006); }
          52% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(0, 2px) scale(1.006); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reply-envelope-flap, .reply-mail-sheet, .reply-envelope-body,
          .reply-source-top, .reply-source-bottom { animation: none; }
        }
      `}</style>
      <defs>
        <filter
          id="filter0_d_reply_icon"
          x="250"
          y="-24"
          width="236"
          height="168"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_reply_icon"
          />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="12" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.486275 0 0 0 0 0.301961 0 0 0 0 1 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_reply_icon"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_reply_icon"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_reply_icon"
          x="-52"
          y="84"
          width="244"
          height="176"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_reply_icon_bottom"
          />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="12" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.486275 0 0 0 0 0.301961 0 0 0 0 1 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_reply_icon_bottom"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_reply_icon_bottom"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_reply_icon"
          x1="127"
          y1="104.501"
          x2="313"
          y2="229.001"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EBE5FF" />
          <stop offset="1" stopColor="#CDC1FF" />
        </linearGradient>
      </defs>
      <g className="reply-envelope-flap">
        <path
          d="M213.192 23.2296L131.726 102.951C125.612 108.934 129.848 119.319 138.402 119.319H301.553C310.113 119.319 314.346 108.921 308.22 102.942L226.536 23.2206C222.824 19.5982 216.899 19.6022 213.192 23.2296Z"
          fill="#BFA7FF"
          stroke="#7C4DFF"
          strokeWidth="14.3182"
        />
      </g>
      <g className="reply-mail-sheet">
        <path
          d="M187.852 6.12305H252.148C275.822 6.12325 295.013 25.315 295.013 48.9883V113.285C295.012 136.958 275.822 156.149 252.148 156.149H187.852C164.178 156.149 144.987 136.958 144.986 113.285V48.9883C144.986 25.3149 164.178 6.12305 187.852 6.12305Z"
          fill="white"
        />
        <path
          d="M187.852 6.12305H252.148C275.822 6.12325 295.013 25.315 295.013 48.9883V113.285C295.012 136.958 275.822 156.149 252.148 156.149H187.852C164.178 156.149 144.987 136.958 144.986 113.285V48.9883C144.986 25.3149 164.178 6.12305 187.852 6.12305Z"
          stroke="#7C4DFF"
          strokeWidth="12.247"
        />
        <path
          d="M172.542 50.5196C172.542 46.2922 175.969 42.8652 180.197 42.8652H259.802C264.03 42.8652 267.457 46.2922 267.457 50.5196C267.457 54.747 264.03 58.174 259.802 58.174H180.197C175.969 58.174 172.542 54.747 172.542 50.5196Z"
          fill="#7C4DFF"
        />
        <path
          d="M172.542 81.1368C172.542 76.9094 175.969 73.4824 180.197 73.4824H259.802C264.03 73.4824 267.457 76.9094 267.457 81.1368C267.457 85.3642 264.03 88.7912 259.802 88.7912H180.197C175.969 88.7912 172.542 85.3642 172.542 81.1368Z"
          fill="#9B78FF"
        />
        <path
          d="M172.542 111.754C172.542 107.527 175.969 104.1 180.197 104.1H259.802C264.03 104.1 267.457 107.527 267.457 111.754C267.457 115.981 264.03 119.408 259.802 119.408H180.197C175.969 119.408 172.542 115.981 172.542 111.754Z"
          fill="#BFA7FF"
        />
      </g>
      <g className="reply-envelope-body">
        <path
          d="M216.28 153.864L141.7 105.11C135.351 100.959 126.932 105.514 126.932 113.099V219.546C126.932 224.818 131.205 229.091 136.477 229.091H303.523C308.794 229.091 313.068 224.818 313.068 219.546V113.437C313.068 105.784 304.513 101.243 298.174 105.531L226.851 153.78C223.666 155.935 219.499 155.968 216.28 153.864Z"
          fill="url(#paint0_linear_reply_icon)"
          stroke="#7C4DFF"
          strokeWidth="14.3182"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g className="reply-source-top">
        <g filter="url(#filter0_d_reply_icon)">
          <path
            d="M416.9 24H339.9C327.142 24 316.8 33.402 316.8 45V57C316.8 68.598 327.142 78 339.9 78H416.9C429.658 78 440 68.598 440 57V45C440 33.402 429.658 24 416.9 24Z"
            fill="white"
          />
          <path
            d="M324.5 50.5469C324.5 43.9195 329.873 38.5469 336.5 38.5469H347.5C354.127 38.5469 359.5 43.9195 359.5 50.5469C359.5 57.1743 354.127 62.5469 347.5 62.5469H336.5C329.873 62.5469 324.5 57.1743 324.5 50.5469Z"
            fill="#7C4DFF"
          />
          <path
            d="M338.094 52.2246H339.721L340.568 53.332C341.122 52.7441 341.457 51.8213 341.457 50.5977C341.457 48.3418 340.322 47.1113 338.709 47.1113C337.096 47.1113 335.961 48.3418 335.961 50.5977C335.961 52.8535 337.096 54.084 338.709 54.084C338.969 54.084 339.215 54.0498 339.447 53.9883L338.094 52.2246ZM343.248 50.5977C343.248 52.3955 342.633 53.7764 341.648 54.6445L343.016 56.4082H341.279L340.459 55.3555C339.926 55.5742 339.338 55.6836 338.709 55.6836C336.111 55.6836 334.17 53.7832 334.17 50.5977C334.17 47.3984 336.111 45.5117 338.709 45.5117C341.307 45.5117 343.248 47.3984 343.248 50.5977ZM348.491 45.6484V55.5469H346.7V47.3848H346.646L344.335 48.8613V47.2344L346.783 45.6484H348.491Z"
            fill="white"
          />
          <path
            d="M378.4 44H422.4"
            stroke="#C4B5FD"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M378.4 57H405.9"
            stroke="#C4B5FD"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      </g>
      <g className="reply-source-bottom">
        <g filter="url(#filter1_d_reply_icon)">
          <path
            d="M125.056 146H54.2438C42.5112 146 33 155.402 33 167V179C33 190.598 42.5112 200 54.2438 200H125.056C136.789 200 146.3 190.598 146.3 179V167C146.3 155.402 136.789 146 125.056 146Z"
            fill="white"
          />
          <path
            d="M94.6001 166H126.5"
            stroke="#C4B5FD"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M94.6001 179H116.6"
            stroke="#C4B5FD"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M40 172.547C40 165.919 45.3726 160.547 52 160.547H63C69.6274 160.547 75 165.919 75 172.547C75 179.174 69.6274 184.547 63 184.547H52C45.3726 184.547 40 179.174 40 172.547Z"
            fill="#7C4DFF"
          />
          <path
            d="M52.5938 174.225H54.2207L55.0684 175.332C55.6221 174.744 55.957 173.821 55.957 172.598C55.957 170.342 54.8223 169.111 53.209 169.111C51.5957 169.111 50.4609 170.342 50.4609 172.598C50.4609 174.854 51.5957 176.084 53.209 176.084C53.4688 176.084 53.7148 176.05 53.9473 175.988L52.5938 174.225ZM57.748 172.598C57.748 174.396 57.1328 175.776 56.1484 176.645L57.5156 178.408H55.7793L54.959 177.355C54.4258 177.574 53.8379 177.684 53.209 177.684C50.6113 177.684 48.6699 175.783 48.6699 172.598C48.6699 169.398 50.6113 167.512 53.209 167.512C55.8066 167.512 57.748 169.398 57.748 172.598ZM58.972 177.547V176.262L62.472 172.885C63.47 171.887 63.9895 171.299 63.9895 170.465C63.9895 169.549 63.2649 168.961 62.2942 168.961C61.2688 168.961 60.6126 169.604 60.6263 170.602H58.9309C58.9173 168.729 60.3255 167.512 62.3079 167.512C64.3313 167.512 65.6985 168.715 65.6985 170.383C65.6985 171.504 65.1516 172.406 63.2102 174.238L61.4466 175.988V176.057H65.8489V177.547H58.972Z"
            fill="white"
          />
        </g>
      </g>
    </svg>
  );
}

interface NoCorrectionIconProps {
  size?: number;
  title?: string;
}

export function NoCorrectionIcon({
  size = 160,
  title = '제안할 교정 항목 없음',
}: NoCorrectionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <style>{`
        .tf-no-correction-doc {
          transform-origin: 80px 80px;
          animation: tf-no-correction-doc 6s ease-in-out infinite;
        }
        .tf-no-correction-line-1,
        .tf-no-correction-line-2,
        .tf-no-correction-line-3 {
          transform-origin: 80px 80px;
          animation: tf-no-correction-lines 6s ease-in-out infinite;
        }
        .tf-no-correction-line-2 { animation-delay: .1s; }
        .tf-no-correction-line-3 { animation-delay: .2s; }
        .tf-no-correction-badge {
          transform-origin: 110px 104px;
          animation: tf-no-correction-badge 6s cubic-bezier(.22, .9, .2, 1) infinite;
        }
        @keyframes tf-no-correction-doc {
          0%, 8%   { opacity: .92; transform: scale(.98); }
          18%, 88% { opacity: 1;   transform: scale(1);   }
          100%     { opacity: .92; transform: scale(.98); }
        }
        @keyframes tf-no-correction-lines {
          0%, 12%  { opacity: .35; }
          28%, 88% { opacity: 1;   }
          100%     { opacity: .35; }
        }
        @keyframes tf-no-correction-badge {
          0%, 28%  { opacity: 0; transform: translateY(3px) scale(.86); }
          36%      { opacity: 1; transform: translateY(0)  scale(1.04); }
          44%, 92% { opacity: 1; transform: translateY(0)  scale(1);    }
          100%     { opacity: 0; transform: translateY(3px) scale(.92); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tf-no-correction-doc,
          .tf-no-correction-line-1,
          .tf-no-correction-line-2,
          .tf-no-correction-line-3,
          .tf-no-correction-badge { animation: none; }
          .tf-no-correction-line-1,
          .tf-no-correction-line-2,
          .tf-no-correction-line-3,
          .tf-no-correction-badge { opacity: 1; }
        }
      `}</style>

      <g className="tf-no-correction-doc">
        <rect
          x="48"
          y="48"
          width="65"
          height="65"
          rx="16"
          fill="#F2EDFF"
          stroke="#7C4DFF"
          strokeWidth="6"
        />
        <rect
          className="tf-no-correction-line-1"
          x="62"
          y="64"
          width="39"
          height="6"
          rx="3"
          fill="#7C4DFF"
        />
        <rect
          className="tf-no-correction-line-2"
          x="62"
          y="78"
          width="39"
          height="6"
          rx="3"
          fill="#9B78FF"
        />
        <rect
          className="tf-no-correction-line-3"
          x="62"
          y="92"
          width="29"
          height="6"
          rx="3"
          fill="#BFA7FF"
        />
      </g>

      <g className="tf-no-correction-badge">
        <circle cx="110" cy="104" r="20" fill="#FFFFFF" />
        <circle cx="110" cy="104" r="17" fill="#7C4DFF" />
        <text
          x="110"
          y="111"
          textAnchor="middle"
          fontFamily="Inter, Pretendard, Arial, sans-serif"
          fontSize="20"
          fontWeight="800"
          fill="#FFFFFF"
        >
          0
        </text>
      </g>
    </svg>
  );
}
