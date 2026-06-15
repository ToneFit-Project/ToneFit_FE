/**
 * ToneFitPanel
 *
 * 이메일 생성 패널 컴포넌트입니다.
 * DemoPage 및 크롬 익스텐션에서 공통으로 재사용됩니다.
 *
 * 생성 로직(API 호출 / mock)은 부모가 `onRequest` prop으로 주입합니다.
 * 패널 자체는 UI 상태(input → loading → success / error)만 관리합니다.
 *
 * 사용 예시:
 *
 * // 데모 (mock)
 * <ToneFitPanel
 *   remainingCount={3}
 *   onRequest={async () => { await delay(3000); return MOCK_EMAIL; }}
 *   onSuccess={(subject, content) => { ... }}
 *   onReset={() => { ... }}
 * />
 *
 * // 익스텐션 (실제 API)
 * <ToneFitPanel
 *   remainingCount={serverCount}
 *   onRequest={async (params) => await postGeneration(params)}
 *   onSuccess={(subject, content) => { ... }}
 *   onReset={() => { ... }}
 * />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChipV2, ButtonLongV2 } from '@/components/ui';
import type { ReceiverType, PurposeType } from '@/types';
import imgPanelIcon from '@/assets/mail-logo.svg';
import iconAiPencil from '@/assets/aiPencil.svg';
import iconExclamation from '@/assets/icon/icon-exclamation.svg';

// =============================================================
// 도메인 데이터
// =============================================================

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

/** 이메일 내용 입력 최대 글자 수 (생성용 brief — 교정용 2000자와 다름) */
const EMAIL_MAX = 200;

// =============================================================
// 유틸
// =============================================================

/**
 * 자음·모음·이모지·공백만으로 이루어진 경우 true
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

// =============================================================
// 타입
// =============================================================

export type PanelView = 'input' | 'loading' | 'success' | 'error';

/** onRequest에 전달되는 생성 파라미터 */
export interface GenerateParams {
  receiver: ReceiverType;
  purpose: PurposeType;
  emailText: string;
}

/** onRequest가 반환하는 생성 결과 */
export interface GenerateResult {
  subject: string;
  content: string;
}

export interface ToneFitPanelProps {
  /**
   * 남은 무료 사용 횟수
   * 데모: localStorage 기반 / 익스텐션: 서버 기반
   */
  remainingCount: number;
  /**
   * 이메일 생성 요청 함수 (부모가 주입)
   * resolve → 성공 (subject, content 반환)
   * reject  → 실패 (error 뷰 표시)
   */
  onRequest: (params: GenerateParams) => Promise<GenerateResult>;
  /**
   * 생성 성공 시 콜백
   * 부모가 Gmail 목업 등 외부 UI에 결과를 반영할 때 사용
   */
  onSuccess: (subject: string, content: string) => void;
  /** 새 이메일 작성 (성공 화면 → 입력 초기화) */
  onReset: () => void;
  /**
   * 잔여 횟수가 0인 상태에서 생성 버튼 클릭 시 호출
   * 부모가 "횟수 소진" 팝업 등 후속 처리를 담당
   */
  onExhausted?: () => void;
  /**
   * 패널 헤더(로고 + 잔여 횟수 뱃지) 표시 여부
   * 데모: true (기본값) / 익스텐션 사이드 패널: false
   */
  showHeader?: boolean;
  /**
   * 사용 모드
   * 'demo': 생성 완료 후 "ToneFit 시작하기" 버튼 (기본값)
   * 'extension': 생성 완료 후 "새 초안 만들기" 버튼
   */
  mode?: 'demo' | 'extension';
  /** 입력 뷰 상단에 렌더할 슬롯 (툴팁 등 익스텐션 전용 UI) */
  tooltipSlot?: ReactNode;
  /** 수신자/목적 칩 선택 시 콜백 (툴팁 dismiss 등에 활용) */
  onChipSelect?: () => void;
  /** 로딩 중 취소 버튼 표시 여부 (익스텐션 전용) */
  onCancel?: () => void;
  /**
   * onRequest가 reject될 때 호출 — 부모가 에러 종류를 판별해 errorVariant 상태를 업데이트할 때 사용
   * cancelledRef.current === true인 경우(취소)에는 호출되지 않음
   */
  onError?: (err: unknown) => void;
  /**
   * 에러 화면 종류
   * 'generic': 기본 (잠시 후 다시 시도)
   * 'session_expired': 세션 만료 → 로그인 하기 버튼
   * 'rate_limited': 레이트리밋 → 60초 카운트다운 후 다시 시도
   */
  errorVariant?: ErrorVariant;
  /** 세션 만료 에러 화면의 "로그인 하기" 버튼 콜백 */
  onGoToLogin?: () => void;
  /** [DEV ONLY] 패널 뷰 강제 지정. undefined면 내부 상태 사용 */
  devForceView?: PanelView;
}

