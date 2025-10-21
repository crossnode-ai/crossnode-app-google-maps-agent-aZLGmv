typescript
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { fetchAgentResponse } from "@/lib/api";
import { AgentResponse } from "@/types";

interface MapDisplayProps {
  query: string;
  onResponse: (response: AgentResponse) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ query, onResponse }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const handleFetchMapData = useCallback(async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setMapHtml(null);
    setLocation(null);

    try {
      const response = await fetchAgentResponse(query, session?.accessToken);
      if (response) {
        onResponse(response);
        if (response.mapHtml) {
          setMapHtml(response.mapHtml);
        }
        if (response.coordinates) {
          setLocation(`${response.coordinates.lat}, ${response.coordinates.lng}`);
        } else if (response.text) {
          // Attempt to extract location from text if coordinates are not directly provided
          // This is a simplified approach; a more robust solution might involve NLP
          const potentialLocation = response.text.match(/at\s+(.*?)(?:\.|\,|$)/i)?.[1];
          if (potentialLocation) {
            setLocation(potentialLocation.trim());
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching map data:", err);
      setError(err.message || "Failed to fetch map data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, session?.accessToken, onResponse]);

  useEffect(() => {
    handleFetchMapData();
  }, [handleFetchMapData]);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Map Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && !mapHtml && !location && (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            No map data available for this query.
          </div>
        )}

        {mapHtml && (
          <div
            className="w-full aspect-video rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: mapHtml }}
          />
        )}

        {location && (
          <div className="mt-4 p-3 bg-secondary rounded-md flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Location: {location}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapDisplay;