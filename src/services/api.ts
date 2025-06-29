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
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8081/api";

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

      if (!response.ok || result.status === "failed") {
        console.error(`API request failed for ${endpoint}:`, result);
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
      console.error(`API request error for ${endpoint}:`, error);
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
        console.error("Upload document failed:", result);
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
      console.error("Upload document error:", error);
      return {
        status: "failed",
        message: "Upload failed",
        error: error instanceof Error ? error.message : "Upload failed",
        data: null,
      };
    }
  }

  async generateAzureTTSAudio(text: string, language: string): Promise<ApiResponse<{ audioUrl: string }>> {
    console.log("Calling Spring Boot TTS endpoint for text:", text, "Language:", language);
    try {
      const response = await fetch(`${API_BASE}/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("TTS response received: Audio URL generated:", audioUrl);
      return {
        status: "success",
        message: "Audio generated successfully",
        error: null,
        data: { audioUrl },
      };
    } catch (error) {
      console.error("TTS request error:", error);
      return {
        status: "failed",
        message: "Failed to generate audio",
        error: error instanceof Error ? error.message : "TTS request failed",
        data: null,
      };
    }
  }

  async queryDocument(
    documentId: string,
    question: string,
    language: string,
  ): Promise<ApiResponse<QueryResponse>> {
    console.log("Querying document:", { documentId, question, language });
    const queryResponse = await this.request<QueryResponse>(`/documents/query`, {
      method: "POST",
      body: JSON.stringify({ documentId, question, language }),
    });

    if (queryResponse.status === "success" && queryResponse.data) {
      console.log("Query response received:", queryResponse.data);
      // Generate audio for the response
      const audioResponse = await this.generateAzureTTSAudio(queryResponse.data.answer, language);
      if (audioResponse.status === "success" && audioResponse.data) {
        queryResponse.data.audioUrl = audioResponse.data.audioUrl;
        console.log("Audio URL generated:", queryResponse.data.audioUrl);
      } else {
        console.error("Failed to generate audio for query response:", audioResponse);
        queryResponse.data.audioUrl = null;
      }
      queryResponse.data.language = language;
    } else {
      console.error("Query document failed:", queryResponse);
    }

    return queryResponse;
  }

  async generateSummary(
    documentId: string,
  ): Promise<ApiResponse<DocumentSummary>> {
    return this.request<DocumentSummary>(`/documents/${documentId}/summary`, {
      method: "POST",
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
        console.error("Download report failed:", response.status);
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
      console.error("Download report error:", error);
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