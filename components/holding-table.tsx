"use client"

import { useEffect, useState, useRef } from "react"
import { useHoldingsStore } from "@/store/holdings-store"

export default function HoldingsTable() {
  const { holdings, removeHolding } = useHoldingsStore()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [removingTicker, setRemovingTicker] = useState<string | null>(null)
  const prevPricesRef = useRef<Record<string, number>>({})
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down" | null>>({})

  useEffect(() => {
    const fetchPrices = async () => {
      if (holdings.length === 0) { setLoading(false); return }
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
        const newPrices = Object.fromEntries(results.map((r) => [r.ticker, r.price]))

        // Compute flash directions vs previous prices
        const flashes: Record<string, "up" | "down" | null> = {}
        for (const { ticker, price } of results) {
          const prev = prevPricesRef.current[ticker]
          if (prev !== undefined && price !== prev) {
            flashes[ticker] = price > prev ? "up" : "down"
          }
        }
        if (Object.keys(flashes).length > 0) {
          setFlashMap(flashes)
          setTimeout(() => setFlashMap({}), 800)
        }

        prevPricesRef.current = newPrices
        setPrices(newPrices)
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

  const handleRemove = (ticker: string) => {
    setRemovingTicker(ticker)
    setTimeout(() => {
      removeHolding(ticker)
      setRemovingTicker(null)
    }, 300)
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-3 text-center animate-in fade-in duration-300">
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

  const iconColors = [
    "bg-indigo-50 dark:bg-indigo-950 text-indigo-500",
    "bg-teal-50 dark:bg-teal-950 text-teal-600",
    "bg-red-50 dark:bg-red-950 text-red-500",
    "bg-amber-50 dark:bg-amber-950 text-amber-600",
    "bg-purple-50 dark:bg-purple-950 text-purple-500",
  ]

  const cols = "grid-cols-[1.4fr_0.8fr_1fr_1fr_1.2fr_52px]"

  const RowContent = ({ h, i }: { h: typeof holdings[0]; i: number }) => {
    const livePrice = prices[h.ticker] ?? h.avgPrice
    const costBasis = h.shares * h.avgPrice
    const currentValue = h.shares * livePrice
    const gainLossDollar = currentValue - costBasis
    const gainLossPercent = costBasis > 0 ? (gainLossDollar / costBasis) * 100 : 0
    const isUp = gainLossDollar >= 0
    const iconColor = iconColors[i % iconColors.length]
    const flash = flashMap[h.ticker]

    return { livePrice, gainLossDollar, gainLossPercent, isUp, iconColor, flash }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block">
        <div className={`grid ${cols} items-center px-4 h-10 gap-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800`}>
          {["Ticker", "Shares", "Avg price", "Current", "Gain / loss", ""].map((h) => (
            <span key={h} className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-600">{h}</span>
          ))}
        </div>

        <div>
          {holdings.map((h, i) => {
            const { livePrice, gainLossDollar, gainLossPercent, isUp, iconColor, flash } = RowContent({ h, i })
            const isRemoving = removingTicker === h.ticker

            return (
              <div
                key={h.ticker}
                className={`grid ${cols} items-center px-4 h-14 gap-2 border-t border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all duration-300 ${
                  isRemoving ? "opacity-0 scale-y-0 -translate-x-2" : "opacity-100 scale-y-100 translate-x-0"
                }`}
                style={{
                  animationDelay: `${i * 50}ms`,
                  transformOrigin: "top",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium shrink-0 ${iconColor}`}>
                    {h.ticker.slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{h.ticker}</span>
                </div>

                <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{h.shares}</span>
                <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">${h.avgPrice.toFixed(2)}</span>

                {/* Current price with flash highlight */}
                <span className={`text-sm tabular-nums font-medium rounded px-1 -mx-1 transition-colors duration-700 ${
                  flash === "up"
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60"
                    : flash === "down"
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60"
                    : "text-slate-600 dark:text-slate-300 bg-transparent"
                }`}>
                  {loading
                    ? <span className="inline-block w-14 h-3.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    : `$${livePrice.toFixed(2)}`
                  }
                </span>

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

                <button
                  onClick={() => handleRemove(h.ticker)}
                  aria-label={`Remove ${h.ticker}`}
                  className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-900 hover:text-red-500 transition-all duration-150 active:scale-90"
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

      {/* ── Mobile cards (< md) ── */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {holdings.map((h, i) => {
          const { livePrice, gainLossDollar, gainLossPercent, isUp, iconColor, flash } = RowContent({ h, i })
          const isRemoving = removingTicker === h.ticker

          return (
            <div
              key={h.ticker}
              className={`p-4 transition-all duration-300 ease-out ${
                isRemoving
                  ? "opacity-0 -translate-x-4 scale-95"
                  : "opacity-100 translate-x-0 scale-100"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium shrink-0 ${iconColor}`}>
                  {h.ticker.slice(0, 2)}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">{h.ticker}</span>

                {!loading && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors duration-300 ${
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
                    {isUp ? "+" : ""}{gainLossPercent.toFixed(2)}%
                  </span>
                )}

                <button
                  onClick={() => handleRemove(h.ticker)}
                  aria-label={`Remove ${h.ticker}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-900 hover:text-red-500 transition-all duration-150 active:scale-90 shrink-0"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Shares", value: String(h.shares), colored: false },
                  { label: "Avg price", value: `$${h.avgPrice.toFixed(2)}`, colored: false },
                  { label: "Current", value: loading ? null : `$${livePrice.toFixed(2)}`, colored: true, isUp, flash },
                ].map(({ label, value, colored, isUp: up, flash: f }) => (
                  <div key={label} className={`rounded-lg px-3 py-2 transition-colors duration-700 ${
                    f === "up" ? "bg-green-50 dark:bg-green-950/40"
                    : f === "down" ? "bg-red-50 dark:bg-red-950/40"
                    : "bg-slate-50 dark:bg-slate-900"
                  }`}>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-600 mb-1">{label}</p>
                    {value === null ? (
                      <span className="inline-block w-12 h-3.5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    ) : (
                      <p className={`text-sm font-medium tabular-nums transition-colors duration-300 ${
                        colored
                          ? up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          : "text-slate-900 dark:text-white"
                      }`}>{value}</p>
                    )}
                  </div>
                ))}
              </div>

              {!loading && (
                <p className={`mt-2 text-xs tabular-nums transition-colors duration-300 ${isUp ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                  {isUp ? "+" : ""}${gainLossDollar.toFixed(2)} total gain/loss
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}