import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ProjectOwnerSignUp from "./pages/ProjectOwnerSignUp";
import ProjectOwnerSignIn from "./pages/ProjectOwnerSignIn";
import Marketplace from "./pages/Marketplace";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorSPVDetail from "./pages/InvestorSPVDetail";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardDocuments from "./pages/dashboard/DashboardDocuments";
import DashboardSPV from "./pages/dashboard/DashboardSPV";
import DashboardCapital from "./pages/dashboard/DashboardCapital";
import DashboardPerformance from "./pages/dashboard/DashboardPerformance";
import DashboardOracle from "./pages/dashboard/DashboardOracle";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardNewOverview from "./pages/dashboard/DashboardNewOverview";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signup" element={<ProjectOwnerSignUp />} />
      <Route path="/signin" element={<ProjectOwnerSignIn />} />
      <Route path="/earn" element={<Marketplace />} />
      <Route path="/investor" element={<InvestorDashboard />} />
      <Route path="/investor/spv/:id" element={<InvestorSPVDetail />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardNewOverview />} />
        <Route path="documents" element={<DashboardDocuments />} />
        <Route path="spvs" element={<DashboardSPV />} />
        <Route path="capital" element={<DashboardCapital />} />
        <Route path="performance" element={<DashboardPerformance />} />
        <Route path="oracle" element={<DashboardOracle />} />
        <Route path="messages" element={<DashboardMessages />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
