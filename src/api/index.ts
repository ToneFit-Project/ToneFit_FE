/**
 * ToneFit API 클라이언트
 *
 * API 명세 v0.53 기준
 *
 * 토큰 정책:
 * - access_token  → localStorage (브라우저 재시작 후에도 유지)
 * - refresh_token → HttpOnly + Secure Cookie (브라우저 자동 송수신)
 *   → FE에서 직접 다루지 않음. `credentials: 'include'`로 자동 처리.
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/constants';
import { devLog, devError } from '@/utils/devLog';
import type {
  // Auth
  GoogleAuthRequest,
  GoogleAuthResponse,
  RefreshResponse,
  // Users
  UserProfile,
  ToggleTermsRequest,
  TermsType,
  // Corrections
  DraftRequest,
  DraftResponse,
  DraftDetailResponse,
  CorrectionRequest,
  CorrectionResponse,
  RejectRequest,
  RejectResponse,
  ConfirmRequest,
  ConfirmResponse,
  // Generations
  GenerationRequest,
  GenerationResponse,
  // History
  InProgressSessionsResponse,
  HistoryResponse,
  HistoryParams,
  SessionDetailResponse,
} from '@/types';

// =============================================================
// Axios 인스턴스 생성
// =============================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // refresh_token HttpOnly Cookie 자동 송수신
  withCredentials: true,
});

// =============================================================
// Visit Session ID
// 탭 단위 세션 식별자 — BE 이벤트 로그에 기록됨
// =============================================================

const VISIT_SESSION_ID = crypto.randomUUID();

// =============================================================
// 요청 인터셉터
// - access_token 헤더 자동 주입
// - X-Visit-Session-Id 헤더 추가
// =============================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers['X-Visit-Session-Id'] = VISIT_SESSION_ID;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any)._startTime = Date.now();
    devLog(
      `[REQ] ${config.method?.toUpperCase()} ${config.url}`,
      config.data ?? ''
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// 응답 인터셉터
// - { success, data, error } 래퍼 자동 unwrap
// - 401: /auth/refresh 호출 후 재요청 (cookie 자동 송신)
// - 401/403 갱신 실패: access_token 삭제 + 홈으로 리다이렉트
// - 429: 그대로 throw
// =============================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

/** access_token 삭제 (refresh_token은 쿠키 — BE 로그아웃 시 만료됨) */
const clearAccessToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

