"use client"

import { useState, useEffect, useRef } from "react"
import { useHoldingsStore } from "@/store/holdings-store"

interface AddHoldingFormProps {
  modal?: boolean
  onClose?: () => void
}

export default function AddHoldingForm({ modal = false, onClose }: AddHoldingFormProps) {
  const addHolding = useHoldingsStore((s) => s.addHolding)
  const [ticker, setTicker] = useState("")
  const [shares, setShares] = useState("")
  const [avgPrice, setAvgPrice] = useState("")
  const [success, setSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [opening, setOpening] = useState(true)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const isValid = ticker.trim().length > 0 && parseFloat(shares) > 0 && parseFloat(avgPrice) > 0
  const positionValue = isValid ? parseFloat(shares) * parseFloat(avgPrice) : 0

  useEffect(() => {
    if (modal) {
      requestAnimationFrame(() => setOpening(false))
      setTimeout(() => firstInputRef.current?.focus(), 150)
    }
  }, [modal])

  // Animated close: play out animation before unmounting
  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose?.(), 250)
  }

  useEffect(() => {
    if (!modal) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [modal])

  const handleSubmit = () => {
    if (!isValid) return
    addHolding({
      ticker: ticker.trim().toUpperCase(),
      shares: parseFloat(shares),
      avgPrice: parseFloat(avgPrice),
    })
    setTicker("")
    setShares("")
    setAvgPrice("")
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      if (modal) handleClose()
    }, 1200)
  }

  const inputClass = `
    h-[38px] w-full px-3 text-sm rounded-md outline-none transition-all duration-150
    bg-slate-50 dark:bg-slate-900
    border border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-white
    placeholder-slate-400 dark:placeholder-slate-600
    focus:border-indigo-400 dark:focus:border-indigo-500
    focus:bg-white dark:focus:bg-slate-950
    focus:ring-2 focus:ring-indigo-500/10
  `
  const labelClass = "block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5"

  const formContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-indigo-500 shrink-0">
            <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add holding
        </h3>
        {modal ? (
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-600 shrink-0">All fields required</span>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {[
          {
            label: "Ticker", ref: firstInputRef, type: "text",
            placeholder: "e.g. NVDA", value: ticker,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTicker(e.target.value.toUpperCase()),
            extra: { maxLength: 10, autoComplete: "off" },
          },
          {
            label: "Shares", ref: undefined, type: "number",
            placeholder: "0.00", value: shares,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setShares(e.target.value),
            extra: { min: "0", step: "any", inputMode: "decimal" as const },
          },
          {
            label: "Avg buy price", ref: undefined, type: "number",
            placeholder: "0.00", value: avgPrice,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAvgPrice(e.target.value),
            extra: { min: "0", step: "any", inputMode: "decimal" as const },
          },
        ].map(({ label, ref, type, placeholder, value, onChange, extra }, idx) => (
          <div
            key={label}
            className="transition-all duration-300"
            style={{ transitionDelay: `${idx * 40}ms` }}
          >
            <label className={labelClass}>{label}</label>
            <input
              ref={ref}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className={inputClass}
              {...extra}
            />
          </div>
        ))}
      </div>

      {/* Live preview — animates in when valid */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-md bg-slate-50 dark:bg-slate-900 mb-4 transition-all duration-300 ease-out ${
        isValid
          ? "opacity-100 translate-y-0 max-h-20"
          : "opacity-0 -translate-y-1 max-h-0 py-0 mb-0 overflow-hidden pointer-events-none"
      }`}>
        <span className="text-xs text-slate-500 dark:text-slate-400">Position value</span>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white min-w-0">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 transition-all duration-200">
            {ticker || "—"}
          </span>
          <span className="truncate tabular-nums">
            {parseFloat(shares) > 0 ? `${shares} shares · ` : ""}
            {positionValue.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
        <button
          onClick={modal ? handleClose : () => { setTicker(""); setShares(""); setAvgPrice("") }}
          className="h-9 px-4 text-sm rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors w-full sm:w-auto"
        >
          {modal ? "Cancel" : "Clear"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || success}
          className={`h-9 px-5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto ${
            success
              ? "bg-green-600 scale-[1.02] text-white"
              : "bg-indigo-500 hover:bg-indigo-600 hover:scale-[1.01] text-white"
          }`}
        >
          {/* Icon cross-fades between states */}
          <span className={`transition-all duration-200 ${success ? "scale-110" : "scale-100"}`}>
            {success ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5L5.5 10L11 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </span>
          <span className="transition-all duration-200">
            {success ? "Added!" : "Add holding"}
          </span>
        </button>
      </div>
    </>
  )

  if (modal) {
    return (
      <>
        {/* Backdrop — fades in/out */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${closing || opening ? "opacity-0" : "opacity-100"}`}
          onClick={handleClose}
          aria-hidden="true"
        />
        {/* Sheet — slides up/down */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add holding"
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            closing || opening ? "translate-y-full" : "translate-y-0"
          }`}
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-5" />
          {formContent}
        </div>
      </>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-5">
      {formContent}
    </div>
  )
}