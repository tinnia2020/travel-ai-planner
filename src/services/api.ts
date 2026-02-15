import axios, { AxiosError } from 'axios';
import type { GeminiRequest, GeminiResponse, GeminiErrorResponse } from '../types';

// API Configuration
const API_URL = import.meta.env.PROD
  ? '/api/generate'
  : 'http://localhost:3000/api/generate';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds
});

// Custom error class
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public resetTime?: string
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// Request interceptor to add session ID
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<GeminiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 429) {
        // Rate limit error
        const resetTime = data.resetTime
          ? new Date(data.resetTime).toLocaleString('zh-TW')
          : '未知';

        throw new GeminiAPIError(
          `${data.error}\n${data.message}\n\n重置時間：${resetTime}`,
          status,
          data.resetTime
        );
      }

      throw new GeminiAPIError(
        data.error || data.message || '無法連接到 AI 服務',
        status
      );
    }

    if (error.request) {
      throw new GeminiAPIError('無法連接到伺服器，請檢查網路連接');
    }

    throw new GeminiAPIError(error.message || '發生未知錯誤');
  }
);

/**
 * Call Gemini API through our secure backend
 */
export const callGemini = async (
  prompt: string,
  includeHistory = false
): Promise<GeminiResponse> => {
  const requestData: GeminiRequest = {
    prompt,
    includeHistory,
  };

  const response = await api.post<GeminiResponse>('', requestData);
  return response.data;
};

/**
 * Build analysis prompt from ideas
 */
export const buildAnalysisPrompt = (
  textIdeas: string[],
  linkIdeas: string[],
  hasImages: boolean
): string => {
  const textContent = textIdeas.join('\n') || '無';
  const linkContent = linkIdeas.join('\n') || '無';
  const imageNote = hasImages ? '（使用者還上傳了圖片）' : '';

  return `你是一個專業的旅遊規劃 AI 助手。請分析以下使用者提供的旅行靈感,並提取關鍵資訊。

使用者提供的內容：

文字描述：
${textContent}

連結：
${linkContent}

${imageNote}

請以 JSON 格式回應,包含以下欄位：
{
  "destination": "目的地",
  "duration": "天數",
  "interests": ["興趣標籤"],
  "style": "旅行風格描述",
  "extractedPlaces": ["提取到的具體地點"],
  "suggestions": "你的初步建議"
}

只回傳 JSON,不要其他內容。`;
};

/**
 * Build itinerary generation prompt
 */
export const buildItineraryPrompt = (
  destination: string,
  duration: string,
  interests: string[],
  style: string
): string => {
  return `根據我們的對話,請幫我規劃一個詳細的 ${duration} 旅行行程。

目的地：${destination}
興趣：${interests.join('、')}
風格：${style}

請以 JSON 格式回應,格式如下：
{
  "title": "行程標題",
  "destination": "目的地",
  "duration": "天數",
  "summary": {
    "budget": "預估預算",
    "style": "風格",
    "highlights": ["亮點1", "亮點2"]
  },
  "days": [
    {
      "day": 1,
      "title": "第一天標題",
      "activities": [
        {
          "time": "09:00-12:00",
          "name": "活動名稱",
          "location": "地點",
          "note": "備註",
          "googleMapsUrl": "Google Maps 連結"
        }
      ]
    }
  ]
}

只回傳 JSON,不要其他內容。`;
};

/**
 * Build conversation context for API call
 */
export const buildConversationContext = (
  conversation: Array<{ role: string; content: string }>,
  currentPrompt: string
): string => {
  const history = conversation.length > 0
    ? `對話歷史：\n${conversation
        .map((msg) => {
          const role = msg.role === 'assistant' ? 'AI' : '用戶';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n')}\n\n`
    : '';

  return `你是一個專業、友善的旅遊規劃 AI 助手。用繁體中文回應。

${history}用戶新訊息：
${currentPrompt}`;
};

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
export const extractJSON = <T>(response: string): T => {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : response;

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    throw new Error('無法解析 AI 回應：' + (error as Error).message);
  }
};
