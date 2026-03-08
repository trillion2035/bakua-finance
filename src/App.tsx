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
import DashboardPlaceholder from "./pages/dashboard/DashboardPlaceholder";

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
            <Route path="documents" element={<DashboardPlaceholder />} />
            <Route path="spv" element={<DashboardPlaceholder />} />
            <Route path="capital" element={<DashboardPlaceholder />} />
            <Route path="iot" element={<DashboardPlaceholder />} />
            <Route path="performance" element={<DashboardPlaceholder />} />
            <Route path="messages" element={<DashboardPlaceholder />} />
            <Route path="settings" element={<DashboardPlaceholder />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
