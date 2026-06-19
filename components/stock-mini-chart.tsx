"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  AreaSeries,           // ← v5: named export
} from "lightweight-charts"

interface PricePoint {
  time: UTCTimestamp
  value: number
}

interface StockMiniChartProps {
  ticker: string
  color?: string
}

export default function StockMiniChart({ ticker, color = "#6366f1" }: StockMiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDelayInfo, setShowDelayInfo] = useState(false)
  const delayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 220,
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        vertLine: { color: "#475569", width: 1, style: 3 },
        horzLine: { color: "#475569", width: 1, style: 3 },
      },
      rightPriceScale: { borderVisible: false, textColor: "#64748b" },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      handleScroll: false,
      handleScale: false,
    })

    // v5: pass the AreaSeries constructor, options go as second arg
    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: `${color}00`,
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    })

    chartRef.current = chart
    seriesRef.current = series

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [color])

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await fetch(`/api/stock/history?ticker=${ticker}`)
        if (!res.ok) throw new Error("Failed")

        const data: PricePoint[] = await res.json()

        if (!data || data.length === 0) {
          setError("No chart data available.")
          return
        }

        const seen = new Set<number>()
        const clean = data
          .filter(({ time }) => {
            if (seen.has(time as number)) return false
            seen.add(time as number)
            return true
          })
          .sort((a, b) => (a.time as number) - (b.time as number))

        if (seriesRef.current) {
          seriesRef.current.setData(clean)
          chartRef.current?.timeScale().fitContent()
        }
      } catch {
        setError("Could not load chart data.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [ticker])

  // Close the popover when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (delayRef.current && !delayRef.current.contains(e.target as Node)) {
        setShowDelayInfo(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {ticker} — Intraday
        </p>

        <div className="flex items-center gap-2">
          <div className="relative" ref={delayRef}>
            <button
              type="button"
              onClick={() => setShowDelayInfo((v) => !v)}
              aria-label="Why is this data delayed?"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 pl-2.5 pr-1.5 py-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors"
            >
              Delayed data
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>

            {showDelayInfo && (
              <div className="absolute right-0 top-full mt-2 w-64 z-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-lg">
                <p className="text-xs font-medium text-slate-900 dark:text-white mb-1">
                  About this data
                </p>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Prices come from Polygon.io. On the free plan, same-day intraday bars
                  aren't available and quotes can lag the real market by 15+ minutes.
                  A paid Polygon plan is required for true real-time data.
                </p>
              </div>
            )}
          </div>

          {loading && <span className="text-xs text-slate-400">Loading chart...</span>}
        </div>
      </div>

      {error ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      ) : (
        <div ref={containerRef} className="w-full" />
      )}
    </div>
  )
}