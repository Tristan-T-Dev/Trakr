"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/analyze", label: "Analyzer" },
  { href: "/news", label: "News" },
]

export default function Navbar() {
  const pathname = usePathname()
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const moveSlider = (el: HTMLElement) => {
    if (!sliderRef.current || !containerRef.current) return
    const cRect = containerRef.current.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    sliderRef.current.style.width = `${eRect.width}px`
    sliderRef.current.style.transform = `translateX(${eRect.left - cRect.left}px)`
  }

  useEffect(() => {
    if (!activeRef.current || !sliderRef.current) return
    sliderRef.current.style.transition = "none"
    moveSlider(activeRef.current)
    requestAnimationFrame(() => {
      if (sliderRef.current) sliderRef.current.style.transition = ""
    })
  }, [pathname])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-opacity hover:opacity-70"
          >
            <span className="w-[22px] h-[22px] rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,9 4,5 7,7 11,2" />
              </svg>
            </span>
            Trakr
          </Link>

          {/* Desktop sliding nav — hidden on mobile */}
          <div ref={containerRef} className="relative hidden sm:flex items-center gap-0.5">
            {/* Animated background pill */}
            <div
              ref={sliderRef}
              className="absolute top-0 left-0 h-full rounded-md bg-slate-100 dark:bg-slate-800 transition-[transform,width] duration-[250ms] ease-[cubic-bezier(0.34,1.2,0.64,1)] pointer-events-none"
            />

            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={isActive ? (el) => { activeRef.current = el } : undefined}
                  className={`relative z-10 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 select-none ${
                    isActive
                      ? "text-slate-900 dark:text-white font-medium"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right spacer (desktop) / Hamburger (mobile) */}
          <div className="shrink-0 w-[60px] flex justify-end">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {menuOpen ? (
                // X icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                // Hamburger icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-[52px] left-0 right-0 z-40 sm:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-all duration-200 ease-out ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {/* Active indicator dot */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-indigo-500" : "bg-transparent"}`} />
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}