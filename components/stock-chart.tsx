"use client"

import { useEffect, useRef } from "react"
import {
  createChart,
  AreaSeries,
  ColorType,
} from "lightweight-charts"

interface StockChartProps {
  data: {
    time: string
    value: number
  }[]
}

export default function StockChart({ data }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: {
          color: "transparent",
        },
        horzLines: {
          color: "transparent",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    })

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 3,
      lineColor: "#22c55e",
      topColor: "rgba(34,197,94,0.25)",
      bottomColor: "rgba(34,197,94,0)",
    })

    series.setData(data)

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (!chartContainerRef.current) return

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [data])

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
    />
  )
}