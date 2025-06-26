import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DocumentCacheProvider } from "@/contexts/DocumentCacheContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DocumentScan from "./pages/DocumentScan";
import LoginSignupPage from "./pages/LoginSignupPage";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component - Now allows guest access
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading Application"
        submessage="Please wait while we initialize..."
      />
    );
  }

  // Allow both authenticated and guest users to access the main app
  return <>{children}</>;
};

// Main App Routes - Guest-friendly
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DocumentScan />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginSignupPage />} />
      <Route path="/auth" element={<LoginSignupPage />} />
      <Route path="/signup" element={<LoginSignupPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DocumentCacheProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </DocumentCacheProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
