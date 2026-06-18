"use client"

import { useEffect, useRef, useState } from "react"
import { useHoldingsStore } from "@/store/holdings-store"
import NewsCard from "@/components/news-card"

interface Article {
  title: string
  source: string
  url: string
  publishedAt: string
  description?: string
}

const TOPIC_CHIPS = [
  "stock market",
  "crypto",
  "Fed",
  "earnings",
  "forex",
  "bitcoin",
  "merger",
  "IPO",
]

export default function NewsFeed() {
  const holdings = useHoldingsStore((s) => s.holdings)
  const [articles, setArticles] = useState<Article[]>([])
  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("stock market")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchNews = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return

    setLoading(true)
    setError("")
    setActiveQuery(trimmed)

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      if (!Array.isArray(data)) throw new Error("Bad response")

      setArticles(data)

      if (data.length === 0) {
        setError(`No news found for "${trimmed}". Try a different keyword or ticker.`)
      }
    } catch {
      setError("Could not load news. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews("stock market")
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) fetchNews(query)
  }

  const handleChip = (q: string) => {
    setQuery(q)
    fetchNews(q)
    inputRef.current?.focus()
  }

  const allChips = [
    ...holdings.map((h) => ({ label: h.ticker, type: "holding" as const })),
    ...TOPIC_CHIPS.map((t) => ({ label: t, type: "topic" as const })),
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — ticker, topic, keyword..."
          className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 text-sm font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {allChips.map(({ label, type }) => {
          const isActive = activeQuery.toLowerCase() === label.toLowerCase()
          return (
            <button
              key={label}
              onClick={() => handleChip(label)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : type === "holding"
                  ? "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              {type === "holding" ? `$${label}` : label}
            </button>
          )
        })}
      </div>

      {/* Status */}
      {!loading && !error && articles.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {articles.length} articles for{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {activeQuery}
          </span>
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}