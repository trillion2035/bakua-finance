import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectOwnerSignUp from "./pages/ProjectOwnerSignUp";
import ProjectOwnerSignIn from "./pages/ProjectOwnerSignIn";
import Marketplace from "./pages/Marketplace";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<ProjectOwnerSignUp />} />
          <Route path="/signin" element={<ProjectOwnerSignIn />} />
          <Route path="/earn" element={<Marketplace />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="documents" element={<DashboardDocuments />} />
            <Route path="spv" element={<DashboardSPV />} />
            <Route path="capital" element={<DashboardCapital />} />
            <Route path="performance" element={<DashboardPerformance />} />
            <Route path="oracle" element={<DashboardOracle />} />
            <Route path="messages" element={<DashboardMessages />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
          <Route path="/dashboard2" element={<DashboardLayout />}>
            <Route index element={<DashboardNewOverview />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
