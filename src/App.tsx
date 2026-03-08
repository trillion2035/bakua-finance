import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ProjectOwnerSignUp from "./pages/ProjectOwnerSignUp";
import ProjectOwnerSignIn from "./pages/ProjectOwnerSignIn";
import ResetPassword from "./pages/ResetPassword";
import Marketplace from "./pages/Marketplace";
import InvestorDashboard from "./pages/InvestorDashboard";
import InvestorSPVDetail from "./pages/InvestorSPVDetail";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardDocuments from "./pages/dashboard/DashboardDocuments";
import DashboardSPV from "./pages/dashboard/DashboardSPV";
import DashboardCapital from "./pages/dashboard/DashboardCapital";
import DashboardPerformance from "./pages/dashboard/DashboardPerformance";
import DashboardOracle from "./pages/dashboard/DashboardOracle";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardNewOverview from "./pages/dashboard/DashboardNewOverview";
import DashboardLayoutPublic from "./components/dashboard/DashboardLayoutPublic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<ProjectOwnerSignUp />} />
            <Route path="/signin" element={<ProjectOwnerSignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/earn" element={<Marketplace />} />
            <Route path="/investor" element={<InvestorDashboard />} />
            <Route path="/investor/spv/:id" element={<InvestorSPVDetail />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardNewOverview />} />
              <Route path="documents" element={<DashboardDocuments />} />
              <Route path="spvs" element={<DashboardSPV />} />
              <Route path="capital" element={<DashboardCapital />} />
              <Route path="performance" element={<DashboardPerformance />} />
              <Route path="oracle" element={<DashboardOracle />} />
              <Route path="messages" element={<DashboardMessages />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>
            <Route path="/dashboard2" element={<DashboardLayoutPublic />}>
              <Route index element={<DashboardOverview />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
