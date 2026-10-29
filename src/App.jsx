import { Suspense, lazy, useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import TargetCursor from "@/components/ui/TargetCursor";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Keep landing page eagerly loaded for instant initial render
import Home from '@/pages/Home';

// Lazy-load secondary and dashboard pages for optimal bundle and memory performance
const Legal = lazy(() => import('@/pages/Legal'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const DashboardShell = lazy(() => import('@/components/app/DashboardShell'));
const Overview = lazy(() => import('@/pages/dashboard/Overview'));
const Agents = lazy(() => import('@/pages/dashboard/Agents'));
const Calls = lazy(() => import('@/pages/dashboard/Calls'));
const Memory = lazy(() => import('@/pages/dashboard/Memory'));
const Tasks = lazy(() => import('@/pages/dashboard/Tasks'));
const Integrations = lazy(() => import('@/pages/dashboard/Integrations'));
const Settings = lazy(() => import('@/pages/dashboard/Settings'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#05060f]/60 backdrop-blur-sm">
    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingFallback />;
  }

  // Handle authentication errors - only redirect on protected routes, not public routes
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/privacy', '/terms'];
      if (!publicPaths.includes(location.pathname)) {
        navigateToLogin();
        return null;
      }
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <ProtectedRoute unauthenticatedElement={<Navigate to="/login?returnTo=%2Fdashboard" replace />} />
          }
        >
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="agents" element={<Agents />} />
            <Route path="calls" element={<Calls />} />
            <Route path="memory" element={<Memory />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <TargetCursor
        spinDuration={2}
        hoverDuration={0.2}
        size={36}
        cornerSize={12}
        thickness={3}
        padding={6}
        dotSize={4}
        cursorColor="#ffffff"
        cursorColorOnTarget="#00f2fe"
        blendMode="normal"
        parallaxOn
        matchRadius
        showLabel
        clickEffect
        hideDefaultCursor
      />
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
}

export default App