import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ESSProvider, useESSS } from "./context/ESSContext";
import LoginSelection from "./pages/LoginSelection";
import AdminLogin from "./components/auth/AdminLogin";
import SupervisorLogin from "./components/auth/SupervisorLogin";
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
  
  return (
    <Routes>
      {/* Authentication routes - always available */}
      <Route path="/admin-login" element={!currentUser ? <AdminLogin /> : <Dashboard />} />
      <Route path="/supervisor-login" element={!currentUser ? <SupervisorLogin /> : <Dashboard />} />
      
      {/* Protected routes - only when logged in */}
      {currentUser ? (
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
            {/* Supervisor-specific routes */}
            <Route path="my-assignments" element={<Dashboard />} />
            <Route path="availability" element={<Dashboard />} />
            <Route path="notifications" element={<Dashboard />} />
            <Route path="profile" element={<Settings />} />
          </Route>
        </>
      ) : (
        <>
          {/* Redirect all other routes to login selection when not logged in */}
          <Route path="/" element={<LoginSelection />} />
          <Route path="*" element={<LoginSelection />} />
        </>
      )}
      
      {/* 404 route for logged in users */}
      {currentUser && <Route path="*" element={<NotFound />} />}
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
