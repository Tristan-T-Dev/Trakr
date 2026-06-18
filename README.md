# 📊 Trakr

> **Trakr** is a modern investment tracking platform that combines real-time market data, AI-powered analysis, and smart financial news insights to help you make better investment decisions.

---

## 🚀 Features

### 📈 Real-Time Portfolio Dashboard
- Track stocks, crypto, and assets in one unified dashboard
- Live price updates via **Polygon API**
- Portfolio performance tracking (PnL, allocation, trends)

---

### 🤖 AI-Powered Investment Analyzer
Powered by **Groq LLM**

- Ask natural language questions like:
  > “Should I hold NVDA long term?”  
  > “Why is BTC dropping today?”

- AI provides:
  - Risk analysis
  - Market sentiment breakdown
  - Investment suggestions
  - Portfolio insights

---

### 📰 Smart Market News Engine
Powered by **Finnhub API**

- Tracks:
  - FED announcements
  - Crypto news
  - Earnings reports
  - Macro events

- AI summarizes news impact on your portfolio

---

### 🔌 Multi-API Market Data Integration

| API | Purpose |
|-----|--------|
| Finnhub | Financial news & fundamentals |
| Polygon.io | Real-time stock & crypto prices |
| Groq | AI reasoning & analysis layer |

---

## 🧠 Key Capabilities

- 📊 Live portfolio valuation
- 📉 Gain/loss tracking per asset
- 🧠 AI-generated investment insights
- 📰 News sentiment analysis
- ⚡ Real-time ticker updates
- 🔄 Fast responsive dashboard UI

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes / Node.js
- **AI Engine:** Groq LLM API
- **Market Data:** Finnhub, Polygon.io
- **State Management:** Zustand 

---

## 🔐 Environment Variables

Create a `.env.local` file:

```bash
FINNHUB_API_KEY=your_finnhub_key
POLYGON_API_KEY=your_polygon_key
GROQ_API_KEY=your_groq_key
