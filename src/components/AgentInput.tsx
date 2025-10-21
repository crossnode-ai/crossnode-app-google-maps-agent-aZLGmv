typescript
"use client";

import React, { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { fetchAgentResponse } from "@/lib/api";
import { AgentResponse } from "@/types";
import { MapDisplay } from "@/components/MapDisplay";

const AGENT_ID = "45df3b25-b49b-464f-b45e-894b994266bb";

export function AgentInput() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }
    if (status === "loading") {
      setError("Please wait for session to load.");
      return;
    }
    if (!session?.user?.id) {
      setError("Authentication required. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await fetchAgentResponse(AGENT_ID, query, session.user.id);
      setResponse(data);
    } catch (err) {
      console.error("Error fetching agent response:", err);
      setError("Failed to get a response from the agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [query, session, status]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Google Maps Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="text"
              placeholder="Ask about locations, routes, or places..."
              value={query}
              onChange={handleQueryChange}
              onKeyPress={handleKeyPress}
              className="flex-grow"
              aria-label="Agent query input"
            />
            <Button onClick={handleSubmit} disabled={isLoading || status === "loading"}>
              {isLoading ? <Spinner className="h-4 w-4" /> : "Ask"}
            </Button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center mt-8"
          >
            <Spinner className="h-12 w-12" />
          </motion.div>
        )}
      </AnimatePresence>

      {response && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-3xl mt-8"
        >
          <MapDisplay response={response} />
        </motion.div>
      )}
    </div>
  );
}