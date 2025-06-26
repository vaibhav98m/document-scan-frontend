export interface GuestUploadTracker {
  date: string; // YYYY-MM-DD format
  uploadCount: number;
  uploads: GuestUpload[];
}

export interface GuestUpload {
  id: string;
  fileName: string;
  fileSize: number;
  timestamp: string;
  ip?: string;
}

export interface UploadRestriction {
  maxFileSize: number; // in bytes
  maxDailyUploads: number;
  isRestricted: boolean;
  reason?: string;
}

export interface UsageApiResponse {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: {
    ip: string;
    dailyUploads: number;
    remainingUploads: number;
    resetTime: string;
  } | null;
}
