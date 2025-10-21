// src/components/ResultCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentResponse } from "@/types";
import { cn } from "@/lib/utils";
import { MapDisplay } from "./MapDisplay";

interface ResultCardProps {
  response: AgentResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function ResultCard({ response, isLoading, error }: ResultCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg animate-pulse">
        <CardHeader>
          <CardTitle>Agent Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg bg-red-100 border-red-400 text-red-700">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return null;
  }

  const hasMapData = response.coordinates || response.route || response.embedMapHtml;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Agent Response</CardTitle>
      </CardHeader>
      <CardContent>
        {response.text && (
          <div className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {response.text}
          </div>
        )}

        {hasMapData && (
          <div className="mt-4">
            {response.embedMapHtml ? (
              <div
                className="w-full aspect-video rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: response.embedMapHtml }}
              />
            ) : (
              <MapDisplay
                initialCoordinates={response.coordinates}
                route={response.route}
                className="w-full h-64 rounded-lg shadow-md"
              />
            )}
          </div>
        )}

        {response.route && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <h3 className="font-semibold mb-2">Route Details:</h3>
            <ul className="space-y-1">
              {response.route.legs.map((leg, index) => (
                <li key={index}>
                  <strong>Leg {index + 1}:</strong>
                  <span className="ml-2">
                    Distance: {leg.distance.text} ({leg.distance.value} meters)
                  </span>
                  <span className="ml-2">
                    Duration: {leg.duration.text} ({leg.duration.value} seconds)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}