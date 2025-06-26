import {
  DocumentData,
  DocumentSummary,
  QueryResponse,
  DocumentInsights,
  ReportData,
  EmailRequest,
  EmailResponse,
  ApiResponse,
} from "@/types";

const API_BASE =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      // Handle the new API response format
      if (!response.ok || result.status === "failed") {
        return {
          status: "failed",
          message: result.message || "An error occurred",
          error: result.error || "Request failed",
          data: null,
        };
      }

      return {
        status: "success",
        message: result.message || "Success",
        error: null,
        data: result.data,
      };
    } catch (error) {
      return {
        status: "failed",
        message: "Network error",
        error: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  async uploadDocument(file: File): Promise<ApiResponse<DocumentData>> {
    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status === "failed") {
        return {
          status: "failed",
          message: result.message || "Upload failed",
          error: result.error || "Upload failed",
          data: null,
        };
      }

      return {
        status: "success",
        message: result.message || "Upload successful",
        error: null,
        data: result.data,
      };
    } catch (error) {
      return {
        status: "failed",
        message: "Upload failed",
        error: error instanceof Error ? error.message : "Upload failed",
        data: null,
      };
    }
  }

  async generateSummary(
    documentId: string,
  ): Promise<ApiResponse<DocumentSummary>> {
    return this.request<DocumentSummary>(`/documents/${documentId}/summary`, {
      method: "POST",
    });
  }

  async queryDocument(
    documentId: string,
    question: string,
  ): Promise<ApiResponse<QueryResponse>> {
    return this.request<QueryResponse>(`/documents/${documentId}/query`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  }

  async generateInsights(
    documentId: string,
  ): Promise<ApiResponse<DocumentInsights>> {
    return this.request<DocumentInsights>(`/documents/${documentId}/insights`, {
      method: "POST",
    });
  }

  async getSummary(documentId: string): Promise<ApiResponse<DocumentSummary>> {
    return this.request<DocumentSummary>(`/documents/${documentId}/summary`);
  }

  async getInsights(
    documentId: string,
  ): Promise<ApiResponse<DocumentInsights>> {
    return this.request<DocumentInsights>(`/documents/${documentId}/insights`);
  }

  async getQueryHistory(
    documentId: string,
  ): Promise<ApiResponse<QueryResponse[]>> {
    return this.request<QueryResponse[]>(`/documents/${documentId}/queries`);
  }

  async generateSummaryReport(
    documentId: string,
  ): Promise<ApiResponse<ReportData>> {
    return this.request<ReportData>(
      `/documents/${documentId}/reports/summary`,
      {
        method: "POST",
      },
    );
  }

  async generateInsightsReport(
    documentId: string,
  ): Promise<ApiResponse<ReportData>> {
    return this.request<ReportData>(
      `/documents/${documentId}/reports/insights`,
      {
        method: "POST",
      },
    );
  }

  async downloadReport(reportId: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/download`);

      if (!response.ok) {
        return {
          status: "failed",
          message: "Failed to download report",
          error: "Download failed",
          data: null,
        };
      }

      const blob = await response.blob();
      return {
        status: "success",
        message: "Download successful",
        error: null,
        data: blob,
      };
    } catch (error) {
      return {
        status: "failed",
        message: "Download failed",
        error: error instanceof Error ? error.message : "Download failed",
        data: null,
      };
    }
  }

  async sendEmail(
    emailData: EmailRequest,
  ): Promise<ApiResponse<EmailResponse>> {
    return this.request<EmailResponse>("/email/send", {
      method: "POST",
      body: JSON.stringify(emailData),
    });
  }

  async sendReportByEmail(
    reportId: string,
    emailData: Omit<EmailRequest, "attachments">,
  ): Promise<ApiResponse<EmailResponse>> {
    return this.request<EmailResponse>(`/reports/${reportId}/email`, {
      method: "POST",
      body: JSON.stringify(emailData),
    });
  }
}

export const apiService = new ApiService();
