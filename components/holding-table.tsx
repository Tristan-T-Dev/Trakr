"use client"

import { useEffect, useState } from "react"
import { useHoldingsStore } from "@/store/holdings-store"

export default function HoldingsTable() {
  const { holdings, removeHolding } = useHoldingsStore()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      if (holdings.length === 0) {
        setLoading(false)
        return
      }
      try {
        const results = await Promise.all(
          holdings.map(async (h) => {
            try {
              const res = await fetch(`/api/stock?ticker=${h.ticker}`)
              const data = await res.json()
              return { ticker: h.ticker, price: data.price ?? h.avgPrice }
            } catch {
              return { ticker: h.ticker, price: h.avgPrice }
            }
          })
        )
        setPrices(Object.fromEntries(results.map((r) => [r.ticker, r.price])))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [holdings])

  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-slate-400">
            <path d="M3 5h12M3 9h8M3 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">No holdings yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-600">Add your first position above</p>
      </div>
    )
  }

  const cols = "grid-cols-[1.4fr_0.8fr_1fr_1fr_1.2fr_52px]"

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* Header */}
      <div className={`grid ${cols} items-center px-4 h-10 gap-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800`}>
        {["Ticker", "Shares", "Avg price", "Current", "Gain / loss", ""].map((h) => (
          <span key={h} className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-600">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {holdings.map((h, i) => {
          const livePrice = prices[h.ticker] ?? h.avgPrice
          const costBasis = h.shares * h.avgPrice
          const currentValue = h.shares * livePrice
          const gainLossDollar = currentValue - costBasis
          const gainLossPercent = costBasis > 0 ? (gainLossDollar / costBasis) * 100 : 0
          const isUp = gainLossDollar >= 0
          const initials = h.ticker.slice(0, 2)

          // Cycle icon bg colors per row
          const iconColors = [
            "bg-indigo-50 dark:bg-indigo-950 text-indigo-500",
            "bg-teal-50 dark:bg-teal-950 text-teal-600",
            "bg-red-50 dark:bg-red-950 text-red-500",
            "bg-amber-50 dark:bg-amber-950 text-amber-600",
            "bg-purple-50 dark:bg-purple-950 text-purple-500",
          ]
          const iconColor = iconColors[i % iconColors.length]

          return (
            <div
              key={h.ticker}
              className={`grid ${cols} items-center px-4 h-14 gap-2 border-t border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors duration-150`}
            >
              {/* Ticker */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium shrink-0 ${iconColor}`}>
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {h.ticker}
                </span>
              </div>

              {/* Shares */}
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                {h.shares}
              </span>

              {/* Avg price */}
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                ${h.avgPrice.toFixed(2)}
              </span>

              {/* Current price */}
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                {loading ? (
                  <span className="inline-block w-14 h-3.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                  `$${livePrice.toFixed(2)}`
                )}
              </span>

              {/* Gain / loss */}
              <div className="flex flex-col gap-0.5">
                {loading ? (
                  <span className="inline-block w-20 h-3.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit ${
                      isUp
                        ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                    }`}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        {isUp
                          ? <path d="M4 6V2M2 4l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          : <path d="M4 2v4M2 4l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        }
                      </svg>
                      {isUp ? "+" : ""}${Math.abs(gainLossDollar).toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-medium ${isUp ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      {isUp ? "+" : ""}{gainLossPercent.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeHolding(h.ticker)}
                aria-label={`Remove ${h.ticker}`}
                className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-900 hover:text-red-500 transition-all duration-150"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}