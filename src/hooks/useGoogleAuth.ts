/**
 * useGoogleAuth
 *
 * Google Identity Services(GIS) SDK를 로드하고
 * Google OAuth 로그인 흐름을 처리하는 커스텀 훅입니다.
 *
 * 흐름:
 *   1. 컴포넌트 마운트 시 GIS 스크립트를 동적으로 로드
 *   2. 스크립트 로드 완료 → SDK 초기화
 *   3. renderButton(element) 호출 → Google 로그인 버튼 렌더링
 *      또는 signIn() 호출 → One Tap 프롬프트 표시
 *   4. Google 콜백 수신 (id_token)
 *      a. POST /auth/google { id_token }
 *      b. 200/201 성공 → DASHBOARD로 이동
 *      c. 400 TERMS_AGREEMENT_REQUIRED
 *         → id_token을 sessionStorage에 임시 저장
 *         → /join/accept 로 이동 (약관 동의 후 재요청)
 *
 * 환경변수:
 *   VITE_GOOGLE_CLIENT_ID — Google Cloud Console OAuth 2.0 클라이언트 ID
 */

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { googleAuth } from '@/api';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { devError } from '@/utils/devLog';

// =============================================================
// Google Identity Services 타입 선언
// =============================================================

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GisInitConfig) => void;
          prompt: (
            momentListener?: (notification: GisPromptMoment) => void
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: GisButtonOptions
          ) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GisInitConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GisPromptMoment {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface GisButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  locale?: string;
}

// =============================================================
// 상수
// =============================================================

const GSI_SCRIPT_ID = 'google-gsi-script';
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const TERMS_VERSION = '1.0';

// =============================================================
// 훅
// =============================================================

export interface UseGoogleAuthReturn {
  /** Google 표준 로그인 버튼을 지정한 DOM 엘리먼트에 렌더링합니다 */
  renderButton: (element: HTMLElement, options?: GisButtonOptions) => void;
  /**
   * One Tap 프롬프트를 직접 띄웁니다.
   * Google 정책에 따라 표시 안 될 수 있습니다.
   */
  signIn: () => void;
  /** SDK 초기화 완료 여부 */
  isReady: boolean;
}

const useGoogleAuth = (): UseGoogleAuthReturn => {
  const navigate = useNavigate();
  const isReadyRef = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // ── Google 콜백 핸들러 ─────────────────────────────────────────
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      const idToken = response.credential;

      try {
        await googleAuth({ id_token: idToken });

        // 성공: 임시 저장 토큰 정리 후 홈으로 이동
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_ID_TOKEN);
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const code: string | undefined = error.response?.data?.error?.code;

          if (
            error.response?.status === 400 &&
            code === 'TERMS_AGREEMENT_REQUIRED'
          ) {
            // 약관 동의 필요 → id_token 임시 저장 후 약관 동의 페이지로 이동
            sessionStorage.setItem(STORAGE_KEYS.PENDING_ID_TOKEN, idToken);
            navigate(ROUTES.JOIN_ACCEPT);
            return;
          }
        }

        devError('[useGoogleAuth] 로그인 실패:', error);
      }
    },
    [navigate]
  );

  // ── GIS 스크립트 동적 로드 & SDK 초기화 ───────────────────────
  useEffect(() => {
    if (!clientId) {
      devError(
        '[useGoogleAuth] VITE_GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.'
      );
      return;
    }

    const initializeSdk = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      isReadyRef.current = true;
    };

    // 이미 스크립트가 로드된 경우 바로 초기화
    if (window.google?.accounts?.id) {
      initializeSdk();
      return;
    }

    // 스크립트 중복 삽입 방지
    if (document.getElementById(GSI_SCRIPT_ID)) {
      // 스크립트는 있지만 아직 로드 중 — onload 대기
      const existing = document.getElementById(
        GSI_SCRIPT_ID
      ) as HTMLScriptElement;
      const originalOnload = existing.onload;
      existing.onload = (event) => {
        if (typeof originalOnload === 'function')
          originalOnload.call(existing, event);
        initializeSdk();
      };
      return;
    }

    // 스크립트 태그 생성 및 삽입
    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = initializeSdk;
    script.onerror = () => {
      devError('[useGoogleAuth] Google Identity Services 스크립트 로드 실패');
    };
    document.head.appendChild(script);
  }, [clientId, handleCredentialResponse]);

  // ── 공개 API ──────────────────────────────────────────────────

  /** Google 표준 버튼 렌더링 */
  const renderButton = useCallback(
    (element: HTMLElement, options: GisButtonOptions = {}) => {
      if (!window.google?.accounts?.id) {
        devError('[useGoogleAuth] SDK가 아직 로드되지 않았습니다.');
        return;
      }
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        locale: 'ko',
        ...options,
      });
    },
    []
  );

  /** One Tap / 팝업 프롬프트 직접 트리거 */
  const signIn = useCallback(() => {
    if (!window.google?.accounts?.id) {
      devError('[useGoogleAuth] SDK가 아직 로드되지 않았습니다.');
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        devError(
          '[useGoogleAuth] One Tap 표시 불가:',
          notification.getNotDisplayedReason()
        );
      }
      if (notification.isSkippedMoment()) {
        devError(
          '[useGoogleAuth] One Tap 스킵:',
          notification.getSkippedReason()
        );
      }
    });
  }, []);

  return {
    renderButton,
    signIn,
    get isReady() {
      return isReadyRef.current;
    },
  };
};

export { TERMS_VERSION };
export default useGoogleAuth;
