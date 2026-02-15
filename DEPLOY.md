# 🚀 Vercel 部署指南

## 📋 前置準備

1. **Vercel 帳號**
   - 前往 https://vercel.com
   - 用 GitHub 帳號登入（免費）

2. **你的 Gemini API Key**
   - `AIzaSyAngFNXxtDBYDqTognKKX9HtYvSqQC6r5c`

---

## 🎯 部署步驟

### 方法1：使用 Vercel CLI（推薦，最快）

1. **安裝 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **部署專案**
   ```bash
   cd C:\Users\tinni\.openclaw\workspace\travel-ai-planner
   vercel
   ```

4. **設定環境變數**
   部署時會問你問題，按照以下回答：
   - Set up and deploy? → **Yes**
   - Which scope? → 選你的帳號
   - Link to existing project? → **No**
   - Project name? → **travel-ai-planner**（或任何你想要的名字）
   - In which directory? → **.**（當前目錄）
   - Override settings? → **No**

5. **新增 API Key 環境變數**
   ```bash
   vercel env add GEMINI_API_KEY production
   ```
   
   然後貼上你的 API Key：
   ```
   AIzaSyAngFNXxtDBYDqTognKKX9HtYvSqQC6r5c
   ```

6. **重新部署（讓環境變數生效）**
   ```bash
   vercel --prod
   ```

7. **完成！**
   Vercel 會給你一個網址，例如：
   ```
   https://travel-ai-planner-xxx.vercel.app
   ```

---

### 方法2：使用 Vercel 網頁介面

1. **推送到 GitHub**
   ```bash
   cd C:\Users\tinni\.openclaw\workspace\travel-ai-planner
   git add .
   git commit -m "Add secure backend API"
   git push
   ```

2. **連接 Vercel**
   - 前往 https://vercel.com/new
   - 選擇「Import Git Repository」
   - 選擇 `travel-ai-planner` repository
   - 點「Import」

3. **設定環境變數**
   - 在部署設定頁面，找到「Environment Variables」
   - 新增變數：
     - Name: `GEMINI_API_KEY`
     - Value: `AIzaSyAngFNXxtDBYDqTognKKX9HtYvSqQC6r5c`
     - Environment: 選「Production」

4. **部署**
   - 點「Deploy」
   - 等待 1-2 分鐘

5. **完成！**
   - Vercel 會給你一個網址
   - 以後每次 git push，Vercel 會自動重新部署

---

## 🔧 本地測試（選擇性）

如果想在本地測試後端 API：

1. **安裝相依套件**
   ```bash
   npm install
   ```

2. **建立 `.env` 檔案**
   ```bash
   echo GEMINI_API_KEY=AIzaSyAngFNXxtDBYDqTognKKX9HtYvSqQC6r5c > .env
   ```

3. **啟動開發伺服器**
   ```bash
   vercel dev
   ```

4. **測試**
   開啟 http://localhost:3000

---

## 📊 用量限制配置

在 `api/generate.js` 中可以調整限制：

```javascript
const RATE_LIMITS = {
    requestsPerIP: 50,        // 每個 IP 每天最多 50 次
    requestsPerSession: 20,    // 每個 session 最多 20 次
    windowMs: 24 * 60 * 60 * 1000  // 24 小時
};
```

修改後重新部署：
```bash
vercel --prod
```

---

## 🔒 安全性

✅ **API Key 安全**
- 存放在 Vercel 環境變數中（加密）
- 不會出現在前端程式碼
- 不會暴露給用戶

✅ **用量控制**
- 每個 IP 每天限制 50 次
- 防止濫用
- 自動重置

✅ **CORS 保護**
- 只接受來自你網域的請求
- 防止其他網站盜用

---

## 🎨 自訂網址（選擇性）

1. 前往 Vercel 專案設定
2. 到「Domains」頁面
3. 新增自訂網域（例如 `travel.your-domain.com`）
4. 按照指示設定 DNS

---

## 📝 更新應用

**自動部署（推薦）：**
```bash
git add .
git commit -m "Update app"
git push
```
→ Vercel 會自動偵測並部署

**手動部署：**
```bash
vercel --prod
```

---

## ❓ 常見問題

### Q: API 回應 500 錯誤？
A: 檢查環境變數是否正確設定：
```bash
vercel env ls
```

### Q: 用量限制太少？
A: 修改 `api/generate.js` 中的 `RATE_LIMITS`，重新部署

### Q: 想用自己的 API Key？
A: 更新環境變數：
```bash
vercel env rm GEMINI_API_KEY production
vercel env add GEMINI_API_KEY production
vercel --prod
```

### Q: 費用問題？
A: Vercel 免費方案包含：
- 100GB 流量/月
- 100GB 小時函數執行時間/月
- 對一般使用綽綽有餘

---

## 🎉 部署後測試

1. 開啟你的 Vercel 網址
2. 在「發想區」輸入：「我想去日本5天」
3. 點「➕ 加入靈感」
4. 點「🤖 開始分析規劃」
5. 檢查是否正常運作
6. 檢查用量顯示是否出現

---

**部署完成後，用戶完全不需要設定任何東西，直接使用！** 🚀
