import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardOverview from "@/pages/DashboardOverview";
import TasksPage from "@/pages/TasksPage";
import MilestonesPage from "@/pages/MilestonesPage";
import FeedbackPage from "@/pages/FeedbackPage";
import FinanceDashboardPage from "@/pages/FinanceDashboardPage";
import InvestorPortalPage from "@/pages/InvestorPortalPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AIInsightsPage from "@/pages/AIInsightsPage";
import PitchGeneratorPage from "@/pages/PitchGeneratorPage";
import TeamPage from "@/pages/TeamPage";
import InvestorFeedPage from "@/pages/InvestorFeedPage";
import MyInvestmentsPage from "@/pages/MyInvestmentsPage";
import SettingsPage from "@/pages/SettingsPage";
import PricingPage from "@/pages/PricingPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";

function ProtectedRoute({ children }) {
  const { user, loading, startups, startupsLoaded } = useAuth();
  if (loading || !startupsLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (startups.length === 0 && window.location.pathname !== '/onboarding') return <Navigate to="/onboarding" />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading, startups, startupsLoaded } = useAuth();
  if (loading || !startupsLoaded) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (user && startups.length > 0) return <Navigate to="/dashboard" />;
  if (user && startups.length === 0) return <Navigate to="/onboarding" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardOverview />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="milestones" element={<MilestonesPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="finance" element={<FinanceDashboardPage />} />
        <Route path="investors" element={<InvestorPortalPage />} />
        <Route path="investor-feed" element={<InvestorFeedPage />} />
        <Route path="my-investments" element={<MyInvestmentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="pitch" element={<PitchGeneratorPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
