import { useState, useEffect, useRef, useCallback } from 'react';
import { ChipV2, ButtonLongV2 } from '@/components/ui';
import type { ReceiverType, PurposeType } from '@/types';
import imgHeroEmail from '@/assets/visual.png';
import imgLogo from '@/assets/logo.svg';
import imgPanelIcon from '@/assets/mail-logo.svg';
import imgToolbar from '@/assets/toolbar.svg';
import iconClose from '@/assets/icon/icon-close.svg';
import iconMaximize from '@/assets/icon/icon-maximize.svg';
import iconMinimize from '@/assets/icon/icon-minimize.svg';

import tAi from '@/assets/toolbar/t-ai.svg';
import tDelete from '@/assets/toolbar/t-delete.svg';
import tDrive from '@/assets/toolbar/t-drive.svg';
import tEdit from '@/assets/toolbar/t-edit.svg';
import tEmoji from '@/assets/toolbar/t-emoji.svg';
import tFile from '@/assets/toolbar/t-file.svg';
import tFont from '@/assets/toolbar/t-font.svg';
import tImage from '@/assets/toolbar/t-image.svg';
import tLink from '@/assets/toolbar/t-link.svg';
import tLock from '@/assets/toolbar/t-lock.svg';
import tMore from '@/assets/toolbar/t-more.svg';
import tSchedule from '@/assets/toolbar/t-schedule.svg';
import tTonefit from '@/assets/toolbar/t-tonefit.svg';
import iconAiPencil from '@/assets/aiPencil.svg';
import iconExclamation from '@/assets/icon/icon-exclamation.svg';
const mailIcons = [iconMinimize, iconMaximize, iconClose];
const actionBarIcons = [
  tTonefit,
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

// ─── 도메인 데이터 ────────────────────────────────────────────────
const RECEIVER_OPTIONS: { value: ReceiverType; label: string }[] = [
  { value: 'DIRECT_SUPERVISOR', label: '상사' },
  { value: 'OTHER_DEPT_COLLEAGUE', label: '동료' },
  { value: 'CLIENT', label: '고객사' },
  { value: 'EXTERNAL_PARTNER', label: '협력사' },
];

const PURPOSE_OPTIONS: { value: PurposeType; label: string }[] = [
  { value: 'REPORT', label: '보고' },
  { value: 'REQUEST', label: '요청' },
  { value: 'NOTICE', label: '안내' },
  { value: 'THANKS', label: '감사' },
  { value: 'APOLOGY', label: '사과' },
  { value: 'DECLINE', label: '거절' },
];

const EMAIL_MAX = 200;
const DEMO_DAILY_LIMIT = 3;

/** 개발용: 목업 로딩 시간 (ms). 실제 API 연동 시 제거 */
const DEV_MOCK_DELAY_MS = 3000;

/**
 * 자음(ㄱ-ㅎ) · 모음(ㅏ-ㅣ) · 이모지 · HTML 태그 · 공백만으로 이루어진 경우 true
 * 완성된 한글 음절(가-힣), 영문, 숫자, 특수문자가 하나라도 있으면 false
 */
const isOnlyJamoOrSpaces = (text: string): boolean => {
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  const stripped = withoutHtml.replace(/\s/g, '');
  if (!stripped) return true;
  const withoutEmoji = stripped.replace(/\p{Extended_Pictographic}/gu, '');
  if (!withoutEmoji) return true;
  return [...withoutEmoji].every((char) => {
    const code = char.charCodeAt(0);
    return code >= 0x3131 && code <= 0x318e;
  });
};
const DEMO_USAGE_KEY = 'tonefit_demo_usage';

// ─── 데모 사용 횟수 (localStorage) ───────────────────────────────
interface DemoUsage {
  count: number;
  date: string; // 'YYYY-MM-DD'
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

/** 오늘 날짜 기준 남은 횟수를 읽어옴. 없거나 날짜가 바뀌면 DEMO_DAILY_LIMIT로 초기화 */
const getDemoRemaining = (): number => {
  try {
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

/** 남은 횟수를 저장 */
const saveDemoRemaining = (count: number) => {
  localStorage.setItem(
    DEMO_USAGE_KEY,
    JSON.stringify({ count, date: getTodayString() })
  );
};

// 목업 이메일 데이터 (API 연동 전 임시)
const MOCK_EMAIL = {
  subject: '업무 협조 요청드립니다',
  content:
    '안녕하세요.\n\n다름이 아니라 금번 프로젝트 관련하여 협조를 요청드리고자 연락드립니다.\n\n세부 사항은 별도 자료를 첨부하오니 검토 후 회신 부탁드리겠습니다.\n\n바쁘신 중에도 검토해 주셔서 감사드립니다.\n\n좋은 하루 되세요.',
};

// ─── 서브 컴포넌트 ────────────────────────────────────────────────

/** 네비게이션 헤더 */
const DemoHeader = () => {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      if (window.scrollY > 50) {
        headerRef.current.classList.add('is-sticky');
      } else {
        headerRef.current.classList.remove('is-sticky');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      id="header"
      className="header w-full border-b border-border-default px-7 py-5 fixed z-9999"
    >
      <div className="header__bg bg-background-page absolute left-0 top-0 w-full h-full z-[-1] opacity-20"></div>
      <div className="header__inner flex items-center justify-between">
        {/* 로고 + 네비 */}
        <div className="header__left flex items-center gap-14">
          <a href="/demo" className="header__logo flex items-center gap-5">
            <img
              src={imgLogo}
              alt="ToneFit 아이콘"
              className="w-10 object-contain"
            />
            <span className="text-2xl-plus font-bold leading-9 tracking-[-0.56px] text-text-primary">
              ToneFit
            </span>
          </a>
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

        {/* 우측 버튼 그룹 */}
        <div className="header__right flex items-center gap-2.5 drop-shadow-sm">
          {/* CTA */}
          <a
            href="https://chromewebstore.google.com/category/extensions"
            target="_blank"
            type="button"
            className="flex items-center justify-center py-2.5 px-4 bg-background-brand rounded-lg text-sm font-semibold leading-5 tracking-tight text-text-inverse hover:bg-background-brand-hover transition-colors"
          >
            ToneFit 시작하기
          </a>
        </div>
      </div>
    </header>
  );
};

/** 히어로 섹션 */
const HeroSection = () => (
  <section id="heroSection" className="hero relative w-full overflow-hidden">
    {/* 좌측: 헤드카피 + CTA */}
    <div className="hero__text absolute w-11/12 mx-auto left-0 right-0 top-1/4 flex flex-col gap-16 z-10">
      <div className="flex flex-col gap-7">
        <h1 className="text-4xl-plus font-bold leading-[48px] tracking-[-0.8px] text-text-primary whitespace-pre-line">
          {'쓰는 법을 몰라도 괜찮아요.\n처음부터 끝까지, 당신의 말로.'}
        </h1>
        <p className="text-lg font-normal leading-7 tracking-tight text-text-primary">
          수신자와 목적, 딱 두 가지 선택만으로 당신의 메일이 달라집니다.
        </p>
      </div>
      <div className="w-[264px] drop-shadow-sm">
        <ButtonLongV2>내 첫 메일 써보기</ButtonLongV2>
      </div>
    </div>

    {/* 우측: 3D 이메일 일러스트 */}
    <div className="here__img flex items-center justify-center ">
      <div className="relative text-2xl font-bold leading-8 tracking-[-0.48px] text-text-inverse">
        {/* 왼쪽 플로팅 카드 */}
        <div className="absolute left-1/7 top-[55%] z-10">
          <div className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white">
            <span className="">상황에 맞는 톤 추천</span>
          </div>
        </div>
        {/* 3D 이메일 이미지 */}
        <span>
          <img
            src={imgHeroEmail}
            alt="ToneFit 이메일 생성 일러스트"
            className="relative z-0"
          />
        </span>
        {/* 오른쪽 플로팅 카드 (살짝 회전) */}
        <div
          className="absolute right-[23%] top-[28%] z-10"
          style={{ transform: 'rotate(8.74deg)' }}
        >
          <div className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white">
            <span>초안 생성까지 빠르게</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/** 메일 섹션 컴포넌트 */
interface GmailMockupProps {
  subject?: string;
  content?: string;
  onSubjectChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
}

/** Gmail 작성 창 목업 */
const GmailMockup = ({
  subject = '',
  content = '',
  onSubjectChange,
  onContentChange,
}: GmailMockupProps) => {
  // 생성 완료 후 편집 가능 상태
  const isEditable = subject !== '' || content !== '';

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
        {/* 수신자 (항상 고정) */}
        <span className="w-full block pb-3.5 border-b border-border-default">
          <input
            name="mailTo"
            className="w-full text-lg font-semibold leading-6.5 tracking-tight text-text-secondary disabled:cursor-default placeholder:text-text-tertiary placeholder:font-semibold focus:outline-none focus:ring-0"
            placeholder="ToneFit@tonefit.kr"
            disabled
          />
        </span>
        {/* 제목 (생성 후 편집 가능) */}
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

      {/* 본문 필드 (생성 후 편집 가능) */}
      <div className="flex-1 px-5 min-h-95">
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
      </div>

      {/* 서식 툴바 */}
      <div className="shrink-0 flex items-center px-4.5 py-1.5">
        <div className="hidden bg-background-brand-subtle items-center gap-1.5 h-[46px] px-3.5 rounded-[23px] w-[94%] overflow-hidden">
          {/* 실행취소/다시실행 */}
          <div className="flex gap-0.5">
            {['↩', '↪'].map((c) => (
              <button
                key={c}
                type="button"
                className="size-[22px] flex items-center justify-center rounded-[11px] text-text-disabled text-sm"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-icon-disabled" />
          {/* 폰트 패밀리 */}
          <span className="text-sm font-semibold text-text-disabled tracking-tight px-1">
            Sans Serif ▾
          </span>
          <div className="h-6 w-px bg-icon-disabled" />
          {/* 크기 */}
          <span className="text-sm font-semibold text-text-disabled tracking-tight px-1">
            T▾
          </span>
          {/* 서식 버튼들 */}
          {['B', 'I', 'U', 'A'].map((f) => (
            <button
              key={f}
              type="button"
              className="size-[22px] flex items-center justify-center rounded-[11px] text-text-disabled text-xs font-bold"
            >
              {f}
            </button>
          ))}
          <div className="h-6 w-px bg-icon-disabled" />
          {['≡', '≡⒈', '≡•'].map((f) => (
            <button
              key={f}
              type="button"
              className="size-[22px] flex items-center justify-center rounded-[11px] text-text-disabled text-xs"
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <img src={imgToolbar} alt="" />
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="shrink-0 flex items-center gap-2.5 py-3.75 px-4">
        <div className="bg-background-brand flex items-center rounded-full h-9 overflow-hidden shrink-0">
          <div className="flex items-center justify-center px-3 py-2 ">
            <span className="text-sm leading-5 font-semibold text-text-inverse tracking-tight">
              Gmail에서 바로 작업하기
            </span>
          </div>
          <div className="h-9 w-px bg-background-brand-subtle"></div>
          <button
            type="button"
            className="flex items-center justify-center h-9 w-8 text-text-inverse text-xs"
          >
            ▾
          </button>
        </div>
        {/* 아이콘 버튼들 플레이스홀더 */}
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-2.5">
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

/** 로딩 단계별 h6 메시지 */
const getLoadingMessage = (
  elapsed: number,
  receiverLabel: string,
  purposeLabel: string
): string => {
  if (elapsed < 5) return `${receiverLabel}에게 맞는 표현을 찾고 있어요.`;
  if (elapsed < 10) return `${purposeLabel}에 맞는 초안을 준비하고 있어요.`;
  return '초안을 완성하고 있어요. 잠깐만요.';
};

interface PanelLoadingBodyProps {
  receiverLabel: string;
  purposeLabel: string;
}

/** 이메일 생성 중 로딩 본문 */
const PanelLoadingBody = ({
  receiverLabel,
  purposeLabel,
}: PanelLoadingBodyProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-5">
      {/* 스피너 */}
      <div className="relative size-40 flex items-center justify-center shrink-0">
        {/* 배경 원 */}
        <svg
          className="absolute inset-0"
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
        >
          <circle
            cx="80"
            cy="80"
            r="72"
            stroke="var(--color-border-default)"
            strokeWidth="8"
          />
        </svg>
        {/* 회전하는 호 */}
        <svg
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '1.4s' }}
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
        >
          <circle
            cx="80"
            cy="80"
            r="72"
            stroke="var(--color-icon-brand)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="340 113"
            strokeDashoffset="113"
          />
        </svg>
        {/* 가운데: AI 펜슬 + 점 3개 */}
        <div className="flex flex-col items-center gap-2 z-10">
          <img src={iconAiPencil} alt="" className="size-12" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 rounded-full bg-background-brand animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col gap-2 items-center text-center w-80">
        <h6 className="text-xl font-medium leading-7 tracking-tight text-text-primary">
          {getLoadingMessage(elapsed, receiverLabel, purposeLabel)}
        </h6>
        <p className="text-sm font-normal leading-5.5 tracking-tight text-text-tertiary">
          입력하신 내용을 바탕으로
          <br />
          자연스러운 톤의 이메일을 만드는 중입니다.
        </p>
      </div>
    </div>
  );
};

/** 생성 성공 화면 */
const PanelSuccessBody = ({ onReset }: { onReset: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-between px-4 py-5">
    {/* 콘텐츠 */}
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="flex flex-col gap-5 items-center">
        {/* 성공 아이콘: 60px 보라색 원 + 흰 체크 */}
        <div className="size-15 rounded-full bg-action-primary-default flex items-center justify-center shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M5.25 14L11.375 20.125L22.75 7.875"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* 텍스트 */}
        <div className="flex flex-col gap-3.5 items-center text-center">
          <p className="text-xl-plus font-semibold leading-7.5 tracking-tight text-text-primary">
            쓰는 법을 몰라도 된다는 게,
            <br />
            이제 느껴지셨나요?
          </p>
          <p className="text-base font-normal leading-6 tracking-tight text-text-secondary text-center">
            간단히 설치하고, 매번 이렇게 완성해보세요.
          </p>
        </div>
      </div>
    </div>
    {/* CTA */}
    <div className="w-full shrink-0">
      <ButtonLongV2 onClick={onReset}>새 이메일 작성하기</ButtonLongV2>
    </div>
  </div>
);

/** 생성 실패 화면 */
const PanelErrorBody = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-between px-4 py-5">
    {/* 콘텐츠 */}
    <div className="flex-1 flex flex-col items-center justify-center gap-10 py-12">
      {/* 에러 아이콘: 90px 보라색-서브틀 원 + 느낌표 */}
      <div className="size-22.5 rounded-full bg-background-brand-subtle flex items-center justify-center shrink-0">
        <img src={iconExclamation} alt="" className="w-3.25 h-12.5" />
      </div>
      {/* 텍스트 */}
      <div className="flex flex-col gap-5 items-center text-center w-full">
        <p className="text-xl-plus font-semibold leading-7.5 tracking-tight text-text-primary">
          교정을 완료하지 못했어요
        </p>
        <p className="text-base font-normal leading-6 tracking-tight text-text-primary text-center">
          잠시 후 다시 시도해 주세요.
          <br />
          입력하신 내용은 그대로 유지돼요.
        </p>
      </div>
    </div>
    {/* CTA */}
    <div className="w-full shrink-0">
      <ButtonLongV2 onClick={onRetry}>다시하기</ButtonLongV2>
    </div>
  </div>
);

/** 입력 폼 패널 본문 */
interface PanelBodyProps {
  receiver: ReceiverType | null;
  setReceiver: (v: ReceiverType | null) => void;
  purpose: PurposeType | null;
  setPurpose: (v: PurposeType | null) => void;
  emailText: string;
  setEmailText: (v: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
}

const PanelBody = ({
  receiver,
  setReceiver,
  purpose,
  setPurpose,
  emailText,
  setEmailText,
  canGenerate,
  onGenerate,
}: PanelBodyProps) => {
  const labelClass =
    'text-base font-semibold leading-6 tracking-tight text-text-primary';

  return (
    <div className="flex-1 flex flex-col px-4 py-5 gap-5">
      <div className="flex flex-col gap-8">
        {/* 수신자 유형 */}
        <div className="flex flex-col gap-4">
          <p className={labelClass}>수신자 유형 선택</p>
          <div className="grid grid-cols-4 gap-1">
            {RECEIVER_OPTIONS.map(({ value, label }) => (
              <ChipV2
                key={value}
                selected={receiver === value}
                onClick={() => setReceiver(receiver === value ? null : value)}
              >
                {label}
              </ChipV2>
            ))}
          </div>
        </div>

        {/* 목적 */}
        <div className="flex flex-col gap-4">
          <p className={labelClass}>목적 선택</p>
          <div className="grid grid-cols-4 gap-2">
            {PURPOSE_OPTIONS.map(({ value, label }) => (
              <ChipV2
                key={value}
                selected={purpose === value}
                onClick={() => setPurpose(purpose === value ? null : value)}
              >
                {label}
              </ChipV2>
            ))}
          </div>
        </div>

        {/* 이메일 내용 입력 */}
        <div className="flex flex-col gap-4 flex-1">
          <p className={labelClass}>이메일 내용 입력</p>
          <div className="flex flex-col gap-1 flex-1">
            <div className="relative bg-background-surface border border-border-default rounded-xl p-2.5 flex-1 min-h-[218px]">
              <textarea
                className="w-full h-full resize-none text-sm font-normal leading-5.5 tracking-tight text-text-secondary placeholder:text-text-placeholder bg-transparent outline-none"
                placeholder="어떤 이메일을 작성하고 싶으신가요?"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={5}
              />
              {/* 스크롤바 장식 */}
              <div className="absolute right-1 top-2.5 w-1 h-8 bg-background-muted rounded-full" />
            </div>
            <div className="flex justify-end">
              <span
                className={`text-xs font-normal leading-4.5 tracking-tight ${
                  emailText.length > EMAIL_MAX
                    ? 'text-text-danger'
                    : 'text-text-placeholder'
                }`}
              >
                {emailText.length} / {EMAIL_MAX}자
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="shrink-0">
        <ButtonLongV2 disabled={!canGenerate} onClick={onGenerate}>
          이메일 생성하기
        </ButtonLongV2>
      </div>
    </div>
  );
};

type PanelView = 'input' | 'loading' | 'success' | 'error';

/** ToneFit 확장 패널 (인터랙티브) */
interface ToneFitPanelProps {
  onGenerate: (subject: string, content: string) => void;
  onReset: () => void;
  /** [DEV ONLY] 패널 뷰를 강제로 지정. undefined면 내부 상태 사용 */
  devForceView?: PanelView;
}

const ToneFitPanel = ({
  onGenerate,
  onReset,
  devForceView,
}: ToneFitPanelProps) => {
  const [receiver, setReceiver] = useState<ReceiverType | null>(null);
  const [purpose, setPurpose] = useState<PurposeType | null>(null);
  const [emailText, setEmailText] = useState('');
  const [view, setView] = useState<PanelView>('input');
  const [remainingCount, setRemainingCount] = useState<number>(() =>
    getDemoRemaining()
  );

  const canGenerate =
    !!receiver &&
    !!purpose &&
    emailText.trim().length >= 10 &&
    emailText.length <= EMAIL_MAX &&
    !isOnlyJamoOrSpaces(emailText) &&
    remainingCount > 0;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    const newCount = remainingCount - 1;
    setRemainingCount(newCount);
    saveDemoRemaining(newCount);
    setView('loading');
    // TODO: API 연동 예정, 현재는 목업 데이터로 대체
    setTimeout(() => {
      // API 실패 시: setView('error');
      setView('success');
      onGenerate(MOCK_EMAIL.subject, MOCK_EMAIL.content);
    }, DEV_MOCK_DELAY_MS);
  }, [canGenerate, remainingCount, onGenerate]);

  /** 성공 화면 → 입력 초기화 */
  const handleReset = () => {
    setView('input');
    setReceiver(null);
    setPurpose(null);
    setEmailText('');
    onReset();
  };

  /** 실패 화면 → 입력 유지하고 돌아가기 */
  const handleRetry = () => {
    setView('input');
  };

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (isMac ? e.metaKey : e.altKey) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  return (
    <div className="bg-background-surface rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.08)] flex flex-col w-[437px] shrink-0">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src={imgPanelIcon}
            alt="ToneFit"
            className="size-8 object-contain"
          />
          <span className="text-lg font-semibold leading-[26px] tracking-tight text-text-primary">
            이메일 생성
          </span>
        </div>
        <button
          type="button"
          className="w-27 h-7 bg-background-selected border border-border-brand rounded-full text-xs font-semibold leading-4 tracking-tight text-text-brand"
        >
          {remainingCount}회 무료체험 가능
        </button>
      </div>
      {/* 본문 */}
      {(() => {
        const activeView = devForceView ?? view;
        if (activeView === 'loading')
          return (
            <PanelLoadingBody
              receiverLabel={
                RECEIVER_OPTIONS.find((o) => o.value === receiver)?.label ??
                '상사'
              }
              purposeLabel={
                PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label ??
                '보고'
              }
            />
          );
        if (activeView === 'success')
          return <PanelSuccessBody onReset={handleReset} />;
        if (activeView === 'error')
          return <PanelErrorBody onRetry={handleRetry} />;
        return null;
      })()}
      {(devForceView ?? view) === 'input' && (
        <PanelBody
          receiver={receiver}
          setReceiver={setReceiver}
          purpose={purpose}
          setPurpose={setPurpose}
          emailText={emailText}
          setEmailText={setEmailText}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
};

/** [DEV ONLY] 패널 뷰 강제 전환 플로팅 툴바 */
const DEV_VIEW_OPTIONS: { view: PanelView; label: string }[] = [
  { view: 'input', label: '입력 화면' },
  { view: 'loading', label: '로딩 화면' },
  { view: 'success', label: '성공 화면' },
  { view: 'error', label: '실패 화면' },
];

const DevViewToolbar = ({
  current,
  onChange,
}: {
  current: PanelView | undefined;
  onChange: (v: PanelView | undefined) => void;
}) => (
  <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-1.5 bg-background-surface border border-border-default rounded-xl shadow-lg p-3 w-36">
    <div className="flex items-center justify-between mb-0.5">
      <p className="text-2xs font-bold tracking-wide text-text-tertiary uppercase">
        🛠 DEV 뷰
      </p>
      {current !== undefined && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-2xs font-semibold text-text-danger hover:opacity-70 transition-opacity"
        >
          ✕ 해제
        </button>
      )}
    </div>
    {current !== undefined && (
      <p className="text-2xs text-text-warning leading-3.5 mb-0.5">
        실제 흐름 일시정지
      </p>
    )}
    {DEV_VIEW_OPTIONS.map(({ view, label }) => (
      <button
        key={view}
        type="button"
        onClick={() => onChange(current === view ? undefined : view)}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors ${
          current === view
            ? 'bg-background-brand text-text-inverse'
            : 'bg-background-subtle text-text-primary hover:bg-background-muted'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

/** 메일 섹션 DemoIntroText + GmailMockup + ToneFitPanel */
const MailSection = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [devForceView, setDevForceView] = useState<PanelView | undefined>(
    undefined
  );

  const handleGenerate = (newSubject: string, newContent: string) => {
    setSubject(newSubject);
    setContent(newContent);
  };

  const handleReset = () => {
    setSubject('');
    setContent('');
  };

  return (
    <>
      <section id="mailSection" className="mail pt-14 pb-37">
        <div className="mail__inner max-w-[1320px] mx-auto">
          <div className="mail__deco flex items-center justify-center">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="235"
                viewBox="0 0 6 235"
                fill="none"
              >
                <path
                  d="M3.1665 0.5L3.1665 2.18557e-08L2.1665 -2.18557e-08L2.1665 0.5L2.6665 0.5L3.1665 0.5ZM2.66649 228.833C1.19373 228.833 -0.000172873 230.027 -0.000172937 231.5C-0.000173002 232.973 1.19373 234.167 2.66649 234.167C4.13925 234.167 5.33316 232.973 5.33316 231.5C5.33316 230.027 4.13925 228.833 2.66649 228.833ZM2.1665 2.49138L2.1665 2.99138L3.1665 2.99138L3.1665 2.49138L2.6665 2.49138L2.1665 2.49138ZM3.1665 6.47414L3.1665 5.97414L2.1665 5.97414L2.1665 6.47414L2.6665 6.47414L3.1665 6.47414ZM2.1665 10.4569L2.1665 10.9569L3.1665 10.9569L3.1665 10.4569L2.6665 10.4569L2.1665 10.4569ZM3.1665 14.4397L3.1665 13.9397L2.1665 13.9397L2.1665 14.4397L2.6665 14.4397L3.1665 14.4397ZM2.1665 18.4224L2.1665 18.9224L3.1665 18.9224L3.1665 18.4224L2.6665 18.4224L2.1665 18.4224ZM3.1665 22.4052L3.1665 21.9052L2.1665 21.9052L2.1665 22.4052L2.6665 22.4052L3.1665 22.4052ZM2.1665 26.3879L2.1665 26.8879L3.1665 26.8879L3.1665 26.3879L2.6665 26.3879L2.1665 26.3879ZM3.1665 30.3707L3.1665 29.8707L2.1665 29.8707L2.1665 30.3707L2.6665 30.3707L3.1665 30.3707ZM2.1665 34.3534L2.1665 34.8534L3.1665 34.8534L3.1665 34.3534L2.6665 34.3534L2.1665 34.3534ZM3.1665 38.3362L3.1665 37.8362L2.1665 37.8362L2.1665 38.3362L2.6665 38.3362L3.1665 38.3362ZM2.1665 42.319L2.1665 42.819L3.1665 42.819L3.1665 42.319L2.6665 42.319L2.1665 42.319ZM3.1665 46.3017L3.1665 45.8017L2.1665 45.8017L2.1665 46.3017L2.6665 46.3017L3.1665 46.3017ZM2.1665 50.2845L2.1665 50.7845L3.1665 50.7845L3.1665 50.2845L2.6665 50.2845L2.1665 50.2845ZM3.1665 54.2672L3.1665 53.7672L2.1665 53.7672L2.1665 54.2672L2.6665 54.2672L3.1665 54.2672ZM2.1665 58.25L2.1665 58.75L3.1665 58.75L3.1665 58.25L2.6665 58.25L2.1665 58.25ZM3.1665 62.2327L3.1665 61.7327L2.1665 61.7327L2.1665 62.2327L2.6665 62.2327L3.1665 62.2327ZM2.1665 66.2155L2.1665 66.7155L3.1665 66.7155L3.1665 66.2155L2.6665 66.2155L2.1665 66.2155ZM3.1665 70.1983L3.1665 69.6983L2.1665 69.6983L2.1665 70.1983L2.6665 70.1983L3.1665 70.1983ZM2.1665 74.181L2.1665 74.681L3.1665 74.681L3.1665 74.181L2.6665 74.181L2.1665 74.181ZM3.1665 78.1638L3.1665 77.6638L2.1665 77.6638L2.1665 78.1638L2.6665 78.1638L3.1665 78.1638ZM2.1665 82.1465L2.1665 82.6465L3.1665 82.6465L3.1665 82.1465L2.6665 82.1465L2.1665 82.1465ZM3.1665 86.1293L3.1665 85.6293L2.1665 85.6293L2.1665 86.1293L2.6665 86.1293L3.1665 86.1293ZM2.1665 90.1121L2.1665 90.6121L3.1665 90.6121L3.1665 90.1121L2.6665 90.1121L2.1665 90.1121ZM3.1665 94.0948L3.1665 93.5948L2.1665 93.5948L2.1665 94.0948L2.6665 94.0948L3.1665 94.0948ZM2.1665 98.0776L2.1665 98.5776L3.1665 98.5776L3.1665 98.0776L2.6665 98.0776L2.1665 98.0776ZM3.1665 102.06L3.1665 101.56L2.1665 101.56L2.1665 102.06L2.6665 102.06L3.1665 102.06ZM2.1665 106.043L2.1665 106.543L3.1665 106.543L3.1665 106.043L2.6665 106.043L2.1665 106.043ZM3.1665 110.026L3.1665 109.526L2.1665 109.526L2.1665 110.026L2.6665 110.026L3.1665 110.026ZM2.1665 114.009L2.1665 114.509L3.1665 114.509L3.1665 114.009L2.6665 114.009L2.1665 114.009ZM3.1665 117.991L3.1665 117.491L2.1665 117.491L2.1665 117.991L2.6665 117.991L3.1665 117.991ZM2.1665 121.974L2.1665 122.474L3.1665 122.474L3.1665 121.974L2.6665 121.974L2.1665 121.974ZM3.1665 125.957L3.1665 125.457L2.1665 125.457L2.1665 125.957L2.6665 125.957L3.1665 125.957ZM2.1665 129.94L2.1665 130.44L3.1665 130.44L3.1665 129.94L2.6665 129.94L2.1665 129.94ZM3.1665 133.922L3.1665 133.422L2.1665 133.422L2.1665 133.922L2.6665 133.922L3.1665 133.922ZM2.1665 137.905L2.1665 138.405L3.1665 138.405L3.1665 137.905L2.6665 137.905L2.1665 137.905ZM3.1665 141.888L3.1665 141.388L2.1665 141.388L2.1665 141.888L2.6665 141.888L3.1665 141.888ZM2.1665 145.871L2.1665 146.371L3.1665 146.371L3.1665 145.871L2.6665 145.871L2.1665 145.871ZM3.1665 149.853L3.1665 149.353L2.1665 149.353L2.1665 149.853L2.6665 149.853L3.1665 149.853ZM2.1665 153.836L2.1665 154.336L3.1665 154.336L3.1665 153.836L2.6665 153.836L2.1665 153.836ZM3.1665 157.819L3.1665 157.319L2.1665 157.319L2.1665 157.819L2.6665 157.819L3.1665 157.819ZM2.1665 161.802L2.1665 162.302L3.1665 162.302L3.1665 161.802L2.6665 161.802L2.1665 161.802ZM3.1665 165.784L3.1665 165.284L2.1665 165.284L2.1665 165.784L2.6665 165.784L3.1665 165.784ZM2.1665 169.767L2.1665 170.267L3.1665 170.267L3.1665 169.767L2.6665 169.767L2.1665 169.767ZM3.1665 173.75L3.1665 173.25L2.1665 173.25L2.1665 173.75L2.6665 173.75L3.1665 173.75ZM2.1665 177.733L2.1665 178.233L3.1665 178.233L3.1665 177.733L2.6665 177.733L2.1665 177.733ZM3.1665 181.715L3.1665 181.215L2.1665 181.215L2.1665 181.715L2.6665 181.715L3.1665 181.715ZM2.1665 185.698L2.1665 186.198L3.1665 186.198L3.1665 185.698L2.6665 185.698L2.1665 185.698ZM3.1665 189.681L3.1665 189.181L2.1665 189.181L2.1665 189.681L2.6665 189.681L3.1665 189.681ZM2.1665 193.664L2.1665 194.164L3.1665 194.164L3.1665 193.664L2.6665 193.664L2.1665 193.664ZM3.1665 197.646L3.1665 197.146L2.1665 197.146L2.1665 197.646L2.6665 197.646L3.1665 197.646ZM2.1665 201.629L2.1665 202.129L3.1665 202.129L3.1665 201.629L2.6665 201.629L2.1665 201.629ZM3.16649 205.612L3.16649 205.112L2.16649 205.112L2.16649 205.612L2.66649 205.612L3.16649 205.612ZM2.16649 209.595L2.16649 210.095L3.16649 210.095L3.16649 209.595L2.66649 209.595L2.16649 209.595ZM3.16649 213.578L3.16649 213.078L2.16649 213.078L2.16649 213.578L2.66649 213.578L3.16649 213.578ZM2.16649 217.56L2.16649 218.06L3.16649 218.06L3.16649 217.56L2.66649 217.56L2.16649 217.56ZM3.16649 221.543L3.16649 221.043L2.16649 221.043L2.16649 221.543L2.66649 221.543L3.16649 221.543ZM2.16649 225.526L2.16649 226.026L3.16649 226.026L3.16649 225.526L2.66649 225.526L2.16649 225.526ZM3.16649 229.509L3.16649 229.009L2.16649 229.009L2.16649 229.509L2.66649 229.509L3.16649 229.509ZM2.6665 0.5L2.1665 0.5L2.1665 2.49138L2.6665 2.49138L3.1665 2.49138L3.1665 0.5L2.6665 0.5ZM2.6665 6.47414L2.1665 6.47414L2.1665 10.4569L2.6665 10.4569L3.1665 10.4569L3.1665 6.47414L2.6665 6.47414ZM2.6665 14.4397L2.1665 14.4397L2.1665 18.4224L2.6665 18.4224L3.1665 18.4224L3.1665 14.4397L2.6665 14.4397ZM2.6665 22.4052L2.1665 22.4052L2.1665 26.3879L2.6665 26.3879L3.1665 26.3879L3.1665 22.4052L2.6665 22.4052ZM2.6665 30.3707L2.1665 30.3707L2.1665 34.3534L2.6665 34.3534L3.1665 34.3534L3.1665 30.3707L2.6665 30.3707ZM2.6665 38.3362L2.1665 38.3362L2.1665 42.319L2.6665 42.319L3.1665 42.319L3.1665 38.3362L2.6665 38.3362ZM2.6665 46.3017L2.1665 46.3017L2.1665 50.2845L2.6665 50.2845L3.1665 50.2845L3.1665 46.3017L2.6665 46.3017ZM2.6665 54.2672L2.1665 54.2672L2.1665 58.25L2.6665 58.25L3.1665 58.25L3.1665 54.2672L2.6665 54.2672ZM2.6665 62.2327L2.1665 62.2327L2.1665 66.2155L2.6665 66.2155L3.1665 66.2155L3.1665 62.2327L2.6665 62.2327ZM2.6665 70.1983L2.1665 70.1983L2.1665 74.181L2.6665 74.181L3.1665 74.181L3.1665 70.1983L2.6665 70.1983ZM2.6665 78.1638L2.1665 78.1638L2.1665 82.1465L2.6665 82.1465L3.1665 82.1465L3.1665 78.1638L2.6665 78.1638ZM2.6665 86.1293L2.1665 86.1293L2.1665 90.1121L2.6665 90.1121L3.1665 90.1121L3.1665 86.1293L2.6665 86.1293ZM2.6665 94.0948L2.1665 94.0948L2.1665 98.0776L2.6665 98.0776L3.1665 98.0776L3.1665 94.0948L2.6665 94.0948ZM2.6665 102.06L2.1665 102.06L2.1665 106.043L2.6665 106.043L3.1665 106.043L3.1665 102.06L2.6665 102.06ZM2.6665 110.026L2.1665 110.026L2.1665 114.009L2.6665 114.009L3.1665 114.009L3.1665 110.026L2.6665 110.026ZM2.6665 117.991L2.1665 117.991L2.1665 121.974L2.6665 121.974L3.1665 121.974L3.1665 117.991L2.6665 117.991ZM2.6665 125.957L2.1665 125.957L2.1665 129.94L2.6665 129.94L3.1665 129.94L3.1665 125.957L2.6665 125.957ZM2.6665 133.922L2.1665 133.922L2.1665 137.905L2.6665 137.905L3.1665 137.905L3.1665 133.922L2.6665 133.922ZM2.6665 141.888L2.1665 141.888L2.1665 145.871L2.6665 145.871L3.1665 145.871L3.1665 141.888L2.6665 141.888ZM2.6665 149.853L2.1665 149.853L2.1665 153.836L2.6665 153.836L3.1665 153.836L3.1665 149.853L2.6665 149.853ZM2.6665 157.819L2.1665 157.819L2.1665 161.802L2.6665 161.802L3.1665 161.802L3.1665 157.819L2.6665 157.819ZM2.6665 165.784L2.1665 165.784L2.1665 169.767L2.6665 169.767L3.1665 169.767L3.1665 165.784L2.6665 165.784ZM2.6665 173.75L2.1665 173.75L2.1665 177.733L2.6665 177.733L3.1665 177.733L3.1665 173.75L2.6665 173.75ZM2.6665 181.715L2.1665 181.715L2.1665 185.698L2.6665 185.698L3.1665 185.698L3.1665 181.715L2.6665 181.715ZM2.6665 189.681L2.1665 189.681L2.1665 193.664L2.6665 193.664L3.1665 193.664L3.1665 189.681L2.6665 189.681ZM2.6665 197.646L2.1665 197.646L2.1665 201.629L2.6665 201.629L3.1665 201.629L3.1665 197.646L2.6665 197.646ZM2.66649 205.612L2.16649 205.612L2.16649 209.595L2.66649 209.595L3.16649 209.595L3.16649 205.612L2.66649 205.612ZM2.66649 213.578L2.16649 213.578L2.16649 217.56L2.66649 217.56L3.16649 217.56L3.16649 213.578L2.66649 213.578ZM2.66649 221.543L2.16649 221.543L2.16649 225.526L2.66649 225.526L3.16649 225.526L3.16649 221.543L2.66649 221.543ZM2.66649 229.509L2.16649 229.509L2.16649 231.5L2.66649 231.5L3.16649 231.5L3.16649 229.509L2.66649 229.509Z"
                  fill="white"
                />
              </svg>
            </span>
          </div>
          <div className="mail__desc flex flex-col gap-2.5 mt-32.5 mb-60">
            <h3 className="text-2xl font-bold leading-8 tracking-tight text-text-secondary">
              딱 세번의 선택으로 메일이 완성됩니다.
            </h3>
            <p className="text-lg font-normal leading-7 tracking-tight text-text-primary">
              상대방과 목적을 선택하면, 그에 맞는 메일이 바로 만들어집니다.
              <br />
              지금 아래 데모에서 직접 경험해보세요.
            </p>
          </div>
          <div id="demo" className="flex gap-5">
            <GmailMockup
              subject={subject}
              content={content}
              onSubjectChange={setSubject}
              onContentChange={setContent}
            />
            <ToneFitPanel
              onGenerate={handleGenerate}
              onReset={handleReset}
              devForceView={devForceView}
            />
          </div>
        </div>
      </section>
      {import.meta.env.DEV && (
        <DevViewToolbar current={devForceView} onChange={setDevForceView} />
      )}
    </>
  );
};

/** 푸터 */
const DemoFooter = () => (
  <footer className="footer w-full bg-background-page--20 border-t border-border-default px-5 py-3.5 text-base font-normal leading-6 tracking-tight text-text-secondary">
    <div className="footer__inner flex items-center justify-between">
      <p className="footer__copy  p-2.5">
        © 2026 ToneFit Inc. All rights reserved.
      </p>
      <div className="footer__link p-2.5 flex gap-6 items-center">
        {['이용약관', '개인정보처리방침', '고객센터'].map((item) => (
          <button
            key={item}
            type="button"
            className="hover:text-text-primary transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  </footer>
);

// ─── 메인 페이지 ──────────────────────────────────────────────────

/**
 * DemoPage
 *
 * ToneFit 크롬 익스텐션 웹 데모 랜딩 페이지
 * 경로: /demo
 */
const DemoPage = () => {
  return (
    <div
      id="demo"
      style={{
        background:
          'linear-gradient(138.84deg, rgba(255,255,255,0.2) 11%, rgba(187,166,255,0.2) 27%, rgba(124,77,255,0.2) 94%), rgb(248,248,251)',
      }}
    >
      <DemoHeader />
      <main className="demo__contents">
        <HeroSection />
        <MailSection />
      </main>
      <DemoFooter />
    </div>
  );
};

export default DemoPage;
