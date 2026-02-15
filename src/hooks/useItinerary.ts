import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { callGemini, buildItineraryPrompt, extractJSON } from '../services/api';
import { generateItineraryHTML, downloadHTML } from '../utils/export';
import type { Itinerary, UseItineraryReturn } from '../types';

export const useItinerary = (): UseItineraryReturn => {
  const { itinerary, analysis, setItinerary, addMessage } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async () => {
    if (!analysis) {
      throw new Error('請先進行分析');
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Add AI message
      addMessage({
        role: 'assistant',
        content: '好的！讓我開始規劃你的行程... ⏳',
      });

      // Build prompt
      const prompt = buildItineraryPrompt(
        analysis.destination,
        analysis.duration,
        analysis.interests,
        analysis.style
      );

      // Call API
      const response = await callGemini(prompt);

      // Parse itinerary
      const generatedItinerary = extractJSON<Itinerary>(response.response);

      // Update state
      setItinerary(generatedItinerary);

      // Add success message
      addMessage({
        role: 'assistant',
        content:
          '行程規劃完成！🎉\n\n你可以在右邊查看詳細內容，或點擊「匯出網頁」生成可分享的旅行網頁！',
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(err as Error);
      addMessage({
        role: 'assistant',
        content: '抱歉，生成行程時發生錯誤：' + errorMessage,
      });
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [analysis, setItinerary, addMessage]);

  const exportHTML = useCallback(() => {
    if (!itinerary) {
      throw new Error('還沒有行程可以匯出');
    }

    const html = generateItineraryHTML(itinerary);
    const filename = `${itinerary.destination}-行程規劃.html`;

    downloadHTML(html, filename);

    addMessage({
      role: 'assistant',
      content: '✅ 行程網頁已下載！你可以用瀏覽器開啟，或部署到網路上分享給朋友。',
    });
  }, [itinerary, addMessage]);

  return {
    itinerary,
    generate,
    exportHTML,
    isGenerating,
    error,
  };
};
