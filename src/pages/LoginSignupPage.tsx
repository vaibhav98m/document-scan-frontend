import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, UserPlus, LogIn } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";

type AuthMode = "welcome" | "login" | "signup";

const LoginSignupPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("welcome");

  const handleBack = () => {
    setAuthMode("welcome");
  };

  const handleClose = () => {
    window.location.href = "/";
  };

  if (authMode === "signup") {
    return (
      <div className="min-h-screen gradient-bg transition-colors duration-300 flex items-center justify-center p-4">
        <SignupForm onBack={handleBack} onClose={handleClose} />
      </div>
    );
  }

  if (authMode === "login") {
    return (
      <div className="min-h-screen gradient-bg transition-colors duration-300 flex items-center justify-center p-4">
        <LoginForm onBack={handleBack} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg transition-colors duration-300 flex flex-col items-center justify-between p-4">
      {/* Theme Toggle - positioned absolute to top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle
          variant="outline"
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        />
      </div>

      <Card className="w-full max-w-lg mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-xl border-0 max-lg:max-w-md max-lg:mx-4">
        <CardHeader className="text-center space-y-4">
          {/* Logo & Branding */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Document Scan
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              AI-Powered Document Analysis Platform
            </p>
          </div>

          <div className="text-center max-w-md mx-auto">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Upload, analyze, and extract insights from your documents with our
              advanced AI technology. Join thousands of users who trust us with
              their document processing needs.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-lg:flex max-lg:flex-col max-lg:items-center max-lg:justify-start">
          {/* Main Action Buttons */}
          <div className="space-y-3 w-full">
            <Button
              onClick={() => setAuthMode("login")}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 max-lg:mb-4"
            >
              <LogIn className="w-5 h-5 mr-3" />
              Sign In to Your Account
            </Button>

            <Button
              onClick={() => setAuthMode("signup")}
              variant="outline"
              className="w-full h-12 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-medium text-base transition-all duration-200"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Create New Account
            </Button>
          </div>

          {/* Features Highlight */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">
              Why Choose Document Scan?
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                <span>AI-powered document analysis and insights</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                <span>Secure processing with enterprise-grade encryption</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                <span>Interactive Q&A and document summarization</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                <span>Export reports and share insights easily</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Secure Authentication
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We use OTP-based authentication to ensure your account security.
              No passwords to remember, just secure one-time codes sent to your
              email or phone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 w-full text-center py-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Powered by AI • Secure document processing • Enterprise ready
        </p>
      </div>
    </div>
  );
};

export default LoginSignupPage;
