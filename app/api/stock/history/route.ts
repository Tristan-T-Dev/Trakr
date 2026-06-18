import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker")
  if (!ticker) return NextResponse.json({ error: "Missing ticker" }, { status: 400 })

  const apiKey = process.env.POLYGON_API_KEY // or whichever provider you use

  try {
    // Polygon.io example — today's 5-minute intraday bars
    const today = new Date().toISOString().split("T")[0]
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/5/minute/${today}/${today}?adjusted=true&sort=asc&limit=288&apiKey=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 60 } })
    const json = await res.json()

    if (!json.results || json.results.length === 0) {
      // Fallback: last 30 days daily bars if intraday is empty (weekend/holiday)
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const fallback = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${today}?adjusted=true&sort=asc&limit=30&apiKey=${apiKey}`,
        { next: { revalidate: 3600 } }
      )
      const fallbackJson = await fallback.json()

      const points = (fallbackJson.results ?? []).map((bar: any) => ({
        time: Math.floor(bar.t / 1000),
        value: bar.c,
      }))

      return NextResponse.json(points)
    }

    const points = json.results.map((bar: any) => ({
      time: Math.floor(bar.t / 1000),
      value: bar.c,
    }))

    return NextResponse.json(points)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}