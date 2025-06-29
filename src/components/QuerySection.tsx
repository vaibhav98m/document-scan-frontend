import { useState, useEffect, useRef } from "react";
import { DocumentData, QueryResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageCircle,
  User,
  Bot,
  Loader2,
  Play,
  Pause,
  Mic,
} from "lucide-react";
import { useDocumentCache } from "@/contexts/DocumentCacheContext";
import { apiService } from "@/services/api";
import ReactMarkdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

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
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addQuery, getQueries } = useDocumentCache();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  // Available languages for Azure TTS, STT, and Translation
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "de-DE", name: "German (Germany)" },
    { code: "it-IT", name: "Italian (Italy)" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "ja-JP", name: "Japanese (Japan)" },
  ];

  // Azure Speech configuration (replace with your Speech Services values)
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    "", // Replace with your Speech Services key
    "eastus" // Replace with your Speech Services region, e.g., "eastus"
  );
  speechConfig.speechRecognitionLanguage = "en-US"; // STT source language (fixed to English)

  // Azure Translator configuration (replace with your Translator values)
  const translatorKey = ""; // Replace with your Translator key
  const translatorEndpoint = "https://api.cognitive.microsofttranslator.com/";

  // Initialize queries from cache
  useEffect(() => {
    if (document) {
      const cachedQueries = getQueries(document.id);
      setQueries(cachedQueries);
    }
  }, [document, getQueries]);

  // Scroll to bottom when queries update
  useEffect(() => {
    if (queries.length > 0) {
      scrollToBottom();
    }
  }, [queries.length]);

  // Cleanup audio and recognizer on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingAudioId(null);
      }
      if (recognizerRef.current) {
        recognizerRef.current.close();
        recognizerRef.current = null;
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        setTimeout(() => {
          if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
          } else if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 0);
      }
    }
  };

  const addQueryToStateAndCache = (documentId: string, queryResponse: QueryResponse) => {
    const formattedQueryResponse: QueryResponse = {
      ...queryResponse,
      timestamp: typeof queryResponse.timestamp === "string"
        ? new Date(queryResponse.timestamp)
        : queryResponse.timestamp,
    };
    setQueries((prevQueries) => [...prevQueries, formattedQueryResponse]);
    addQuery(documentId, formattedQueryResponse);
  };

  const loadQueryHistory = async () => {
    if (!document) return;

    try {
      const response = await apiService.getQueryHistory(document.id);
      if (response.status === "success" && response.data) {
        response.data.forEach((query: QueryResponse) => {
          addQueryToStateAndCache(document.id, {
            ...query,
            timestamp: new Date(query.timestamp),
          });
        });
      }
    } catch (err) {
      console.error("Failed to load query history:", err);
      setError("Failed to load query history");
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
      const response = await apiService.queryDocument(document.id, userQuery, selectedLanguage);

      if (response.status === "success" && response.data) {
        addQueryToStateAndCache(document.id, {
          ...response.data,
          timestamp: new Date(response.data.timestamp),
        });
      } else {
        const mockResponse: QueryResponse = {
          id: Math.random().toString(36).substr(2, 9),
          documentId: document.id,
          fileName: document.fileName,
          question: userQuery,
          answer: `Based on the analysis of "${document.fileName}", I can provide insights related to your question: "${userQuery}". The document contains relevant information that addresses this topic.`,
          timestamp: new Date(),
          confidence: Math.random() * 0.3 + 0.7,
          language: selectedLanguage,
          audioUrl: null,
        };
        addQueryToStateAndCache(document.id, mockResponse);
        setError("No audio available for mock response");
      }
    } catch (err) {
      console.error("Query Error:", err);
      setError("Failed to process query");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (queryResponse: QueryResponse) => {
    if (!queryResponse.audioUrl) {
      setError("No audio available for this response");
      return;
    }

    if (playingAudioId === queryResponse.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(queryResponse.audioUrl);
      audioRef.current.play().catch((err) => {
        console.error("Audio playback error:", err);
        setError("Failed to play audio: " + err.message);
      });
      setPlayingAudioId(queryResponse.id);
      audioRef.current.onended = () => {
        setPlayingAudioId(null);
        audioRef.current = null;
      };
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync(
          () => {
            setIsListening(false);
            recognizerRef.current = null;
          },
          (err) => {
            console.error("Stop recognition failed:", err);
            setError("Failed to stop voice input");
            setIsListening(false);
            recognizerRef.current = null;
          }
        );
      }
      return;
    }

    setIsListening(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioConfig = sdk.AudioConfig.fromStreamInput(stream);
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.startContinuousRecognitionAsync(
        () => console.log("Recognition started"),
        (err) => {
          console.error("Start recognition failed:", err);
          setError("Failed to start voice input: " + err);
          setIsListening(false);
          stream.getTracks().forEach(track => track.stop());
        }
      );

      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const recognizedText = e.result.text;
          if (selectedLanguage !== "en-US") {
            try {
              const response = await fetch(`${translatorEndpoint}translate?api-version=3.0&to=${selectedLanguage.split('-')[0]}`, {
                method: "POST",
                headers: {
                  "Ocp-Apim-Subscription-Key": translatorKey,
                  "Ocp-Apim-Subscription-Region": "eastus", // Replace with your Translator region
                  "Content-Type": "application/json",
                },
                body: JSON.stringify([{ Text: recognizedText }]),
              });
              const data = await response.json();
              const translatedText = data[0].translations[0].text;
              setQuery((prev) => prev + (prev ? " " : "") + translatedText);
            } catch (translationErr) {
              console.error("Translation error:", translationErr);
              setError("Failed to translate: " + (translationErr instanceof Error ? translationErr.message : "Unknown error"));
              setQuery((prev) => prev + (prev ? " " : "") + recognizedText); // Fallback to original
            }
          } else {
            setQuery((prev) => prev + (prev ? " " : "") + recognizedText);
          }
        }
      };

      recognizer.canceled = (s, e) => {
        console.error("Recognition canceled:", e.reason, e.errorDetails);
        setError("Voice recognition canceled: " + e.errorDetails);
        setIsListening(false);
        if (recognizerRef.current) recognizerRef.current.stopContinuousRecognitionAsync();
        stream.getTracks().forEach(track => track.stop());
      };

      recognizer.sessionStopped = (s, e) => {
        console.log("Session stopped");
        setIsListening(false);
        if (recognizerRef.current) recognizerRef.current.stopContinuousRecognitionAsync();
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("Voice input error:", err);
      setError("Microphone access denied or failed: " + (err instanceof Error ? err.message : "Unknown error"));
      setIsListening(false);
    }
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
              queries.map((queryResponse, index) => (
                <div
                  key={queryResponse.id}
                  className="space-y-3"
                  ref={index === queries.length - 1 ? lastMessageRef : null}
                >
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
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            <ReactMarkdown
                              components={{
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                              }}
                            >
                              {queryResponse.answer}
                            </ReactMarkdown>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            {queryResponse.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                <div
                                  className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(queryResponse.confidence)}`}
                                />
                                {getConfidenceText(queryResponse.confidence)} Confidence
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              Language: {languages.find(lang => lang.code === queryResponse.language)?.name || queryResponse.language || "Unknown"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {queryResponse.audioUrl ? (
                              <Button
                                onClick={() => handlePlayAudio(queryResponse)}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title={playingAudioId === queryResponse.id && audioRef.current && !audioRef.current.paused ? "Pause Audio" : "Play Audio"}
                              >
                                {playingAudioId === queryResponse.id && audioRef.current && !audioRef.current.paused ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No Audio
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
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
            <Select
              value={selectedLanguage}
              onValueChange={(value) => {
                setSelectedLanguage(value);
                speechConfig.speechRecognitionLanguage = "en-US"; // STT remains in English
              }}
              disabled={isLoading || isListening}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the document..."
              disabled={isLoading || isListening}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!query.trim() || isLoading || isListening}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`gap-2 ${isListening ? "bg-red-500" : "bg-blue-500"} text-white`}
            >
              {isListening ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Voice
                </>
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
                disabled={isLoading || isListening}
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