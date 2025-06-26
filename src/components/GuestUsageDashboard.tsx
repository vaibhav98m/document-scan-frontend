import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  Clock,
  FileText,
  Shield,
  Upload,
  User,
  Zap,
  Info,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { guestUsageService } from "@/services/guestUsageService";

interface GuestUsageDashboardProps {
  onLoginClick: () => void;
}

const GuestUsageDashboard: React.FC<GuestUsageDashboardProps> = ({
  onLoginClick,
}) => {
  const { isAuthenticated } = useAuth();
  const [usage, setUsage] = useState(() => guestUsageService.getCurrentUsage());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateUsage = () => {
      if (!isAuthenticated) {
        setUsage(guestUsageService.getCurrentUsage());
      }
    };

    // Update usage every minute
    const interval = setInterval(updateUsage, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleClearUsage = () => {
    guestUsageService.clearTodayUsage();
    setUsage(guestUsageService.getCurrentUsage());
  };

  if (isAuthenticated) {
    return null;
  }

  const maxUploads = guestUsageService.getMaxDailyUploads();
  const usagePercentage = (usage.count / maxUploads) * 100;
  const timeUntilReset = guestUsageService.getTimeUntilReset();
  const maxFileSize = guestUsageService.formatFileSize(
    guestUsageService.getMaxFileSize(),
  );

  return (
    <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                Guest Usage
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Daily upload tracking
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
          >
            <Info className="w-4 h-4 mr-1" />
            {showDetails ? "Hide" : "Details"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Daily Upload Progress
            </span>
            <Badge
              variant={
                usage.remaining > 5
                  ? "default"
                  : usage.remaining > 0
                    ? "secondary"
                    : "destructive"
              }
            >
              {usage.count} / {maxUploads}
            </Badge>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{usage.remaining} uploads remaining</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Resets in {timeUntilReset}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Max File Size
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {maxFileSize}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Daily Limit
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {maxUploads} files
            </p>
          </div>
        </div>

        {/* Detailed Usage (Expandable) */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Today's Uploads
            </h4>

            {usage.uploads.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {usage.uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {upload.fileName}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {guestUsageService.formatFileSize(upload.fileSize)} •{" "}
                        {new Date(upload.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No uploads today
              </p>
            )}

            {/* Clear Usage Button (Development only) */}
            {process.env.NODE_ENV === "development" && usage.count > 0 && (
              <Button
                onClick={handleClearUsage}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear Usage (Dev Only)
              </Button>
            )}
          </div>
        )}

        {/* Upgrade Prompt */}
        <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
          <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Unlock unlimited access</p>
                <p className="text-xs">
                  No file size limits, unlimited uploads, and more features
                </p>
              </div>
              <Button
                onClick={onLoginClick}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ml-3"
              >
                <User className="w-3 h-3 mr-1" />
                Sign Up
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Guest mode • Data stored locally • Resets daily
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestUsageDashboard;
