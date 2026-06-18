"use client"

import { useState, useEffect } from "react"
import { useHoldingsStore } from "@/store/holdings-store"

export default function AddHoldingForm() {
  const addHolding = useHoldingsStore((s) => s.addHolding)
  const [ticker, setTicker] = useState("")
  const [shares, setShares] = useState("")
  const [avgPrice, setAvgPrice] = useState("")
  const [success, setSuccess] = useState(false)

  const isValid = ticker.trim().length > 0 && parseFloat(shares) > 0 && parseFloat(avgPrice) > 0
  const positionValue = isValid ? parseFloat(shares) * parseFloat(avgPrice) : 0
  const showPreview = isValid

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
    setTimeout(() => setSuccess(false), 1500)
  }

  const handleClear = () => {
    setTicker("")
    setShares("")
    setAvgPrice("")
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

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-indigo-500">
            <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add holding
        </h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-600">All fields required</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelClass}>Ticker</label>
          <input
            type="text"
            placeholder="e.g. NVDA"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            maxLength={10}
            autoComplete="off"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Shares</label>
          <input
            type="number"
            placeholder="0.00"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            min="0"
            step="any"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Avg buy price</label>
          <input
            type="number"
            placeholder="0.00"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            min="0"
            step="any"
            className={inputClass}
          />
        </div>
      </div>

      {/* Live preview */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-md bg-slate-50 dark:bg-slate-900 mb-4 transition-all duration-200 ${
        showPreview ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
      }`}>
        <span className="text-xs text-slate-500 dark:text-slate-400">Position value</span>
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-900 dark:text-white">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            {ticker}
          </span>
          <span>
            {parseFloat(shares) > 0 ? `${shares} shares · ` : ""}
            {positionValue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleClear}
          className="h-9 px-4 text-sm rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || success}
          className={`h-9 px-5 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
            success
              ? "bg-green-600 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
        >
          {success ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5L5.5 10L11 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Added
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Add holding
            </>
          )}
        </button>
      </div>
    </div>
  )
}