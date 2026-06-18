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

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {ticker} — Intraday
        </p>
        {loading && <span className="text-xs text-slate-400">Loading chart...</span>}
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