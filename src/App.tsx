import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import apiClient from '@/api';
// ─────────────────────────────────────────────────────────────────
// import 페이지
// home - 공용레이아웃, 교정시작, 교정로딩, 교정비교, 교정완료(로딩), 교정결과
import Layout from '@/components/layout/Layout';
import JoinAcceptPage from '@/pages/auth/JoinAcceptPage';
import EditorPage from '@/pages/home/EditorPage';
import EditorProcessingPage from '@/pages/home/EditorProcessingPage';
import EditorResultPage from '@/pages/home/EditorResultPage';
import EditorConfirmLoadingPage from '@/pages/home/EditorConfirmLoadingPage';
import EditorDonePage from '@/pages/home/EditorDonePage';
// ─────────────────────────────────────────────────────────────────
// [DEV ONLY] 컴포넌트 확인 페이지
import ComponentPage from '@/pages/dev/ComponentPage';
// ─────────────────────────────────────────────────────────────────
// 데모 페이지 (크롬 익스텐션 웹 데모)
import DemoPage from '@/pages/demo/DemoPage';
// ─────────────────────────────────────────────────────────────────

/**
 * App
 *
 * 애플리케이션 최상위 라우팅을 정의합니다.
 *
 * 라우트 구조:
 *
 * /                         → /home/editor 로 리다이렉트 (임시)
 *
 * [AuthLayout] — 인증 카드 레이아웃
 *   /auth                   → LoginPage
 *   /join/accept            → JoinAcceptPage  (약관 동의)
 *   /join/info              → JoinInfoPage    (회원 정보 입력)
 *
 * [Layout]
 *   /home                   → DashboardPage
 *   /home/editor            → EditorPage
 *   /home/editor/processing → EditorProcessingPage
 *   /home/editor/result     → EditorResultPage
 *   /home/history           → HistoryPage
 *   /home/settings          → SettingsPage
 *   /home/pricing           → PricingPage
 *
 * TODO: 로그인 여부에 따른 ProtectedRoute / GuestRoute 구현
 */
const App = () => {
  // StrictMode 이중 호출 방지용 플래그
  const issuedRef = useRef(false);

  useEffect(() => {
    // 이미 유효한 access_token이 있으면 불필요
    const existingToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (existingToken) return;

    // StrictMode에서 effect가 두 번 실행되는 것 방지
    if (issuedRef.current) return;
    issuedRef.current = true;

    // refresh_token 쿠키로 access_token 재발급 시도 (로그인된 Extension 사용자)
    // 실패 시 그냥 진행 — 웹 데모는 인증 없이 POST /generations 직접 호출
    const initSession = async () => {
      try {
        const { data } = await apiClient.post<{ access_token: string }>(
          '/auth/refresh'
        );
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${data.access_token}`;
      } catch {
        // refresh_token 없음 (미로그인 / 데모 사용자) → 인증 없이 진행
      }
    };

    initSession();
  }, []);

  return (
    <Routes>
      {/* 루트 경로: 데모 페이지로 리다이렉트 */}
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.DEMO} replace />}
      />

      {/* ── 약관 동의 라우트 (Google OAuth 흐름에서 자동 진입) ── */}
      {/* AuthLayout은 디자인 확정 후 적용 예정 */}
      <Route path={ROUTES.JOIN_ACCEPT} element={<JoinAcceptPage />} />

      {/* MVP를 위한 임시삭제 */}
      {/* ── 나머지 인증 라우트 (로그인 버튼 구현 시 활성화) ── */}
      {/* <Route element={<AuthLayout variant="center" />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>
      <Route element={<AuthLayout variant="top" />}>
        <Route path={ROUTES.JOIN_INFO} element={<JoinInfoPage />} />
        <Route path={ROUTES.JOIN_COMPLETE} element={<JoinCompletePage />} />
      </Route> */}

      {/* ── 홈 라우트 ────────────────────────────────────── */}

      <Route element={<Layout />}>
        {/* 홈 경로: 교정하기로 임시 리다이렉트 */}
        {/* <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} /> */}
        <Route
          path={ROUTES.DASHBOARD}
          element={<Navigate to={ROUTES.EDITOR} replace />}
        />
        <Route path={ROUTES.EDITOR} element={<EditorPage />} />
        <Route
          path={ROUTES.EDITOR_PROCESSING}
          element={<EditorProcessingPage />}
        />
        <Route path={ROUTES.EDITOR_RESULT} element={<EditorResultPage />} />
        <Route
          path={ROUTES.EDITOR_CONFIRM_LOADING}
          element={<EditorConfirmLoadingPage />}
        />
        <Route path={ROUTES.EDITOR_DONE} element={<EditorDonePage />} />
        {/* MVP를 위한 임시삭제 */}
        {/* <Route path={ROUTES.HISTORY} element={<HistoryPage />} /> */}
        {/* <Route path={ROUTES.SETTINGS} element={<SettingsPage />} /> */}
        {/* <Route path={ROUTES.PRICING} element={<PricingPage />} /> */}
        <Route
          path={ROUTES.HISTORY}
          element={<Navigate to={ROUTES.EDITOR} replace />}
        />
        <Route
          path={ROUTES.SETTINGS}
          element={<Navigate to={ROUTES.EDITOR} replace />}
        />
        <Route
          path={ROUTES.PRICING}
          element={<Navigate to={ROUTES.EDITOR} replace />}
        />
      </Route>

      {/* ── [DEV ONLY] 컴포넌트 확인 페이지 ───────────────────
          ⚠️  프로덕션 배포 전 아래 Route를 주석 처리하세요.
          (위의 import ComponentPage도 함께 주석 처리)
          빌드 사이즈 최소화를 위해 두 줄 모두 비활성화합니다. */}
      <Route path="/dev/components" element={<ComponentPage />} />
      {/* ────────────────────────────────────────────────────── */}

      {/* ── 데모 페이지 (크롬 익스텐션 웹 데모) ──────────────── */}
      <Route path={ROUTES.DEMO} element={<DemoPage />} />
      {/* ────────────────────────────────────────────────────── */}
    </Routes>
  );
};

export default App;
