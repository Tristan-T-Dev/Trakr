"use client"

import { useEffect, useRef, useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

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

export default function AIChatPanel({ stockContext }: { stockContext?: StockQuote | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: "user", content: text }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, stockContext }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestions = stockContext
    ? [
        `Is ${stockContext.ticker} a good buy right now?`,
        `What are the risks of ${stockContext.ticker}?`,
        `Summarize ${stockContext.ticker} performance today`,
      ]
    : []

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col min-h-[420px]">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-indigo-500">
            <path d="M6.5 1l1.2 3.8H11L8.2 7l1 3.3L6.5 8.5 3.8 10.3l1-3.3L2 4.8h3.3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-white">AI Analyzer</span>
        {stockContext && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {stockContext.ticker}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 flex flex-col gap-2.5 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-indigo-500">
                <path d="M9 1.5l1.6 5H16L11.7 9.5l1.5 4.8L9 11.8l-4.2 2.5 1.5-4.8L2 6.5h5.4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {stockContext ? `Ask anything about ${stockContext.ticker}` : "Search a ticker to get started"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                {stockContext ? "Powered by real-time market data" : "Then ask the AI anything about it"}
              </p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            style={{ animation: "msgIn 0.2s ease" }}
          >
            <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-500 text-white rounded-2xl rounded-br-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                  style={{ animation: `blink 1.2s ${delay}ms infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input footer */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={stockContext ? `Ask about ${stockContext.ticker}...` : "Ask about this stock..."}
          rows={1}
          className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none resize-none leading-relaxed transition-all duration-150 focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-150 active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M7.5 2l5.5 5.5L7.5 13" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes msgIn { from{opacity:0;transform:translateY(5px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  )
}