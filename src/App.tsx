import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ESSProvider, useESSS } from "./context/ESSContext";
import LoginForm from "./components/auth/LoginForm";
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
  
  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <Routes>
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
      <Route path="*" element={<NotFound />} />
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
