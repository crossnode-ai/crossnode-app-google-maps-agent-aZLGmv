// src/types/index.ts

/**
 * Base structure for API responses.
 */
interface ApiResponseBase {
  text?: string;
  coordinates?: { lat: number; lng: number };
  route?: {
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        html_instructions: string;
        maneuver?: string;
      }>;
    }>;
    overview_polyline: { points: string };
    bounds: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } };
  };
  mapHtml?: string;
  error?: { message: string };
}

/**
 * Represents the structure of a single message in the chat history.
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Represents the state of the application's chat interface.
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Represents the structure of the API response from the Google Maps Agent.
 */
export type GoogleMapsAgentResponse = ApiResponseBase;

/**
 * Represents the structure of the data sent to the Google Maps Agent API.
 */
export interface GoogleMapsAgentRequest {
  query: string;
}

/**
 * Represents the state of the map display component.
 */
export interface MapDisplayState {
  center?: { lat: number; lng: number };
  zoom?: number;
  route?: any; // More specific type can be defined if needed
  mapHtml?: string;
}

/**
 * Represents the overall application state.
 */
export interface AppState {
  chat: ChatState;
  map: MapDisplayState;
  userInput: string;
}