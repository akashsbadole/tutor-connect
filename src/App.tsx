import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SearchTutors from "./pages/SearchTutors";
import TutorProfile from "./pages/TutorProfile";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchTutors />} />
            <Route path="/tutor/:id" element={<TutorProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile-setup" element={
              <ProtectedRoute><ProfileSetup /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requireProfileComplete><Dashboard /></ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requireProfileComplete><Messages /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
