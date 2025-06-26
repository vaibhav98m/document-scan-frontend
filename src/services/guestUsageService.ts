import {
  GuestUploadTracker,
  GuestUpload,
  UsageApiResponse,
} from "@/types/guestUsage";

const STORAGE_KEY = "guest_upload_tracker";
const MAX_FILE_SIZE_GUEST = 1024 * 1024; // 1MB in bytes
const MAX_DAILY_UPLOADS_GUEST = 15;

class GuestUsageService {
  private getStorageKey(): string {
    return STORAGE_KEY;
  }

  private getTodayString(): string {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  private getTracker(): GuestUploadTracker {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) {
        return this.createNewTracker();
      }

      const tracker: GuestUploadTracker = JSON.parse(stored);

      // Reset if it's a new day
      if (tracker.date !== this.getTodayString()) {
        return this.createNewTracker();
      }

      return tracker;
    } catch (error) {
      console.warn(
        "Failed to parse guest usage tracker, creating new one:",
        error,
      );
      return this.createNewTracker();
    }
  }

  private createNewTracker(): GuestUploadTracker {
    const tracker: GuestUploadTracker = {
      date: this.getTodayString(),
      uploadCount: 0,
      uploads: [],
    };
    this.saveTracker(tracker);
    return tracker;
  }

  private saveTracker(tracker: GuestUploadTracker): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(tracker));
    } catch (error) {
      console.error("Failed to save guest usage tracker:", error);
    }
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  public getMaxFileSize(): number {
    return MAX_FILE_SIZE_GUEST;
  }

  public getMaxDailyUploads(): number {
    return MAX_DAILY_UPLOADS_GUEST;
  }

  public getCurrentUsage(): {
    count: number;
    remaining: number;
    uploads: GuestUpload[];
  } {
    const tracker = this.getTracker();
    return {
      count: tracker.uploadCount,
      remaining: Math.max(0, MAX_DAILY_UPLOADS_GUEST - tracker.uploadCount),
      uploads: tracker.uploads,
    };
  }

  public canUpload(fileSize: number): { allowed: boolean; reason?: string } {
    // Check file size
    if (fileSize > MAX_FILE_SIZE_GUEST) {
      return {
        allowed: false,
        reason: `File size (${this.formatFileSize(fileSize)}) exceeds the 1MB limit for guest users`,
      };
    }

    // Check daily limit
    const usage = this.getCurrentUsage();
    if (usage.remaining <= 0) {
      return {
        allowed: false,
        reason: `Daily upload limit of ${MAX_DAILY_UPLOADS_GUEST} files reached for guest users`,
      };
    }

    return { allowed: true };
  }

  public recordUpload(fileName: string, fileSize: number): boolean {
    try {
      const tracker = this.getTracker();

      const upload: GuestUpload = {
        id: this.generateUploadId(),
        fileName,
        fileSize,
        timestamp: new Date().toISOString(),
      };

      tracker.uploads.push(upload);
      tracker.uploadCount = tracker.uploads.length;

      this.saveTracker(tracker);
      return true;
    } catch (error) {
      console.error("Failed to record upload:", error);
      return false;
    }
  }

  public clearTodayUsage(): void {
    const tracker = this.createNewTracker();
    console.log("Guest upload usage cleared for today");
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  public getResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  public getTimeUntilReset(): string {
    const now = new Date();
    const reset = this.getResetTime();
    const diff = reset.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Optional: API integration for IP-based tracking
  public async checkIPUsage(ip?: string): Promise<UsageApiResponse | null> {
    if (!ip) return null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/usage/ip?ip=${encodeURIComponent(ip)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("Failed to check IP usage from API:", error);
      return null;
    }
  }

  public async getUserIP(): Promise<string | null> {
    try {
      // Try to get IP from a public service
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      console.warn("Failed to get user IP:", error);
      return null;
    }
  }
}

export const guestUsageService = new GuestUsageService();
