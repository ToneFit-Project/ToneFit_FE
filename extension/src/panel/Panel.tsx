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
import {
  postGeneration,
  postCorrection,
  postCorrectionsRejections,
} from '@ext/apiClient';
import type {
  TermsType,
  CorrectionsRejectionItem,
  ReceiverType,
  PurposeType,
} from '@/types';
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
const VIEWS: PanelView[] = [
  'input',
  'loading',
  'success',
  'error',
  'correction-review',
];
const VIEW_LABELS: Record<PanelView, string> = {
  input: 'input',
  loading: 'load',
  success: 'done',
  error: 'err',
  'correction-review': 'review',
};
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
  devPanelMode,
  onPanelModeChange,
}: {
  screen: Screen;
  onScreenChange: (s: Screen) => void;
  devView: PanelView | undefined;
  onViewChange: (v: PanelView | undefined) => void;
  errorVariant: ErrorVariant;
  onErrorVariantChange: (v: ErrorVariant) => void;
  devPanelMode: 'generate' | 'correct';
  onPanelModeChange: (m: 'generate' | 'correct') => void;
}) => {
  const [open, setOpen] = useState(false);
  const isErrorView = devView === 'error';
  const showModeToggle =
    isErrorView || devView === 'loading' || devView === 'success';

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
              <div className="flex gap-1 flex-wrap">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onViewChange(devView === v ? undefined : v)}
                    className={`text-2xs rounded px-1.5 py-1 transition-colors cursor-pointer ${
                      devView === v
                        ? 'bg-background-brand text-text-inverse'
                        : 'bg-background-inverse/30 text-text-inverse/70 hover:bg-background-inverse/50'
                    }`}
                  >
                    {VIEW_LABELS[v]}
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

          {/* 모드 전환 (error / loading 뷰에서 메시지 확인용) */}
          {screen === 'main' && showModeToggle && (
            <div className="flex flex-col gap-1">
              <p className="text-2xs text-text-inverse/50 font-medium uppercase tracking-wide">
                Mode
              </p>
              <div className="flex gap-1">
                {(['generate', 'correct'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onPanelModeChange(m)}
                    className={`flex-1 text-2xs rounded px-1.5 py-1 transition-colors cursor-pointer ${
                      devPanelMode === m
                        ? 'bg-background-brand-subtle text-text-brand'
                        : 'bg-background-inverse/30 text-text-inverse/70 hover:bg-background-inverse/50'
                    }`}
                  >
                    {m === 'generate' ? '생성' : '교정'}
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
  const [devPanelMode, setDevPanelMode] = useState<'generate' | 'correct'>(
    'generate'
  );
  const [initialPanelMode, setInitialPanelMode] = useState<
    'generate' | 'correct'
  >('generate');
  // 익스텐션은 무제한 — Infinity로 설정해 소진 로직 비활성화
  const [remainingCount] = useState(Infinity);
  const [errorVariant, setErrorVariant] = useState<ErrorVariant>('generic');

  // 레이트리밋: 1분 내 최대 5회
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // 약관 동의 전까지 id_token을 임시 보관
  const pendingIdTokenRef = useRef<string | null>(null);

  // 현재 활성 Gmail 탭 ID — 메시지 전송 대상 특정용
  const activeTabIdRef = useRef<number | null>(null);

  // ── 앱 초기화: 저장된 토큰 확인 + 활성 탭 ID 저장 ──────────────

  useEffect(() => {
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const tabId = tabs[0]?.id ?? null;
        activeTabIdRef.current = tabId;

        if (tabId) {
          chrome.tabs.sendMessage(tabId, { type: 'PANEL_OPENED' });
          // 패널 닫힐 때(언로드) content script에 알림
          window.addEventListener(
            'unload',
            () => {
              chrome.runtime.sendMessage({ type: 'PANEL_UNLOADED', tabId });
            },
            { once: true }
          );
        }

        getStoredToken()
          .then((token) => {
            if (!token) return;
            // 이미 로그인된 상태로 패널 오픈 → Gmail 본문 확인 후 초기 모드 결정
            if (tabId) {
              chrome.tabs.sendMessage(
                tabId,
                { type: 'GET_EMAIL_CONTENT' },
                (response) => {
                  if (!chrome.runtime.lastError) {
                    const content = (response?.content ?? '').trim();
                    console.error(
                      '[ToneFit] 본문 글자수:',
                      content.length,
                      '/ 내용 미리보기:',
                      content.slice(0, 60)
                    );
                    const hasContent = content.length >= 40;
                    setInitialPanelMode(hasContent ? 'correct' : 'generate');
                  } else {
                    console.error(
                      '[ToneFit] GET_EMAIL_CONTENT 실패:',
                      chrome.runtime.lastError.message
                    );
                  }
                  setScreen('main');
                }
              );
            } else {
              setScreen('main');
            }
          })
          .catch(console.error)
          .finally(() => setIsLoading(false));
      })
      .catch(() => setIsLoading(false));
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
    // Gmail 본문 내용 유무에 따라 초기 모드 결정 → 결정 후 화면 전환
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) {
          setScreen('main');
          if (showTip) setShowTooltip(true);
          return;
        }
        chrome.tabs.sendMessage(
          tabId,
          { type: 'GET_EMAIL_CONTENT' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                '[ToneFit] GET_EMAIL_CONTENT 실패:',
                chrome.runtime.lastError.message
              );
            } else {
              const content = (response?.content ?? '').trim();
              console.error(
                '[ToneFit] 본문 글자수:',
                content.length,
                '/ 내용 미리보기:',
                content.slice(0, 60)
              );
              const hasContent = content.length >= 40;
              setInitialPanelMode(hasContent ? 'correct' : 'generate');
            }
            setScreen('main');
            if (showTip) setShowTooltip(true);
          }
        );
      })
      .catch(() => {
        setScreen('main');
        if (showTip) setShowTooltip(true);
      });
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

  /** Gmail 작성창 본문과 제목을 content script에서 읽어옴 */
  const getEmailContentFromGmail = useCallback((): Promise<{
    content: string;
    subject: string;
  }> => {
    return new Promise((resolve, reject) => {
      const tabId = activeTabIdRef.current;
      if (!tabId) {
        reject(new Error('활성 탭을 찾을 수 없습니다'));
        return;
      }
      chrome.tabs.sendMessage(
        tabId,
        { type: 'GET_EMAIL_CONTENT' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve({
            content: response?.content ?? '',
            subject: response?.subject ?? '',
          });
        }
      );
    });
  }, []);

  /** 교정 시작 전 본문 길이 사전 검증 — 10자 미만이면 _tooShort throw */
  const handlePreCheck = useCallback(async () => {
    const { content } = await getEmailContentFromGmail();
    if (content.trim().length < 10) {
      throw Object.assign(new Error('EMAIL_TOO_SHORT'), { _tooShort: true });
    }
  }, [getEmailContentFromGmail]);

  const handleRequest = useCallback(
    async (params: GenerateParams): Promise<GenerateResult> => {
      const tabId = activeTabIdRef.current;
      chrome.runtime.sendMessage({ type: 'GENERATION_START', tabId });

      try {
        // 교정 모드: Gmail 본문 읽어서 교정 API 호출 → 리뷰 뷰로 전환
        if (params.correctionMode) {
          const { content: originalEmail } = await getEmailContentFromGmail();
          const response = await postCorrection({
            receiver_type: params.receiver,
            purpose: params.purpose,
            original_email: originalEmail,
          });
          // 오버레이는 리뷰 완료(onSuccess) 시점에 제거 — 여기선 유지
          chrome.runtime.sendMessage({ type: 'GENERATION_ERROR', tabId }); // 오버레이 해제
          return {
            type: 'correction' as const,
            changes: response.changes,
            originalEmail,
            receiver: params.receiver,
            purpose: params.purpose,
          };
        }

        // 생성 모드
        const response = await postGeneration({
          receiver_type: params.receiver,
          purpose: params.purpose,
          brief_content: params.emailText,
        });
        return {
          type: 'email' as const,
          subject: response.generated_subject,
          content: response.generated_email.replace(/\\n/g, '\n'),
        };
      } catch (err) {
        chrome.runtime.sendMessage({ type: 'GENERATION_ERROR', tabId });
        throw err;
      }
    },
    [getEmailContentFromGmail]
  );

  /** 에러 종류 판별 — ToneFitPanel의 onError 콜백에서 호출 */
  const handleError = useCallback((err: unknown) => {
    const sessionExpired = (err as { _sessionExpired?: boolean })
      ?._sessionExpired;
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[ToneFit] handleError:', {
      sessionExpired,
      status,
      errMsg,
      err,
    });

    if (sessionExpired) {
      setErrorVariant('session_expired');
      return;
    }
    if (status === 429) {
      setErrorVariant('rate_limited');
      return;
    }
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

  const handleCorrectionsRejected = useCallback(
    (
      items: CorrectionsRejectionItem[],
      receiver: ReceiverType,
      purpose: PurposeType
    ) => {
      const payload = { receiver_type: receiver, purpose, items };
      console.error(
        '[ToneFit] corrections/rejections 전송:',
        JSON.stringify(payload, null, 2)
      );
      postCorrectionsRejections(payload)
        .then((res) =>
          console.error('[ToneFit] corrections/rejections 응답:', res)
        )
        .catch(console.error);
    },
    []
  );

  const handleCancel = useCallback(() => {
    chrome.runtime.sendMessage({
      type: 'GENERATION_ERROR',
      tabId: activeTabIdRef.current,
    });
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
    <div className="w-full h-screen flex flex-col bg-background-page">
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
              onCorrectionsRejected={handleCorrectionsRejected}
              onPreCheck={handlePreCheck}
              initialPanelMode={initialPanelMode}
              devForceView={SHOW_DEV_TOOLBAR ? devView : undefined}
              devPanelMode={SHOW_DEV_TOOLBAR ? devPanelMode : undefined}
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
          devPanelMode={devPanelMode}
          onPanelModeChange={setDevPanelMode}
        />
      )}
    </div>
  );
};

export default Panel;
