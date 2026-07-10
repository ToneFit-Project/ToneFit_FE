import { useState } from 'react';
import type { ReactNode } from 'react';
import replyBefore1 from '@/assets/landing/feature-card-reply-before1.svg';
import replyBefore2 from '@/assets/landing/feature-card-reply-before2.svg';
import { ButtonLongV2 } from '@/components/ui';
import {
  FeatureAfterBg,
  FeatureBeforeBg,
} from '@/components/ui/MotionBackground';
const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/tonefit/hccpncocbnbphkmandkcmnefolgfhcgi';

export const GmailMockup = () => (
  <div className="relative flex-1 min-w-0 overflow-hidden rounded-2xl shadow-[0px_8px_12px_rgba(124,77,255,0.16)] bg-background-surface min-h-96 hidden lg:block">
    <div className="bg-background-brand-subtle px-5 py-4 flex items-center justify-between rounded-t-2xl">
      <span className="text-2xl font-semibold tracking-tight text-text-brand-strong">
        새 메일
      </span>
    </div>
    <div className="px-5 py-8 flex flex-col gap-4">
      <div className="border-b border-border-subtle pb-4">
        <p className="text-text-placeholder font-semibold text-lg tracking-tight">
          ToneFit@tonefit.kr
        </p>
      </div>
      <div className="border-b border-border-subtle pb-4">
        <p className="text-text-placeholder font-semibold text-lg tracking-tight">
          제목
        </p>
      </div>
      <p className="text-text-primary text-lg leading-8 tracking-tight">...</p>
    </div>
  </div>
);

export const CorrectionMockup = () => (
  <div className="relative flex-1 min-w-0 h-full">
    <style>{`
      .cc-b1 {
        opacity: 0;
        animation: ccB1 6s linear infinite;
        will-change: opacity;
      }
      .cc-b2 {
        opacity: 0;
        transform: translateY(16px);
        animation: ccB2 6s linear infinite;
        will-change: opacity, transform;
      }
      .cc-b3 {
        opacity: 0;
        animation: ccB3 6s linear infinite;
        will-change: opacity;
      }
      @keyframes ccB1 {
        0%, 8%   { opacity: 0; animation-timing-function: ease-out; }
        18%, 70% { opacity: 1; animation-timing-function: ease-in; }
        82%, 100% { opacity: 0; }
      }
      @keyframes ccB2 {
        0%, 18%  { opacity: 0; transform: translateY(16px); animation-timing-function: ease-out; }
        28%, 70% { opacity: 1; transform: translateY(0); animation-timing-function: ease-in; }
        82%, 100% { opacity: 0; transform: translateY(0); }
      }
      @keyframes ccB3 {
        0%, 28%  { opacity: 0; animation-timing-function: ease-out; }
        38%, 70% { opacity: 1; animation-timing-function: ease-in; }
        82%, 100% { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .cc-b1, .cc-b2, .cc-b3 { animation: none; opacity: 1; transform: none; }
      }
    `}</style>
    <div className="py-9 px-10 h-full flex flex-col justify-between gap-5">
      <div className="cc-b1 flex justify-end">
        <div className="bg-background-brand text-text-inverse text-lg font-normal leading-7 tracking-tight px-5.5 py-4.5 rounded-[25px]">
          방금 전에 내가 작성한 메일의 맞춤법을 확인해줘
        </div>
      </div>
      <div className="cc-b2 flex justify-start">
        <div className="bg-background-surface rounded-[25px] px-5.5 py-4 shadow-sm border border-border-subtle">
          <p className="text-text-primary leading-8 tracking-tight whitespace-pre-line">
            {
              '안녕하세요.\n\n금일 전달드린 자료를 확인 부탁드립니다.\n\n검토 후 회신 부탁드리며,\n추가 수정이 필요한 경우\n말씀 주시면 반영하겠습니다.\n\n감사합니다.'
            }
          </p>
        </div>
      </div>
      <div className="cc-b3 flex justify-end">
        <div className="bg-background-brand text-text-inverse text-lg font-normal leading-7 tracking-tight px-5.5 py-4.5 rounded-[25px]">
          메일이 너무 딱딱해졌는데…
        </div>
      </div>
    </div>
  </div>
);

export const ReplyMockup = () => (
  <div className="relative flex-1 min-w-0 h-full overflow-hidden">
    <style>{`
      .rr-img1 {
        position: absolute;
        top: 50%; left: 50%;
        width: 95%;
        object-fit: contain;
        border-radius: 12px;
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        animation: rrImg1 8s linear infinite;
        will-change: transform, opacity;
      }
      .rr-img2 {
        position: absolute;
        top: 58%; left: 55%;
        width: 82%;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 20px 48px rgba(56, 31, 140, 0.18);
        transform: translate(-50%, 90%);
        opacity: 0;
        animation: rrImg2 8s linear infinite;
        will-change: transform, opacity;
      }
      @keyframes rrImg1 {
        0%, 10%  { transform: translate(-50%, -50%) scale(1); opacity: 1; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
        28%, 65% { transform: translate(-65%, -65%) scale(0.68); opacity: 0.5; }
        78%      { transform: translate(-65%, -65%) scale(0.68); opacity: 0.5; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
        92%, 100%{ transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes rrImg2 {
        0%, 34%  { transform: translate(-50%, 90%); opacity: 0; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        52%, 65% { transform: translate(-50%, -50%); opacity: 1; animation-timing-function: ease-in; }
        78%      { transform: translate(-50%, -50%); opacity: 0; }
        78.5%, 100% { transform: translate(-50%, 90%); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .rr-img1 { animation: none; transform: translate(-50%, -50%) scale(1); opacity: 1; }
        .rr-img2 { animation: none; transform: translate(-50%, -50%); opacity: 1; }
      }
    `}</style>
    <img src={replyBefore1} alt="" className="rr-img1" />
    <img src={replyBefore2} alt="" className="rr-img2" />
  </div>
);

