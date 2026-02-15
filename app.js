// State Management
let state = {
    ideas: [],
    apiKey: localStorage.getItem('gemini_api_key') || '',
    conversation: [],
    itinerary: null,
    analyzing: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupDragAndDrop();
});

// Tab Switching
function switchTab(tab) {
    // Update active tab
    document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show corresponding input
    document.getElementById('text-input').style.display = tab === 'text' ? 'flex' : 'none';
    document.getElementById('image-input').style.display = tab === 'image' ? 'flex' : 'none';
    document.getElementById('link-input').style.display = tab === 'link' ? 'flex' : 'none';
}

// Add Text Idea
function addTextIdea() {
    const textarea = document.getElementById('text-idea');
    const content = textarea.value.trim();
    
    if (!content) {
        alert('請輸入內容');
        return;
    }
    
    const idea = {
        id: Date.now(),
        type: 'text',
        content: content,
        analyzed: false
    };
    
    state.ideas.push(idea);
    renderIdeas();
    textarea.value = '';
    updateAnalyzeButton();
    saveState();
}

// Handle Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const idea = {
            id: Date.now(),
            type: 'image',
            content: e.target.result,
            fileName: file.name,
            analyzed: false
        };
        
        state.ideas.push(idea);
        renderIdeas();
        updateAnalyzeButton();
        saveState();
    };
    reader.readAsDataURL(file);
}

// Add Link Idea
function addLinkIdea() {
    const input = document.getElementById('link-idea');
    const url = input.value.trim();
    
    if (!url) {
        alert('請輸入網址');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch {
        alert('請輸入有效的網址');
        return;
    }
    
    const idea = {
        id: Date.now(),
        type: 'link',
        content: url,
        analyzed: false
    };
    
    state.ideas.push(idea);
    renderIdeas();
    input.value = '';
    updateAnalyzeButton();
    saveState();
}

// Render Ideas
function renderIdeas() {
    const container = document.getElementById('inspiration-items');
    
    if (state.ideas.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">還沒有任何靈感</div>';
        return;
    }
    
    container.innerHTML = state.ideas.map(idea => {
        let content = '';
        let typeLabel = '';
        
        switch (idea.type) {
            case 'text':
                typeLabel = '📝 文字';
                content = `<div class="item-content">${escapeHtml(idea.content)}</div>`;
                break;
            case 'image':
                typeLabel = '📸 圖片';
                content = `<img src="${idea.content}" class="item-image" alt="${idea.fileName}">`;
                break;
            case 'link':
                typeLabel = '🔗 連結';
                content = `<div class="item-content"><a href="${idea.content}" target="_blank">${idea.content}</a></div>`;
                break;
        }
        
        const status = idea.analyzed ? 
            '<div class="item-status">✓ AI 已分析</div>' : 
            '<div class="item-status" style="color: var(--text-secondary);">⏳ 待分析</div>';
        
        return `
            <div class="inspiration-item">
                <span class="item-type">${typeLabel}</span>
                <button class="item-remove" onclick="removeIdea(${idea.id})">×</button>
                ${content}
                ${status}
            </div>
        `;
    }).join('');
}

// Remove Idea
function removeIdea(id) {
    state.ideas = state.ideas.filter(idea => idea.id !== id);
    renderIdeas();
    updateAnalyzeButton();
    saveState();
}

// Update Analyze Button
function updateAnalyzeButton() {
    const btn = document.getElementById('analyze-btn');
    btn.disabled = state.ideas.length === 0 || state.analyzing;
}

// Drag and Drop
function setupDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageUpload({ target: { files: [file] } });
        }
    });
}

