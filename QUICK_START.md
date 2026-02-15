# ⚡ 快速開始指南

## 📋 環境變數設定總結

### ✅ 你已完成
- Vercel Dashboard 設定環境變數 `API_KEY`
- 值：你的 Gemini API Key

### ✅ 已自動配置
- `vercel.json` 已設定將 `@api_key` 映射到 `GEMINI_API_KEY`
- `api/generate.js` 已使用 `process.env.GEMINI_API_KEY`

### ⚙️ 工作原理

```
Vercel Dashboard: API_KEY (你設定的)
        ↓
vercel.json: @api_key
        ↓
Runtime: process.env.GEMINI_API_KEY (程式碼使用)
```

## 🚀 立即部署

```bash
# 確保在專案目錄
cd travel-ai-planner-new

# 部署到生產環境
vercel --prod
```

就這麼簡單！環境變數已經設定好了。

## 🔍 驗證部署

部署完成後測試：

1. 開啟部署的 URL
2. 新增一個靈感（例如：「我想去東京旅遊 5 天」）
3. 點擊「🤖 開始分析規劃」
4. 如果 AI 有回應，表示環境變數設定成功！✅

## ❌ 如果失敗

### 看到「伺服器配置錯誤」？

1. 檢查 Vercel Dashboard → Settings → Environment Variables
2. 確認 `API_KEY` 存在且值正確
3. 重新部署：`vercel --prod --force`

### 其他問題？

查看詳細的故障排除：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 本地開發

如果要在本地測試：

```bash
# 1. 建立環境變數檔案
cp .env.example .env.local

# 2. 編輯 .env.local，填入你的 API Key
# GEMINI_API_KEY=你的_api_key

# 3. 啟動開發伺服器
npm run dev
```

## 🎯 下一步

- 📖 閱讀 [README.md](./README.md) 了解專案架構
- 📚 查看 [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) 了解重構細節
- 🚀 開始開發 UI 組件

---

**一切就緒！開始部署吧！** 🎉
