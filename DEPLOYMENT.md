# 🚀 部署指南

## Vercel 環境變數設定

### 你已經設定的環境變數

✅ 環境變數名稱：`API_KEY`
✅ 值：你的 Gemini API Key

### 重要：環境變數映射

Vercel 配置檔 (`vercel.json`) 已經設定將 `@api_key` 映射到 `GEMINI_API_KEY`：

```json
{
  "env": {
    "GEMINI_API_KEY": "@api_key"
  }
}
```

這表示：
- 你在 Vercel Dashboard 設定的環境變數名稱是 `API_KEY`
- 程式碼中使用 `process.env.GEMINI_API_KEY` 來存取
- Vercel 會自動將 `@api_key` (對應你設定的 `API_KEY`) 注入為 `GEMINI_API_KEY`

## 📋 部署步驟

### 方式一：Vercel CLI (推薦)

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署到預覽環境
cd travel-ai-planner-new
vercel

# 4. 部署到生產環境
vercel --prod
```

### 方式二：Vercel Dashboard

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 導入你的 Git repository
4. Vercel 會自動檢測到這是 Vite 專案
5. 點擊 "Deploy"

## ✅ 環境變數檢查清單

### Vercel Dashboard 設定

1. 前往你的專案設定
2. 點擊 "Settings" → "Environment Variables"
3. 確認以下環境變數存在：

| 名稱 | 值 | 環境 |
|------|-----|------|
| `API_KEY` | 你的 Gemini API Key | Production, Preview, Development |

### 驗證環境變數

部署後，你可以檢查環境變數是否正確載入：

```bash
# 在 Vercel 的 Serverless Function Logs 中應該看到
# ✅ "GEMINI_API_KEY is loaded"
# 而不是
# ❌ "Missing GEMINI_API_KEY environment variable"
```

## 🔍 故障排除

### 問題：API 返回 500 錯誤 "伺服器配置錯誤"

**原因**：環境變數未正確設定

**解決方案**：

1. 檢查 Vercel Dashboard 中 `API_KEY` 是否存在
2. 確認環境變數已套用到所有環境 (Production, Preview, Development)
3. 重新部署專案：
   ```bash
   vercel --prod --force
   ```

### 問題：本地開發時 API 無法工作

**解決方案**：

1. 建立 `.env.local` 檔案：
   ```bash
   cp .env.example .env.local
   ```

2. 填入你的 API Key：
   ```
   GEMINI_API_KEY=你的_api_key
   ```

3. 重啟開發伺服器：
   ```bash
   npm run dev
   ```

### 問題：部署後環境變數沒有生效

**解決方案**：

1. 確認 `vercel.json` 中的設定正確
2. 在 Vercel Dashboard 重新部署
3. 檢查 Function Logs 是否有錯誤訊息

## 📊 部署後檢查

部署完成後，測試以下功能：

1. ✅ 開啟網站正常載入
2. ✅ 可以新增靈感 (文字/圖片/連結)
3. ✅ 點擊「開始分析」後 AI 正常回應
4. ✅ 可以與 AI 對話
5. ✅ 可以生成行程
6. ✅ 可以匯出 HTML

## 🔐 安全性

### ✅ 最佳實踐

- ✅ API Key 存放在環境變數 (不在程式碼中)
- ✅ API Key 不會暴露給前端
- ✅ 使用 Serverless Function 作為代理
- ✅ 實作 Rate Limiting (每 IP 每天 50 次)
- ✅ CORS 設定

### ⚠️ 注意事項

- **永遠不要** 將 API Key 提交到 Git
- **永遠不要** 在前端程式碼中使用 API Key
- **定期輪換** API Key
- **監控** API 使用量

## 📈 效能優化建議

### CDN 設定 (已自動配置)

Vercel 會自動：
- ✅ 使用全球 CDN
- ✅ 啟用 HTTP/2
- ✅ 壓縮靜態資源
- ✅ 快取優化

### 自訂設定

如需更多優化，可在 `vercel.json` 中添加：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🌍 自訂網域

1. 前往 Vercel Dashboard
2. Settings → Domains
3. 添加你的網域
4. 按照指示設定 DNS

## 📝 環境變數最佳實踐

### 建議的環境變數結構

```bash
# Production
API_KEY=prod_gemini_key_xxx

# Preview (用於 PR 預覽)
API_KEY=preview_gemini_key_xxx

# Development (本地開發)
GEMINI_API_KEY=dev_gemini_key_xxx
```

## 🔄 CI/CD

Vercel 自動支援：
- ✅ Git 推送自動部署
- ✅ PR 預覽環境
- ✅ 生產環境部署保護
- ✅ 回滾功能

## 📞 支援

遇到問題？

1. 查看 [Vercel 文檔](https://vercel.com/docs)
2. 檢查 [Function Logs](https://vercel.com/docs/observability/runtime-logs)
3. 查看專案的 `REFACTORING_GUIDE.md`

---

**最後更新**：2026-02-15
