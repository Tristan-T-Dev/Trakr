import { NextRequest, NextResponse } from "next/server"

const CATEGORY_MAP: Record<string, string> = {
  crypto: "crypto",
  cryptocurrency: "crypto",
  bitcoin: "crypto",
  btc: "crypto",
  eth: "crypto",
  ethereum: "crypto",
  forex: "forex",
  currency: "forex",
  usd: "forex",
  merger: "merger",
  acquisition: "merger",
  ipo: "merger",
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() || "stock market"
  const apiKey = process.env.FINNHUB_API_KEY

  try {
    const isTicker = /^[A-Z]{1,10}$/.test(query.toUpperCase()) && query.length <= 5

    // --- Ticker-specific news ---
    if (isTicker) {
      const to = new Date().toISOString().split("T")[0]
      const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]

      const res = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${query.toUpperCase()}&from=${from}&to=${to}&token=${apiKey}`,
        { next: { revalidate: 300 } }
      )
      const data = await res.json()
      const articles = Array.isArray(data) ? data : []

      // If ticker returns nothing, fall through to keyword search
      if (articles.length > 0) {
        return NextResponse.json(mapArticles(articles.slice(0, 24)))
      }
    }

    // --- Category or keyword search ---
    const keyword = query.toLowerCase()
    const category = CATEGORY_MAP[keyword]

    if (category) {
      // Exact category match — fetch that Finnhub category
      const res = await fetch(
        `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`,
        { next: { revalidate: 300 } }
      )
      const data = await res.json()
      const articles = Array.isArray(data) ? data : []
      return NextResponse.json(mapArticles(articles.slice(0, 24)))
    }

    // --- General keyword: fetch general + crypto + merger, then filter ---
    const [general, crypto, merger] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
      fetch(`https://finnhub.io/api/v1/news?category=crypto&token=${apiKey}`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
      fetch(`https://finnhub.io/api/v1/news?category=merger&token=${apiKey}`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
    ])

    const all = [
      ...(Array.isArray(general) ? general : []),
      ...(Array.isArray(crypto) ? crypto : []),
      ...(Array.isArray(merger) ? merger : []),
    ]

    // Score each article by how many times the keyword appears
    const words = keyword.split(/\s+/).filter(Boolean)
    const scored = all
      .map((item: any) => {
        const text =
          `${item.headline ?? ""} ${item.summary ?? ""} ${item.source ?? ""}`.toLowerCase()
        const score = words.reduce(
          (acc, word) => acc + (text.split(word).length - 1),
          0
        )
        return { item, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)

    // If keyword filter returns nothing, fall back to general news
    const results = scored.length > 0 ? scored.slice(0, 24) : all.slice(0, 24)

    return NextResponse.json(mapArticles(results))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

function mapArticles(data: any[]) {
  return data
    .filter((item) => item.headline && item.url)
    .map((item) => ({
      title: item.headline,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      description: item.summary,
    }))
}