// Analyze Ideas with AI
async function analyzeIdeas() {
    if (!state.apiKey) {
        alert('請先在設定中填入 Google Gemini API Key');
        openSettings();
        return;
    }
    
    state.analyzing = true;
    updateAnalyzeButton();
    
    // Add AI message
    addAIMessage('讓我來分析你的靈感... 🤔');
    
    try {
        // Prepare analysis prompt
        const prompt = buildAnalysisPrompt();
        
        // Call Gemini API
        const response = await callGemini(prompt);
        
        // Extract JSON from response (Gemini might include markdown)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : response;
        const analysis = JSON.parse(jsonText);
        
        // Mark ideas as analyzed
        state.ideas.forEach(idea => idea.analyzed = true);
        renderIdeas();
        
        // Show analysis results
        showAnalysisResults(analysis);
        
        // Generate initial conversation
        startConversation(analysis);
        
    } catch (error) {
        console.error('Analysis error:', error);
        addAIMessage('抱歉，分析時發生錯誤：' + error.message);
    } finally {
        state.analyzing = false;
        updateAnalyzeButton();
    }
}

// Build Analysis Prompt
function buildAnalysisPrompt() {
    const textIdeas = state.ideas.filter(i => i.type === 'text').map(i => i.content).join('\n');
    const linkIdeas = state.ideas.filter(i => i.type === 'link').map(i => i.content).join('\n');
    const hasImages = state.ideas.some(i => i.type === 'image');
    
    return `你是一個專業的旅遊規劃 AI 助手。請分析以下使用者提供的旅行靈感，並提取關鍵資訊。

使用者提供的內容：

文字描述：
${textIdeas || '無'}

連結：
${linkIdeas || '無'}

${hasImages ? '（使用者還上傳了圖片）' : ''}

請以 JSON 格式回應，包含以下欄位：
{
  "destination": "目的地",
  "duration": "天數",
  "interests": ["興趣標籤"],
  "style": "旅行風格描述",
  "extractedPlaces": ["提取到的具體地點"],
  "suggestions": "你的初步建議"
}

只回傳 JSON，不要其他內容。`;
}

// Call Google Gemini API
async function callGemini(prompt, includeImages = false) {
    // Build conversation history
    let conversationText = '';
    if (state.conversation.length > 0) {
        conversationText = state.conversation.map(msg => {
            const role = msg.role === 'assistant' ? 'AI' : '用戶';
            return `${role}: ${msg.content}`;
        }).join('\n\n');
    }
    
    // Combine system prompt + conversation + current prompt
    const fullPrompt = `你是一個專業、友善的旅遊規劃 AI 助手。用繁體中文回應。

${conversationText ? '對話歷史：\n' + conversationText + '\n\n' : ''}

用戶新訊息：
${prompt}`;

    // Prepare request body
    const requestBody = {
        contents: [{
            parts: [{
                text: fullPrompt
            }]
        }]
    };
    
    // Add images if needed
    if (includeImages) {
        const imageIdeas = state.ideas.filter(i => i.type === 'image');
        if (imageIdeas.length > 0) {
            // Add first image for vision analysis
            const imageData = imageIdeas[0].content.split(',')[1]; // Remove data:image/...;base64,
            requestBody.contents[0].parts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageData
                }
            });
        }
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '無法連接到 Gemini API');
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Show Analysis Results
function showAnalysisResults(analysis) {
    const message = `
我分析完了！這是我理解的內容：

📍 目的地：${analysis.destination}
⏱️ 天數：${analysis.duration}
💫 興趣：${analysis.interests.join('、')}
🎨 風格：${analysis.style}

${analysis.extractedPlaces.length > 0 ? '🗺️ 我找到這些地點：\n' + analysis.extractedPlaces.map(p => `• ${p}`).join('\n') : ''}

💡 ${analysis.suggestions}

接下來我們一起討論細節，確認你的需求後，我會幫你生成完整的行程規劃！
    `.trim();
    
    addAIMessage(message);
}

// Start Conversation
function startConversation(analysis) {
    // Store analysis in state
    state.analysis = analysis;
    
    // Ask first question
    setTimeout(() => {
        addAIMessage('我有幾個問題想確認：\n\n1️⃣ 這趟旅行你最重視什麼？（美食、文化、購物、放鬆...）\n2️⃣ 預算大概是多少？\n3️⃣ 有特別想去的地方嗎？');
    }, 1000);
}

