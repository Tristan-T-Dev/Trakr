"use client"

import { useState } from "react"
import AddHoldingForm from "@/components/add-holding-form"

export default function AddHoldingFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* FAB — pulses once on mount to draw attention, rotates to × when open */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close" : "Add holding"}
        className={`sm:hidden fixed z-30 w-14 h-14 rounded-full text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] active:scale-90
          ${open
            ? "bg-slate-700 dark:bg-slate-600 rotate-45 scale-95"
            : "bg-indigo-500 hover:bg-indigo-600 rotate-0 scale-100"
          }`}
        style={{
          bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          right: "1.25rem",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 4v14M4 11h14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Bottom-sheet modal */}
      {open && (
        <AddHoldingForm modal onClose={() => setOpen(false)} />
      )}
    </>
  )
}