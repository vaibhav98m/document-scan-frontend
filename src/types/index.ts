export interface DocumentData {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  previewUrl?: string;
  content?: string;
}

export interface DocumentSummary {
  id: string;
  documentId: string;
  summaryData: string;
  generatedAt: Date;
  keyPoints: string[];
  wordCount: number;
  readingTime:  number;
}

export interface QueryResponse {
  id: string;
  documentId: string;
  fileName: string;
  question: string;
  answer: string;
  timestamp: Date;
  confidence?: number;
  language?: string;
  audioUrl?: string;
}

export interface KeyInsight {
  id: string;
  type:
    | "decision"
    | "data"
    | "date"
    | "person"
    | "location"
    | "amount"
    | "risk"
    | "opportunity"
    | "action"
    | "milestone"
    | "metric"
    | "compliance"
    | "process"
    | "technology"
    | "financial"
    | "legal"
    | "strategic"
    | "operational"
    | "other";
  priority: "high" | "medium" | "low";
  content: string;
  relevance: number;
  context?: string;
  category?: string;
  tags?: string[];
}

export interface DocumentInsights {
  id: string;
  documentId: string;
  insights: KeyInsight[];
  generatedAt: Date;
}

export type TabType = "upload" | "summary" | "query" | "insights";

export interface TTSStatus {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string | null;
  error?: string;
}

export interface ApiResponse<T> {
  status: "success" | "failed";
  message: string;
  error: string | null;
  data: T | null;
}

export interface ReportData {
  id: string;
  documentId: string;
  type: "summary" | "insights";
  title: string;
  content: string;
  generatedAt: Date;
  downloadUrl?: string;
}

export interface EmailRequest {
  to: string;
  subject: string;
  message?: string;
  attachments?: {
    filename: string;
    content: string;
    type: string;
  }[];
}

export interface EmailResponse {
  id: string;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  error?: string;
}