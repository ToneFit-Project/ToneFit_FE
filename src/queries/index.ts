/**
 * ToneFit TanStack Query 훅 모음
 *
 * API 명세 v0.53 기준
 *
 * useQuery    → 데이터 조회 (GET) — 캐싱, 자동 갱신 처리
 * useMutation → 데이터 변경 (POST/PUT/PATCH) — 성공 시 캐시 무효화
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { HistoryParams } from '@/types';
import {
  // Users
  getMyProfile,
  toggleTerms,
  // Corrections
  saveDraft,
  getDraft,
  requestCorrection,
  rejectCorrection,
  confirmCorrection,
  // Generations
  postGeneration,
  // History
  getInProgressSessions,
  getHistory,
  getSessionDetail,
} from '@/api';
import type {
  DraftRequest,
  CorrectionRequest,
  RejectRequest,
  ConfirmRequest,
  GenerationRequest,
  ToggleTermsRequest,
  TermsType,
} from '@/types';

// =============================================================
// 사용자 (Users)
// =============================================================

/**
 * 내 프로필 조회
 *
 * 사용 예시:
 * const { data, isLoading } = useMyProfile();
 * data?.plan     // 'FREE' | 'PRO'
 * data?.nickname // Google 프로필 이름
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
  });
};

/**
 * 선택 약관 토글 (철회 / 재동의)
 * 성공 시 프로필 캐시 갱신
 */
export const useToggleTerms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: TermsType;
      data: ToggleTermsRequest;
    }) => toggleTerms(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

// =============================================================
// 임시저장 (Draft)
// =============================================================

/**
 * 임시저장 조회
 * 교정 입력 화면 진입 시 이전에 작성 중이던 내용 불러오기
 */
export const useDraft = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DRAFT,
    queryFn: getDraft,
    retry: false, // 404 (draft 없음)는 에러로 처리하지 않음
  });
};

/**
 * 임시저장 저장
 * 작성 중 자동저장 또는 수동저장에 사용
 */
export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DraftRequest) => saveDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT });
    },
  });
};

// =============================================================
// 교정 (Corrections)
// =============================================================

/**
 * 교정 요청
 * 성공 시 미완료 이력 캐시 갱신 (새 세션 추가됨)
 */
export const useRequestCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CorrectionRequest) => requestCorrection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CORRECTIONS_IN_PROGRESS,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRAFT });
    },
  });
};

/**
 * 교정 거부 (사유 포함)
 * action = REJECTED 즉시 반영. 성공 시 세션 상세 캐시 갱신.
 */
export const useRejectCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: number;
      data: RejectRequest;
    }) => rejectCorrection(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CORRECTION_DETAIL(sessionId),
      });
    },
  });
};

/**
 * 교정 확정 (송신)
 * 성공 시 완료·미완료 이력 캐시 갱신
 */
export const useConfirmCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: number;
      data: ConfirmRequest;
    }) => confirmCorrection(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CORRECTIONS_HISTORY,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CORRECTIONS_IN_PROGRESS,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CORRECTION_DETAIL(sessionId),
      });
    },
  });
};

// =============================================================
// 생성 (Generations)
// =============================================================

/**
 * 이메일 생성
 * 저장 없음 — 히스토리 미노출, 무료 횟수는 FE/localStorage 관리
 */
export const usePostGeneration = () => {
  return useMutation({
    mutationFn: (data: GenerationRequest) => postGeneration(data),
  });
};

// =============================================================
// 교정 이력 (History)
// =============================================================

/** 미완료 이력 조회 (IN_PROGRESS) */
export const useInProgressSessions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CORRECTIONS_IN_PROGRESS,
    queryFn: getInProgressSessions,
  });
};

/**
 * 완료 이력 조회 (CONFIRMED)
 * 페이지네이션 + 필터 지원
 *
 * 사용 예시:
 * const { data } = useHistory({ page: 1, size: 10 });
 * data?.total    // 전체 개수
 * data?.sessions // 현재 페이지 세션 목록
 */
export const useHistory = (params?: HistoryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CORRECTIONS_HISTORY, params],
    queryFn: () => getHistory(params),
    placeholderData: keepPreviousData,
  });
};

/** 교정 이력 상세 조회 */
export const useSessionDetail = (sessionId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.CORRECTION_DETAIL(sessionId),
    queryFn: () => getSessionDetail(sessionId),
    enabled: !!sessionId,
  });
};