apiClient.interceptors.response.use(
  (response) => {
    // { success: true, data: {...} } 래퍼 unwrap
    if (
      response.data !== null &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }

    const elapsed =
      Date.now() - ((response.config as any)._startTime ?? Date.now());
    devLog(
      `[RES] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${elapsed}ms)`,
      response.data
    );

    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const status: number | undefined = error.response?.status;

    const elapsed =
      Date.now() - ((originalRequest as any)._startTime ?? Date.now());
    devError(
      `[ERR] ${status ?? 'NETWORK'} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${elapsed}ms)`,
      error.response?.data ?? error.message
    );

    // 429 Too Many Requests — 호출부에서 처리
    if (status === 429) {
      return Promise.reject(error);
    }

    // 401 Unauthorized — refresh_token(cookie)으로 갱신 시도
    // /auth/refresh 자체가 401이면 인터셉터에서 처리하지 않음 (App.tsx catch로 전달)
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    if (status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // body 없음 — refresh_token은 cookie로 자동 송신
        const response = await apiClient.post<RefreshResponse>('/auth/refresh');
        const { access_token } = response.data;

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${access_token}`;

        processQueue(null, access_token);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAccessToken();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden
    if (status === 403) {
      const url = originalRequest?.url ?? '';
      const isCorrectionsEndpoint = url.includes('/corrections');
      if (!isCorrectionsEndpoint) {
        clearAccessToken();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

/**
 * Google OAuth 로그인 / 신규 가입 / 게스트 전환
 *
 * 성공 후 access_token을 localStorage에 저장.
 * refresh_token은 Set-Cookie로 자동 관리됨.
 */
export const googleAuth = async (
  data: GoogleAuthRequest
): Promise<GoogleAuthResponse> => {
  const response = await apiClient.post<GoogleAuthResponse>(
    '/auth/google',
    data
  );
  const { access_token } = response.data;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

  return response.data;
};

/**
 * 로그아웃
 *
 * BE에서 refresh_token row 삭제 + cookie 만료 헤더 발급.
 * FE는 access_token만 삭제.
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  clearAccessToken();
};

// =============================================================
// 2. 사용자 (Users)
// =============================================================

/** 내 정보 조회 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
};

/**
 * 선택 약관 토글 (철회 / 재동의)
 * 필수 약관(SERVICE/PRIVACY/ANALYTICS)에는 호출 불가
 */
export const toggleTerms = async (
  type: TermsType,
  data: ToggleTermsRequest
): Promise<void> => {
  await apiClient.patch(`/users/me/terms/${type}`, data);
};

// =============================================================
// 3. 교정 (Corrections)
// =============================================================

/** 임시저장 — 사용자당 1건 유지, PUT으로 덮어쓰기 */
export const saveDraft = async (data: DraftRequest): Promise<DraftResponse> => {
  const response = await apiClient.put<DraftResponse>(
    '/corrections/draft',
    data
  );
  return response.data;
};

/** 임시저장 조회 */
export const getDraft = async (): Promise<DraftDetailResponse> => {
  const response =
    await apiClient.get<DraftDetailResponse>('/corrections/draft');
  return response.data;
};

/** 교정 요청 */
export const requestCorrection = async (
  data: CorrectionRequest
): Promise<CorrectionResponse> => {
  // Gemini AI 교정 처리 → 60초로 연장
  const response = await apiClient.post<CorrectionResponse>(
    '/corrections',
    data,
    { timeout: 60000 }
  );
  return response.data;
};

/** 교정 거부 (사유 포함) */
export const rejectCorrection = async (
  sessionId: number,
  data: RejectRequest
): Promise<RejectResponse> => {
  const response = await apiClient.post<RejectResponse>(
    `/corrections/${sessionId}/reject`,
    data
  );
  return response.data;
};

/** 교정 확정 (송신) */
export const confirmCorrection = async (
  sessionId: number,
  data: ConfirmRequest
): Promise<ConfirmResponse> => {
  const response = await apiClient.post<ConfirmResponse>(
    `/corrections/${sessionId}/confirm`,
    data
  );
  return response.data;
};

// =============================================================
// 4. 생성 (Generations)
// =============================================================

/**
 * 이메일 생성
 *
 * 저장 없음 — 히스토리에 노출되지 않는 일회성 결과.
 * 무료 체험 횟수는 FE/localStorage에서 카운트 (BE 제한 없음).
 */
export const postGeneration = async (
  data: GenerationRequest
): Promise<GenerationResponse> => {
  // Gemini AI 호출 → 60초로 연장
  const response = await apiClient.post<GenerationResponse>(
    '/generations',
    data,
    { timeout: 60000 }
  );
  return response.data;
};

// =============================================================
// 5. 교정 이력 (History)
// =============================================================

/** 미완료 이력 조회 (IN_PROGRESS) */
export const getInProgressSessions =
  async (): Promise<InProgressSessionsResponse> => {
    const response = await apiClient.get<InProgressSessionsResponse>(
      '/corrections/in-progress'
    );
    return response.data;
  };

/** 완료 이력 조회 (CONFIRMED) */
export const getHistory = async (
  params?: HistoryParams
): Promise<HistoryResponse> => {
  const response = await apiClient.get<HistoryResponse>(
    '/corrections/history',
    { params }
  );
  return response.data;
};

/** 교정 이력 상세 조회 */
export const getSessionDetail = async (
  sessionId: number
): Promise<SessionDetailResponse> => {
  const response = await apiClient.get<SessionDetailResponse>(
    `/corrections/${sessionId}`
  );
  return response.data;
};

export default apiClient;
