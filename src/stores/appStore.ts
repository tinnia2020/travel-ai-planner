import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Idea, Message, Itinerary, Analysis, Usage } from '../types';

// Utility: Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Retrieve or create session ID
const getSessionId = (): string => {
  const stored = localStorage.getItem('session_id');
  if (stored) return stored;

  const newId = generateSessionId();
  localStorage.setItem('session_id', newId);
  return newId;
};

interface AppActions {
  // Ideas
  addIdea: (idea: Omit<Idea, 'id' | 'analyzed' | 'createdAt'>) => void;
  removeIdea: (id: number) => void;
  markIdeasAnalyzed: () => void;

  // Conversation
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  clearConversation: () => void;

  // Analysis
  setAnalysis: (analysis: Analysis) => void;
  setAnalyzing: (analyzing: boolean) => void;

  // Itinerary
  setItinerary: (itinerary: Itinerary) => void;
  clearItinerary: () => void;

  // Usage
  setUsage: (usage: Usage) => void;

  // Reset
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  ideas: [],
  sessionId: getSessionId(),
  conversation: [],
  itinerary: null,
  analysis: null,
  analyzing: false,
  usage: { remaining: null, limit: null },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Ideas actions
      addIdea: (ideaData) =>
        set((state) => ({
          ideas: [
            ...state.ideas,
            {
              ...ideaData,
              id: Date.now(),
              analyzed: false,
              createdAt: new Date(),
            },
          ],
        })),

      removeIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        })),

      markIdeasAnalyzed: () =>
        set((state) => ({
          ideas: state.ideas.map((idea) => ({ ...idea, analyzed: true })),
        })),

      // Conversation actions
      addMessage: (messageData) =>
        set((state) => ({
          conversation: [
            ...state.conversation,
            {
              ...messageData,
              timestamp: new Date(),
            },
          ],
        })),

      clearConversation: () =>
        set(() => ({
          conversation: [],
        })),

      // Analysis actions
      setAnalysis: (analysis) =>
        set(() => ({
          analysis,
        })),

      setAnalyzing: (analyzing) =>
        set(() => ({
          analyzing,
        })),

      // Itinerary actions
      setItinerary: (itinerary) =>
        set(() => ({
          itinerary,
        })),

      clearItinerary: () =>
        set(() => ({
          itinerary: null,
        })),

      // Usage actions
      setUsage: (usage) =>
        set(() => ({
          usage,
        })),

      // Reset
      reset: () =>
        set(() => ({
          ...initialState,
          sessionId: generateSessionId(),
        })),
    }),
    {
      name: 'travel-planner-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ideas: state.ideas,
        conversation: state.conversation,
        itinerary: state.itinerary,
        analysis: state.analysis,
      }),
    }
  )
);
