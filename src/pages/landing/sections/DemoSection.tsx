import { useState, useEffect, useRef } from 'react';
import { ButtonLongV2 } from '@/components/ui';
import { ToneFitPanel } from '@/components/panel';
import type { GenerateParams, GenerateResult } from '@/components/panel';
import { postGeneration } from '@/api';
import { devLog, devError } from '@/utils/devLog';
import imgToolbar from '@/assets/toolbar.svg';
import iconClose from '@/assets/icon/icon-close.svg';
import iconMaximize from '@/assets/icon/icon-maximize.svg';
import iconMinimize from '@/assets/icon/icon-minimize.svg';
import iconExclamation from '@/assets/icon/icon-exclamation.svg';
import tTonefit from '@/assets/toolbar/t-tonefit.svg';
import tDelete from '@/assets/toolbar/t-delete.svg';
import tSchedule from '@/assets/toolbar/t-schedule.svg';
import tFont from '@/assets/toolbar/t-font.svg';
import tAi from '@/assets/toolbar/t-ai.svg';
import tFile from '@/assets/toolbar/t-file.svg';
import tLink from '@/assets/toolbar/t-link.svg';
import tEmoji from '@/assets/toolbar/t-emoji.svg';
import tDrive from '@/assets/toolbar/t-drive.svg';
import tImage from '@/assets/toolbar/t-image.svg';
import tLock from '@/assets/toolbar/t-lock.svg';
import tEdit from '@/assets/toolbar/t-edit.svg';
import tMore from '@/assets/toolbar/t-more.svg';

const mailIcons = [iconMinimize, iconMaximize, iconClose];
const actionBarIcons = [
  tSchedule,
  tFont,
  tAi,
  tFile,
  tLink,
  tEmoji,
  tDrive,
  tImage,
  tLock,
  tEdit,
  tMore,
];

// ─── 데모 사용 횟수 (localStorage) ───────────────────────────────
const DEMO_DAILY_LIMIT = 3;
const DEMO_USAGE_KEY = 'tonefit_demo_usage';
const DEMO_ATTEMPT_KEY = 'tonefit_demo_attempt';

interface DemoUsage {
  count: number;
  date: string;
}
interface DemoAttemptState {
  countBefore: number;
  status: 'pending' | 'failed';
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

const saveDemoRemaining = (count: number) => {
  localStorage.setItem(
    DEMO_USAGE_KEY,
    JSON.stringify({ count, date: getTodayString() })
  );
};

const getDemoRemaining = (): number => {
  try {
    const attemptRaw = localStorage.getItem(DEMO_ATTEMPT_KEY);
    if (attemptRaw) {
      const { countBefore, status } = JSON.parse(
        attemptRaw
      ) as DemoAttemptState;
      localStorage.removeItem(DEMO_ATTEMPT_KEY);
      if (status === 'failed') {
        saveDemoRemaining(countBefore);
        return countBefore;
      }
    }
    const raw = localStorage.getItem(DEMO_USAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        DEMO_USAGE_KEY,
        JSON.stringify({ count: DEMO_DAILY_LIMIT, date: getTodayString() })
      );
      return DEMO_DAILY_LIMIT;
    }
    const { count, date } = JSON.parse(raw) as DemoUsage;
    if (date !== getTodayString()) {
      localStorage.setItem(
        DEMO_USAGE_KEY,
        JSON.stringify({ count: DEMO_DAILY_LIMIT, date: getTodayString() })
      );
      return DEMO_DAILY_LIMIT;
    }
    return count;
  } catch {
    return DEMO_DAILY_LIMIT;
  }
};

// ─── ToneFit 툴바 아이콘 (펄스 글로우) ───────────────────────────
const ToneFitToolbarIcon = () => {
  const [isHighlight, setIsHighlight] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setIsHighlight((p) => !p), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative flex items-center justify-center size-7 shrink-0">
      <span
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: '#DFD1FF',
          opacity: isHighlight ? 1 : 0,
          transition: 'opacity 0.7s ease-in-out',
        }}
      />
      <img src={tTonefit} alt="ToneFit" className="relative z-10 size-7" />
    </span>
  );
};

// ─── Gmail 목업 ───────────────────────────────────────────────────
const SKELETON_LINES = [
  { widthPct: 100, label: 'Line 1' },
  { widthPct: 60, label: 'Line 2' },
  { widthPct: 67, label: 'Line 3' },
];

interface GmailMockupProps {
  subject?: string;
  content?: string;
  onSubjectChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  isLoading?: boolean;
  animatedDots?: boolean;
}

