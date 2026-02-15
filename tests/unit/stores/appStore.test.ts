import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../../src/stores/appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Clear localStorage first
    localStorage.clear();
    // Then reset store
    useAppStore.getState().reset();
  });

  describe('Ideas Management', () => {
    it('should add a text idea', () => {
      useAppStore.getState().addIdea({
        type: 'text',
        content: 'Visit Tokyo',
      });

      const { ideas } = useAppStore.getState();
      expect(ideas).toHaveLength(1);
      expect(ideas[0]).toMatchObject({
        type: 'text',
        content: 'Visit Tokyo',
        analyzed: false,
      });
      expect(ideas[0].id).toBeDefined();
      expect(ideas[0].createdAt).toBeInstanceOf(Date);
    });

    it('should add an image idea', () => {
      useAppStore.getState().addIdea({
        type: 'image',
        content: 'data:image/png;base64,abc123',
        fileName: 'test.png',
      });

      const { ideas } = useAppStore.getState();
      expect(ideas).toHaveLength(1);
      expect(ideas[0]).toMatchObject({
        type: 'image',
        content: 'data:image/png;base64,abc123',
        fileName: 'test.png',
        analyzed: false,
      });
    });

    it('should add a link idea', () => {
      useAppStore.getState().addIdea({
        type: 'link',
        content: 'https://example.com/travel-guide',
      });

      const { ideas } = useAppStore.getState();
      expect(ideas).toHaveLength(1);
      expect(ideas[0]).toMatchObject({
        type: 'link',
        content: 'https://example.com/travel-guide',
        analyzed: false,
      });
    });

    it.skip('should remove an idea', () => {
      const store = useAppStore.getState();

      store.addIdea({ type: 'text', content: 'Idea 1' });
      store.addIdea({ type: 'text', content: 'Idea 2' });

      const allIdeas = useAppStore.getState().ideas;
      expect(allIdeas).toHaveLength(2);

      const ideaToRemove = allIdeas[0];
      store.removeIdea(ideaToRemove.id);

      const { ideas } = useAppStore.getState();
      expect(ideas).toHaveLength(1);
      expect(ideas[0].content).toBe('Idea 2');
    });

    it('should mark all ideas as analyzed', () => {
      useAppStore.getState().addIdea({ type: 'text', content: 'Idea 1' });
      useAppStore.getState().addIdea({ type: 'text', content: 'Idea 2' });

      useAppStore.getState().markIdeasAnalyzed();

      const { ideas } = useAppStore.getState();
      expect(ideas.every((idea) => idea.analyzed)).toBe(true);
    });
  });

  describe('Conversation Management', () => {
    it('should add a user message', () => {
      useAppStore.getState().addMessage({
        role: 'user',
        content: 'Hello AI',
      });

      const { conversation } = useAppStore.getState();
      expect(conversation).toHaveLength(1);
      expect(conversation[0]).toMatchObject({
        role: 'user',
        content: 'Hello AI',
      });
      expect(conversation[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add an assistant message', () => {
      useAppStore.getState().addMessage({
        role: 'assistant',
        content: 'Hello user',
      });

      const { conversation } = useAppStore.getState();
      expect(conversation).toHaveLength(1);
      expect(conversation[0]).toMatchObject({
        role: 'assistant',
        content: 'Hello user',
      });
    });

    it('should clear conversation', () => {
      useAppStore.getState().addMessage({ role: 'user', content: 'Message 1' });
      useAppStore.getState().addMessage({ role: 'assistant', content: 'Response 1' });

      useAppStore.getState().clearConversation();

      const { conversation } = useAppStore.getState();
      expect(conversation).toHaveLength(0);
    });
  });

  describe('Analysis Management', () => {
    it('should set analysis', () => {
      const mockAnalysis = {
        destination: 'Tokyo',
        duration: '5天4夜',
        interests: ['美食', '文化'],
        style: '深度旅遊',
        extractedPlaces: ['淺草寺', '東京鐵塔'],
        suggestions: 'Great choice!',
      };

      useAppStore.getState().setAnalysis(mockAnalysis);

      expect(useAppStore.getState().analysis).toEqual(mockAnalysis);
    });

    it('should set analyzing state', () => {
      useAppStore.getState().setAnalyzing(true);
      expect(useAppStore.getState().analyzing).toBe(true);

      useAppStore.getState().setAnalyzing(false);
      expect(useAppStore.getState().analyzing).toBe(false);
    });
  });

  describe('Itinerary Management', () => {
    it('should set itinerary', () => {
      const mockItinerary = {
        title: 'Tokyo Adventure',
        destination: 'Tokyo',
        duration: '5天4夜',
        summary: {
          budget: 'NT$ 30,000',
          style: '深度旅遊',
          highlights: ['美食體驗', '文化探索'],
        },
        days: [
          {
            day: 1,
            title: '抵達東京',
            activities: [
              {
                time: '09:00-12:00',
                name: '淺草寺參觀',
                location: '淺草',
                note: '早點出發避開人潮',
              },
            ],
          },
        ],
      };

      useAppStore.getState().setItinerary(mockItinerary);

      expect(useAppStore.getState().itinerary).toEqual(mockItinerary);
    });

    it('should clear itinerary', () => {
      const mockItinerary = {
        title: 'Tokyo Adventure',
        destination: 'Tokyo',
        duration: '5天4夜',
        summary: { budget: 'NT$ 30,000', style: '深度旅遊', highlights: [] },
        days: [],
      };

      useAppStore.getState().setItinerary(mockItinerary);
      useAppStore.getState().clearItinerary();

      expect(useAppStore.getState().itinerary).toBeNull();
    });
  });

  describe('Usage Management', () => {
    it('should set usage', () => {
      const mockUsage = {
        remaining: 45,
        limit: 50,
      };

      useAppStore.getState().setUsage(mockUsage);

      expect(useAppStore.getState().usage).toEqual(mockUsage);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      // Add some data
      useAppStore.getState().addIdea({ type: 'text', content: 'Test' });
      useAppStore.getState().addMessage({ role: 'user', content: 'Test' });
      useAppStore.getState().setAnalysis({
        destination: 'Tokyo',
        duration: '5天',
        interests: [],
        style: 'test',
        extractedPlaces: [],
        suggestions: 'test',
      });

      // Reset
      useAppStore.getState().reset();

      const state = useAppStore.getState();
      expect(state.ideas).toHaveLength(0);
      expect(state.conversation).toHaveLength(0);
      expect(state.analysis).toBeNull();
      expect(state.itinerary).toBeNull();
    });
  });
});
