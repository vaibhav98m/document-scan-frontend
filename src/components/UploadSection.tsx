import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DocumentData } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { guestUsageService } from "@/services/guestUsageService";
import RestrictionsModal from "@/components/RestrictionsModal";
import GuestRestrictionsHeader from "@/components/GuestRestrictionsHeader";
import { toast } from "sonner";

interface UploadSectionProps {
  onDocumentUploaded: (document: DocumentData) => void;
  currentDocument?: DocumentData | null;
  className?: string;
}

const UploadSection = ({
  onDocumentUploaded,
  currentDocument,
  className = "",
}: UploadSectionProps) => {
  const { isAuthenticated } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Guest restriction states
  const [restrictionModal, setRestrictionModal] = useState<{
    open: boolean;
    type: "fileSize" | "dailyLimit";
    fileData?: {
      name: string;
      size: number;
    };
  }>({ open: false, type: "fileSize" });

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [guestUsage, setGuestUsage] = useState(() =>
    isAuthenticated
      ? { count: 0, remaining: 0 }
      : guestUsageService.getCurrentUsage(),
  );

  // State for showing restriction banner
  const [showRestrictionsBanner, setShowRestrictionsBanner] = useState(false);
  const [restrictionBannerType, setRestrictionBannerType] = useState<
    "fileSize" | "dailyLimit" | "info"
  >("info");

  const processFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await apiService.uploadDocument(file);

      if (response.status === "success" && response.data) {
        setUploadProgress(100);
        clearInterval(progressInterval);

        // Record upload for guest users
        if (!isAuthenticated) {
          const recorded = guestUsageService.recordUpload(file.name, file.size);
          if (recorded) {
            const newUsage = guestUsageService.getCurrentUsage();
            setGuestUsage(newUsage);

            // Show toast with remaining uploads
            if (newUsage.remaining > 0) {
              toast.success(
                `Upload successful! ${newUsage.remaining} uploads remaining today.`,
              );
            } else {
              toast.warning(
                "Upload successful! Daily limit reached. Sign up for unlimited uploads.",
              );
            }
          }
        } else {
          toast.success("Upload successful!");
        }

        // Create document data object
        const documentData: DocumentData = {
          id: response.data.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date(),
          file: file,
        };

        setSuccess(true);
        onDocumentUploaded(documentData);

        // Auto-hide success state after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload file",
      );
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Check guest restrictions for unauthenticated users
      if (!isAuthenticated) {
        const canUpload = guestUsageService.canUpload(file.size);

        if (!canUpload.allowed) {
          // Determine restriction type and show both banner and modal
          if (file.size > guestUsageService.getMaxFileSize()) {
            setRestrictionBannerType("fileSize");
            setShowRestrictionsBanner(true);
            setRestrictionModal({
              open: true,
              type: "fileSize",
              fileData: { name: file.name, size: file.size },
            });
          } else {
            setRestrictionBannerType("dailyLimit");
            setShowRestrictionsBanner(true);
            setRestrictionModal({
              open: true,
              type: "dailyLimit",
            });
          }
          setPendingFile(file);
          return;
        }
      }

      await processFileUpload(file);
    },
    [isAuthenticated, onDocumentUploaded],
  );

  const handleLoginRedirect = () => {
    // Navigate to auth page - you can implement this based on your routing
    window.location.href = "/auth";
  };

  const handleContinueAsGuest = () => {
    setRestrictionModal({ open: false, type: "fileSize" });
    setPendingFile(null);

    // For file size restriction, user can continue with smaller files
    if (restrictionModal.type === "fileSize") {
      toast.info(
        `Please select a file smaller than ${guestUsageService.formatFileSize(guestUsageService.getMaxFileSize())}`,
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB for authenticated users
    disabled: isUploading || (!isAuthenticated && guestUsage.remaining === 0),
  });

  const clearError = () => setError(null);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Restrictions Banner - Show when triggered */}
      <GuestRestrictionsHeader
        onLoginClick={handleLoginRedirect}
        show={showRestrictionsBanner}
        restrictionType={restrictionBannerType}
      />

      {/* Guest Usage Display */}
      {!isAuthenticated && (
        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Guest Mode
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Limited to{" "}
                  {guestUsageService.formatFileSize(
                    guestUsageService.getMaxFileSize(),
                  )}{" "}
                  files, {guestUsage.remaining} uploads remaining today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  guestUsage.remaining > 5
                    ? "default"
                    : guestUsage.remaining > 0
                      ? "secondary"
                      : "destructive"
                }
              >
                {guestUsage.remaining} /{" "}
                {guestUsageService.getMaxDailyUploads()}
              </Badge>
              <Button
                onClick={handleLoginRedirect}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Upgrade
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card
        className={`border-2 border-dashed transition-colors ${
          !isAuthenticated && guestUsage.remaining === 0
            ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10"
            : "border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600"
        }`}
      >
        <div
          {...getRootProps()}
          className={`p-8 text-center cursor-pointer ${
            isDragActive ? "bg-purple-50 dark:bg-purple-950/20" : ""
          } ${
            !isAuthenticated && guestUsage.remaining === 0
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          <input
            {...getInputProps()}
            disabled={!isAuthenticated && guestUsage.remaining === 0}
          />

          {/* Upload Icon */}
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              !isAuthenticated && guestUsage.remaining === 0
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                !isAuthenticated && guestUsage.remaining === 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-purple-600 dark:text-purple-400"
              }`}
            />
          </div>

          {/* Upload Text */}
          {!isAuthenticated && guestUsage.remaining === 0 ? (
            <>
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                Daily Upload Limit Reached
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                You've reached the maximum uploads for guest users today.
              </p>
              <Button
                onClick={handleLoginRedirect}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Sign Up for Unlimited Uploads
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {isDragActive
                  ? "Drop your document here"
                  : "Upload your document"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {isDragActive
                  ? "Release to upload"
                  : "Drag and drop a file here, or click to browse"}
              </p>

              {/* File Types and Limits */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  PDF
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  DOCX
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  XLSX
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Images
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  TXT
                </Badge>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {!isAuthenticated
                  ? `Max file size: ${guestUsageService.formatFileSize(guestUsageService.getMaxFileSize())} (guest users)`
                  : "Max file size: 50MB"}
              </p>

              {/* Current Document Display */}
              {currentDocument && !isUploading && !success && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Current: {currentDocument.fileName}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Uploading...
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-6 border-t border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Upload successful!</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Restrictions Modal */}
      <RestrictionsModal
        open={restrictionModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setRestrictionModal({ open: false, type: "fileSize" });
            setPendingFile(null);
          }
        }}
        type={restrictionModal.type}
        fileSize={restrictionModal.fileData?.size}
        fileName={restrictionModal.fileData?.name}
        maxFileSize={guestUsageService.getMaxFileSize()}
        currentUploads={guestUsage.count}
        maxUploads={guestUsageService.getMaxDailyUploads()}
        timeUntilReset={guestUsageService.getTimeUntilReset()}
        onLogin={handleLoginRedirect}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  );
};

export default UploadSection;
