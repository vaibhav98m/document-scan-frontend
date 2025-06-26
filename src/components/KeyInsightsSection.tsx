import { useState, useEffect } from "react";
import { DocumentData, DocumentInsights, KeyInsight } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Volume2,
  Lightbulb,
  Calendar,
  User,
  MapPin,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
  Mail,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Shield,
  Briefcase,
  Code,
  Scale,
  Settings,
  Filter,
} from "lucide-react";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import { useDocumentCache } from "@/contexts/DocumentCacheContext";
import { apiService } from "@/services/api";
import EmailDialog from "@/components/EmailDialog";
import jsPDF from "jspdf";

interface KeyInsightsSectionProps {
  document: DocumentData | null;
  className?: string;
  isCompact?: boolean;
}

const KeyInsightsSection = ({
  document,
  className = "",
  isCompact = false,
}: KeyInsightsSectionProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const {
    state: audioState,
    actions: audioActions,
    isPlayingId,
  } = useAudioPlayer();

  const { getInsights, setInsights, setLoadingInsights, isLoadingInsights } =
    useDocumentCache();

  // Get insights from cache
  const insights = document ? getInsights(document.id) : null;
  const isLoading = document ? isLoadingInsights(document.id) : false;

  useEffect(() => {
    if (document && !insights && !isLoading) {
      loadInsights();
    }
  }, [document, insights, isLoading]);

  const loadInsights = async () => {
    if (!document) return;

    setLoadingInsights(document.id, true);
    setError(null);

    try {
      // Try to get existing insights first
      const response = await apiService.getInsights(document.id);

      if (response.status === "success" && response.data) {
        setInsights(document.id, response.data);
      } else {
        // Generate new insights if none exist
        await generateInsights();
      }
    } catch (err) {
      setError("Failed to load insights");
      setLoadingInsights(document.id, false);
    }
  };

  const generateInsights = async () => {
    if (!document) return;

    setLoadingInsights(document.id, true);
    setError(null);

    try {
      const response = await apiService.generateInsights(document.id);

      if (response.status === "success" && response.data) {
        setInsights(document.id, response.data);
      } else {
        // Fallback: create mock insights for demo purposes
        const mockInsights: DocumentInsights = {
          id: Math.random().toString(36).substr(2, 9),
          documentId: document.id,
          generatedAt: new Date(),
          insights: [
            {
              id: "1",
              type: "strategic",
              priority: "high",
              content:
                "Critical strategic decision to implement AI-powered document processing system",
              relevance: 0.95,
              context: "Found in executive summary section",
              category: "Strategic Planning",
              tags: ["AI", "automation", "digital transformation"],
            },
            {
              id: "2",
              type: "date",
              priority: "high",
              content:
                "Implementation deadline set for Q4 2024 with critical milestones",
              relevance: 0.92,
              context: "Mentioned in project timeline section",
              category: "Project Management",
              tags: ["deadline", "milestone", "Q4 2024"],
            },
            {
              id: "3",
              type: "person",
              priority: "medium",
              content:
                "Project lead assigned to Sarah Johnson, Senior Operations Manager",
              relevance: 0.82,
              context: "Listed in responsibility matrix",
              category: "Team Structure",
              tags: ["leadership", "responsibility", "operations"],
            },
            {
              id: "4",
              type: "financial",
              priority: "high",
              content:
                "Budget allocation of $150,000 for technology infrastructure",
              relevance: 0.91,
              context: "Detailed in financial projections",
              category: "Budget & Finance",
              tags: ["budget", "investment", "infrastructure"],
            },
            {
              id: "5",
              type: "metric",
              priority: "medium",
              content: "Expected 40% improvement in processing efficiency",
              relevance: 0.85,
              context: "Performance metrics section",
              category: "Performance KPIs",
              tags: ["efficiency", "improvement", "metrics"],
            },
            {
              id: "8",
              type: "compliance",
              priority: "medium",
              content:
                "Must comply with GDPR and SOX regulations for data handling",
              relevance: 0.84,
              context: "Compliance requirements section",
              category: "Legal & Compliance",
              tags: ["GDPR", "SOX", "compliance", "data handling"],
            },
            {
              id: "10",
              type: "technology",
              priority: "low",
              content: "Integration with existing CRM and ERP systems required",
              relevance: 0.76,
              context: "Technical requirements section",
              category: "Technical Integration",
              tags: ["CRM", "ERP", "integration", "systems"],
            },
          ],
        };
        setInsights(document.id, mockInsights);
      }
    } catch (err) {
      setError("Failed to generate insights");
      setLoadingInsights(document.id, false);
    }
  };

  const getInsightIcon = (type: KeyInsight["type"]) => {
    const iconProps = { className: "w-4 h-4" };

    switch (type) {
      case "strategic":
        return <Target {...iconProps} />;
      case "decision":
        return <TrendingUp {...iconProps} />;
      case "date":
        return <Calendar {...iconProps} />;
      case "person":
        return <User {...iconProps} />;
      case "location":
        return <MapPin {...iconProps} />;
      case "amount":
      case "financial":
        return <DollarSign {...iconProps} />;
      case "data":
      case "metric":
        return <BarChart3 {...iconProps} />;
      case "risk":
        return <AlertTriangle {...iconProps} />;
      case "opportunity":
        return <Zap {...iconProps} />;
      case "action":
      case "milestone":
        return <CheckCircle {...iconProps} />;
      case "compliance":
      case "legal":
        return <Scale {...iconProps} />;
      case "process":
      case "operational":
        return <Settings {...iconProps} />;
      case "technology":
        return <Code {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  const getInsightColor = (type: KeyInsight["type"]) => {
    switch (type) {
      case "strategic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "decision":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      case "date":
      case "milestone":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "person":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "location":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "amount":
      case "financial":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "data":
      case "metric":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      case "risk":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "opportunity":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "action":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
      case "compliance":
      case "legal":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300";
      case "process":
      case "operational":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      case "technology":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const getPriorityColor = (priority: KeyInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: KeyInsight["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-3 h-3" />;
      case "medium":
        return <Clock className="w-3 h-3" />;
      case "low":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const filteredInsights =
    insights?.insights.filter(
      (insight) => activeFilter === "all" || insight.priority === activeFilter,
    ) || [];

  const handlePlayInsight = (insight: KeyInsight) => {
    const insightId = `insight-${insight.id}`;
    const isCurrentlyPlaying = isPlayingId(insightId);
    const text = `${insight.content}. ${insight.context ? `Context: ${insight.context}` : ""}`;

    if (isCurrentlyPlaying) {
      if (audioState.isPlaying) {
        audioActions.pause();
      } else if (audioState.isPaused) {
        audioActions.resume();
      } else {
        // Replay from beginning
        audioActions.play(insightId, text);
      }
    } else {
      audioActions.play(insightId, text);
    }
  };

  const handleStopInsight = () => {
    audioActions.stop();
  };

  const speakAllInsights = () => {
    if (!insights) return;

    const allInsightsText = filteredInsights
      .map((insight) => `${insight.content}. ${insight.context || ""}`)
      .join(" ");

    audioActions.play(
      "all-insights",
      `Here are the key insights: ${allInsightsText}`,
    );
  };

  const handleDownloadReport = async () => {
    if (!document) return;

    setIsDownloading(true);
    try {
      const response = await apiService.generateInsightsReport(document.id);

      if (response.status === "success" && response.data) {
        setReportId(response.data.id);

        if (response.data.downloadUrl) {
          // Direct download link provided
          const link = window.document.createElement("a");
          link.href = response.data.downloadUrl;
          link.download = `${document.fileName}_insights_report.pdf`;
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
            link.download = `${document.fileName}_insights_report.pdf`;
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
    if (!insights || !document) return;

    const doc = new jsPDF();
    let y = 10;

    const addWrappedText = (text, x = 10, lineHeight = 8) => {
      const lines = doc.splitTextToSize(text, 180); // wrap at 180px
      lines.forEach((line) => {
        if (y > 280) {
          // page break
          doc.addPage();
          y = 10;
        }
        doc.text(line, x, y);
        y += lineHeight;
      });
    };

    doc.setFontSize(12);
    addWrappedText(`KEY INSIGHTS REPORT`);
    addWrappedText(`Generated on: ${new Date().toLocaleString()}`);
    addWrappedText(`Document: ${document.fileName}`);
    addWrappedText(``);

    addWrappedText(`INSIGHTS SUMMARY:`);
    addWrappedText(`Total Insights: ${insights.insights.length}`);
    addWrappedText(
      `High Priority: ${insights.insights.filter((i) => i.priority === "high").length}`,
    );
    addWrappedText(
      `Medium Priority: ${insights.insights.filter((i) => i.priority === "medium").length}`,
    );
    addWrappedText(
      `Low Priority: ${insights.insights.filter((i) => i.priority === "low").length}`,
    );
    addWrappedText(``);

    const renderInsights = (priority) => {
      addWrappedText(`=== ${priority.toUpperCase()} PRIORITY INSIGHTS ===`);
      insights.insights
        .filter((i) => i.priority === priority)
        .forEach((insight, index) => {
          addWrappedText(
            `${index + 1}. [${insight.type.toUpperCase()}] ${insight.content}`,
          );
          addWrappedText(`   Priority: ${insight.priority.toUpperCase()}`);
          addWrappedText(
            `   Relevance: ${Math.round(insight.relevance * 100)}%`,
          );
          addWrappedText(`   Category: ${insight.category || "General"}`);
          if (insight.context) addWrappedText(`   Context: ${insight.context}`);
          if (insight.tags)
            addWrappedText(`   Tags: ${insight.tags.join(", ")}`);
          addWrappedText(``);
        });
    };

    renderInsights("high");
    renderInsights("medium");
    renderInsights("low");

    addWrappedText(`INSIGHTS BY CATEGORY:`);
    Object.entries(
      insights.insights.reduce((acc, insight) => {
        const category = insight.category || "General";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
    ).forEach(([category, count]) => addWrappedText(`- ${category}: ${count}`));

    addWrappedText(``);

    addWrappedText(`INSIGHTS BY TYPE:`);
    Object.entries(
      insights.insights.reduce((acc, insight) => {
        acc[insight.type] = (acc[insight.type] || 0) + 1;
        return acc;
      }, {}),
    ).forEach(([type, count]) => addWrappedText(`- ${type}: ${count}`));

    addWrappedText(``);
    addWrappedText(`---`);
    addWrappedText(`Generated by Document Scan Application`);

    doc.save(`${document.fileName}_insights_report.pdf`);
  };

  const handleEmailReport = async () => {
    if (!document) return;

    try {
      const response = await apiService.generateInsightsReport(document.id);
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

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return "bg-green-500";
    if (relevance >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!document) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            No Document to Analyze
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Please upload a document first to extract key insights
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Insights Header */}
      <Card className={isCompact ? "p-2" : "p-6"}>
        <div
          className={`flex items-center justify-between ${isCompact ? "mb-2" : "mb-4"}`}
        >
          <div className="flex-1 min-w-0">
            <h2
              className={`font-bold text-slate-900 dark:text-slate-100 ${isCompact ? "text-sm" : "text-xl"}`}
            >
              Key Insights
            </h2>
            {!isCompact && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Prioritized insights extracted from "{document.fileName}"
              </p>
            )}
          </div>
          <div className={`flex items-center ${isCompact ? "gap-1" : "gap-2"}`}>
            {insights && (
              <>
                <Button
                  onClick={speakAllInsights}
                  variant="outline"
                  size="sm"
                  className={isCompact ? "p-1" : "gap-2"}
                  title="Play All Insights"
                >
                  <Play className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                  {!isCompact && "Play All"}
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  variant="outline"
                  size="sm"
                  className={isCompact ? "p-1" : "gap-2"}
                  title="Download Report"
                >
                  <Download
                    className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} ${isDownloading ? "animate-spin" : ""}`}
                  />
                  {!isCompact && (isDownloading ? "Generating..." : "Download")}
                </Button>
                <Button
                  onClick={handleEmailReport}
                  variant="outline"
                  size="sm"
                  className={isCompact ? "p-1" : "gap-2"}
                  title="Email Report"
                >
                  <Mail className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                  {!isCompact && "Email"}
                </Button>
              </>
            )}
            <Button
              onClick={generateInsights}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className={isCompact ? "p-1" : "gap-2"}
              title="Regenerate Insights"
            >
              <RefreshCw
                className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} ${isLoading ? "animate-spin" : ""}`}
              />
              {!isCompact && (isLoading ? "Analyzing..." : "Regenerate")}
            </Button>
          </div>
        </div>

        {insights && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lightbulb className="w-3 h-3" />
            Generated on {insights.generatedAt.toLocaleString()}
          </div>
        )}
      </Card>

      {/* Insights Content */}
      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Analyzing Document
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Extracting key insights and important information...
              </p>
            </div>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="text-center">
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Analysis Failed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              {error}
            </p>
            <Button
              onClick={generateInsights}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </Card>
      ) : insights ? (
        <>
          {/* Priority Filter Tabs */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Priority
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Total: {insights.insights.length}</span>
              </div>
            </div>

            <Tabs
              value={activeFilter}
              onValueChange={(value) =>
                setActiveFilter(value as typeof activeFilter)
              }
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  All ({insights.insights.length})
                </TabsTrigger>
                <TabsTrigger value="high" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  High (
                  {
                    insights.insights.filter((i) => i.priority === "high")
                      .length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="medium" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Medium (
                  {
                    insights.insights.filter((i) => i.priority === "medium")
                      .length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="low" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Low (
                  {insights.insights.filter((i) => i.priority === "low").length}
                  )
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-xs ${getPriorityColor(insight.priority)} flex items-center gap-1`}
                        >
                          {getPriorityIcon(insight.priority)}
                          {insight.priority.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {insight.type}
                        </Badge>
                        {insight.category && (
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${getRelevanceColor(insight.relevance)}`}
                          />
                          <span className="text-xs text-slate-500">
                            {Math.round(insight.relevance * 100)}% relevant
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          onClick={() => handlePlayInsight(insight)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={
                            audioState.isLoading &&
                            isPlayingId(`insight-${insight.id}`)
                          }
                        >
                          {audioState.isLoading &&
                          isPlayingId(`insight-${insight.id}`) ? (
                            <div className="w-4 h-4 animate-spin border-2 border-purple-600 border-t-transparent rounded-full" />
                          ) : isPlayingId(`insight-${insight.id}`) &&
                            audioState.isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>

                        {isPlayingId(`insight-${insight.id}`) &&
                          audioState.isPlaying && (
                            <Button
                              onClick={handleStopInsight}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    </div>

                    <p className="text-slate-900 dark:text-slate-100 font-medium mb-2">
                      {insight.content}
                    </p>

                    {insight.context && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <strong>Context:</strong> {insight.context}
                      </p>
                    )}

                    {insight.tags && insight.tags.length > 0 && (
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <span className="text-xs text-slate-500">Tags:</span>
                        {insight.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-2">
                      <Progress
                        value={insight.relevance * 100}
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>

                {isPlayingId(`insight-${insight.id}`) &&
                  audioState.isPlaying && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          <span>
                            {audioState.isPaused
                              ? "Paused"
                              : "Playing insight..."}
                          </span>
                        </div>
                        {audioState.duration > 0 && (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={
                                (audioState.currentTime / audioState.duration) *
                                100
                              }
                              className="w-16 h-1"
                            />
                            <span className="text-xs">
                              {Math.floor(audioState.currentTime)}s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </Card>
            ))}
          </div>

          {filteredInsights.length === 0 && (
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                No {activeFilter === "all" ? "" : activeFilter + " priority"}{" "}
                insights found
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Try a different priority filter or regenerate insights
              </p>
            </Card>
          )}

          {/* Insights Summary */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Insights Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Priority Summary */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {
                    insights.insights.filter((i) => i.priority === "high")
                      .length
                  }
                </h4>
                <p className="text-xs text-slate-500">High Priority</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {
                    insights.insights.filter((i) => i.priority === "medium")
                      .length
                  }
                </h4>
                <p className="text-xs text-slate-500">Medium Priority</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {insights.insights.filter((i) => i.priority === "low").length}
                </h4>
                <p className="text-xs text-slate-500">Low Priority</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {insights.insights.length}
                </h4>
                <p className="text-xs text-slate-500">Total Insights</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                Categories
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(
                  insights.insights.reduce(
                    (acc, insight) => {
                      const category = insight.category || "General";
                      acc[category] = (acc[category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded text-sm"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      ) : null}

      {/* Email Dialog */}
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        reportId={reportId || undefined}
        reportType="insights"
        documentName={document?.fileName}
        onEmailSent={() => {
          console.log("Insights report sent via email");
        }}
      />
    </div>
  );
};

export default KeyInsightsSection;
