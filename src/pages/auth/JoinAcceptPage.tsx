import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import TitleText from '@/components/ui/TitleText';
import Stepper from '@/components/ui/Stepper';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { googleAuth } from '@/api';
import { TERMS_VERSION } from '@/hooks/useGoogleAuth';
import type { TermsType, TermsAgreement } from '@/types';
import { devError } from '@/utils/devLog';

// ── 타입 ──────────────────────────────────────────────────────────

/**
 * 약관 동의 체크 상태
 * v0.53 기준 — 5개 약관
 *   필수: SERVICE / PRIVACY / ANALYTICS
 *   선택: MARKETING / AI_LEARNING
 */
type TermsState = Record<TermsType, boolean>;

/**
 * 약관 목록 항목 단위
 */
interface AgreeTermItem {
  key: TermsType;
  type: '필수' | '선택';
  label: string;
}

// ── 상수 ──────────────────────────────────────────────────────────

/** 약관 동의 항목 목록 (렌더링 순서) */
const AGREE_TERMS: AgreeTermItem[] = [
  { key: 'SERVICE', type: '필수', label: '서비스 이용 약관 동의' },
  { key: 'PRIVACY', type: '필수', label: '개인정보 수집 및 이용 동의' },
  { key: 'ANALYTICS', type: '필수', label: '서비스 개선을 위한 분석 동의' },
  { key: 'MARKETING', type: '선택', label: '마케팅 정보 수신 동의' },
  { key: 'AI_LEARNING', type: '선택', label: 'AI 학습 활용 동의' },
];

/** 필수 약관 키 목록 */
const REQUIRED_KEYS: TermsType[] = ['SERVICE', 'PRIVACY', 'ANALYTICS'];

// ── 초기 상태 ─────────────────────────────────────────────────────

const INITIAL_TERMS: TermsState = {
  SERVICE: false,
  PRIVACY: false,
  ANALYTICS: false,
  MARKETING: false,
  AI_LEARNING: false,
  MAIL_READ: false,
};

// ── 내부 서브 컴포넌트 ────────────────────────────────────────────

/**
 * CheckBoldIcon
 *
 * 약관 동의 체크 상태를 나타내는 볼드 체크마크 아이콘입니다.
 * Figma 기준: iconamoon:check-bold
 *
 * 색상 규칙:
 * - checked=true  → var(--color-text-primary)  (진한 색)
 * - checked=false → var(--color-text-disabled) (연한 회색)
 */
