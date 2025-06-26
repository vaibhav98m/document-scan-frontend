import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Upload, Clock, X, User, FileText, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { guestUsageService } from "@/services/guestUsageService";

interface GuestRestrictionsHeaderProps {
  onLoginClick: () => void;
  show?: boolean; // Add prop to control visibility
  restrictionType?: "fileSize" | "dailyLimit" | "info";
}

const GuestRestrictionsHeader: React.FC<GuestRestrictionsHeaderProps> = ({
  onLoginClick,
  show = false, // Only show when explicitly triggered
  restrictionType = "info",
}) => {
  const { isAuthenticated } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentUsage, setCurrentUsage] = useState({ count: 0, remaining: 15 });

  useEffect(() => {
    if (!isAuthenticated) {
      const usage = guestUsageService.getCurrentUsage();
      setCurrentUsage(usage);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Reset dismissal state when show prop changes to true
    if (show) {
      setIsDismissed(false);
    }
  }, [show]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't show for authenticated users, if not explicitly shown, or if dismissed
  if (isAuthenticated || !show || isDismissed) {
    return null;
  }

  const maxFileSize = guestUsageService.formatFileSize(
    guestUsageService.getMaxFileSize(),
  );
  const timeUntilReset = guestUsageService.getTimeUntilReset();

  return (
    <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 relative">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200 pr-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Guest Mode Active</span>
              <Badge variant="outline" className="text-xs">
                {currentUsage.remaining} uploads remaining today
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Max file size: {maxFileSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>
                    Daily limit: {currentUsage.count} /{" "}
                    {guestUsageService.getMaxDailyUploads()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Resets in: {timeUntilReset}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={onLoginClick}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs"
            >
              <User className="w-3 h-3 mr-1" />
              Sign In for Unlimited Access
            </Button>
          </div>
        </div>
      </AlertDescription>

      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      >
        <X className="w-3 h-3" />
      </Button>
    </Alert>
  );
};

export default GuestRestrictionsHeader;
