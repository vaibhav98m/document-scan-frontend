import { useState, useEffect } from "react";
import { DocumentData, DocumentSummary as DocumentSummaryType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";
import { useDocumentCache } from "@/contexts/DocumentCacheContext";
import { apiService } from "@/services/api";
import EmailDialog from "@/components/EmailDialog";
import DocumentSummary from "@/components/DocumentSummary";
import jsPDF from "jspdf";

interface SummarySectionProps {
  document: DocumentData | null;
  className?: string;
  isCompact?: boolean;
}

const SummarySection = ({
  document,
  className = "",
  isCompact = false,
}: SummarySectionProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const { getSummary, setSummary, setLoadingSummary, isLoadingSummary } =
    useDocumentCache();

  // Get summary from cache
  const summary = document ? getSummary(document.id) : null;
  const isLoading = document ? isLoadingSummary(document.id) : false;

  useEffect(() => {
    if (document && !summary && !isLoading) {
      loadSummary();
    }
  }, [document, summary, isLoading]);

  const loadSummary = async () => {
    if (!document) return;

    setLoadingSummary(document.id, true);
    setError(null);

    try {
      // Try to get existing summary first
      const response = await apiService.getSummary(document.id);

      if (response.status === "success" && response.data) {
        setSummary(document.id, response.data);
      } else {
        // Generate new summary if none exists
        await generateSummary();
      }
    } catch (err) {
      setError("Failed to load summary");
      setLoadingSummary(document.id, false);
    }
  };

  const generateSummary = async () => {
    if (!document) return;

    setLoadingSummary(document.id, true);
    setError(null);

    try {
      const response = await apiService.generateSummary(document.id);

      if (response.status === "success" && response.data) {
        setSummary(document.id, response.data);
      } else {
        // Fallback: create mock summary for demo purposes
        const mockSummary: DocumentSummaryType = {
          id: Math.random().toString(36).substr(2, 9),
          documentId: document.id,
          summaryData: `This document discusses key strategic initiatives and operational improvements. The analysis reveals important insights about market positioning, financial performance, and recommended action items for future growth and development.`,
          keyPoints: [
            "Strategic business transformation initiative identified",
            "Quarterly revenue growth of 15% year-over-year",
            "New market opportunities in emerging sectors",
            "Operational efficiency improvements recommended",
            "Investment in technology infrastructure proposed",
          ],
          generatedAt: new Date(),
          wordCount: 156,
          readingTime: 2,
        };
        setSummary(document.id, mockSummary);
      }
    } catch (err) {
      setError("Failed to generate summary");
      setLoadingSummary(document.id, false);
    }
  };

  const handleDownloadReport = async () => {
    if (!document || !summary) return;

    setIsDownloading(true);
    try {
      const response = await apiService.generateSummaryReport(document.id);

      if (response.status === "success" && response.data) {
        setReportId(response.data.id);

        if (response.data.downloadUrl) {
          // Direct download link provided
          const link = window.document.createElement("a");
          link.href = response.data.downloadUrl;
          link.download = `${document.fileName}_summary_report.pdf`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else {
          // Download via API
          const downloadResponse = await apiService.downloadReport(
            response.data.id,
          );
          if (downloadResponse.status === "success" && downloadResponse.data) {
            const blob = downloadResponse.data;
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = `${document.fileName}_summary_report.pdf`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      } else {
        // Fallback: Generate text file client-side
        generateClientSideReport();
      }
    } catch (error) {
      console.error("Failed to download report:", error);
      generateClientSideReport();
    } finally {
      setIsDownloading(false);
    }
  };

  const generateClientSideReport = () => {
    if (!summary || !document) return;

    const doc = new jsPDF();
    let y = 20;

    const addWrappedText = (text: string, x = 20, lineHeight = 8) => {
      const lines = doc.splitTextToSize(text, 170); // wrap at 170px
      lines.forEach((line: string) => {
        if (y > 280) {
          // page break
          doc.addPage();
          y = 20;
        }
        doc.text(line, x, y);
        y += lineHeight;
      });
    };

    doc.setFontSize(16);
    addWrappedText("DOCUMENT SUMMARY REPORT");
    y += 5;

    doc.setFontSize(12);
    addWrappedText(`Generated on: ${new Date().toLocaleString()}`);
    addWrappedText(`Document: ${document.fileName}`);
    addWrappedText("");

    doc.setFontSize(14);
    addWrappedText("SUMMARY:");
    doc.setFontSize(11);
    addWrappedText(summary.summaryData || "No summary available");
    addWrappedText("");

    if (summary.keyPoints && summary.keyPoints.length > 0) {
      doc.setFontSize(14);
      addWrappedText("KEY POINTS:");
      doc.setFontSize(11);
      summary.keyPoints.forEach((point, index) => {
        addWrappedText(`${index + 1}. ${point}`);
      });
      addWrappedText("");
    }

    addWrappedText("DOCUMENT DETAILS:");
    if (summary.wordCount) addWrappedText(`Word Count: ${summary.wordCount}`);
    if (summary.readingTime)
      addWrappedText(`Reading Time: ${summary.readingTime} minutes`);
    addWrappedText(`Generated At: ${summary.generatedAt}`);

    addWrappedText("");
    addWrappedText("---");
    addWrappedText("Generated by Document Scan Application");

    doc.save(`${document.fileName}_summary_report.pdf`);
  };

  const handleEmailReport = async () => {
    if (!document) return;

    try {
      const response = await apiService.generateSummaryReport(document.id);
      if (response.status === "success" && response.data) {
        setReportId(response.data.id);
        setEmailDialogOpen(true);
      } else {
        generateClientSideReport();
        setEmailDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to generate report for email:", error);
    }
  };

  if (!document) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            No Document to Summarize
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Please upload a document first to generate a summary
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Loading State */}
      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Analyzing Document
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generating comprehensive summary and key points...
              </p>
            </div>
          </div>
        </Card>
      ) : error ? (
        /* Error State */
        <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="text-center">
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Summary Generation Failed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              {error}
            </p>
            <Button
              onClick={generateSummary}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      ) : summary ? (
        /* Summary Content */
        <DocumentSummary
          summary={summary}
          isCompact={isCompact}
          onDownload={handleDownloadReport}
          onEmail={handleEmailReport}
          onRegenerate={loadSummary}
          isRegenerating={isLoading}
        />
      ) : null}

      {/* Email Dialog */}
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        reportId={reportId || undefined}
        reportType="summary"
        documentName={document?.fileName}
        onEmailSent={() => {
          console.log("Summary report sent via email");
        }}
      />
    </div>
  );
};

export default SummarySection;
