import { Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  submessage,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const logoSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const logoIconClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <div
            className={`${logoSizeClasses[size]} bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg animate-pulse`}
          >
            <Sparkles className={`${logoIconClasses[size]} text-white`} />
          </div>
          <div
            className={`absolute inset-0 ${logoSizeClasses[size]} border-2 border-purple-300 dark:border-purple-600 rounded-xl animate-spin mx-auto`}
            style={{
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              animationDuration: "2s",
            }}
          />
        </div>

        {/* Loading Spinner */}
        <div
          className={`${sizeClasses[size]} border-2 border-purple-300 dark:border-purple-600 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto`}
        />

        {/* Messages */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
            {message}
          </h3>
          {submessage && (
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {submessage}
            </p>
          )}
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
