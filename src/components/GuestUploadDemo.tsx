import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Info,
  Clock,
  FileText,
  Shield,
  Upload,
  User,
  Zap,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { guestUsageService } from "@/services/guestUsageService";

interface GuestUploadDemoProps {
  onLoginClick: () => void;
}

const GuestUploadDemo: React.FC<GuestUploadDemoProps> = ({ onLoginClick }) => {
  const { isAuthenticated } = useAuth();
  const [usage, setUsage] = useState(() => guestUsageService.getCurrentUsage());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateUsage = () => {
      if (!isAuthenticated) {
        setUsage(guestUsageService.getCurrentUsage());
      }
    };

    // Update usage every 30 seconds
    const interval = setInterval(updateUsage, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRefreshUsage = () => {
    setUsage(guestUsageService.getCurrentUsage());
  };

  const handleClearUsage = () => {
    guestUsageService.clearTodayUsage();
    setUsage(guestUsageService.getCurrentUsage());
  };

  if (isAuthenticated) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Authenticated User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-green-700 dark:text-green-300">
            <p className="font-medium">✅ Unlimited file uploads</p>
            <p className="font-medium">✅ No daily limits</p>
            <p className="font-medium">✅ Files up to 50MB</p>
            <p className="font-medium">✅ Full platform access</p>
          </div>
        </CardContent>
      </Card>
    );
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
            <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                Guest Upload Status
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current restrictions and usage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefreshUsage}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
            >
              <Info className="w-4 h-4 mr-1" />
              {showDetails ? "Hide" : "Details"}
            </Button>
          </div>
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

        {/* Current Restrictions */}
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

        {/* Upload History (if details shown) */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Today's Upload History
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

            {/* Development Controls */}
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

        {/* Status Alert */}
        {usage.remaining <= 3 && usage.remaining > 0 && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">
                Only {usage.remaining} uploads remaining today
              </p>
              <p className="text-xs">
                Sign up for unlimited uploads and larger file sizes
              </p>
            </AlertDescription>
          </Alert>
        )}

        {usage.remaining === 0 && (
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <p className="font-medium mb-1">Daily upload limit reached</p>
              <p className="text-xs">
                Resets in {timeUntilReset} or sign up for unlimited access
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade CTA */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={onLoginClick}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Sign Up for Unlimited Access
          </Button>
        </div>

        {/* Info Footer */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Guest mode • Secure tracking • Daily reset
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestUploadDemo;
