import { useState, useEffect, useRef, useId } from 'react';
import type { ReactNode } from 'react';
import { ButtonLongV2 } from '@/components/ui';
import { ToneFitPanel } from '@/components/panel';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type {
  PanelView,
  GenerateParams,
  GenerateResult,
} from '@/components/panel';
import { postGeneration } from '@/api';
import { devLog, devError } from '@/utils/devLog';
import useGoogleAuth from '@/hooks/useGoogleAuth';
import imgHeroEmail from '@/assets/here_content.png';
import imgToolbar from '@/assets/toolbar.svg';
import iconClose from '@/assets/icon/icon-close.svg';
import iconMaximize from '@/assets/icon/icon-maximize.svg';
import iconMinimize from '@/assets/icon/icon-minimize.svg';
import iconExclamation from '@/assets/icon/icon-exclamation.svg';

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

const mailIcons = [iconMinimize, iconMaximize, iconClose];
// tTonefit은 펄스 글로우 효과를 위해 별도 컴포넌트로 렌더링
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

// ─── 데모 전용 상수 ───────────────────────────────────────────────
const DEMO_DAILY_LIMIT = 3;

// ─── 데모 사용 횟수 (localStorage) ───────────────────────────────
const DEMO_USAGE_KEY = 'tonefit_demo_usage';

/**
 * 생성 시도 상태 키
 *
 * pending : 생성 요청 중 (로딩 중 이탈 → 차감 유지)
 * failed  : 생성 실패   (실패 후 이탈 → 차감 복구)
 *
 * 성공 시 삭제, 재시도 시 pending으로 갱신
 */
const DEMO_ATTEMPT_KEY = 'tonefit_demo_attempt';

interface DemoUsage {
  count: number;
  date: string; // 'YYYY-MM-DD'
}

