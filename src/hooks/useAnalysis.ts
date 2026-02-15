import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { callGemini, buildAnalysisPrompt, extractJSON } from '../services/api';
import type { Analysis, UseAnalysisReturn } from '../types';

export const useAnalysis = (): UseAnalysisReturn => {
  const { ideas, setAnalysis, setAnalyzing, markIdeasAnalyzed, addMessage } =
    useAppStore();
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async () => {
    if (ideas.length === 0) {
      throw new Error('請先加入一些靈感');
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Add AI message
      addMessage({
        role: 'assistant',
        content: '讓我來分析你的靈感... 🤔',
      });

      // Prepare ideas
      const textIdeas = ideas.filter((i) => i.type === 'text').map((i) => i.content);
      const linkIdeas = ideas.filter((i) => i.type === 'link').map((i) => i.content);
      const hasImages = ideas.some((i) => i.type === 'image');

      // Build prompt
      const prompt = buildAnalysisPrompt(textIdeas, linkIdeas, hasImages);

      // Call API
      const response = await callGemini(prompt);

      // Parse analysis
      const analysis = extractJSON<Analysis>(response.response);

      // Update state
      setAnalysis(analysis);
      markIdeasAnalyzed();

      // Show analysis results
      const message = `
我分析完了！這是我理解的內容：

📍 目的地：${analysis.destination}
⏱️ 天數：${analysis.duration}
💫 興趣：${analysis.interests.join('、')}
🎨 風格：${analysis.style}

${analysis.extractedPlaces.length > 0 ? '🗺️ 我找到這些地點：\n' + analysis.extractedPlaces.map((p) => `• ${p}`).join('\n') : ''}

💡 ${analysis.suggestions}

接下來我們一起討論細節，確認你的需求後，我會幫你生成完整的行程規劃！
      `.trim();

      addMessage({
        role: 'assistant',
        content: message,
      });

      // Ask follow-up questions
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content:
            '我有幾個問題想確認：\n\n1️⃣ 這趟旅行你最重視什麼？（美食、文化、購物、放鬆...）\n2️⃣ 預算大概是多少？\n3️⃣ 有特別想去的地方嗎？',
        });
      }, 1000);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(err as Error);
      addMessage({
        role: 'assistant',
        content: '抱歉，分析時發生錯誤：' + errorMessage,
      });
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [ideas, setAnalysis, setAnalyzing, markIdeasAnalyzed, addMessage]);

  return {
    analyze,
    isAnalyzing: useAppStore((state) => state.analyzing),
    error,
  };
};
