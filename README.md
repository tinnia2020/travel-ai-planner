# ✈️ AI 旅遊規劃助手

一個智能旅遊規劃 Web App，讓你通過文字、圖片、連結收集靈感，AI 會幫你生成完整的旅行行程規劃！

## 🎯 功能特色

### 1️⃣ 發想區 (Inspiration Board)
- **📝 文字輸入**：直接描述旅行想法
- **📸 圖片上傳**：上傳 IG 截圖、Pinterest 圖片（AI 會分析圖片內容）
- **🔗 連結輸入**：貼上部落格、Google Maps、YouTube 連結

### 2️⃣ 討論區 (AI Chat)
- **💬 智能對話**：AI 理解你的需求並提問確認
- **🎯 需求確認**：討論預算、風格、特殊需求
- **🤝 協作調整**：隨時修改和優化行程

### 3️⃣ 行程生成
- **📅 完整規劃**：每日詳細行程安排
- **🗺️ 地點資訊**：包含時間、地點、備註
- **📥 匯出網頁**：生成可分享的美觀行程網頁

## 🚀 使用方式

### 開啟 App
1. 用瀏覽器開啟 `index.html`
2. 點擊右上角「⚙️ 設定」
3. 填入你的 Google Gemini API Key（[如何取得](#取得-gemini-api-key)）

### 規劃行程
1. **加入靈感**：在左側「發想區」輸入想法、上傳圖片或連結
2. **開始分析**：點擊「🤖 開始分析規劃」
3. **與 AI 討論**：在中間「討論區」確認需求
4. **生成行程**：AI 會自動生成完整行程
5. **匯出分享**：點擊「📥 匯出網頁」下載

## 🔑 取得 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 用 Google 帳號登入
3. 點擊「Create API Key」
4. 複製 API Key（格式：`AIza...`）
5. 在 App 設定中貼上

**注意**：
- API Key 會儲存在你的瀏覽器本地，不會上傳到任何伺服器
- Google 提供每月免費額度，一般使用綽綽有餘

## 💰 費用說明

- App 本身：**完全免費**
- Google Gemini API：**免費！**
  - 模型：Gemini 1.5 Flash
  - 每月免費額度：15 次請求/分鐘，150萬 tokens/月
  - 一般使用完全不用付費
  - [查看免費額度詳情](https://ai.google.dev/pricing)

## 🛠️ 技術架構

- **前端**：純 HTML + CSS + JavaScript（無框架）
- **AI**：Google Gemini 1.5 Flash API
- **視覺分析**：Gemini Vision（支援圖片分析）
- **儲存**：瀏覽器 LocalStorage（本地儲存）
- **部署**：可直接部署到 GitHub Pages

## 📦 部署到 GitHub Pages

```bash
# 1. 初始化 Git
cd travel-ai-planner
git init

# 2. 加入檔案
git add .
git commit -m "Initial commit"

# 3. 推送到 GitHub
git remote add origin https://github.com/你的帳號/travel-ai-planner.git
git branch -M main
git push -u origin main

# 4. 啟用 GitHub Pages
# 到 Repository > Settings > Pages
# Source 選擇 "main" branch
# 幾分鐘後網站會上線！
```

## 🎨 自訂樣式

所有樣式都在 `index.html` 的 `<style>` 區塊中，可以自由修改：

```css
:root {
    --primary: #6366f1;        /* 主色調 */
    --primary-dark: #4f46e5;   /* 深色主色 */
    --success: #10b981;        /* 成功色 */
    --bg: #f8fafc;             /* 背景色 */
}
```

## 🐛 常見問題

### Q: API Key 安全嗎？
A: 目前版本是前端直接呼叫 API，Key 會暴露。建議：
- 只在本地使用
- 或改用後端代理（需要自行開發）

### Q: 可以離線使用嗎？
A: 不行，需要網路連接 OpenAI API。但已分析的內容會儲存在本地。

### Q: 支援哪些語言？
A: 目前介面是繁體中文，AI 也用中文回應。可以自行修改程式碼支援其他語言。

### Q: 圖片分析功能實作了嗎？
A: 已支援！Gemini Vision 可以分析圖片內容，辨識地點、食物類型等（完全免費）。

## 🔮 未來功能規劃

- [x] Gemini Vision 圖片分析 ✅
- [ ] 多人協作模式
- [ ] 即時路線優化
- [ ] 天氣整合
- [ ] 預算追蹤
- [ ] 行程範本市集
- [ ] 多語言支援
- [ ] 手機 App 版本
- [ ] YouTube 影片分析

## 📝 更新日誌

### v1.1.0 (2026-02-15)
- ✅ **改用 Google Gemini API**（完全免費！）
- ✅ 支援 Gemini Vision 圖片分析
- ✅ 更快的回應速度
- ✅ 更大的免費額度

### v1.0.0 (2026-02-15)
- ✅ 基礎 MVP 完成
- ✅ 文字/圖片/連結輸入
- ✅ AI 對話分析
- ✅ 行程生成
- ✅ 匯出網頁功能

## 👨‍💻 開發者

由 龍蝦 🦞 開發

## 📄 授權

MIT License - 可自由使用、修改、分發

---

**祝你旅行愉快！✈️🌍**