interface DemoAttemptState {
  countBefore: number;
  status: 'pending' | 'failed';
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getDemoRemaining = (): number => {
  try {
    // 이전 시도 상태 확인
    const attemptRaw = localStorage.getItem(DEMO_ATTEMPT_KEY);
    if (attemptRaw) {
      const { countBefore, status } = JSON.parse(
        attemptRaw
      ) as DemoAttemptState;
      localStorage.removeItem(DEMO_ATTEMPT_KEY);
      if (status === 'failed') {
        // 실패 후 이탈 → 차감 전 횟수로 복구
        saveDemoRemaining(countBefore);
        return countBefore;
      }
      // pending (로딩 중 이탈) → 차감된 횟수 그대로 유지
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

const saveDemoRemaining = (count: number) => {
  localStorage.setItem(
    DEMO_USAGE_KEY,
    JSON.stringify({ count, date: getTodayString() })
  );
};

// ─── 서브 컴포넌트 ────────────────────────────────────────────────

/**
 * Gmail 툴바의 ToneFit 아이콘 — 배경 없음 ↔ brand-purple-200 breathing 효과
 *
 * Figma ref: node 3167-1984 (DemoCtaLogoButtonPulse)
 * - Rest     : 배경 완전 투명 (opacity 0)
 * - Highlight: brand-purple-200(≈#DFD1FF) 원형 배경 (크기 변화 없음)
 * - 전환     : opacity 0 ↔ 1, 0.8s ease-in-out
 */
const ToneFitToolbarIcon = () => {
  const [isHighlight, setIsHighlight] = useState(false);

  useEffect(() => {
    // 1.6s 마다 상태 전환 → 0.8s fade in + 0.8s hold → 0.8s fade out + 0.8s hold (3.2s 주기)
    const t = setInterval(() => setIsHighlight((p) => !p), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative flex items-center justify-center size-7 shrink-0">
      {/* 배경 — Rest(투명) ↔ Highlight(brand-purple-200) */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: '#DFD1FF',
          opacity: isHighlight ? 1 : 0,
          transition: 'opacity 0.7s ease-in-out',
        }}
      />
      {/* ToneFit 아이콘 */}
      <img src={tTonefit} alt="ToneFit" className="relative z-10 size-7" />
    </span>
  );
};

// ─── Liquid Glass 물리 굴절 유틸 ─────────────────────────────────────
// 출처: archisvaze/liquid-glass (MIT)
// backdrop-filter: url(#id) 로 배경을 직접 굴절시키는 기법

/** Snell의 법칙 기반 굴절 프로파일 계산 */
function lgCalcProfile(
  thickness: number,
  bezel: number,
  heightFn: (x: number) => number,
  ior: number,
  samples = 128
): Float64Array {
  const eta = 1 / ior;
  const refract = (nx: number, ny: number): [number, number] | null => {
    const k = 1 - eta * eta * (1 - ny * ny);
    if (k < 0) return null;
    const sq = Math.sqrt(k);
    return [-(eta * ny + sq) * nx, eta - (eta * ny + sq) * ny];
  };
  const profile = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    const y = heightFn(x);
    const dx = x < 1 ? 1e-4 : -1e-4;
    const deriv = (heightFn(x + dx) - y) / dx;
    const mag = Math.sqrt(deriv * deriv + 1);
    const ref = refract(-deriv / mag, -1 / mag);
    profile[i] = ref ? ref[0] * ((y * bezel + thickness) / ref[1]) : 0;
  }
  return profile;
}

/** 굴절 변위 맵 → canvas data URL (모서리 bezel 영역만 변위 적용) */
function lgDispMap(
  w: number,
  h: number,
  r: number,
  bezel: number,
  profile: Float64Array,
  maxDisp: number
): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128;
    d[i + 1] = 128;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }
  const rSq = r * r,
    r1Sq = (r + 1) ** 2,
    rBSq = Math.max(r - bezel, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2,
    S = profile.length;
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < rSq
          ? 1
          : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist,
        sin = y / dist;
      const bi = Math.min(((fromSide / bezel) * S) | 0, S - 1);
      const disp = profile[bi] || 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = (128 + ((-cos * disp) / maxDisp) * 127 * op + 0.5) | 0;
      d[idx + 1] = (128 + ((-sin * disp) / maxDisp) * 127 * op + 0.5) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/** 스펙큘러 하이라이트 맵 → canvas data URL */
function lgSpecMap(
  w: number,
  h: number,
  r: number,
  bezel: number,
  angle = Math.PI / 3
): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  d.fill(0);
  const rSq = r * r,
    r1Sq = (r + 1) ** 2,
    rBSq = Math.max(r - bezel, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2;
  const sv = [Math.cos(angle), Math.sin(angle)];
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < rSq
          ? 1
          : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const dot = Math.abs((x / dist) * sv[0] + (-y / dist) * sv[1]);
      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
      const coeff = dot * edge;
      const col = (255 * coeff) | 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = col;
      d[idx + 1] = col;
      d[idx + 2] = col;
      d[idx + 3] = (col * coeff * op) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/**
 * LiquidGlassPill
 *
 * archisvaze/liquid-glass 기법을 React로 구현한 물리 기반 유리 pill.
 *
 * 구조:
 *   ① backdrop-filter: url(#id) → 배경 자체를 SVG 필터로 굴절
 *   ② 틴트 + 인너 섀도우 오버레이 → 유리 두께감 표현
 *   ③ 텍스트 콘텐츠
 *
 * 굴절은 둥근 모서리(bezel) 영역에만 적용 → 중앙은 선명하게 유지
 * ⚠ backdrop-filter: url(#...) 는 Chrome/Chromium 전용
 */
const LiquidGlassPill = ({ children }: { children: ReactNode }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const reactId = useId();
  // useId는 렌더마다 동일값 → ref 불필요, 일반 상수로 사용
  const filterId = `lg-pill-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    const el = wrapRef.current;
    const fEl = filterRef.current;
    if (!el || !fEl) return;

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w < 2 || h < 2) return;

    const r = Math.round(Math.min(w, h) / 2); // fully rounded pill
    const bezel = Math.min(14, r - 1);

    // convex squircle surface — 가장 자연스러운 유리 형태
    const surfaceFn = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

    const profile = lgCalcProfile(80, bezel, surfaceFn, 2.5);
    const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
    const dispUrl = lgDispMap(w, h, r, bezel, profile, maxDisp);
    const specUrl = lgSpecMap(w, h, r, bezel * 2.5);

    fEl.innerHTML = `
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="b"/>
      <feImage href="${dispUrl}" x="0" y="0" width="${w}" height="${h}" result="dm"/>
      <feDisplacementMap in="b" in2="dm" scale="${maxDisp}"
        xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feColorMatrix in="d" type="saturate" values="4" result="ds"/>
      <feImage href="${specUrl}" x="0" y="0" width="${w}" height="${h}" result="sp"/>
      <feComposite in="ds" in2="sp" operator="in" result="sm"/>
      <feComponentTransfer in="sp" result="sf">
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feBlend in="sm" in2="d" mode="normal" result="ws"/>
      <feBlend in="sf" in2="ws" mode="normal"/>
    `;
  }, []);

  const fid = filterId;

  return (
    <>
      {/* SVG filter 정의 */}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
        colorInterpolationFilters="sRGB"
      >
        <defs>
          <filter
            ref={filterRef}
            id={fid}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          />
        </defs>
      </svg>

      {/* pill 본체 */}
      <div
        ref={wrapRef}
        className="relative px-6 py-2.5 rounded-full"
        style={{
          isolation: 'isolate',
          // boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* ① 배경 굴절 (backdrop-filter → SVG 필터) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backdropFilter: `url(#${fid})`,
            WebkitBackdropFilter: `url(#${fid})`,
            zIndex: -1,
          }}
        />
        {/* ② 틴트 + 인너 섀도우 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 0 20px -5px rgba(255,255,255,0.45)',
            border: '1px solid rgba(255,255,255,0.22)',
          }}
        />
        {/* ③ 텍스트 */}
        <div className="relative" style={{ zIndex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
};

/** 히어로 섹션 */
const HeroSection = ({ onStartDemo }: { onStartDemo: () => void }) => (
  <section
    id="heroSection"
    className="hero relative w-full overflow-hidden flex justify-center"
  >
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
        <ButtonLongV2 onClick={onStartDemo}>내 첫 메일 써보기</ButtonLongV2>
      </div>
    </div>
    <div className="here__img h-screen w-full relative flex items-center justify-center ">
      <div className="relative text-2xl font-bold leading-8 tracking-[-0.48px] text-text-inverse max-w-265 w-full border border-white rounded-full aspect-square flex items-center justify-center">
        <div className="hero__glass hero__glass--left absolute left-1/7 top-[55%] z-10">
          <LiquidGlassPill>상황에 맞는 톤 추천</LiquidGlassPill>
        </div>
        <div className="">
          <img
            src={imgHeroEmail}
            alt="ToneFit 이메일 생성 일러스트"
            className="relative z-0 animate-float-email"
          />
        </div>
        <div className="hero__glass hero__glass--right absolute right-[23%] top-[28%] z-10">
          <LiquidGlassPill>초안 생성까지 빠르게</LiquidGlassPill>
        </div>
      </div>
    </div>
  </section>
);

// ─── Gmail 목업 ───────────────────────────────────────────────────

interface GmailMockupProps {
  subject?: string;
  content?: string;
  onSubjectChange?: (value: string) => void;
  onContentChange?: (value: string) => void;
  /** 이메일 생성 중 — 본문 영역에 스켈레톤 타이핑 애니메이션 표시 */
  isLoading?: boolean;
}

/**
 * 스켈레톤 줄 정의 (Figma node 3183-1984 기반)
 * widthPct: 줄 너비 비율 / label: Figma 상태명
 */
const SKELETON_LINES: { widthPct: number; label: string }[] = [
  { widthPct: 100, label: 'Line 1' }, // 870px → 100%
  { widthPct: 60, label: 'Line 2' }, // 518px → 518/870 ≈ 60%
  { widthPct: 67, label: 'Line 3' }, // 581px → 581/870 ≈ 67%
];

const GmailMockup = ({
  subject = '',
  content = '',
  onSubjectChange,
  onContentChange,
  isLoading = false,
}: GmailMockupProps) => {
  const isEditable = !isLoading && (subject !== '' || content !== '');

  /**
   * "Gmail에서 바로 작업하기" 버튼 glow 애니메이션
   * Figma node 3194-2068: Rest(#7c4dff) ↔ Glow(#9b78ff) breathing 효과
   * 1.3s 주기로 상태 전환, 0.7s ease-in-out 배경색 전환
   */
  const [isGlowing, setIsGlowing] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setIsGlowing((p) => !p), 1300);
    return () => clearInterval(t);
  }, []);

  /**
   * 스켈레톤 타이핑 애니메이션 — 생성 중일 때만 실행
   * Figma node 3183-1984: Line 1 → Line 2 → Line 3 → Line 1 (600ms 주기)
   * 활성 줄: opacity 1 / 비활성 줄: opacity 0.08
   */
  const [skeletonStep, setSkeletonStep] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(
      () => setSkeletonStep((p) => (p + 1) % SKELETON_LINES.length),
      600
    );
    return () => {
      clearInterval(t);
      setSkeletonStep(0); // 로딩 종료 시 리셋
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
          /* 스켈레톤 타이핑 애니메이션 (Figma node 3183-1984) */
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
        <div className="hidden bg-background-brand-subtle items-center gap-1.5 h-[46px] px-3.5 rounded-[23px] w-[94%] overflow-hidden">
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
          <span className="text-sm font-semibold text-text-disabled tracking-tight px-1">
            Sans Serif ▾
          </span>
          <div className="h-6 w-px bg-icon-disabled" />
          <span className="text-sm font-semibold text-text-disabled tracking-tight px-1">
            T▾
          </span>
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
        {/* Gmail 바로 작업하기 — Rest ↔ Glow breathing 애니메이션 */}
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
          <span
            // type="button"
            className="flex items-center justify-center h-9 w-8 text-text-inverse text-xs"
          >
            ▾
          </span>
        </a>
        <div className="flex flex-1 justify-between items-center">
          <div className="flex items-center gap-2.5">
            {/* ToneFit 아이콘 — 펄스 글로우 효과 */}
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

/** 무료 체험 횟수를 모두 소진했을 때 표시되는 모달 팝업 */
const ExhaustedPopup = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(0,0,0,0.54)]">
    <div className="relative bg-background-surface rounded-2xl pt-6 pb-2.5 px-5 w-[552px] gap-8 flex flex-col items-center">
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="팝업 닫기"
        className="absolute top-4 right-4 cursor-pointer size-8 rounded-2xl bg-[rgba(255,255,255,0.86)] border border-border-default flex items-center justify-center hover:bg-background-subtle transition-colors"
      >
        <span>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="31"
              height="31"
              rx="15.5"
              fill="white"
              fill-opacity="0.86"
            />
            <rect
              x="0.5"
              y="0.5"
              width="31"
              height="31"
              rx="15.5"
              stroke="#E5E7EF"
            />
            <path
              d="M11.3346 21.8333L10.168 20.6666L14.8346 16L10.168 11.3333L11.3346 10.1666L16.0013 14.8333L20.668 10.1666L21.8346 11.3333L17.168 16L21.8346 20.6666L20.668 21.8333L16.0013 17.1666L11.3346 21.8333Z"
              fill="#6B7284"
            />
          </svg>
        </span>
      </button>

      {/* 아이콘 */}
      <div className="size-[90px] rounded-full bg-background-brand-subtle flex items-center justify-center shrink-0">
        <img src={iconExclamation} alt="" className="w-3.25 h-12.5" />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-bold text-[15px] leading-[22px] tracking-tight text-text-brand">
          체험 횟수 소진
        </p>
        <h2 className="text-[26px] font-bold leading-[34px] tracking-tight text-text-primary">
          무료 체험을 모두 사용했어요
        </h2>
        <p className="text-base font-normal leading-6 tracking-tight text-text-secondary">
          설치 후 Gmail에서 바로 이어서 이메일을 만들 수 있어요.
        </p>
      </div>

      {/* CTA */}
      <div className="w-full p-2.5 mt-3.5">
        <ButtonLongV2
          onClick={() => {
            window.open(
              'https://chromewebstore.google.com/category/extensions',
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

// ─── [DEV ONLY] 패널 뷰 강제 전환 툴바 ──────────────────────────

const DEV_VIEW_OPTIONS: { view: PanelView; label: string }[] = [
  { view: 'input', label: '작성 화면' },
  { view: 'loading', label: '로딩 화면' },
  { view: 'success', label: '생성 완료' },
  { view: 'error', label: '생성 실패' },
];

const DevViewToolbar = ({
  current,
  onChange,
  onResetUsage,
  onDrainUsage,
  onShowExhaustedPopup,
}: {
  current: PanelView | undefined;
  onChange: (v: PanelView | undefined) => void;
  onResetUsage: () => void;
  onDrainUsage: () => void;
  onShowExhaustedPopup: () => void;
}) => {
  const { signIn } = useGoogleAuth();

  return (
    <div className="fixed bottom-30 right-6 z-9999 flex flex-col gap-1.5 bg-background-surface border border-border-default rounded-xl shadow-lg p-3 w-36">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-2xs font-bold tracking-wide text-text-tertiary uppercase">
          🛠 미리보기
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
          실제 흐름 일시정지됨!!!
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
      {/* 구분선 */}
      <div className="border-t border-border-subtle my-0.5" />
      {/* 횟수 제어 */}
      <button
        type="button"
        onClick={onResetUsage}
        className="text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors bg-background-subtle text-text-primary hover:bg-background-muted"
      >
        무료체험 리셋
      </button>
      <button
        type="button"
        onClick={onDrainUsage}
        className="text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors bg-background-subtle text-text-danger hover:bg-background-danger-subtle"
      >
        무료체험 제거
      </button>
      {/* 구분선 */}
      <div className="border-t border-border-subtle my-0.5" />
      {/* 팝업 미리보기 */}
      <button
        type="button"
        onClick={onShowExhaustedPopup}
        className="text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors bg-background-subtle text-text-primary hover:bg-background-muted"
      >
        소진시 팝업
      </button>
      {/* 구분선 */}
      <div className="border-t border-border-subtle my-0.5" />
      {/* Google 로그인 */}
      <button
        type="button"
        onClick={signIn}
        className="text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors bg-background-subtle text-text-primary hover:bg-background-muted"
      >
        🔑 Google 로그인
      </button>
    </div>
  );
};

// ─── 메일 섹션 ────────────────────────────────────────────────────

const MailSection = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [remainingCount, setRemainingCount] = useState(() =>
    getDemoRemaining()
  );
  const [devForceView, setDevForceView] = useState<PanelView | undefined>(
    undefined
  );
  const [showExhaustedPopup, setShowExhaustedPopup] = useState(false);

  // 소진 팝업 노출 시 페이지 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = showExhaustedPopup ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showExhaustedPopup]);
  /** 이메일 생성 진행 중 여부 — GmailMockup 스켈레톤 애니메이션 트리거 */
  const [isGenerating, setIsGenerating] = useState(false);
  /**
   * 재시도 모드 여부
   * true  → 이전 시도가 실패한 상태 — 다음 요청 시 횟수 차감 없음
   * false → 최초 시도 — 요청 시 횟수 차감
   */
  const [isRetryMode, setIsRetryMode] = useState(false);
  /** 현재 시도 직전의 횟수 (실패 후 새로고침 시 복구 기준값) */
  const countBeforeAttemptRef = useRef<number | null>(null);

  /** [DEV ONLY] localStorage 사용 횟수 초기화 (DEMO_DAILY_LIMIT으로 복구) */
  const handleResetUsage = () => {
    localStorage.removeItem(DEMO_ATTEMPT_KEY);
    saveDemoRemaining(DEMO_DAILY_LIMIT);
    setRemainingCount(DEMO_DAILY_LIMIT);
    setIsRetryMode(false);
    countBeforeAttemptRef.current = null;
    setShowExhaustedPopup(false);
  };

  /** [DEV ONLY] localStorage 사용 횟수를 0으로 차감 */
  const handleDrainUsage = () => {
    localStorage.removeItem(DEMO_ATTEMPT_KEY);
    saveDemoRemaining(0);
    setRemainingCount(0);
    setIsRetryMode(false);
    countBeforeAttemptRef.current = null;
    setShowExhaustedPopup(false);
  };

  /** [DEV ONLY] 체험 횟수 소진 팝업 즉시 표시 */
  const handleShowExhaustedPopup = () => setShowExhaustedPopup(true);

  /**
   * 이메일 생성 요청 — POST /generations
   *
   * 횟수 차감 정책:
   * - 최초 시도: 즉시 차감 + localStorage에 pending 플래그 저장
   *   → 로딩 중 새로고침해도 차감 유지
   * - 실패: failed 플래그 저장 → 새로고침 시 차감 복구
   * - 재시도: 추가 차감 없이 pending 플래그로만 갱신
   * - 성공: 플래그 제거 (차감 확정)
   */
  const handleRequest = async (
    params: GenerateParams
  ): Promise<GenerateResult> => {
    setIsGenerating(true);
    try {
      if (!isRetryMode) {
        // 최초 시도: 횟수 차감 + pending 플래그
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
        // 재시도: 차감 없이 pending 플래그만 갱신
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

      // 성공: 플래그 제거, 재시도 모드 해제
      localStorage.removeItem(DEMO_ATTEMPT_KEY);
      setIsRetryMode(false);
      countBeforeAttemptRef.current = null;

      const result = {
        subject: response.generated_subject,
        // 서버가 리터럴 \n 문자열로 줄바꿈을 내려줄 경우 실제 개행 문자로 변환
        content: response.generated_email.replace(/\\n/g, '\n'),
      };
      devLog('[Generation] 매핑 결과', result);
      return result;
    } catch (err) {
      // 실패: failed 플래그 저장 → 새로고침 시 복구
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
      {/* 횟수 소진 팝업 */}
      {showExhaustedPopup && (
        <ExhaustedPopup onClose={() => setShowExhaustedPopup(false)} />
      )}

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
          <div id="mail-demo" className="flex gap-5">
            <GmailMockup
              subject={subject}
              content={content}
              onSubjectChange={setSubject}
              onContentChange={setContent}
              isLoading={isGenerating || devForceView === 'loading'}
            />
            <div className="bg-background-surface rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.08)] flex flex-col w-full max-w-[437px] shrink-0">
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
                  // 새 이메일 작성 → 재시도 모드 해제
                  setIsRetryMode(false);
                  countBeforeAttemptRef.current = null;
                  localStorage.removeItem(DEMO_ATTEMPT_KEY);
                }}
                onExhausted={() => setShowExhaustedPopup(true)}
                devForceView={devForceView}
              />
            </div>
          </div>
        </div>
      </section>
      {import.meta.env.DEV && (
        <DevViewToolbar
          current={devForceView}
          onChange={setDevForceView}
          onResetUsage={handleResetUsage}
          onDrainUsage={handleDrainUsage}
          onShowExhaustedPopup={handleShowExhaustedPopup}
        />
      )}
    </>
  );
};

// ─── 메인 페이지 ──────────────────────────────────────────────────

/**
 * DemoPage
 *
 * ToneFit 크롬 익스텐션 웹 데모 랜딩 페이지
 * 경로: /demo
 */
const DemoPage = () => {
  /**
   * 히어로 "내 첫 메일 써보기" 클릭 핸들러
   * 1. #mail-demo(GmailMockup + ToneFitPanel) 위치로 smooth 스크롤
   *    - 고정 헤더 높이만큼 위로 올려 요소가 헤더 아래에 딱 맞게 위치
   *    - 추가 24px 여백으로 자연스러운 간격 확보
   * 2. 스크롤 완료 후 ToneFitPanel 이메일 입력 textarea에 포커스
   */
  const handleStartDemo = () => {
    const target = document.getElementById('mail-demo');
    if (!target) return;

    const headerHeight = document.getElementById('header')?.offsetHeight ?? 80;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;

    window.scrollTo({ top, behavior: 'smooth' });

    // smooth 스크롤 완료 대기 후 포커스
    setTimeout(() => {
      document
        .querySelector<HTMLTextAreaElement>('[data-panel-input="email-brief"]')
        ?.focus();
    }, 700);
  };

  return (
    <div
      id="demo"
      style={{
        background:
          'linear-gradient(138.84deg, rgba(255,255,255,0.2) 11%, rgba(187,166,255,0.2) 27%, rgba(124,77,255,0.2) 94%), rgb(248,248,251)',
      }}
    >
      <Header />
      <main className="demo__contents">
        <HeroSection onStartDemo={handleStartDemo} />
        <MailSection />
      </main>
      <Footer />
    </div>
  );
};

export default DemoPage;
