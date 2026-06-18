// app/api/stock/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker")

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    )
    const data = await res.json()

    // Finnhub returns all zeros for unknown tickers
    if (!data.c || data.c === 0) {
      return NextResponse.json({ error: "Ticker not found" }, { status: 404 })
    }

    return NextResponse.json({
      ticker,
      price: data.c,
      change: parseFloat(data.d?.toFixed(2)),
      changePercent: parseFloat(data.dp?.toFixed(2)),
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}