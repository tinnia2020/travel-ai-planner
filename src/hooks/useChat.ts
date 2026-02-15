import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { callGemini, buildConversationContext } from '../services/api';
import type { UseChatReturn } from '../types';

export const useChat = (): UseChatReturn => {
  const { conversation, addMessage, analysis, setUsage } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        throw new Error('請輸入訊息');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Add user message
        addMessage({
          role: 'user',
          content: content.trim(),
        });

        // Build conversation context
        const prompt = buildConversationContext(conversation, content);

        // Call API
        const response = await callGemini(prompt, conversation.length > 0);

        // Update usage
        if (response.usage) {
          setUsage(response.usage);
        }

        // Add AI response
        addMessage({
          role: 'assistant',
          content: response.response,
        });
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(err as Error);
        addMessage({
          role: 'assistant',
          content: '抱歉，發生錯誤：' + errorMessage,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, addMessage, setUsage, analysis]
  );

  return {
    messages: conversation,
    sendMessage,
    isLoading,
    error,
  };
};
