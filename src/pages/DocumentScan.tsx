import { useState } from "react";
import { DocumentData, TabType } from "@/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  FileText,
  MessageCircle,
  Lightbulb,
  Sparkles,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDocumentCache } from "@/contexts/DocumentCacheContext";
import DocumentViewer from "@/components/DocumentViewer";
import SecureUploadComponent from "@/components/SecureUploadComponent";
import SummarySection from "@/components/SummarySection";
import QuerySection from "@/components/QuerySection";
import KeyInsightsSection from "@/components/KeyInsightsSection";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfile from "@/components/UserProfile";
import GuestRestrictionsHeader from "@/components/GuestRestrictionsHeader";

const DocumentScan = () => {
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [isDocumentExpanded, setIsDocumentExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<TabType, boolean>
  >({
    upload: true,
    summary: false,
    query: false,
    insights: false,
  });

  const { clearAllCache } = useDocumentCache();

  const handleDocumentUploaded = (document: DocumentData) => {
    // Clear all cached data when new document is uploaded
    clearAllCache();

    setCurrentDocument(document);
    // Auto-navigate to Summary tab after successful upload
    setActiveTab("summary");
    // Expand summary section and collapse upload
    setExpandedSections({
      upload: false,
      summary: true,
      query: false,
      insights: false,
    });
  };

  const handleLoginRedirect = () => {
    // Navigate to login page
    window.location.href = "/login";
  };

  const toggleSection = (section: TabType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    {
      value: "upload" as TabType,
      label: "Upload",
      icon: Upload,
      description: "Upload or re-upload documents",
    },
    {
      value: "summary" as TabType,
      label: "Summary",
      icon: FileText,
      description: "AI-generated document summary",
    },
    {
      value: "query" as TabType,
      label: "Query",
      icon: MessageCircle,
      description: "Ask questions about your document",
    },
    {
      value: "insights" as TabType,
      label: "Key Insights",
      icon: Lightbulb,
      description: "Important findings and data points",
    },
  ];

  // Component for rendering collapsible sections
  const CollapsibleSection = ({ tab }: { tab: (typeof tabs)[0] }) => {
    const IconComponent = tab.icon;
    const isExpanded = expandedSections[tab.value];

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={() => toggleSection(tab.value)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-md ${
                  isExpanded
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <IconComponent
                  className={`w-3 h-3 ${
                    isExpanded
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  {tab.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  {tab.description}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-1">
          <div className="px-2 pb-2">
            <div className="border border-slate-200 dark:border-slate-700 rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
              {tab.value === "upload" && (
                <SecureUploadComponent
                  onDocumentUploaded={handleDocumentUploaded}
                  currentDocument={currentDocument}
                  onLoginRedirect={handleLoginRedirect}
                  className="compact-mode"
                />
              )}
              {tab.value === "summary" && (
                <SummarySection
                  document={currentDocument}
                  className="compact-mode"
                  isCompact={true}
                />
              )}
              {tab.value === "query" && (
                <QuerySection
                  document={currentDocument}
                  className="compact-mode"
                  isCompact={true}
                />
              )}
              {tab.value === "insights" && (
                <KeyInsightsSection
                  document={currentDocument}
                  className="compact-mode"
                  isCompact={true}
                />
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="min-h-screen gradient-bg transition-colors duration-300 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Document Scan
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-powered document analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle
                variant="outline"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              />
              <UserProfile />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Upload, analyze, and extract insights from your documents with
              AI-powered processing
            </p>
          </div>
        </div>

        {/* Guest Restrictions Banner - Only shown when triggered */}

        {/* Main Content Grid - 70/30 split when expanded, 33/67 when normal */}
        <div
          className={`grid gap-8 max-w-7xl mx-auto transition-all duration-300 ${
            isDocumentExpanded
              ? "grid-cols-1 lg:grid-cols-10" // 70/30 split: 7 columns for document, 3 for tabs
              : "grid-cols-1 lg:grid-cols-3" // Normal: 33/67 split
          }`}
        >
          {/* Document Viewer - Dynamic width */}
          <div
            className={`transition-all duration-300 ${
              isDocumentExpanded ? "lg:col-span-7" : "lg:col-span-1"
            }`}
          >
            <div className="sticky top-8">
              {/* Document Viewer Header with Expand/Collapse Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Preview
                  {isDocumentExpanded && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                    >
                      Expanded View (70%)
                    </Badge>
                  )}
                </h2>

                {/* Expand/Collapse Button */}
                {currentDocument && (
                  <Button
                    variant={isDocumentExpanded ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsDocumentExpanded(!isDocumentExpanded)}
                    className={`gap-2 ${
                      isDocumentExpanded
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : ""
                    }`}
                  >
                    {isDocumentExpanded ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        Expand (70%)
                      </>
                    )}
                  </Button>
                )}
              </div>

              <DocumentViewer
                document={currentDocument}
                className={`overflow-auto transition-all duration-300 ${
                  isDocumentExpanded ? "h-[85vh]" : "h-[600px]"
                }`}
              />
            </div>
          </div>

          {/* Main Content - Dynamic width */}
          <div
            className={`transition-all duration-300 ${
              isDocumentExpanded ? "lg:col-span-3" : "lg:col-span-2"
            }`}
          >
            {isDocumentExpanded ? (
              /* Compact Collapsible Sections for Expanded Mode */
              <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-xl border-0 h-[85vh] overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          Document Tools
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Compact View (30%)
                        </p>
                      </div>
                    </div>
                    <ThemeToggle
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    {tabs.map((tab) => (
                      <CollapsibleSection key={tab.value} tab={tab} />
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              /* Normal Tab Interface for Regular Mode */
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as TabType)}
                  className="h-full flex flex-col"
                >
                  {/* Custom Tab Headers */}
                  <div className="border-b border-slate-200 dark:border-slate-700 p-6 pb-0 flex-shrink-0">
                    <TabsList className="grid w-full grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.value;
                        return (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={`flex flex-row gap-2 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all ${
                              isActive
                                ? "items-center justify-start"
                                : "items-start justify-center"
                            } lg:mb-0 lg:py-3 mb-5 py-2 lg:justify-start lg:items-center max-lg:justify-center max-lg:items-start`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {tab.label}
                            </span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {/* Tab Description */}
                    <div className="mt-4 mb-2">
                      {tabs.map(
                        (tab) =>
                          activeTab === tab.value && (
                            <Badge
                              key={tab.value}
                              variant="outline"
                              className="text-xs"
                            >
                              {tab.description}
                            </Badge>
                          ),
                      )}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent value="upload" className="mt-0 h-full">
                      <SecureUploadComponent
                        onDocumentUploaded={handleDocumentUploaded}
                        currentDocument={currentDocument}
                        onLoginRedirect={handleLoginRedirect}
                      />
                    </TabsContent>

                    <TabsContent value="summary" className="mt-0 h-full">
                      <SummarySection document={currentDocument} />
                    </TabsContent>

                    <TabsContent value="query" className="mt-0 h-full">
                      <QuerySection document={currentDocument} />
                    </TabsContent>

                    <TabsContent value="insights" className="mt-0 h-full">
                      <KeyInsightsSection document={currentDocument} />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            )}
          </div>
        </div>

        {/* Footer - Always at bottom, no overlap */}
        {!isDocumentExpanded && (
          <footer className="w-full mt-auto pt-16">
            <div className="max-w-7xl mx-auto text-center border-t border-slate-200 dark:border-slate-700 pt-8 pb-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Powered by AI • Secure document processing • Enterprise ready
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DocumentScan;
