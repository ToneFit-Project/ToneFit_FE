import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import apiClient from '@/api';
import LandingPage from '@/pages/landing/LandingPage';
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
// ── 약관·정책 페이지 ──────────────────────────────────────────────
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import BehavioralDataPage from '@/pages/legal/BehavioralDataPage';
import MarketingConsentPage from '@/pages/legal/MarketingConsentPage';
import AiQualityConsentPage from '@/pages/legal/AiQualityConsentPage';
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
  useEffect(() => {
    // 저장된 access_token이 있으면 Axios 헤더에 주입 (Google OAuth 로그인 후 유지)
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    AOS.init({ once: false, duration: 600, easing: 'ease-out', offset: 80 });
  }, []);

  return (
    <Routes>
      {/* ── 랜딩 페이지 ── */}
      <Route path="/" element={<LandingPage />} />

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

      {/* ── 약관·정책 페이지 ────────────────────────────────── */}
      <Route path={ROUTES.TERMS} element={<TermsPage />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
      <Route path={ROUTES.BEHAVIORAL_DATA} element={<BehavioralDataPage />} />
      <Route
        path={ROUTES.MARKETING_CONSENT}
        element={<MarketingConsentPage />}
      />
      <Route
        path={ROUTES.AI_QUALITY_CONSENT}
        element={<AiQualityConsentPage />}
      />
      {/* ────────────────────────────────────────────────────── */}
    </Routes>
  );
};

export default App;
