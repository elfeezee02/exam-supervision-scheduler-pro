import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ESSProvider, useESSS } from "./context/ESSContext";
import { useAuth } from "@/hooks/useAuth";
import LoginSelection from "./pages/LoginSelection";
import AdminLogin from "./components/auth/AdminLogin";
import SupervisorLogin from "./components/auth/SupervisorLogin";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import Supervisors from "./pages/Supervisors";
import Venues from "./pages/Venues";
import Schedules from "./pages/Schedules";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentUser } = useESSS();
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!authUser && !currentUser ? (
        <>
          <Route path="/" element={<LoginSelection />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/supervisor-login" element={<SupervisorLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : authUser?.role === 'supervisor' ? (
        <>
          <Route path="/" element={<Navigate to="/supervisor-dashboard" replace />} />
          <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor-login" element={<Navigate to="/supervisor-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/supervisor-dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="supervisors" element={<Supervisors />} />
            <Route path="venues" element={<Venues />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ESSProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ESSProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
