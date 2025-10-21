typescript
// src/hooks/useGoogleMapsAgent.ts
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { fetchAgentResponse } from "@/lib/api";
import { AgentResponse } from "@/types";

const AGENT_ID = "45df3b25-b49b-464f-b45e-894b994266bb";

interface UseGoogleMapsAgentOptions {
  initialQuery?: string;
}

export function useGoogleMapsAgent(options?: UseGoogleMapsAgentOptions) {
  const { initialQuery = "" } = options || {};
  const [query, setQuery] = useState<string>(initialQuery);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const submitQuery = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }
    if (!session?.user?.accessToken) {
      setError("Authentication token not found. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await fetchAgentResponse(
        AGENT_ID,
        query,
        session.user.accessToken
      );
      setResponse(data);
    } catch (err: any) {
      console.error("Error fetching agent response:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [query, session?.user?.accessToken]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return {
    query,
    setQuery,
    response,
    isLoading,
    error,
    handleQueryChange,
    submitQuery,
  };
}