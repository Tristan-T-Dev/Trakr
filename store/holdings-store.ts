import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Holding {
  ticker: string
  shares: number
  avgPrice: number
}

interface PortfolioSnapshot {
  timestamp: number
  value: number
}

interface HoldingsStore {
  holdings: Holding[]
  portfolioHistory: PortfolioSnapshot[]

  addHolding: (h: Holding) => void
  removeHolding: (ticker: string) => void
  createSnapshot: (value: number) => void  // ← accepts live value
}

export const useHoldingsStore = create<HoldingsStore>()(
  persist(
    (set) => ({
      holdings: [],
      portfolioHistory: [],

      addHolding: (h) =>
        set((state) => ({
          holdings: [...state.holdings, h],
        })),

      removeHolding: (ticker) =>
        set((state) => ({
          holdings: state.holdings.filter(
            (h) => h.ticker !== ticker
          ),
        })),

      createSnapshot: (value: number) => {  // ← uses passed-in live value
        set((state) => {
          const now = Date.now()
          const lastSnapshot =
            state.portfolioHistory[state.portfolioHistory.length - 1]

          // Skip if same second and same value — avoids duplicate timestamps
          if (
            lastSnapshot &&
            Math.floor(lastSnapshot.timestamp / 1000) ===
              Math.floor(now / 1000)
          ) {
            return state
          }

          return {
            portfolioHistory: [
              ...state.portfolioHistory,
              { timestamp: now, value },
            ],
          }
        })
      },
    }),
    {
      name: "trakr-holdings",
    }
  )
)