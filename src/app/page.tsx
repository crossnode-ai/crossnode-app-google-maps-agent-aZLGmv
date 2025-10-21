src/app/page.tsx
typescript
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Map } from "lucide-react";

// Define the structure of the response from the agent API
interface AgentResponse {
  text?: string;
  coordinates?: { lat: number; lng: number };
  route?: any; // Placeholder for route details
  mapHtml?: string;
}

const AGENT_ID = "45df3b25-b49b-464f-b45e-894b994266bb";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/agent/${AGENT_ID}/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token || ""}`,
        },
        body: JSON.stringify({
          input: query,
          // You might want to pass session data or other context here
          // context: { userId: session?.user?.id }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Failed to fetch from agent:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, session]);

  const renderMap = () => {
    if (response?.mapHtml) {
      return (
        <div
          className="w-full aspect-video rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: response.mapHtml }}
        />
      );
    }
    if (response?.coordinates) {
      // Basic fallback if mapHtml is not provided but coordinates are
      // In a real app, you'd likely use a dedicated map component here
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Map for: {response.coordinates.lat}, {response.coordinates.lng}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4">
          Google Maps Agent
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore locations, get directions, and discover points of interest with our intelligent Google Maps agent.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Enter your query</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="e.g., 'Find the nearest coffee shop' or 'Directions from Eiffel Tower to Louvre'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  disabled={isLoading || status === "loading"}
                  className="w-full"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || status === "loading" || !query.trim()}
                  className="w-full"
                >
                  {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : <Map className="h-4 w-4 mr-2" />}
                  {isLoading ? "Processing..." : "Get Information"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2 lg:w-2/3">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full min-h-[300px] bg-muted rounded-lg shadow-lg"
              >
                <Spinner className="h-12 w-12" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Alert variant="destructive" className="shadow-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {response && !isLoading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Agent Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {response.text && (
                      <div className="prose max-w-none">
                        <p>{response.text}</p>
                      </div>
                    )}
                    {renderMap()}
                    {response.route && (
                      <div className="mt-4 p-4 bg-secondary rounded-md">
                        <h3 className="font-semibold mb-2">Route Details:</h3>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(response.route, null, 2)}
                        </pre>
                      </div>
                    )}
                    {!response.text && !response.mapHtml && !response.route && (
                      <p className="text-muted-foreground">No specific information to display.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}