// Send Message
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Get AI response
    handleUserMessage(message);
}

// Handle Chat Key Press
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Add User Message
function addUserMessage(content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">${escapeHtml(content)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    state.conversation.push({ role: 'user', content });
    saveState();
}

// Add AI Message
function addAIMessage(content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    state.conversation.push({ role: 'assistant', content });
    saveState();
}

// Handle User Message
async function handleUserMessage(message) {
    if (!state.apiKey) {
        addAIMessage('請先在設定中填入 Google Gemini API Key');
        return;
    }
    
    try {
        // Check if user wants to generate itinerary
        if (message.includes('生成') || message.includes('規劃') || message.includes('確認') || message.includes('好')) {
            if (state.analysis) {
                addAIMessage('好的！讓我開始規劃你的行程... ⏳');
                await generateItinerary();
                return;
            }
        }
        
        // Get AI response
        const response = await callGemini(message);
        addAIMessage(response);
        
    } catch (error) {
        console.error('Chat error:', error);
        addAIMessage('抱歉，發生錯誤：' + error.message);
    }
}

// Generate Itinerary
async function generateItinerary() {
    try {
        const prompt = `根據我們的對話，請幫我規劃一個詳細的 ${state.analysis.duration} 旅行行程。

目的地：${state.analysis.destination}
興趣：${state.analysis.interests.join('、')}
風格：${state.analysis.style}

請以 JSON 格式回應，格式如下：
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

只回傳 JSON，不要其他內容。`;
        
        const response = await callGemini(prompt);
        
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : response;
        const itinerary = JSON.parse(jsonText);
        
        state.itinerary = itinerary;
        renderItinerary(itinerary);
        
        addAIMessage('行程規劃完成！🎉\n\n你可以在右邊查看詳細內容，或點擊「匯出網頁」生成可分享的旅行網頁！');
        
        saveState();
        
    } catch (error) {
        console.error('Itinerary generation error:', error);
        addAIMessage('抱歉，生成行程時發生錯誤：' + error.message);
    }
}