const CheckBoldIcon = ({ checked }: { checked: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{
      color: checked
        ? 'var(--color-text-primary)'
        : 'var(--color-text-disabled)',
      flexShrink: 0,
    }}
  >
    <path
      d="M4 13L9.5 18.5L20 6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ChevronRightIcon
 *
 * 약관 상세 보기 버튼의 오른쪽 화살표 아이콘입니다.
 */
const ChevronRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="var(--color-icon-tertiary)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── 메인 컴포넌트 ─────────────────────────────────────────────────

/**
 * JoinAcceptPage
 *
 * 회원가입 - 약관 동의 페이지입니다.
 * 경로: /join/accept
 *
 * 진입 경로:
 *   Google OAuth 성공 후 BE에서 400 TERMS_AGREEMENT_REQUIRED를 반환하면
 *   useGoogleAuth 훅이 id_token을 sessionStorage(PENDING_ID_TOKEN)에 임시 저장하고
 *   이 페이지로 이동합니다.
 *
 * 약관 구성 (v0.53):
 *   필수: SERVICE / PRIVACY / ANALYTICS
 *   선택: MARKETING / AI_LEARNING
 *
 * 제출 흐름:
 *   1. sessionStorage에서 PENDING_ID_TOKEN 읽기
 *   2. POST /auth/google { id_token, terms_agreements } 호출
 *   3. 성공(200/201) → PENDING_ID_TOKEN 삭제 + DASHBOARD로 이동
 *   4. 실패 → 에러 표시 (TODO: 에러 UI 디자인 후 구체화)
 *
 * 상태:
 *   terms        — 약관별 동의 여부 (5개)
 *   isSubmitting — API 호출 중 여부 (버튼 비활성)
 *   errorMsg     — 에러 메시지
 *   agreeAll     — 전체 동의 여부 (모두 동의 버튼 상태)
 *   canProceed   — 필수 3개 모두 동의 여부 (다음 버튼 활성)
 */
const JoinAcceptPage = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState<TermsState>(INITIAL_TERMS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 필수 약관 전체 동의 여부 — 다음 버튼 활성 기준 */
  const canProceed = REQUIRED_KEYS.every((key) => terms[key]);

  /** 전체 동의 여부 — 모두 동의 버튼 상태 기준 */
  const agreeAll = AGREE_TERMS.every((item) => terms[item.key]);

  // ── 핸들러 ────────────────────────────────────────────────────

  /** 모두 동의 / 해제 */
  const handleCheckAll = () => {
    const next = !agreeAll;
    const updated = AGREE_TERMS.reduce<TermsState>(
      (acc, item) => ({ ...acc, [item.key]: next }),
      {} as TermsState
    );
    setTerms(updated);
  };

  /** 개별 약관 토글 */
  const handleToggle = (key: TermsType) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * 약관 동의 제출
   * sessionStorage의 PENDING_ID_TOKEN으로 POST /auth/google 재요청
   */
  const handleSubmit = async () => {
    if (!canProceed || isSubmitting) return;

    const idToken = sessionStorage.getItem(STORAGE_KEYS.PENDING_ID_TOKEN);
    if (!idToken) {
      setErrorMsg('Google 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }

    const termsAgreements: TermsAgreement[] = AGREE_TERMS.map((item) => ({
      type: item.key,
      version: TERMS_VERSION,
      agreed: terms[item.key],
    }));

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await googleAuth({
        id_token: idToken,
        terms_agreements: termsAgreements,
      });

      // 성공 — 임시 토큰 정리 후 홈으로 이동
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_ID_TOKEN);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code: string | undefined = error.response?.data?.error?.code;

        if (error.response?.status === 400 && code === 'INVALID_REQUEST') {
          setErrorMsg('요청 형식이 올바르지 않습니다. 다시 시도해 주세요.');
        } else if (error.response?.status === 401) {
          // id_token 만료 — Google 재로그인 필요
          sessionStorage.removeItem(STORAGE_KEYS.PENDING_ID_TOKEN);
          setErrorMsg(
            'Google 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.'
          );
        } else {
          setErrorMsg('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } else {
        setErrorMsg('알 수 없는 오류가 발생했습니다.');
      }

      devError('[JoinAcceptPage] 약관 동의 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 이전 / 다음 내비게이션 핸들러 */
  const handleNavigation = (val: string) => {
    if (val === 'prev') {
      navigate(ROUTES.LOGIN);
    }
    if (val === 'next') {
      handleSubmit();
    }
  };

  return (
    <div className="join-accept max-w-135 w-full flex flex-col gap-16 items-center">
      {/* ── 진행 단계 표시 ─────────────────────────────────── */}
      <Stepper step={1} />

      {/* ── 페이지 제목 + 안내 문구 ──────────────────────── */}
      <TitleText
        heading="약관 동의"
        subtitle="톤핏 서비스 시작 및 가입을 위해 정보 제공에 동의해주세요."
      />

      {/* ── 약관 동의 영역 ─────────────────────────────────── */}
      <div className="w-full flex flex-col gap-5">
        {/* ── 모두 동의 버튼 ──────────────────────────────── */}
        <button
          type="button"
          onClick={handleCheckAll}
          aria-pressed={agreeAll}
          className="
            w-full h-16.5 rounded-2xl
            bg-background-muted
            flex items-center justify-center gap-2.5
            transition-colors
            relative
            px-5
          "
        >
          <span className="absolute left-5">
            <CheckBoldIcon checked={agreeAll} />
          </span>
          <span
            className={`
              text-2xl font-bold leading-8 tracking-tight
              ${agreeAll ? 'text-text-primary' : 'text-text-tertiary'}
            `}
          >
            약관에 모두 동의합니다
          </span>
        </button>

        {/* ── 개별 약관 항목 목록 ─────────────────────────── */}
        <div className="w-full flex flex-col gap-2.5">
          {AGREE_TERMS.map((term, index) => {
            /**
             * 구분선: 첫 번째 선택 약관 앞에만 표시
             * AGREE_TERMS 순서상 index===3 이 MARKETING(첫 번째 선택)
             */
            const isFirstOptional =
              term.type === '선택' && AGREE_TERMS[index - 1]?.type === '필수';

            return (
              <div key={term.key}>
                {isFirstOptional && (
                  <div
                    className="w-full border-t border-border-default mb-2.5"
                    aria-hidden="true"
                  />
                )}

                {/* 약관 항목 행 */}
                <div className="flex items-center justify-between h-11.5 px-5 py-2.5">
                  {/* 좌측 — 체크 아이콘 + 약관 라벨 */}
                  <button
                    type="button"
                    onClick={() => handleToggle(term.key)}
                    className="flex items-center gap-2.5 flex-1 text-left"
                    aria-pressed={terms[term.key]}
                    aria-label={`(${term.type}) ${term.label} ${terms[term.key] ? '동의 취소' : '동의'}`}
                  >
                    <CheckBoldIcon checked={terms[term.key]} />

                    <span className="text-lg font-semibold leading-6.5 tracking-tight whitespace-nowrap">
                      <span
                        className={
                          terms[term.key]
                            ? 'text-text-primary'
                            : term.type === '선택'
                              ? 'text-text-disabled'
                              : 'text-text-secondary'
                        }
                      >
                        ({term.type})
                      </span>
                      <span
                        className={
                          terms[term.key]
                            ? 'text-text-primary'
                            : 'text-text-disabled'
                        }
                      >
                        {' '}
                        {term.label}
                      </span>
                    </span>
                  </button>

                  {/* 우측 — 상세 보기 버튼 */}
                  {/* TODO: 약관 상세 모달 또는 별도 페이지로 연결 */}
                  <button
                    type="button"
                    className="shrink-0 ml-2.5"
                    aria-label={`${term.label} 자세히 보기`}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 에러 메시지 ─────────────────────────────────────── */}
      {errorMsg && (
        <p className="w-full text-sm text-text-danger text-center">
          {errorMsg}
        </p>
      )}

      {/* ── 이전 / 다음 내비게이션 버튼 ──────────────────── */}
      <ButtonGroup
        options={[
          { value: 'prev', label: '이전' },
          { value: 'next', label: isSubmitting ? '처리 중...' : '다음' },
        ]}
        value={canProceed && !isSubmitting ? 'next' : ''}
        onChange={handleNavigation}
        className="w-full"
      />
    </div>
  );
};

export default JoinAcceptPage;
