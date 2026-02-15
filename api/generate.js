// Vercel Serverless Function - Gemini API Proxy
// 這個檔案會部署到 Vercel，安全地存放 API Key

// 用量限制配置
const RATE_LIMITS = {
    requestsPerIP: 50,        // 每個 IP 每天最多 50 次
    requestsPerSession: 20,    // 每個 session 最多 20 次
    windowMs: 24 * 60 * 60 * 1000  // 24 小時
};

// 簡單的記憶體用量追蹤（生產環境建議用 Redis/Vercel KV）
const usageStore = new Map();

// 清理過期記錄
function cleanupUsage() {
    const now = Date.now();
    for (const [key, data] of usageStore.entries()) {
        if (now - data.timestamp > RATE_LIMITS.windowMs) {
            usageStore.delete(key);
        }
    }
}

// 檢查用量限制
function checkRateLimit(identifier) {
    cleanupUsage();
    
    const usage = usageStore.get(identifier);
    const now = Date.now();
    
    if (!usage) {
        usageStore.set(identifier, {
            count: 1,
            timestamp: now
        });
        return { allowed: true, remaining: RATE_LIMITS.requestsPerIP - 1 };
    }
    
    // 重置時間窗口
    if (now - usage.timestamp > RATE_LIMITS.windowMs) {
        usageStore.set(identifier, {
            count: 1,
            timestamp: now
        });
        return { allowed: true, remaining: RATE_LIMITS.requestsPerIP - 1 };
    }
    
    // 檢查是否超過限制
    if (usage.count >= RATE_LIMITS.requestsPerIP) {
        const resetTime = new Date(usage.timestamp + RATE_LIMITS.windowMs);
        return {
            allowed: false,
            remaining: 0,
            resetTime: resetTime.toISOString()
        };
    }
    
    // 增加計數
    usage.count++;
    return {
        allowed: true,
        remaining: RATE_LIMITS.requestsPerIP - usage.count
    };
}

// 主要 API Handler
export default async function handler(req, res) {
    // CORS 設定
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Session-ID');
    
    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // 只接受 POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // 取得用戶識別（IP 或 Session ID）
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
        const sessionId = req.headers['x-session-id'] || ip;
        const identifier = `${ip}_${sessionId}`;
        
        // 檢查用量限制
        const rateLimit = checkRateLimit(identifier);
        
        // 設定回應 header
        res.setHeader('X-RateLimit-Limit', RATE_LIMITS.requestsPerIP);
        res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
        
        if (!rateLimit.allowed) {
            return res.status(429).json({
                error: '超過使用次數限制',
                message: `每日限制 ${RATE_LIMITS.requestsPerIP} 次請求`,
                resetTime: rateLimit.resetTime
            });
        }
        
        // 取得請求內容
        const { prompt, includeHistory } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: '缺少 prompt 參數' });
        }
        
        // 從環境變數取得 API Key（安全！）
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        
        if (!GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return res.status(500).json({ error: '伺服器配置錯誤' });
        }
        
        // 準備 Gemini API 請求
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };
        
        // 呼叫 Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );
        
        if (!geminiResponse.ok) {
            const error = await geminiResponse.json();
            console.error('Gemini API error:', error);
            return res.status(geminiResponse.status).json({
                error: 'AI 服務暫時無法使用',
                details: error.error?.message || 'Unknown error'
            });
        }
        
        const data = await geminiResponse.json();
        
        // 回傳結果
        return res.status(200).json({
            success: true,
            response: data.candidates[0].content.parts[0].text,
            usage: {
                remaining: rateLimit.remaining,
                limit: RATE_LIMITS.requestsPerIP
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: '伺服器錯誤',
            message: error.message
        });
    }
}