interface BeforeCardProps {
  quote: string;
  painPoints: [string, string, string];
  onAfterClick: () => void;
}

const BeforeCard = ({ quote, painPoints, onAfterClick }: BeforeCardProps) => (
  <div className="bg-background-surface border border-[rgba(255,255,255,0.24)] rounded-[20px] shadow-[0px_18px_36px_-8px_rgba(56,31,140,0.13)] flex flex-col gap-14 px-10 py-9 w-120 h-150 shrink-0">
    <div className="flex flex-col gap-10">
      <div className="bg-white/20 rounded-2xl shadow-[4px_2px_24px_rgba(124,77,255,0.15)] p-1 flex">
        <div className="flex-1 bg-background-surface rounded-xl py-2.5 text-center cursor-pointer">
          <span className="text-sm font-semibold leading-5 tracking-tight text-text-brand">
            Before
          </span>
        </div>
        <div
          className="flex-1 py-2.5 text-center cursor-pointer"
          onClick={onAfterClick}
        >
          <span className="text-sm font-semibold leading-5 tracking-tight text-text-placeholder">
            After
          </span>
        </div>
      </div>
      <div className="text-3xl font-bold leading-10 tracking-tight text-text-primary whitespace-pre-line">
        {quote}
      </div>
    </div>
    <div className="flex flex-col gap-5 flex-1">
      {painPoints.map((text) => (
        <div
          key={text}
          className="flex-1 bg-background-muted flex items-center justify-center px-6 py-2.5 rounded-2xl"
        >
          <p className="text-xl font-semibold leading-7 tracking-tight text-text-secondary text-center">
            {text}
          </p>
        </div>
      ))}
    </div>
  </div>
);

interface AfterCardProps {
  headline: string;
  description: string;
  onBeforeClick: () => void;
}

const AfterCard = ({
  headline,
  description,
  onBeforeClick,
}: AfterCardProps) => (
  <div className="bg-background-selected border border-border-brand rounded-[20px] shadow-[0px_18px_36px_-8px_rgba(56,31,140,0.13)] flex flex-col justify-between px-10 py-9 w-120 h-150 shrink-0">
    <div className="flex flex-col gap-10">
      <div className="bg-white/20 rounded-2xl shadow-[4px_2px_24px_rgba(124,77,255,0.15)] p-1 flex">
        <div
          className="flex-1 py-2.5 text-center cursor-pointer"
          onClick={onBeforeClick}
        >
          <span className="text-sm font-semibold leading-5 tracking-tight text-text-placeholder">
            Before
          </span>
        </div>
        <div className="flex-1 bg-background-surface rounded-xl py-2.5 text-center cursor-pointer">
          <span className="text-sm font-semibold leading-5 tracking-tight text-text-brand">
            After
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        <p className="text-3xl-plus font-bold leading-10 tracking-tight text-text-brand whitespace-pre-line">
          {headline}
        </p>
        <p className="text-lg font-normal leading-7 tracking-tight text-text-secondary whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>

    <ButtonLongV2 href={CHROME_STORE_URL} target="_blank">
      무료로 설치하기
    </ButtonLongV2>
  </div>
);

export interface FeatureCardProps {
  id: string;
  label: string;
  headline: string;
  quote: string;
  painPoints: [string, string, string];
  afterHeadline: string;
  afterDescription: string;
  beforeMockup?: ReactNode;
  afterMockup?: ReactNode;
  className?: string;
}

const FeatureCard = ({
  id,
  label,
  headline,
  quote,
  painPoints,
  afterHeadline,
  afterDescription,
  beforeMockup,
  afterMockup,
  className = '',
}: FeatureCardProps) => {
  const [tab, setTab] = useState<'before' | 'after'>('before');

  return (
    <div id={id} className={`p-8 flex flex-col gap-20 ${className}`}>
      <div className="flex flex-col gap-4">
        <p className="text-xl font-semibold leading-7 tracking-tight text-text-brand-strong">
          {label}
        </p>
        <h2 className="text-4xl font-bold leading-11 tracking-tight text-text-primary">
          {headline}
        </h2>
      </div>

      <div className="flex gap-5 h-150">
        {/* 목업 영역 */}
        <div className="relative flex-1 min-w-0 overflow-hidden rounded-2xl shadow-[0px_8px_12px_rgba(124,77,255,0.16)] min-h-96 h-full">
          {tab === 'before' ? (
            <FeatureBeforeBg
              style={{ position: 'absolute', inset: 0, minHeight: 0 }}
              radius={16}
            />
          ) : (
            <FeatureAfterBg
              style={{ position: 'absolute', inset: 0, minHeight: 0 }}
              radius={16}
            />
          )}
          <div className="relative z-10 h-full">
            {tab === 'before' ? beforeMockup : afterMockup}
          </div>
        </div>
        {/* 카드 설명 */}
        <div className="shrink-0">
          {tab === 'before' ? (
            <BeforeCard
              quote={quote}
              painPoints={painPoints}
              onAfterClick={() => setTab('after')}
            />
          ) : (
            <AfterCard
              headline={afterHeadline}
              description={afterDescription}
              onBeforeClick={() => setTab('before')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
