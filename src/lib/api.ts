typescript
// src/lib/api.ts
"use client";

import { Session } from "next-auth";
import { getSession } from "next-auth/react";

const AGENT_ID = "45df3b25-b49b-464f-b45e-894b994266bb";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponseBase {
  text?: string;
  coordinates?: { lat: number; lng: number };
  route?: {
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
    }>;
    overview_polyline: { points: string };
    bounds: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } };
  };
  mapHtml?: string;
}

interface ApiError {
  error: string;
  message: string;
}

type ApiResponse = ApiResponseBase & ApiError;

export const sendMessageToAgent = async (
  message: string,
  session: Session | null
): Promise<ApiResponse> => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  const token = session?.user?.token;

  try {
    const response = await fetch(`${API_URL}/agent/${AGENT_ID}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message to agent:", error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
};

export const getAgentSession = async () => {
  return await getSession();
};