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

export default function StockSnapshot({ quote }: { quote: StockQuote }) {
  const isPositive = quote.change >= 0

  const rangePercent =
    quote.high > quote.low
      ? ((quote.price - quote.low) / (quote.high - quote.low)) * 100
      : 50

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-5 space-y-4 sm:space-y-5">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: ticker + label */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white tracking-tight">
              {quote.ticker}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Real-time quote</p>
        </div>

        {/* Right: price + badge */}
        <div className="text-right shrink-0">
          <p className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white leading-none">
            ${quote.price.toFixed(2)}
          </p>
          <div className="mt-1.5 sm:mt-2">
            <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full ${
              isPositive
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
            }`}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                {isPositive
                  ? <path d="M4.5 7V2M2 4.5l2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M4.5 2v5M2 4.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                }
              </svg>
              {/* On very small screens just show percent */}
              <span className="hidden xs:inline">{isPositive ? "+" : ""}{quote.change.toFixed(2)} · </span>
              {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Day range bar */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-600 shrink-0">Day range</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">L ${quote.low.toFixed(2)}</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">H ${quote.high.toFixed(2)}</span>
          </div>
        </div>
        <div className="relative h-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-400 to-green-400"
            style={{ width: `${rangePercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-950 ring-1 ring-indigo-500/30"
            style={{ left: `${rangePercent}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* Stats grid — 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Open", value: `$${quote.open.toFixed(2)}` },
          { label: "Prev close", value: `$${quote.prevClose.toFixed(2)}` },
          { label: "Day high", value: `$${quote.high.toFixed(2)}` },
          { label: "Day low", value: `$${quote.low.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-900 gap-0.5 sm:gap-0"
          >
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-sm font-medium tabular-nums text-slate-900 dark:text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}