// Render Itinerary
function renderItinerary(itinerary) {
    const container = document.getElementById('itinerary-preview');
    const actionButtons = document.getElementById('action-buttons');
    
    let html = `
        <div class="itinerary-summary">
            <div class="summary-title">📋 ${itinerary.title}</div>
            <div class="summary-item">
                <span class="summary-label">目的地</span>
                <span class="summary-value">${itinerary.destination}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">天數</span>
                <span class="summary-value">${itinerary.duration}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">預算</span>
                <span class="summary-value">${itinerary.summary.budget}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">風格</span>
                <span class="summary-value">${itinerary.summary.style}</span>
            </div>
        </div>
    `;
    
    itinerary.days.forEach(day => {
        html += `
            <div class="day-card">
                <div class="day-header">📅 Day ${day.day} - ${day.title}</div>
                ${day.activities.map(activity => `
                    <div class="activity">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-name">${activity.name}</div>
                        <div class="activity-note">📍 ${activity.location}</div>
                        ${activity.note ? `<div class="activity-note">💡 ${activity.note}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
    actionButtons.style.display = 'flex';
}

// Edit Itinerary
function editItinerary() {
    addAIMessage('請告訴我你想調整什麼？例如：「第一天想加入咖啡廳」、「預算要降低」等。');
}

// Export Itinerary
function exportItinerary() {
    if (!state.itinerary) {
        alert('還沒有行程可以匯出');
        return;
    }
    
    const html = generateItineraryHTML(state.itinerary);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.itinerary.destination}-行程規劃.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    addAIMessage('✅ 行程網頁已下載！你可以用瀏覽器開啟，或部署到網路上分享給朋友。');
}

// Generate Itinerary HTML (using Seoul Trip template style)
function generateItineraryHTML(itinerary) {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itinerary.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        .title { font-size: 2rem; font-weight: 700; margin-bottom: 12px; }
        .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .summary {
            background: white;
            padding: 25px;
            border-radius: 16px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 10px;
        }
        .summary-label {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 4px;
        }
        .summary-value {
            font-weight: 600;
            font-size: 1.05rem;
        }
        .day-card {
            background: white;
            padding: 25px;
            border-radius: 16px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .day-header {
            font-size: 1.3rem;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid #eef2ff;
        }
        .activity {
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 12px;
            border-left: 4px solid #6366f1;
        }
        .activity-time {
            font-size: 0.85rem;
            color: #6366f1;
            font-weight: 600;
            margin-bottom: 6px;
        }
        .activity-name {
            font-weight: 600;
            font-size: 1.05rem;
            margin-bottom: 6px;
        }
        .activity-detail {
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 4px;
        }
        .footer {
            text-align: center;
            color: #64748b;
            margin-top: 40px;
            padding: 20px;
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">✈️ ${itinerary.title}</div>
            <div class="subtitle">${itinerary.destination} • ${itinerary.duration}</div>
        </div>

        <div class="summary">
            <h3 style="margin-bottom: 15px;">📋 行程概要</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">預算</div>
                    <div class="summary-value">${itinerary.summary.budget}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">風格</div>
                    <div class="summary-value">${itinerary.summary.style}</div>
                </div>
            </div>
            ${itinerary.summary.highlights.length > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <div style="font-weight: 600; margin-bottom: 8px;">✨ 行程亮點</div>
                    ${itinerary.summary.highlights.map(h => `<div style="color: #64748b; margin: 4px 0;">• ${h}</div>`).join('')}
                </div>
            ` : ''}
        </div>

        ${itinerary.days.map(day => `
            <div class="day-card">
                <div class="day-header">Day ${day.day} - ${day.title}</div>
                ${day.activities.map(activity => `
                    <div class="activity">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-name">${activity.name}</div>
                        <div class="activity-detail">📍 ${activity.location}</div>
                        ${activity.note ? `<div class="activity-detail">💡 ${activity.note}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}

        <div class="footer">
            由 AI 旅遊規劃助手生成 • ${new Date().toLocaleDateString('zh-TW')}
        </div>
    </div>
</body>
</html>`;
}

// Settings
function openSettings() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('api-key-input');
    input.value = state.apiKey;
    modal.classList.add('show');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('show');
}

function saveSettings() {
    const input = document.getElementById('api-key-input');
    state.apiKey = input.value.trim();
    localStorage.setItem('gemini_api_key', state.apiKey);
    saveState();
    closeSettings();
    
    if (state.apiKey) {
        addAIMessage('✅ Gemini API Key 已儲存！現在可以開始使用 AI 功能了。');
    }
}

// State Management
function saveState() {
    localStorage.setItem('travel_planner_state', JSON.stringify({
        ideas: state.ideas,
        conversation: state.conversation,
        itinerary: state.itinerary,
        analysis: state.analysis
    }));
}

function loadState() {
    const saved = localStorage.getItem('travel_planner_state');
    if (saved) {
        const data = JSON.parse(saved);
        state.ideas = data.ideas || [];
        state.conversation = data.conversation || [];
        state.itinerary = data.itinerary || null;
        state.analysis = data.analysis || null;
        
        renderIdeas();
        
        // Restore conversation
        if (state.conversation.length > 0) {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = '';
            state.conversation.forEach(msg => {
                if (msg.role === 'assistant') {
                    addAIMessage(msg.content);
                } else {
                    addUserMessage(msg.content);
                }
            });
        }
        
        // Restore itinerary
        if (state.itinerary) {
            renderItinerary(state.itinerary);
        }
        
        updateAnalyzeButton();
    }
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Click outside modal to close
document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target.id === 'settings-modal') {
        closeSettings();
    }
});
