"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useEffect, useRef, useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: Source[]
}

interface Source {
  label: string
  description: string
  url: string | null
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

interface AIChatPanelProps {
  stockContext?: StockQuote | null
  modal?: boolean
  onClose?: () => void
}

// ─── Collapsible Sources ──────────────────────────────────────────────────────

function SourcesPanel({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1L1.5 2.5v3C1.5 8.1 3.5 10.5 6 11c2.5-.5 4.5-2.9 4.5-5.5v-3L6 1z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M4 6l1.3 1.3L8 4.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-medium">
          {sources.length} {sources.length === 1 ? "Source" : "Sources"}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 3.5L5 6.5L7.5 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {sources.map((src, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <div className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-indigo-500">{i + 1}</span>
              </div>
              <div className="min-w-0">
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 hover:underline leading-tight block truncate"
                  >
                    {src.label} ↗
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight block">
                    {src.label}
                  </span>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5">
                  {src.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Markdown renderer for AI messages ───────────────────────────────────────

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white mt-3 mb-1.5 first:mt-0 pb-1 border-b border-slate-200 dark:border-slate-700">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mt-3 mb-1 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[13px] font-medium text-slate-800 dark:text-slate-200 mt-2 mb-0.5 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-slate-900 dark:text-white mb-2 last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900 dark:text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-700 dark:text-slate-300">
            {children}
          </em>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className?.includes("language-"))
          if (isBlock) return <code className={className}>{children}</code>
          return (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-[12px] font-mono font-medium">
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="mt-2 mb-2 p-3 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700 overflow-x-auto text-[12px] leading-relaxed text-slate-200">
            {children}
          </pre>
        ),
        ul: ({ children }) => (
          <ul className="my-1.5 space-y-1.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-1.5 space-y-1.5 list-none">{children}</ol>
        ),
        li: ({ children, ...props }) => {
          const ordered = (props as any).ordered
          return (
            <li className="flex items-start gap-2 text-sm text-slate-900 dark:text-white leading-relaxed">
              {ordered ? (
                <span className="mt-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold flex items-center justify-center shrink-0">
                  {(props as any).index + 1}
                </span>
              ) : (
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />
              )}
              <span>{children}</span>
            </li>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="my-2 pl-3 pr-2 py-2 border-l-2 border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 rounded-r-lg">
            <div className="text-[13px] text-indigo-700 dark:text-indigo-300 leading-relaxed [&>p]:mb-0">
              {children}
            </div>
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-slate-200 dark:border-slate-700" />,
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <table className="w-full border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-medium text-[11px] uppercase tracking-wide">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
            {children}
          </td>
        ),
        a: ({ href, children }: React.ComponentPropsWithoutRef<"a">) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIChatPanel({
  stockContext,
  modal = false,
  onClose,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [closing, setClosing] = useState(false)
  const [opening, setOpening] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (modal) {
      requestAnimationFrame(() => setOpening(false))
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [modal])

  useEffect(() => {
    if (!modal) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [modal])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose?.(), 250)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

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
        // Strip sources before sending — API only needs role + content
        body: JSON.stringify({
          messages: updated.map(({ role, content }) => ({ role, content })),
          stockContext,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          sources: data.sources ?? [],
        },
      ])
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

  // ─── Shared inner UI ────────────────────────────────────────────────────────

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-indigo-500">
            <path
              d="M6.5 1l1.2 3.8H11L8.2 7l1 3.3L6.5 8.5 3.8 10.3l1-3.3L2 4.8h3.3z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-white">AI Analyzer</span>
        {stockContext && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ml-1">
            {stockContext.ticker}
          </span>
        )}
        {modal && (
          <button
            onClick={handleClose}
            aria-label="Close"
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-indigo-500">
                <path
                  d="M9 1.5l1.6 5H16L11.7 9.5l1.5 4.8L9 11.8l-4.2 2.5 1.5-4.8L2 6.5h5.4z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
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
              <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 justify-center mt-1 w-full px-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all duration-150 text-left sm:text-center"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            style={{ animation: "msgIn 0.2s ease" }}
          >
            <div
              className={`max-w-[85%] sm:max-w-[78%] px-3 sm:px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white rounded-2xl rounded-br-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-bl-sm"
              }`}
            >
              {msg.role === "user" ? (
                <span>{msg.content}</span>
              ) : (
                <>
                  <MarkdownMessage content={msg.content} />
                  {msg.sources && msg.sources.length > 0 && (
                    <SourcesPanel sources={msg.sources} />
                  )}
                </>
              )}
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
      <div className="p-2 sm:p-2.5 border-t border-slate-100 dark:border-slate-800 flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={stockContext ? `Ask about ${stockContext.ticker}...` : "Ask about this stock..."}
          rows={1}
          className="flex-1 px-3 py-2 sm:py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none resize-none leading-relaxed transition-all duration-150 focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-150 active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M13 7.5H2M7.5 2l5.5 5.5L7.5 13"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes msgIn { from{opacity:0;transform:translateY(5px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </>
  )

  // ─── Modal (bottom sheet) ───────────────────────────────────────────────────

  if (modal) {
    return (
      <>
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${
            closing || opening ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI Analyzer"
          className={`fixed bottom-0 left-0 right-0 z-50
            bg-white dark:bg-slate-950
            rounded-t-2xl border-t border-slate-200 dark:border-slate-800
            shadow-2xl flex flex-col
            transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${closing || opening ? "translate-y-full" : "translate-y-0"}`}
          style={{ height: "72vh", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mt-3 mb-1 shrink-0" />
          {panelContent}
        </div>
      </>
    )
  }

  // ─── Default (desktop sidebar) ──────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-[500px] sm:h-[560px] lg:h-[calc(100vh-160px)] lg:max-h-[700px]">
      {panelContent}
    </div>
  )
}