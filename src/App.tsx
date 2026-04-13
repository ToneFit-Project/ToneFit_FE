import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '@/components/layout/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import JoinAcceptPage from '@/pages/auth/JoinAcceptPage';
import JoinInfoPage from '@/pages/auth/JoinInfoPage';
import DashboardPage from '@/pages/home/DashboardPage';
import EditorPage from '@/pages/home/EditorPage';
import EditorProcessingPage from '@/pages/home/EditorProcessingPage';
import EditorResultPage from '@/pages/home/EditorResultPage';
import HistoryPage from '@/pages/home/HistoryPage';
import SettingsPage from '@/pages/home/SettingsPage';
import PricingPage from '@/pages/home/PricingPage';
import { ROUTES } from '@/constants';

/**
 * App
 *
 * 애플리케이션 최상위 라우팅을 정의합니다.
 *
 * 라우트 구조:
 *
 * /                         → /auth 로 리다이렉트 (임시)
 *
 * [AuthLayout] — 인증 카드 레이아웃
 *   /auth                   → LoginPage
 *   /join/accept            → JoinAcceptPage  (약관 동의)
 *   /join/info              → JoinInfoPage    (회원 정보 입력)
 *
 * [홈 — 레이아웃 미정]
 *   /home                   → DashboardPage
 *   /home/editor            → EditorPage
 *   /home/editor/processing → EditorProcessingPage
 *   /home/editor/result     → EditorResultPage
 *   /home/history           → HistoryPage
 *   /home/settings          → SettingsPage
 *   /home/pricing           → PricingPage
 *
 * TODO: 로그인 여부에 따른 ProtectedRoute / GuestRoute 구현
 * TODO: 홈 영역 공통 레이아웃(헤더·사이드바) 추가
 */
const App = () => {
  return (
    <Routes>
      {/* ── 인증 라우트 (AuthLayout 적용) ────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.JOIN_ACCEPT} element={<JoinAcceptPage />} />
        <Route path={ROUTES.JOIN_INFO} element={<JoinInfoPage />} />
      </Route>

      {/* ── 홈 라우트 ────────────────────────────────────── */}
      {/* TODO: HomeLayout(헤더·사이드바)으로 감싸기 */}
      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
      <Route path={ROUTES.EDITOR} element={<EditorPage />} />
      <Route
        path={ROUTES.EDITOR_PROCESSING}
        element={<EditorProcessingPage />}
      />
      <Route path={ROUTES.EDITOR_RESULT} element={<EditorResultPage />} />
      <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      <Route path={ROUTES.PRICING} element={<PricingPage />} />

      {/* 루트 경로: 로그인으로 임시 리다이렉트 */}
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
};

export default App;
