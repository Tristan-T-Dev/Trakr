"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

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

  const moveSlider = (el: HTMLElement) => {
    if (!sliderRef.current || !containerRef.current) return
    const cRect = containerRef.current.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    sliderRef.current.style.width = `${eRect.width}px`
    sliderRef.current.style.transform = `translateX(${eRect.left - cRect.left}px)`
  }

  // On mount: snap slider with no transition, then re-enable
  useEffect(() => {
    if (!activeRef.current || !sliderRef.current) return
    sliderRef.current.style.transition = "none"
    moveSlider(activeRef.current)
    requestAnimationFrame(() => {
      if (sliderRef.current) sliderRef.current.style.transition = ""
    })
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-600 dark:border-slate-800 bg-black dark:bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-[52px] flex items-center justify-between">

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

        {/* Sliding nav */}
        <div ref={containerRef} className="relative flex items-center gap-0.5">
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

        {/* Right — subtle portfolio indicator or empty */}
        <div className="shrink-0 w-[60px]" />
      </div>
    </nav>
  )
}