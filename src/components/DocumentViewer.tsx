import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";

interface DocumentData {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date | string;
  file: File;
}

interface DocumentViewerProps {
  document?: DocumentData | null;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  className = "",
}) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    "image" | "pdf" | "excel" | "docx" | "text" | "unsupported"
  >("unsupported");

  useEffect(() => {
    if (document?.file) {
      processDocument(document.file);
    } else {
      resetState();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document]);

  const resetState = (): void => {
    setPreviewContent(null);
    setPreviewUrl(null);
    setIsLoading(false);
    setError(null);
    setPreviewType("unsupported");
  };

  const processDocument = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPreviewType("image");
      } else if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPreviewType("pdf");
      } else if (
        file.type.includes("sheet") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        await processExcelFile(file);
      } else if (
        file.type.includes("document") ||
        file.name.endsWith(".docx")
      ) {
        await processDocxFile(file);
      } else if (file.type.startsWith("text/")) {
        await processTextFile(file);
      } else {
        setPreviewType("unsupported");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process document",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processExcelFile = async (file: File): Promise<void> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const htmlTable = XLSX.utils.sheet_to_html(worksheet);
      setPreviewContent(htmlTable);
      setPreviewType("excel");
    } catch (err) {
      throw new Error("Failed to process Excel file");
    }
  };

  const processDocxFile = async (file: File): Promise<void> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewContent(result.value);
      setPreviewType("docx");
      if (result.messages.length > 0) {
        console.warn("DOCX conversion warnings:", result.messages);
      }
    } catch (err) {
      throw new Error("Failed to process DOCX file");
    }
  };

  const processTextFile = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const htmlContent = `<pre style="white-space: pre-wrap; font-family: monospace; padding: 1rem; background: #f8f9fa; border-radius: 0.375rem; overflow-x: auto; width: 100%; height: 100%;">${escapeHtml(text)}</pre>`;
      setPreviewContent(htmlContent);
      setPreviewType("text");
    } catch (err) {
      throw new Error("Failed to process text file");
    }
  };

  const escapeHtml = (text: string): string => {
    const div = window.document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Unknown date";
    const d = typeof date === "string" ? new Date(date) : date;
    return d instanceof Date && !isNaN(d.getTime())
      ? d.toLocaleString()
      : "Invalid date";
  };

  const handleDownload = (): void => {
    if (document?.file) {
      const url = URL.createObjectURL(document.file);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    if (
      fileType.includes("sheet") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv")
    ) {
      return <FileSpreadsheet className="w-10 h-10 text-green-600" />;
    }
    if (fileType.includes("document") || fileName.endsWith(".docx")) {
      return <File className="w-10 h-10 text-blue-600" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="w-10 h-10 text-red-600" />;
    }
    return <FileText className="w-10 h-10 text-slate-500" />;
  };

  if (!document) {
    return (
      <Card
        className={`p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
              No Document Selected
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Upload a document to see the preview here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-white dark:bg-slate-900 shadow-lg p-4 ${className}`}>
      <div className="flex flex-col h-full space-y-4">
        {/* Document Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {document.fileName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {document.fileType.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-500">
                {formatFileSize(document.fileSize)}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              aria-label="Download document"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex-1">
          {isLoading ? (
            <div className="h-full min-h-[400px] flex items-center justify-center w-full">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="h-full min-h-[400px] flex items-center justify-center w-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="mt-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] w-full">
              {previewType === "image" && previewUrl && (
                <img
                  src={previewUrl}
                  alt={document.fileName}
                  className="w-full h-full object-contain"
                />
              )}
              {previewType === "pdf" && previewUrl && (
                <iframe
                  src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={document.fileName}
                />
              )}
              {previewType === "excel" && previewContent && (
                <div className="w-full h-full overflow-auto">
                  <style>
                    {`
                      .excel-preview table {
                        border-collapse: collapse;
                        width: 100%;
                        height: 100%;
                        font-size: 12px;
                      }
                      .excel-preview td, .excel-preview th {
                        border: 1px solid #ddd;
                        padding: 4px 8px;
                        text-align: left;
                      }
                      .excel-preview th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                      }
                      .excel-preview tr:nth-child(even) {
                        background-color: #f9f9f9;
                      }
                    `}
                  </style>
                  <div
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    className="excel-preview w-full h-full"
                  />
                </div>
              )}
              {previewType === "docx" && previewContent && (
                <div className="w-full h-full overflow-auto prose prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    className="w-full h-full p-4"
                  />
                </div>
              )}
              {previewType === "text" && previewContent && (
                <div className="w-full h-full overflow-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    className="w-full h-full"
                  />
                </div>
              )}
              {previewType === "unsupported" && (
                <div className="h-full min-h-[400px] flex items-center justify-center w-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      {getFileIcon(document.file.type, document.fileName)}
                    </div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {document.fileName}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Info */}
        <div className="text-xs text-slate-500 space-y-1">
          <div>Uploaded: {formatDate(document.uploadedAt)}</div>
          <div>Size: {formatFileSize(document.fileSize)}</div>
          <div>Type: {document.file.type || "Unknown"}</div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentViewer;
