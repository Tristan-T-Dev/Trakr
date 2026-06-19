"use client"

import { useState } from "react"
import PageWrapper from "@/components/page-wrapper"
import TickerSearch from "@/components/ticker-search"
import StockSnapshot from "@/components/stock-snapshot"
import StockMiniChart from "@/components/stock-mini-chart"
import AIChatPanel from "@/components/ai-chat-panel"
import AIChatFAB from "@/components/ai-chat-fab"

interface StockQuote {
  ticker: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
}

export default function AnalyzePage() {
  const [stock, setStock] = useState<StockQuote | null>(null)

  return (
    <PageWrapper title="Analyzer" description="Ask AI about any stock">
      <div className="flex flex-col gap-4 sm:gap-6">
        <TickerSearch onStockLoad={setStock} />
        {stock && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-6 items-start">
            {/* Left column */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <StockSnapshot quote={stock} />
              <StockMiniChart
                ticker={stock.ticker}
                color={stock.change >= 0 ? "#22c55e" : "#ef4444"}
              />
            </div>

            {/* Right column — desktop only */}
            <div className="hidden lg:block lg:sticky lg:top-[68px]">
              <AIChatPanel stockContext={stock} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile FAB — only renders once a stock is loaded */}
      {stock && <AIChatFAB stockContext={stock} />}
    </PageWrapper>
  )
}