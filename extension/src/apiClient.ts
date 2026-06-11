/**
 * ToneFit Extension — API 클라이언트
 *
 * 메인 앱의 apiClient와 별개로 관리.
 * - 토큰을 chrome.storage.local에서 직접 읽어 헤더에 주입
 * - async 인터셉터 미사용 (익스텐션 환경 안정성)
 * - 401 시 window.location 리다이렉트 없이 그대로 throw
 */

import axios from 'axios';
import { getStoredToken } from '@ext/auth';
import type {
  GenerationRequest,
  GenerationResponse,
  TermsType,
  UserProfile,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL as string;

/** auth 헤더 포함한 기본 헤더 반환 */
const buildHeaders = async (): Promise<Record<string, string>> => {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('[ToneFit API] 저장된 토큰 없음 — 비인증 요청으로 진행');
  }
  return headers;
};

/** API 응답 { success, data } 래퍼 unwrap */
const unwrap = <T>(data: unknown): T => {
  if (
    data !== null &&
    typeof data === 'object' &&
    'success' in data &&
    'data' in data
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

// =============================================================
// API 함수
// =============================================================

/** 내 정보 조회 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const headers = await buildHeaders();
  const response = await axios.get<unknown>(`${API_URL}/users/me`, { headers });
  return unwrap<UserProfile>(response.data);
};

/** 선택 약관 토글 (MARKETING / AI_LEARNING) */
export const toggleTerms = async (
  type: TermsType,
  agreed: boolean
): Promise<void> => {
  const headers = await buildHeaders();
  await axios.patch(
    `${API_URL}/users/me/terms/${type}`,
    { agreed },
    { headers }
  );
};

/** 이메일 생성 */
export const postGeneration = async (
  data: GenerationRequest
): Promise<GenerationResponse> => {
  const headers = await buildHeaders();
  console.error('[ToneFit API] postGeneration 요청', data);

  const response = await axios.post<unknown>(`${API_URL}/generations`, data, {
    headers,
    timeout: 60000,
  });

  console.error(
    '[ToneFit API] postGeneration 응답',
    response.status,
    response.data
  );
  return unwrap<GenerationResponse>(response.data);
};