// =============================================================
// 로딩 메시지
// =============================================================

const getLoadingMessage = (
  elapsed: number,
  receiverLabel: string,
  purposeLabel: string
): string => {
  if (elapsed < 5) return `${receiverLabel}에게 맞는 표현을 찾고 있어요.`;
  if (elapsed < 10) return `${purposeLabel}에 맞는 초안을 준비하고 있어요.`;
  return '초안을 완성하고 있어요. 잠깐만요.';
};

// =============================================================
// 로딩 애니메이션 — 쓰기 동작 (Figma node 3188-2121)
// =============================================================

/**
 * AI 연필이 점을 하나씩 "써나가는" 4단계 애니메이션
 *
 * pen → dot1 → dot2 → dot3 → pen → ...
 *
 * 연필은 점이 추가될수록 좌측으로 이동 (쓰기 동작),
 * pen 상태로 돌아올 때는 즉시 복귀 (새 획 시작).
 */
type WritingStep = 'pen' | 'dot1' | 'dot2' | 'dot3';
const WRITING_STEPS: WritingStep[] = ['pen', 'dot1', 'dot2', 'dot3'];
/** 각 스텝 유지 시간 (ms) */
const WRITING_STEP_MS = 550;

/**
 * 연필 아이콘의 left 위치 (px, 160×160 컨테이너 기준)
 * Figma 좌표 그대로 사용
 */
const PENCIL_LEFT_PX: Record<WritingStep, number> = {
  pen: 50,
  dot1: 48,
  dot2: 45.5,
  dot3: 43,
};

/** 각 점(8px)의 left 위치 (px, 160×160 컨테이너 기준) */
const DOT_LEFT_PX = [78, 91, 104] as const;
/** 점의 top 위치 (px) */
const DOT_TOP_PX = 98;
/** 연필의 top 위치 (px) */
const PENCIL_TOP_PX = 48;

// =============================================================
// 서브 컴포넌트
// =============================================================

/** 이메일 생성 중 로딩 본문 */
const PanelLoadingBody = ({
  receiverLabel,
  purposeLabel,
  onCancel,
}: {
  receiverLabel: string;
  purposeLabel: string;
  onCancel?: () => void;
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  // 경과 시간 — 로딩 메시지 전환용
  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 쓰기 애니메이션 스텝 순환
  useEffect(() => {
    const timer = setInterval(
      () => setStepIdx((prev) => (prev + 1) % WRITING_STEPS.length),
      WRITING_STEP_MS
    );
    return () => clearInterval(timer);
  }, []);

  const step = WRITING_STEPS[stepIdx];
  const pencilLeft = PENCIL_LEFT_PX[step];
  const isReset = step === 'pen'; // pen으로 돌아올 때 즉시 복귀 (transition 없음)

  // 각 점의 활성 여부: 한 번 켜진 점은 pen으로 돌아갈 때까지 유지
  const dotActive: [boolean, boolean, boolean] = [
    step !== 'pen',
    step === 'dot2' || step === 'dot3',
    step === 'dot3',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between  px-4 py-5 h-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* 스피너 */}
        <div className="relative size-40 shrink-0">
          {/* AI 연필 쓰기 애니메이션 (Figma node 3188-2121) */}
          <div className="absolute inset-0 z-10">
            {/* 연필 아이콘 — 점이 추가될수록 좌측 이동 */}
            <div
              className="absolute size-16 overflow-hidden"
              style={{
                top: PENCIL_TOP_PX,
                left: pencilLeft,
                transition: isReset ? 'none' : 'left 0.25s ease-out',
              }}
            >
              <img src={iconAiPencil} alt="" className="size-full" />
            </div>

            {/* 점 3개 — 순서대로 나타남 */}
            {DOT_LEFT_PX.map((leftPos, i) => (
              <div
                key={i}
                className={`absolute size-2 rounded-full transition-colors duration-300 ${
                  dotActive[i] ? 'bg-background-brand-100' : ''
                }`}
                style={{ top: DOT_TOP_PX, left: leftPos }}
              />
            ))}
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

      {/* 취소 버튼 — 익스텐션 전용 */}
      {onCancel && (
        <div className="w-full shrink-0">
          <ButtonLongV2 onClick={onCancel}>중단하기</ButtonLongV2>
        </div>
      )}
    </div>
  );
};

