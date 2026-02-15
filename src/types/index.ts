// =============== Core Types ===============

export type IdeaType = 'text' | 'image' | 'link';

export interface Idea {
  id: number;
  type: IdeaType;
  content: string;
  fileName?: string;
  analyzed: boolean;
  createdAt: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Analysis {
  destination: string;
  duration: string;
  interests: string[];
  style: string;
  extractedPlaces: string[];
  suggestions: string;
}

export interface Activity {
  time: string;
  name: string;
  location: string;
  note?: string;
  googleMapsUrl?: string;
}

export interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

export interface ItinerarySummary {
  budget: string;
  style: string;
  highlights: string[];
}

export interface Itinerary {
  title: string;
  destination: string;
  duration: string;
  summary: ItinerarySummary;
  days: Day[];
}

export interface Usage {
  remaining: number | null;
  limit: number | null;
}

export interface AppState {
  ideas: Idea[];
  sessionId: string;
  conversation: Message[];
  itinerary: Itinerary | null;
  analysis: Analysis | null;
  analyzing: boolean;
  usage: Usage;
}

// =============== API Types ===============

export interface GeminiRequest {
  prompt: string;
  includeHistory?: boolean;
}

export interface GeminiResponse {
  success: boolean;
  response: string;
  usage: Usage;
}

export interface GeminiErrorResponse {
  error: string;
  message?: string;
  resetTime?: string;
}

// =============== Component Props Types ===============

export interface IdeaItemProps {
  idea: Idea;
  onRemove: (id: number) => void;
}

export interface MessageItemProps {
  message: Message;
}

export interface ItineraryCardProps {
  itinerary: Itinerary;
}

export interface DayCardProps {
  day: Day;
}

export interface ActivityCardProps {
  activity: Activity;
}

// =============== Hook Return Types ===============

export interface UseIdeasReturn {
  ideas: Idea[];
  addTextIdea: (content: string) => void;
  addImageIdea: (file: File) => Promise<void>;
  addLinkIdea: (url: string) => void;
  removeIdea: (id: number) => void;
}

export interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAnalysisReturn {
  analyze: () => Promise<void>;
  isAnalyzing: boolean;
  error: Error | null;
}

export interface UseItineraryReturn {
  itinerary: Itinerary | null;
  generate: () => Promise<void>;
  exportHTML: () => void;
  isGenerating: boolean;
  error: Error | null;
}
