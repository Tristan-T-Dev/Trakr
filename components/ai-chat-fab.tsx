"use client"

import { useState } from "react"
import AIChatPanel from "@/components/ai-chat-panel"

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

export default function AIChatFAB({ stockContext }: { stockContext: StockQuote }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* FAB — sm and below only, rotates to × when sheet is open */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className={`lg:hidden fixed z-30 w-14 h-14 rounded-full text-white shadow-lg shadow-indigo-500/30
          flex items-center justify-center
          transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]
          active:scale-90
          ${open
            ? "bg-slate-700 dark:bg-slate-600 rotate-45 scale-95"
            : "bg-indigo-500 hover:bg-indigo-600 rotate-0 scale-100"
          }`}
        style={{
          bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          right: "1.25rem",
        }}
      >
        {/* Star / AI icon — becomes × via parent rotation */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2l2.2 6.6H20l-5.5 4 2 6.4L11 15l-5.5 4 2-6.4L2 8.6h6.8z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Bottom-sheet modal */}
      {open && (
        <AIChatPanel
          stockContext={stockContext}
          modal
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}