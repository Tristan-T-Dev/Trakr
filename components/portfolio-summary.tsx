"use client"

import { useEffect, useMemo, useState } from "react"
import { useHoldingsStore } from "@/store/holdings-store"
import StockChart from "@/components/stock-chart"

export default function PortfolioSummary() {
  const holdings = useHoldingsStore((s) => s.holdings)
  const portfolioHistory = useHoldingsStore((s) => s.portfolioHistory)
  const createSnapshot = useHoldingsStore((s) => s.createSnapshot)

  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPrices = async () => {
    if (holdings.length === 0) {
      setLoading(false)
      return
    }
    try {
      const results = await Promise.all(
        holdings.map(async (holding) => {
          try {
            const res = await fetch(`/api/stock?ticker=${holding.ticker}`)
            const data = await res.json()
            return { ticker: holding.ticker, price: data.price ?? holding.avgPrice }
          } catch {
            return { ticker: holding.ticker, price: holding.avgPrice }
          }
        })
      )
      setPrices(Object.fromEntries(results.map((r) => [r.ticker, r.price])))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [holdings])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPrices()
  }

  const investedValue = useMemo(
    () => holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0),
    [holdings]
  )

  const currentValue = useMemo(
    () => holdings.reduce((sum, h) => sum + h.shares * (prices[h.ticker] ?? h.avgPrice), 0),
    [holdings, prices]
  )

  const gainLoss = currentValue - investedValue
  const gainPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0
  const isPositive = gainLoss >= 0

  useEffect(() => {
    if (!loading && currentValue > 0) createSnapshot(currentValue)
  }, [currentValue, loading])

  const chartData = useMemo(() => {
    const seen = new Set<string>()
    return portfolioHistory
      .map((s) => ({
        time: new Date(s.timestamp).toISOString().slice(0, 10),
        value: s.value,
      }))
      .filter(({ time }) => {
        if (seen.has(time)) return false
        seen.add(time)
        return true
      })
      .sort((a, b) => (a.time > b.time ? 1 : -1))
  }, [portfolioHistory])

  const averagePosition = holdings.length > 0 ? currentValue / holdings.length : 0

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-6 space-y-4 sm:space-y-5">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            Portfolio value
          </p>

          {loading ? (
            <div className="h-8 sm:h-9 w-36 sm:w-44 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : (
            <h1 className="text-2xl sm:text-[32px] font-medium tracking-tight text-slate-900 dark:text-white leading-none truncate">
              ${fmt(currentValue)}
            </h1>
          )}

          {!loading && (
            <div className="mt-2 sm:mt-2.5">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                isPositive
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
              }`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  {isPositive
                    ? <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    : <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  }
                </svg>
                <span className="hidden xs:inline">{isPositive ? "+" : ""}${gainLoss.toFixed(2)} · </span>
                {gainPercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          aria-label="Refresh prices"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors shrink-0"
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={refreshing ? "animate-spin" : ""}
          >
            <path d="M12 7A5 5 0 1 1 7 2a5 5 0 0 1 3.5 1.4L12 2v4H8l1.8-1.8A3 3 0 1 0 10 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <StockChart data={chartData} />
      ) : (
        <div className="flex h-[120px] sm:h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Tracking portfolio performance...
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM4 3V2M9 3V2M6.5 6.5a1 1 0 1 0 0-1 1 1 0 0 0 0 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            ),
            label: "Invested",
            value: `$${fmt(investedValue)}`,
            sub: "Cost basis",
          },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M2 7h9M2 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            ),
            label: "Holdings",
            value: `${holdings.length}`,
            sub: holdings.length === 1 ? "1 position" : `${holdings.length} positions`,
          },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M2 4l4.5-3 4.5 3M2 9l4.5 3 4.5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ),
            label: "Avg position",
            value: `$${fmt(averagePosition)}`,
            sub: "Per holding",
          },
        ].map(({ icon, label, value, sub }) => (
          <div
            key={label}
            className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-3 sm:p-4 transition-colors duration-150 min-w-0"
          >
            <p className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
              <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>
              <span className="truncate">{label}</span>
            </p>
            <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white tracking-tight truncate">
              {loading
                ? <span className="inline-block w-12 sm:w-16 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                : value
              }
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-600 mt-0.5 truncate">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}