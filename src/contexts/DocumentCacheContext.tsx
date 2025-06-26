import { createContext, useContext, useState, ReactNode } from "react";
import { DocumentSummary, QueryResponse, DocumentInsights } from "@/types";

interface DocumentCache {
  [documentId: string]: {
    summary?: DocumentSummary;
    queries: QueryResponse[];
    insights?: DocumentInsights;
    isLoadingSummary?: boolean;
    isLoadingInsights?: boolean;
  };
}

interface DocumentCacheContextType {
  cache: DocumentCache;
  setSummary: (documentId: string, summary: DocumentSummary) => void;
  addQuery: (documentId: string, query: QueryResponse) => void;
  setInsights: (documentId: string, insights: DocumentInsights) => void;
  getSummary: (documentId: string) => DocumentSummary | undefined;
  getQueries: (documentId: string) => QueryResponse[];
  getInsights: (documentId: string) => DocumentInsights | undefined;
  clearCache: (documentId: string) => void;
  clearAllCache: () => void;
  setLoadingSummary: (documentId: string, loading: boolean) => void;
  setLoadingInsights: (documentId: string, loading: boolean) => void;
  isLoadingSummary: (documentId: string) => boolean;
  isLoadingInsights: (documentId: string) => boolean;
}

const DocumentCacheContext = createContext<
  DocumentCacheContextType | undefined
>(undefined);

export const useDocumentCache = () => {
  const context = useContext(DocumentCacheContext);
  if (!context) {
    throw new Error(
      "useDocumentCache must be used within DocumentCacheProvider",
    );
  }
  return context;
};

interface DocumentCacheProviderProps {
  children: ReactNode;
}

export const DocumentCacheProvider = ({
  children,
}: DocumentCacheProviderProps) => {
  const [cache, setCache] = useState<DocumentCache>({});

  const setSummary = (documentId: string, summary: DocumentSummary) => {
    setCache((prev) => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        summary,
        isLoadingSummary: false,
      },
    }));
  };

  const addQuery = (documentId: string, query: QueryResponse) => {
    setCache((prev) => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        queries: [...(prev[documentId]?.queries || []), query],
      },
    }));
  };

  const setInsights = (documentId: string, insights: DocumentInsights) => {
    setCache((prev) => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        insights,
        isLoadingInsights: false,
      },
    }));
  };

  const getSummary = (documentId: string) => {
    return cache[documentId]?.summary;
  };

  const getQueries = (documentId: string) => {
    return cache[documentId]?.queries || [];
  };

  const getInsights = (documentId: string) => {
    return cache[documentId]?.insights;
  };

  const clearCache = (documentId: string) => {
    setCache((prev) => {
      const newCache = { ...prev };
      delete newCache[documentId];
      return newCache;
    });
  };

  const clearAllCache = () => {
    setCache({});
  };

  const setLoadingSummary = (documentId: string, loading: boolean) => {
    setCache((prev) => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        isLoadingSummary: loading,
        queries: prev[documentId]?.queries || [],
      },
    }));
  };

  const setLoadingInsights = (documentId: string, loading: boolean) => {
    setCache((prev) => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        isLoadingInsights: loading,
        queries: prev[documentId]?.queries || [],
      },
    }));
  };

  const isLoadingSummary = (documentId: string) => {
    return cache[documentId]?.isLoadingSummary || false;
  };

  const isLoadingInsights = (documentId: string) => {
    return cache[documentId]?.isLoadingInsights || false;
  };

  const value: DocumentCacheContextType = {
    cache,
    setSummary,
    addQuery,
    setInsights,
    getSummary,
    getQueries,
    getInsights,
    clearCache,
    clearAllCache,
    setLoadingSummary,
    setLoadingInsights,
    isLoadingSummary,
    isLoadingInsights,
  };

  return (
    <DocumentCacheContext.Provider value={value}>
      {children}
    </DocumentCacheContext.Provider>
  );
};
