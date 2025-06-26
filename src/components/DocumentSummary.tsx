import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Square,
  Volume2,
  FileText,
  Clock,
  Lightbulb,
  Download,
  Mail,
  Share,
  RotateCcw,
} from "lucide-react";
import { DocumentSummary as DocumentSummaryType } from "@/types";
import useAudioPlayer from "@/hooks/useAudioPlayer";

interface DocumentSummaryProps {
  summary: DocumentSummaryType;
  isCompact?: boolean;
  className?: string;
  onDownload?: () => void;
  onEmail?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  summary,
  isCompact = false,
  className = "",
  onDownload,
  onEmail,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    state: audioState,
    actions: audioActions,
    isPlayingId,
  } = useAudioPlayer();

  const summaryId = `summary-${summary.id}`;
  const isCurrentlyPlaying = isPlayingId(summaryId);

  const handlePlaySummary = () => {
    const text = `Document Summary: ${summary.summaryData}. Key Points: ${summary.keyPoints.join(", ")}`;

    if (isCurrentlyPlaying) {
      if (audioState.isPlaying) {
        audioActions.pause();
      } else if (audioState.isPaused) {
        audioActions.resume();
      } else {
        // Replay from beginning
        audioActions.play(summaryId, text);
      }
    } else {
      audioActions.play(summaryId, text);
    }
  };

  const handleStopSummary = () => {
    audioActions.stop();
  };

  const handleDownload = async () => {
    if (onDownload) {
      setIsDownloading(true);
      try {
        await onDownload();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div
        className={`flex items-center justify-between ${isCompact ? "mb-2" : "mb-4"}`}
      >
        <div className="flex items-center gap-2">
          <FileText
            className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} text-purple-600 dark:text-purple-400`}
          />
          <h3
            className={`font-semibold text-slate-900 dark:text-slate-100 ${isCompact ? "text-sm" : "text-lg"}`}
          >
            Document Summary
          </h3>
        </div>

        <div className={`flex items-center ${isCompact ? "gap-1" : "gap-2"}`}>
          {/* Audio Controls */}
          <Button
            onClick={handlePlaySummary}
            variant="outline"
            size={isCompact ? "sm" : "default"}
            className={isCompact ? "p-1" : "gap-2"}
            disabled={audioState.isLoading}
            title={
              isCurrentlyPlaying && audioState.isPlaying
                ? "Pause"
                : "Play Summary"
            }
          >
            {audioState.isLoading && isCurrentlyPlaying ? (
              <div
                className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} animate-spin border-2 border-purple-600 border-t-transparent rounded-full`}
              />
            ) : isCurrentlyPlaying && audioState.isPlaying ? (
              <Pause className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
            ) : (
              <Play className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
            )}
            {!isCompact && (
              <span>
                {isCurrentlyPlaying && audioState.isPlaying
                  ? "Pause"
                  : isCurrentlyPlaying && audioState.isPaused
                    ? "Resume"
                    : "Play"}
              </span>
            )}
          </Button>

          {isCurrentlyPlaying && audioState.isPlaying && (
            <Button
              onClick={handleStopSummary}
              variant="outline"
              size={isCompact ? "sm" : "default"}
              className={isCompact ? "p-1" : "gap-2"}
              title="Stop"
            >
              <Square className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
              {!isCompact && "Stop"}
            </Button>
          )}

          {/* Action Buttons */}
          {onRegenerate && (
            <Button
              onClick={onRegenerate}
              variant="outline"
              size={isCompact ? "sm" : "default"}
              disabled={isRegenerating}
              className={isCompact ? "p-1" : "gap-2"}
              title="Regenerate Summary"
            >
              <RotateCcw
                className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} ${isRegenerating ? "animate-spin" : ""}`}
              />
              {!isCompact &&
                (isRegenerating ? "Regenerating..." : "Regenerate")}
            </Button>
          )}

          {onDownload && (
            <Button
              onClick={handleDownload}
              variant="outline"
              size={isCompact ? "sm" : "default"}
              disabled={isDownloading}
              className={isCompact ? "p-1" : "gap-2"}
              title="Download Summary"
            >
              <Download
                className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} ${isDownloading ? "animate-spin" : ""}`}
              />
              {!isCompact && (isDownloading ? "Downloading..." : "Download")}
            </Button>
          )}

          {onEmail && (
            <Button
              onClick={onEmail}
              variant="outline"
              size={isCompact ? "sm" : "default"}
              className={isCompact ? "p-1" : "gap-2"}
              title="Email Summary"
            >
              <Mail className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
              {!isCompact && "Email"}
            </Button>
          )}
        </div>
      </div>

      {/* Audio Progress Indicator */}
      {isCurrentlyPlaying && audioState.isPlaying && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm">Playing summary...</span>
              {audioState.duration > 0 && (
                <div className="flex items-center gap-2">
                  <Progress
                    value={(audioState.currentTime / audioState.duration) * 100}
                    className="w-20 h-1"
                  />
                  <span className="text-xs">
                    {Math.floor(audioState.currentTime)}s /{" "}
                    {Math.floor(audioState.duration)}s
                  </span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Content */}
      <div className={`space-y-3 ${isCompact ? "text-sm" : ""}`}>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {summary.summaryData}
          </p>
        </div>

        {/* Key Points */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="space-y-2">
            <h4
              className={`font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 ${isCompact ? "text-sm" : "text-base"}`}
            >
              <Lightbulb
                className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} text-yellow-600 dark:text-yellow-400`}
              />
              Key Points
            </h4>
            <ul className="space-y-1">
              {summary.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                >
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div
          className={`flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 ${isCompact ? "flex-col items-start" : ""}`}
        >
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Generated {formatDate(summary.generatedAt)}</span>
          </div>

          {summary.wordCount && (
            <Badge variant="outline" className="text-xs">
              {summary.wordCount} words
            </Badge>
          )}

          {summary.readingTime && (
            <Badge variant="outline" className="text-xs">
              {summary.readingTime} min read
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSummary;