/** 생성 성공 화면 */
const PanelSuccessBody = ({
  mode = 'demo',
  onReset,
}: {
  mode?: 'demo' | 'extension';
  onReset: () => void;
}) => (
  <div className="flex-1 flex flex-col items-center justify-between px-4 py-5 h-full">
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="flex flex-col gap-5 items-center">
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
        <div className="flex flex-col gap-3.5 items-center text-center">
          <p className="text-xl-plus font-semibold leading-7.5 tracking-tight text-text-primary">
            {mode === 'extension' ? (
              '메일 초안이 완성됐어요'
            ) : (
              <>
                쓰는 법을 몰라도 된다는 게,
                <br />
                이제 느껴지셨나요?
              </>
            )}
          </p>
          <p className="text-base font-normal leading-6 tracking-tight text-text-secondary text-center">
            {mode === 'extension' ? (
              <>
                Gmail 작성 화면에 바로 넣어뒀어요.
                <br />
                확인하고 전송하면 끝이에요.
              </>
            ) : (
              '간단히 설치하고, 매번 이렇게 완성해보세요.'
            )}
          </p>
        </div>
      </div>
    </div>
    <div className="w-full shrink-0 flex flex-col gap-2">
      {mode === 'demo' ? (
        <ButtonLongV2
          onClick={() =>
            window.open(
              'https://chromewebstore.google.com/category/extensions',
              '_blank',
              'noopener,noreferrer'
            )
          }
        >
          ToneFit 시작하기
        </ButtonLongV2>
      ) : (
        <ButtonLongV2 onClick={onReset}>새 초안 만들기</ButtonLongV2>
      )}
    </div>
  </div>
);

// =============================================================
// 에러 variant 타입
// =============================================================

export type ErrorVariant = 'generic' | 'session_expired' | 'rate_limited';

/** 에러 variant별 텍스트 설정 */
const ERROR_CONFIG: Record<
  ErrorVariant,
  { title: string; descLine1: string; descLine2: string; descLine3?: string }
> = {
  generic: {
    title: '초안 생성을 완료하지 못했어요',
    descLine1: '입력한 내용은 그대로 있어요.',
    descLine2: '잠시 후 다시 시도해 주세요.',
  },
  session_expired: {
    title: '다시 로그인이 필요해요',
    descLine1: '로그인이 만료되었어요.',
    descLine2: '로그인 후 이어서 초안을 생성할 수 있습니다.',
  },
  rate_limited: {
    title: '요청이 잠시 제한되었어요',
    descLine1: '짧은 시간에 요청이 몰려 잠시 멈췄어요.',
    descLine2: '입력한 내용은 그대로 있고,',
    descLine3: '시간이 지나면 다시 시도할 수 있어요.',
  },
};