export const GmailMockup = ({
  subject = '',
  content = '',
  onSubjectChange,
  onContentChange,
  isLoading = false,
  animatedDots = false,
}: GmailMockupProps) => {
  const isEditable = !isLoading && (subject !== '' || content !== '');

  const [isGlowing, setIsGlowing] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setIsGlowing((p) => !p), 1300);
    return () => clearInterval(t);
  }, []);

  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!animatedDots) return;
    const t = setInterval(() => setDotCount((p) => Math.min(p + 1, 3)), 500);
    return () => clearInterval(t);
  }, [animatedDots]);

  const [skeletonStep, setSkeletonStep] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(
      () => setSkeletonStep((p) => (p + 1) % SKELETON_LINES.length),
      600
    );
    return () => {
      clearInterval(t);
      setSkeletonStep(0);
    };
  }, [isLoading]);

  return (
    <div className="bg-background-surface shadow-[0px_4px_8px_rgba(0,0,0,0.1)] flex flex-col flex-1 gap-2.5 overflow-hidden rounded-tl-xl rounded-tr-xl">
      {/* 창 헤더 */}
      <div className="flex items-center justify-between bg-background-brand-subtle px-5 py-5 shrink-0">
        <span className="text-lg font-semibold leading-6.5 tracking-tight text-text-brand-strong">
          새 메일
        </span>
        <div className="flex items-center justify-between gap-1">
          {mailIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              className="size-6 flex items-center justify-center"
            >
              <img src={icon} alt="" />
            </button>
          ))}
        </div>
      </div>

      {/* 발신/제목 필드 */}
      <div className="flex flex-col gap-4 px-5 py-2.5 shrink-0">
        <span className="w-full block pb-3.5 border-b border-border-default">
          <input
            name="mailTo"
            className="w-full text-lg font-semibold leading-6.5 tracking-tight text-text-secondary disabled:cursor-default placeholder:text-text-tertiary placeholder:font-semibold focus:outline-none focus:ring-0"
            placeholder="ToneFit@tonefit.kr"
            disabled
          />
        </span>
        <span className="w-full block pb-3.5 border-b border-border-default">
          <input
            name="mailSubject"
            className={`w-full text-lg font-semibold leading-6.5 tracking-tight text-text-secondary placeholder:text-text-tertiary placeholder:font-semibold focus:outline-none focus:ring-0 ${isEditable ? 'cursor-text' : 'cursor-default'}`}
            placeholder="제목"
            value={subject}
            readOnly={!isEditable}
            onChange={
              isEditable ? (e) => onSubjectChange?.(e.target.value) : undefined
            }
          />
        </span>
      </div>

      {/* 본문 */}
      <div className="flex-1 px-5 min-h-95">
        {isLoading ? (
          <div className="flex flex-col gap-2.5 pt-2">
            {SKELETON_LINES.map((line, i) => (
              <div
                key={line.label}
                className="h-7 rounded-sm bg-background-muted"
                style={{
                  width: `${line.widthPct}%`,
                  opacity: i === skeletonStep ? 1 : 0.08,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              />
            ))}
          </div>
        ) : animatedDots ? (
          <p className="text-lg font-normal leading-7 tracking-tight text-text-secondary pt-1">
            {'·'.repeat(dotCount)}
            <span
              style={{
                display: 'inline-block',
                width: 1.5,
                height: '1.1em',
                background: 'var(--color-text-secondary)',
                verticalAlign: 'text-bottom',
                marginLeft: 1,
                animation: 'gmailCursorBlink 0.9s steps(1, end) infinite',
              }}
            />
            <style>{`@keyframes gmailCursorBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
          </p>
        ) : (
          <textarea
            className={`w-full h-full text-lg font-normal leading-7 tracking-tight text-text-secondary placeholder:text-text-placeholder focus:outline-none focus:ring-0 resize-none ${isEditable ? 'cursor-text' : 'cursor-default'}`}
            name="mailContent"
            placeholder="어떤 이메일을 작성하시겠어요?"
            value={content}
            readOnly={!isEditable}
            onChange={
              isEditable ? (e) => onContentChange?.(e.target.value) : undefined
            }
          />
        )}
      </div>

      {/* 서식 툴바 */}
      <div className="shrink-0 flex items-center px-4.5 py-1.5">
        <div>
          <img src={imgToolbar} alt="" />
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="shrink-0 flex items-center gap-2.5 py-3.75 px-4">
        <a
          className="flex items-center rounded-full h-9 bg-background-brand hover:bg-background-brand-hover! overflow-hidden shrink-0 cursor-pointer"
          href="#none"
          style={{
            backgroundColor: isGlowing
              ? 'var(--color-background-brand-400)'
              : '',
            transition: 'background-color 0.7s ease-in-out',
          }}
        >
          <div className="flex items-center justify-center px-3 py-2">
            <span className="text-sm leading-5 font-semibold text-text-inverse tracking-tight">
              Gmail에서 바로 작업하기
            </span>
          </div>
          <div className="h-9 w-px bg-background-brand-subtle" />
          <span className="flex items-center justify-center h-9 w-8 text-text-inverse text-xs">
            ▾
          </span>
        </a>
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-2.5">
            <ToneFitToolbarIcon />
            {actionBarIcons.map((icon) => (
              <span
                key={icon}
                className="rounded-full hover:bg-background-subtle"
              >
                <img src={icon} alt="" />
              </span>
            ))}
          </div>
          <div>
            <span className="rounded-full hover:bg-background-subtle">
              <img src={tDelete} alt="" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 횟수 소진 팝업 ───────────────────────────────────────────────
const ExhaustedPopup = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(0,0,0,0.54)]">
    <div className="relative bg-background-surface rounded-2xl pt-6 pb-2.5 px-5 w-138 gap-8 flex flex-col items-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="팝업 닫기"
        className="absolute top-4 right-4 cursor-pointer size-8 rounded-full bg-background-surface border border-border-default flex items-center justify-center hover:bg-background-subtle transition-colors"
      >
        <img src={iconClose} alt="닫기" className="size-4" />
      </button>
      <div className="size-22.5 rounded-full bg-background-brand-subtle flex items-center justify-center shrink-0">
        <img src={iconExclamation} alt="" className="w-3.25 h-12.5" />
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-bold text-sm leading-5.5 tracking-tight text-text-brand">
          체험 횟수 소진
        </p>
        <h2 className="text-2xl-plus font-bold leading-8.5 tracking-tight text-text-primary">
          무료 체험을 모두 사용했어요
        </h2>
        <p className="text-base font-normal leading-6 tracking-tight text-text-secondary">
          설치 후 Gmail에서 바로 이어서 이메일을 만들 수 있어요.
        </p>
      </div>
      <div className="w-full p-2.5 mt-3.5">
        <ButtonLongV2
          onClick={() => {
            window.open(
              'https://chromewebstore.google.com/detail/tonefit/hccpncocbnbphkmandkcmnefolgfhcgi',
              '_blank',
              'noopener,noreferrer'
            );
            onClose();
          }}
        >
          ToneFit 시작하기
        </ButtonLongV2>
      </div>
    </div>
  </div>
);

// ─── DemoSection ─────────────────────────────────────────────────
const DemoSection = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [remainingCount, setRemainingCount] = useState(() =>
    getDemoRemaining()
  );
  const [showExhaustedPopup, setShowExhaustedPopup] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const countBeforeAttemptRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = showExhaustedPopup ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showExhaustedPopup]);

  const handleRequest = async (
    params: GenerateParams
  ): Promise<GenerateResult> => {
    setIsGenerating(true);
    try {
      if (!isRetryMode) {
        const newCount = remainingCount - 1;
        countBeforeAttemptRef.current = remainingCount;
        setRemainingCount(newCount);
        saveDemoRemaining(newCount);
        localStorage.setItem(
          DEMO_ATTEMPT_KEY,
          JSON.stringify({
            countBefore: remainingCount,
            status: 'pending',
          } satisfies DemoAttemptState)
        );
      } else {
        localStorage.setItem(
          DEMO_ATTEMPT_KEY,
          JSON.stringify({
            countBefore: countBeforeAttemptRef.current!,
            status: 'pending',
          } satisfies DemoAttemptState)
        );
      }

      const reqBody = {
        receiver_type: params.receiver,
        purpose: params.purpose,
        brief_content: params.emailText,
      };
      devLog('[Generation] ▶ 요청', reqBody);

      const response = await postGeneration(reqBody);
      devLog('[Generation] ◀ 응답', response);

      localStorage.removeItem(DEMO_ATTEMPT_KEY);
      setIsRetryMode(false);
      countBeforeAttemptRef.current = null;

      return {
        type: 'email' as const,
        subject: response.generated_subject,
        content: response.generated_email.replace(/\\n/g, '\n'),
      };
    } catch (err) {
      localStorage.setItem(
        DEMO_ATTEMPT_KEY,
        JSON.stringify({
          countBefore: countBeforeAttemptRef.current!,
          status: 'failed',
        } satisfies DemoAttemptState)
      );
      setIsRetryMode(true);
      devError('[Generation] 오류', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {showExhaustedPopup && (
        <ExhaustedPopup onClose={() => setShowExhaustedPopup(false)} />
      )}

      <section className="bg-background-surface rounded-4xl py-25 ">
        <div className="flex flex-col gap-25 items-center max-w-332.5 mx-auto">
          {/* 헤딩 */}
          <div className="flex flex-col gap-7 items-center w-full">
            <h2 className="font-bold text-4xl-plus leading-12 tracking-tight text-text-primary text-center">
              상대에게 딱 맞는 이메일, 직접 만들어 보세요.
            </h2>
            <p className="font-normal text-lg leading-7 tracking-tight text-text-primary text-center">
              설치 없이, 지금 바로 체험할 수 있어요.
            </p>
          </div>

          {/* 데모 영역 */}
          <div id="mail-demo" className="flex gap-5 w-full px-10">
            <GmailMockup
              subject={subject}
              content={content}
              onSubjectChange={setSubject}
              onContentChange={setContent}
              isLoading={isGenerating}
            />
            <div className="bg-background-surface rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.08)] flex flex-col w-full max-w-109 shrink-0">
              <ToneFitPanel
                remainingCount={remainingCount}
                onRequest={handleRequest}
                onSuccess={(s, c) => {
                  setSubject(s);
                  setContent(c);
                }}
                onReset={() => {
                  setSubject('');
                  setContent('');
                  setIsRetryMode(false);
                  countBeforeAttemptRef.current = null;
                  localStorage.removeItem(DEMO_ATTEMPT_KEY);
                }}
                onExhausted={() => setShowExhaustedPopup(true)}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DemoSection;
