import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Analytics } from '@vercel/analytics/next'
import "./globals.css"

export const metadata = {
  title: "Trakr",
  description: "AI-powered stock portfolio tracker",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}