/** 생성 실패 화면 */
const PanelErrorBody = ({
  variant = 'generic',
  onRetry,
  onGoToLogin,
}: {
  variant?: ErrorVariant;
  onRetry: () => void;
  onGoToLogin?: () => void;
}) => {
  // rate_limited: 60초 카운트다운 → 0 도달 시 다시 시도 버튼 활성화
  const [countdown, setCountdown] = useState(
    variant === 'rate_limited' ? 60 : 0
  );

  useEffect(() => {
    if (variant !== 'rate_limited') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [variant]);

  const { title, descLine1, descLine2, descLine3 } = ERROR_CONFIG[variant];

  // CTA 버튼 설정
  const isCounting = variant === 'rate_limited' && countdown > 0;
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');
  const buttonLabel =
    variant === 'session_expired'
      ? '로그인하기'
      : isCounting
        ? `${mm}:${ss}`
        : '다시 시도';
  const handleAction =
    variant === 'session_expired' ? (onGoToLogin ?? onRetry) : onRetry;

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-5 h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-10 py-12">
        <div className="size-22.5 rounded-full bg-background-brand-subtle flex items-center justify-center shrink-0">
          <img src={iconExclamation} alt="" className="w-3.25 h-12.5" />
        </div>
        <div className="flex flex-col gap-5 items-center text-center w-full">
          <p className="text-xl-plus font-semibold leading-7.5 tracking-tight text-text-primary">
            {title}
          </p>
          <p className="text-base font-normal leading-6 tracking-tight text-text-primary text-center">
            {descLine1}
            <br />
            {descLine2}
            {descLine3 && (
              <>
                <br />
                {descLine3}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="w-full shrink-0">
        <ButtonLongV2 onClick={handleAction} disabled={isCounting}>
          {buttonLabel}
        </ButtonLongV2>
      </div>
    </div>
  );
};

/** 입력 폼 패널 본문 */
const PanelBody = ({
  receiver,
  setReceiver,
  purpose,
  setPurpose,
  emailText,
  setEmailText,
  canGenerate,
  onGenerate,
  tooltipSlot,
  onChipSelect,
}: {
  receiver: ReceiverType | null;
  setReceiver: (v: ReceiverType | null) => void;
  purpose: PurposeType | null;
  setPurpose: (v: PurposeType | null) => void;
  emailText: string;
  setEmailText: (v: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
  tooltipSlot?: ReactNode;
  onChipSelect?: () => void;
}) => {
  const labelClass =
    'text-base font-semibold leading-6 tracking-tight text-text-primary';

  return (
    <div className="flex-1 flex flex-col px-4 py-5 gap-5 justify-between h-full">
      <div className="flex flex-col gap-8">
        {/* 툴팁 슬롯 */}
        {tooltipSlot}

        {/* 수신자 유형 */}
        <div className="flex flex-col gap-4">
          <p className={labelClass}>수신자 유형 선택</p>
          <div className="grid grid-cols-4 gap-1">
            {RECEIVER_OPTIONS.map(({ value, label }) => (
              <ChipV2
                key={value}
                selected={receiver === value}
                onClick={() => {
                  setReceiver(receiver === value ? null : value);
                  onChipSelect?.();
                }}
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
                onClick={() => {
                  setPurpose(purpose === value ? null : value);
                  onChipSelect?.();
                }}
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
                data-panel-input="email-brief"
                className="w-full h-full resize-none text-sm font-normal leading-5.5 tracking-tight text-text-secondary placeholder:text-text-placeholder bg-transparent outline-none"
                placeholder="어떤 이메일을 작성하고 싶으신가요?"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={5}
              />
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
          초안 생성하기
        </ButtonLongV2>
      </div>
    </div>
  );
};

// =============================================================
// 패널 헤더 (독립 컴포넌트)
// =============================================================

/**
 * 패널 헤더 — 로고 + 잔여 횟수 뱃지
 *
 * 데모 페이지에서는 표시 / 익스텐션 사이드 패널에서는 숨김
 * ToneFitPanel의 showHeader prop으로 제어하거나, 독립적으로 사용 가능
 */
export const PanelHeader = ({ remainingCount }: { remainingCount: number }) => (
  <div className="flex items-center justify-between px-4 py-5 shrink-0">
    <div className="flex items-center gap-2.5">
      <img src={imgPanelIcon} alt="ToneFit" className="size-8 object-contain" />
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
);

// =============================================================
// 메인 컴포넌트
// =============================================================

const ToneFitPanel = ({
  remainingCount,
  onRequest,
  onSuccess,
  onReset,
  onExhausted,
  showHeader = true,
  mode = 'demo',
  tooltipSlot,
  onChipSelect,
  onCancel,
  onError,
  errorVariant = 'generic',
  onGoToLogin,
  devForceView,
}: ToneFitPanelProps) => {
  const [receiver, setReceiver] = useState<ReceiverType | null>(null);
  const [purpose, setPurpose] = useState<PurposeType | null>(null);
  const [emailText, setEmailText] = useState('');
  const [view, setView] = useState<PanelView>('input');
  const cancelledRef = useRef(false);

  /**
   * 폼 입력 조건 (잔여 횟수 제외)
   * 버튼의 disabled 여부를 결정 — 횟수가 소진돼도 클릭은 가능해야 함
   */
  const canGenerateForm =
    !!receiver &&
    !!purpose &&
    emailText.trim().length >= 10 &&
    emailText.length <= EMAIL_MAX &&
    !isOnlyJamoOrSpaces(emailText);

  /** 생성 요청 — 횟수 소진 시 onExhausted 호출, 정상 시 로딩 → 성공/실패 전환 */
  const handleGenerate = useCallback(async () => {
    if (!canGenerateForm || !receiver || !purpose) return;

    // 잔여 횟수 소진 → 팝업 표시 (부모 처리)
    if (remainingCount === 0) {
      onExhausted?.();
      return;
    }

    cancelledRef.current = false;
    setView('loading');
    try {
      const result = await onRequest({ receiver, purpose, emailText });
      if (cancelledRef.current) return; // 취소된 경우 결과 무시
      setView('success');
      onSuccess(result.subject, result.content);
    } catch (err) {
      if (cancelledRef.current) return; // 취소된 경우 에러 무시
      onError?.(err);
      setView('error');
    }
  }, [
    canGenerateForm,
    receiver,
    purpose,
    emailText,
    remainingCount,
    onRequest,
    onSuccess,
    onExhausted,
    onError,
  ]);

  /** 로딩 중 취소 → 입력값 유지하고 input으로 복귀 */
  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    setView('input');
    onCancel?.();
  }, [onCancel]);

  /** 성공 화면 → 입력 초기화 */
  const handleReset = () => {
    setView('input');
    setReceiver(null);
    setPurpose(null);
    setEmailText('');
    onReset();
  };

  /** 실패 화면 → 입력 유지하고 돌아가기 */
  const handleRetry = () => setView('input');

  /** Mac: Cmd+Enter / Windows: Alt+Enter 로 생성 */
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

  const activeView = devForceView ?? view;

  const receiverLabel =
    RECEIVER_OPTIONS.find((o) => o.value === receiver)?.label ?? '상사';
  const purposeLabel =
    PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label ?? '보고';

  return (
    <>
      {/* 패널 헤더 — 데모: 표시 / 익스텐션: 숨김 */}
      {showHeader && <PanelHeader remainingCount={remainingCount} />}

      {/* 본문 */}
      {activeView === 'loading' && (
        <PanelLoadingBody
          receiverLabel={receiverLabel}
          purposeLabel={purposeLabel}
          onCancel={onCancel ? handleCancel : undefined}
        />
      )}
      {activeView === 'success' && (
        <PanelSuccessBody mode={mode} onReset={handleReset} />
      )}
      {activeView === 'error' && (
        <PanelErrorBody
          key={errorVariant}
          variant={errorVariant}
          onRetry={handleRetry}
          onGoToLogin={onGoToLogin}
        />
      )}
      {activeView === 'input' && (
        <PanelBody
          receiver={receiver}
          setReceiver={setReceiver}
          purpose={purpose}
          setPurpose={setPurpose}
          emailText={emailText}
          setEmailText={setEmailText}
          canGenerate={canGenerateForm}
          onGenerate={handleGenerate}
          tooltipSlot={tooltipSlot}
          onChipSelect={onChipSelect}
        />
      )}
    </>
  );
};

export default ToneFitPanel;
