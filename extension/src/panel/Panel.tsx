/**
 * Panel — Extension Side Panel 루트 컴포넌트
 *
 * 화면 흐름:
 *   start  → Google 로그인 버튼 (미인증)
 *   terms  → 약관 동의 (신규 가입 시)
 *   main   → ToneFitPanel (인증 완료)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ToneFitPanel } from '@/components/panel';
import type {
  GenerateParams,
  GenerateResult,
  PanelView,
  ErrorVariant,
} from '@/components/panel';
import { postGeneration } from '@ext/apiClient';
import type { TermsType } from '@/types';
import StartView from './views/StartView';
import TermsView from './views/TermsView';
import Tooltip from './components/Tooltip';
import {
  getStoredToken,
  clearToken,
  getGoogleIdToken,
  signInWithGoogle,
} from '@ext/auth';

type Screen = 'start' | 'terms' | 'main';

// ── DEV 툴바 ─────────────────────────────────────────────────────────

const SCREENS: Screen[] = ['start', 'terms', 'main'];
const VIEWS: PanelView[] = ['input', 'loading', 'success', 'error'];
const ERROR_VARIANTS: ErrorVariant[] = [
  'generic',
  'session_expired',
  'rate_limited',
];
const ERROR_VARIANT_LABELS: Record<ErrorVariant, string> = {
  generic: 'generic',
  session_expired: 'session',
  rate_limited: 'rate',
};

const DevToolbar = ({
  screen,
  onScreenChange,
  devView,
  onViewChange,
  errorVariant,
  onErrorVariantChange,
}: {
  screen: Screen;
  onScreenChange: (s: Screen) => void;
  devView: PanelView | undefined;
  onViewChange: (v: PanelView | undefined) => void;
  errorVariant: ErrorVariant;
  onErrorVariantChange: (v: ErrorVariant) => void;
}) => {
  const [open, setOpen] = useState(false);
  const isErrorView = devView === 'error';

  return (
    <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5">
      {open && (
        <div className="bg-background-inverse/90 backdrop-blur-sm rounded-xl px-3 py-2.5 flex flex-col gap-2.5 shadow-lg min-w-48">
          {/* 화면 전환 */}
          <div className="flex flex-col gap-1">
            <p className="text-2xs text-text-inverse/50 font-medium uppercase tracking-wide">
              Screen
            </p>
            <div className="flex gap-1">
              {SCREENS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onScreenChange(s)}
                  className={`flex-1 text-2xs rounded px-1.5 py-1 transition-colors cursor-pointer ${
                    screen === s
                      ? 'bg-background-brand text-text-inverse'
                      : 'bg-background-inverse/30 text-text-inverse/70 hover:bg-background-inverse/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 뷰 강제 전환 (main 화면에서만) */}
          {screen === 'main' && (
            <div className="flex flex-col gap-1">
              <p className="text-2xs text-text-inverse/50 font-medium uppercase tracking-wide">
                View
              </p>
              <div className="flex gap-1">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onViewChange(devView === v ? undefined : v)}
                    className={`flex-1 text-2xs rounded px-1.5 py-1 transition-colors cursor-pointer ${
                      devView === v
                        ? 'bg-background-brand text-text-inverse'
                        : 'bg-background-inverse/30 text-text-inverse/70 hover:bg-background-inverse/50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 에러 variant 전환 (error 뷰일 때만) */}
          {screen === 'main' && isErrorView && (
            <div className="flex flex-col gap-1">
              <p className="text-2xs text-text-inverse/50 font-medium uppercase tracking-wide">
                Error
              </p>
              <div className="flex gap-1">
                {ERROR_VARIANTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onErrorVariantChange(v)}
                    className={`flex-1 text-2xs rounded px-1.5 py-1 transition-colors cursor-pointer ${
                      errorVariant === v
                        ? 'bg-background-danger-subtle text-text-danger'
                        : 'bg-background-inverse/30 text-text-inverse/70 hover:bg-background-inverse/50'
                    }`}
                  >
                    {ERROR_VARIANT_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-2xs bg-background-inverse/80 hover:bg-background-inverse text-text-inverse rounded-full px-3 py-1 transition-colors cursor-pointer shadow"
      >
        {open ? '✕ DEV' : '🛠 DEV'}
      </button>
    </div>
  );
};

// ── DEV 전용 기능 노출 여부 — 배포 전 false로 변경 ──────────────────
const SHOW_DEV_TOOLBAR = false;
const SHOW_DEV_LOGIN_SKIP = false;

// 약관 버전 — 서버와 맞춰야 함
const TERMS_VERSION = '1.0';

const Panel = () => {
  const [screen, setScreen] = useState<Screen>('start');
  const [devView, setDevView] = useState<PanelView | undefined>(undefined);
  // 익스텐션은 무제한 — Infinity로 설정해 소진 로직 비활성화
  const [remainingCount] = useState(Infinity);
  const [errorVariant, setErrorVariant] = useState<ErrorVariant>('generic');

  // 레이트리밋: 1분 내 최대 5회
  const requestTimestampsRef = useRef<number[]>([]);
  const RATE_LIMIT = 5;
  const RATE_WINDOW_MS = 60_000;
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // 약관 동의 전까지 id_token을 임시 보관
  const pendingIdTokenRef = useRef<string | null>(null);

  // 현재 활성 Gmail 탭 ID — 메시지 전송 대상 특정용
  const activeTabIdRef = useRef<number | null>(null);

  // ── 앱 초기화: 저장된 토큰 확인 + 활성 탭 ID 저장 ──────────────

  useEffect(() => {
    getStoredToken()
      .then((token) => {
        if (token) setScreen('main');
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        activeTabIdRef.current = tabs[0]?.id ?? null;
      })
      .catch(console.error);
  }, []);

  // ── 팝업에서 로그아웃 시 start 화면으로 이동 ────────────────────
  useEffect(() => {
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'LOGOUT') {
        setScreen('start');
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // ── 툴팁: main 진입 시 1회 노출 ─────────────────────────────────

  const dismissTooltip = useCallback(() => setShowTooltip(false), []);

  const goToMain = useCallback((showTip = false) => {
    setScreen('main');
    if (showTip) setShowTooltip(true);
  }, []);

  // ── Google 로그인 ────────────────────────────────────────────────

  const handleGoogleLogin = useCallback(async () => {
    setAuthError(null);
    let idToken = '';
    try {
      idToken = await getGoogleIdToken();
      const result = await signInWithGoogle(idToken);

      if (result.isNewUser) {
        // 신규 가입 → 약관 동의 화면으로, id_token 보관
        pendingIdTokenRef.current = idToken;
        setScreen('terms');
      } else {
        // 기존 회원 → 바로 메인 (툴팁 없음)
        goToMain();
      }
    } catch (err: unknown) {
      // 400 TERMS_AGREEMENT_REQUIRED → 신규 유저, 약관 화면으로
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const code = (
        err as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code;

      if (status === 400 && code === 'TERMS_AGREEMENT_REQUIRED') {
        pendingIdTokenRef.current = idToken;
        setScreen('terms');
        return;
      }

      const message =
        err instanceof Error ? err.message : '로그인에 실패했습니다';
      setAuthError(message);
      console.error('[ToneFit] 로그인 실패:', err);
    }
  }, [goToMain]);

  // ── 약관 동의 완료 ───────────────────────────────────────────────

  const handleTermsComplete = useCallback(
    async (agreedKeys: TermsType[]) => {
      const idToken = pendingIdTokenRef.current;
      // DEV 스킵 케이스 — id_token 없이 바로 main 진입
      if (!idToken) {
        goToMain(true);
        return;
      }

      setAuthError(null);
      try {
        const ALL_TERMS: TermsType[] = [
          'SERVICE',
          'PRIVACY',
          'ANALYTICS',
          'MARKETING',
          'AI_LEARNING',
        ];
        const termsAgreements = ALL_TERMS.map((type) => ({
          type,
          version: TERMS_VERSION,
          agreed: agreedKeys.includes(type),
        }));

        await signInWithGoogle(idToken, termsAgreements);
        pendingIdTokenRef.current = null;
        goToMain(true); // 신규 가입 → 툴팁 표시
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '가입에 실패했습니다';
        setAuthError(message);
        console.error('[ToneFit] 약관 동의 후 가입 실패:', err);
      }
    },
    [goToMain]
  );

  // ── ToneFitPanel 핸들러 ─────────────────────────────────────────

  const handleRequest = useCallback(
    async (params: GenerateParams): Promise<GenerateResult> => {
      // 레이트리밋 체크 — 1분 내 5회 초과 시 오버레이 없이 바로 에러
      const now = Date.now();
      requestTimestampsRef.current = requestTimestampsRef.current.filter(
        (t) => now - t < RATE_WINDOW_MS
      );
      if (requestTimestampsRef.current.length >= RATE_LIMIT) {
        throw Object.assign(new Error('RATE_LIMITED'), { _rateLimited: true });
      }
      requestTimestampsRef.current.push(now);

      const tabId = activeTabIdRef.current;
      chrome.runtime.sendMessage({ type: 'GENERATION_START', tabId });
      try {
        const response = await postGeneration({
          receiver_type: params.receiver,
          purpose: params.purpose,
          brief_content: params.emailText,
        });
        return {
          subject: response.generated_subject,
          content: response.generated_email.replace(/\\n/g, '\n'),
        };
      } catch (err) {
        chrome.runtime.sendMessage({ type: 'GENERATION_ERROR', tabId });
        throw err;
      }
    },

    []
  );

  /** 에러 종류 판별 — ToneFitPanel의 onError 콜백에서 호출 */
  const handleError = useCallback((err: unknown) => {
    const isRateLimit = (err as { _rateLimited?: boolean })?._rateLimited;
    if (isRateLimit) {
      setErrorVariant('rate_limited');
      return;
    }
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      setErrorVariant('session_expired');
      return;
    }
    setErrorVariant('generic');
  }, []);

  const handleSuccess = useCallback((subject: string, content: string) => {
    chrome.runtime.sendMessage({
      type: 'INSERT_EMAIL',
      subject,
      content,
      tabId: activeTabIdRef.current,
    });
  }, []);

  const handleReset = useCallback(() => {
    // 새 이메일 작성 → 패널 초기화
  }, []);

  const handleCancel = useCallback(() => {
    // 오버레이 제거
    chrome.runtime.sendMessage({ type: 'GENERATION_ERROR' });
  }, []);

  /** 세션 만료 에러 → 토큰 제거 후 로그인 화면으로 */
  const handleGoToLogin = useCallback(async () => {
    await clearToken();
    setScreen('start');
  }, []);

  // ── 렌더 ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background-page flex items-center justify-center">
        <div className="size-6 rounded-full border-2 border-border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background-page flex flex-col">
      <div className="inner bg-background-surface rounded-xl max-w-[360px] w-full h-full mx-auto overflow-hidden">
        {screen === 'start' && (
          <StartView
            onGoogleLogin={handleGoogleLogin}
            onSkip={SHOW_DEV_LOGIN_SKIP ? () => setScreen('terms') : undefined}
            error={authError}
          />
        )}
        {screen === 'terms' && (
          <TermsView onComplete={handleTermsComplete} error={authError} />
        )}
        {screen === 'main' && (
          <div className="relative w-full h-full">
            <ToneFitPanel
              remainingCount={remainingCount}
              onRequest={handleRequest}
              onSuccess={handleSuccess}
              onReset={handleReset}
              onCancel={handleCancel}
              onError={handleError}
              errorVariant={errorVariant}
              onGoToLogin={handleGoToLogin}
              showHeader={false}
              mode="extension"
              tooltipSlot={
                showTooltip ? <Tooltip onClose={dismissTooltip} /> : undefined
              }
              onChipSelect={dismissTooltip}
              devForceView={devView}
            />
          </div>
        )}
      </div>

      {/* DEV 전용 — 화면/뷰 전환 툴바 (SHOW_DEV_TOOLBAR로 노출 제어) */}
      {SHOW_DEV_TOOLBAR && (
        <DevToolbar
          screen={screen}
          onScreenChange={(s) => {
            setScreen(s);
            setDevView(undefined);
          }}
          devView={devView}
          onViewChange={setDevView}
          errorVariant={errorVariant}
          onErrorVariantChange={setErrorVariant}
        />
      )}
    </div>
  );
};

export default Panel;
