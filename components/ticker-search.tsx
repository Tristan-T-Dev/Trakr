"use client"

import { useState } from "react"

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

interface TickerSearchProps {
  onStockLoad: (quote: StockQuote) => void
}

const POPULAR = ["AAPL", "NVDA", "TSLA", "MSFT", "SPY"]

export default function TickerSearch({ onStockLoad }: TickerSearchProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    const ticker = input.trim().toUpperCase()
    if (!ticker) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/stock?ticker=${ticker}`)
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Could not find "${ticker}". Try another ticker.`)
        return
      }

      onStockLoad(data)
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleChip = (ticker: string) => {
    setInput(ticker)
    setError("")
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 space-y-3">

      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none"
            width="15" height="15" viewBox="0 0 15 15" fill="none"
          >
            <path d="M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setError("") }}
            onKeyDown={handleKeyDown}
            placeholder="Ticker — e.g. AAPL, NVDA, TSLA"
            maxLength={10}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-150 focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="h-10 px-5 flex items-center gap-2 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <path d="M6.5 1.5a5 5 0 0 1 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Searching
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Popular chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400 dark:text-slate-600">Popular:</span>
        {POPULAR.map((t) => (
          <button
            key={t}
            onClick={() => handleChip(t)}
            className={`h-6 px-2.5 text-[11px] rounded-full border transition-all duration-150 ${
              input === t
                ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-500 shrink-0">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}