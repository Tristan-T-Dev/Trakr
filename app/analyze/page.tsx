"use client"

import { useState } from "react"
import PageWrapper from "@/components/page-wrapper"
import TickerSearch from "@/components/ticker-search"
import StockSnapshot from "@/components/stock-snapshot"
import StockMiniChart from "@/components/stock-mini-chart"
import AIChatPanel from "@/components/ai-chat-panel"

export default function AnalyzePage() {
  const [stock, setStock] = useState<any>(null)

  return (
    <PageWrapper title="Analyzer" description="Ask AI about any stock">
      <div className="flex flex-col gap-6">
        <TickerSearch onStockLoad={setStock} />
        {stock && (
          <>
            <StockSnapshot quote={stock} />
            <StockMiniChart
              ticker={stock.ticker}
              color={stock.change >= 0 ? "#22c55e" : "#ef4444"}
            />
            <AIChatPanel stockContext={stock} />
          </>
        )}
      </div>
    </PageWrapper>
  )
}