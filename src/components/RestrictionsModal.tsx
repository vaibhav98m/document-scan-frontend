import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Upload,
  Lock,
  Clock,
  FileX,
  User,
  X,
} from "lucide-react";

export interface RestrictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "fileSize" | "dailyLimit";
  fileSize?: number;
  fileName?: string;
  maxFileSize?: number;
  currentUploads?: number;
  maxUploads?: number;
  timeUntilReset?: string;
  onLogin: () => void;
  onContinueAsGuest: () => void;
}

const RestrictionsModal: React.FC<RestrictionModalProps> = ({
  open,
  onOpenChange,
  type,
  fileSize,
  fileName,
  maxFileSize,
  currentUploads,
  maxUploads,
  timeUntilReset,
  onLogin,
  onContinueAsGuest,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleContinueAsGuest = () => {
    setIsClosing(true);
    onContinueAsGuest();
    onOpenChange(false);
  };

  const handleLogin = () => {
    onLogin();
    onOpenChange(false);
  };

  const getModalContent = () => {
    if (type === "fileSize") {
      return {
        title: "File Size Limit Exceeded",
        description: "This action requires login to upload larger files.",
        icon: <FileX className="w-6 h-6 text-amber-600" />,
        alertType: "warning" as const,
        content: (
          <div className="space-y-4">
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>File too large for guest users</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <Badge variant="outline" className="text-xs">
                      {fileName || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <Badge variant="secondary" className="text-xs">
                      {fileSize ? formatFileSize(fileSize) : "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest limit:</span>
                    <Badge variant="outline" className="text-xs text-amber-700">
                      {maxFileSize ? formatFileSize(maxFileSize) : "1MB"}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                With an account, you get:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Unlimited file size uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>No daily upload limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Document history and sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Advanced AI analysis features</span>
                </li>
              </ul>
            </div>
          </div>
        ),
        primaryButton: "Login to continue",
        secondaryButton: "Continue as guest",
      };
    }

    // Daily limit exceeded
    return {
      title: "Daily Upload Limit Reached",
      description:
        "You've reached the maximum number of uploads for guest users today.",
      icon: <Clock className="w-6 h-6 text-red-600" />,
      alertType: "destructive" as const,
      content: (
        <div className="space-y-4">
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Upload limit reached</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Today's uploads:</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentUploads || 0} / {maxUploads || 15}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Limit resets in:</span>
                  <Badge
                    variant="outline"
                    className="text-xs text-red-700 dark:text-red-300"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {timeUntilReset || "24h"}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Sign up for unlimited access:
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Unlimited daily uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Upload files of any size</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Save and organize your documents</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Premium AI analysis features</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      primaryButton: "Create account now",
      secondaryButton: "Wait until tomorrow",
    };
  };

  const content = getModalContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/20 dark:to-amber-950/20 flex items-center justify-center">
              {content.icon}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {content.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                {content.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">{content.content}</div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleContinueAsGuest}
            className="w-full sm:w-auto"
            disabled={type === "dailyLimit"}
          >
            {content.secondaryButton}
          </Button>
          <Button
            onClick={handleLogin}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {content.primaryButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestrictionsModal;
