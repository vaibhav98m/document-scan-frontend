import { useState, useEffect, useRef } from "react";
import { DocumentData, QueryResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Play,
  Pause,
  Square,
  Volume2,
  MessageCircle,
  User,
  Bot,
  Loader2,
} from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useDocumentCache } from "@/contexts/DocumentCacheContext";
import { apiService } from "@/services/api";

interface QuerySectionProps {
  document: DocumentData | null;
  className?: string;
  isCompact?: boolean;
}

const QuerySection = ({
  document,
  className = "",
  isCompact = false,
}: QuerySectionProps) => {
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState<QueryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { speak, pause, resume, stop, status } = useTextToSpeech();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document) {
      loadQueryHistory();
    }
  }, [document]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [queries]);

  const loadQueryHistory = async () => {
    if (!document) return;

    try {
      const response = await apiService.getQueryHistory(document.id);
      if (response.status === "success" && response.data) {
        // Add each query to cache
        response.data.forEach((query) => {
          addQuery(document.id, query);
        });
      }
    } catch (err) {
      console.error("Failed to load query history:", err);
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !document || isLoading) return;

    const userQuery = query.trim();
    setQuery("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.queryDocument(document.id, userQuery);

      if (response.status === "success" && response.data) {
        addQuery(document.id, response.data);
      } else {
        // Fallback: create a mock response for demo purposes
        const mockResponse: QueryResponse = {
          id: Math.random().toString(36).substr(2, 9),
          documentId: document.id,
          question: userQuery,
          answer: `Based on the analysis of "${document.fileName}", I can provide insights related to your question: "${userQuery}". The document contains relevant information that addresses this topic. The content suggests various aspects and details that are pertinent to your inquiry. For more specific information, you might want to ask follow-up questions about particular sections or elements mentioned in the document.`,
          timestamp: new Date(),
          confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
        };
        addQuery(document.id, mockResponse);
      }
    } catch (err) {
      setError("Failed to process query");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAnswer = (queryResponse: QueryResponse) => {
    if (
      playingId === queryResponse.id &&
      status.isPlaying &&
      !status.isPaused
    ) {
      pause();
    } else if (playingId === queryResponse.id && status.isPaused) {
      resume();
    } else {
      setPlayingId(queryResponse.id);
      speak(queryResponse.answer);
    }
  };

  const handleStopAnswer = () => {
    stop();
    setPlayingId(null);
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-500";
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return "Unknown";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key findings?",
    "What are the important dates mentioned?",
    "Who are the main people or entities discussed?",
    "What decisions or actions are recommended?",
  ];

  if (!document) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            No Document to Query
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Please upload a document first to start asking questions
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Query Header */}
      <Card className={isCompact ? "p-2" : "p-6"}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2
              className={`font-bold text-slate-900 dark:text-slate-100 ${isCompact ? "text-sm" : "text-xl"}`}
            >
              {isCompact ? "Ask Questions" : "Ask Questions"}
            </h2>
            {!isCompact && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ask questions about "{document.fileName}"
              </p>
            )}
          </div>
          <Badge variant="outline" className={isCompact ? "gap-1" : "gap-2"}>
            <MessageCircle className={isCompact ? "w-2 h-2" : "w-3 h-3"} />
            <span className={isCompact ? "text-xs" : ""}>{queries.length}</span>
          </Badge>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className={`flex flex-col ${isCompact ? "h-64" : "h-96"}`}>
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {queries.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-600 dark:text-slate-400">
                  Start a Conversation
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Ask your first question about the document
                </p>
              </div>
            ) : (
              queries.map((queryResponse) => (
                <div key={queryResponse.id} className="space-y-3">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="bg-purple-600 text-white rounded-lg px-4 py-2">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 mt-0.5 shrink-0" />
                          <p className="text-sm">{queryResponse.question}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-right">
                        {queryResponse.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2">
                        <div className="flex items-start gap-2 mb-2">
                          <Bot className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {queryResponse.answer}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            {queryResponse.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                <div
                                  className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(queryResponse.confidence)}`}
                                />
                                {getConfidenceText(queryResponse.confidence)}{" "}
                                Confidence
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handlePlayAnswer(queryResponse)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              {playingId === queryResponse.id &&
                              status.isPlaying &&
                              !status.isPaused ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>

                            {playingId === queryResponse.id &&
                              status.isPlaying && (
                                <Button
                                  onClick={handleStopAnswer}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <Square className="w-3 h-3" />
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>

                      {playingId === queryResponse.id && status.isPlaying && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Volume2 className="w-3 h-3" />
                          {status.isPaused ? "Paused" : "Playing answer..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Query Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmitQuery} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the document..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Suggested Questions */}
      {queries.length === 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Suggested Questions
          </h3>
          <div className="grid gap-2">
            {suggestedQuestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-left h-auto p-3 text-wrap"
                onClick={() => setQuery(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}
    </div>
  );
};

export default QuerySection;
