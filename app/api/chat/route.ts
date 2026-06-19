import Groq from "groq-sdk"
import { NextRequest, NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, stockContext } = await req.json()

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are Trakr, an AI stock market analyst. Be concise, clear, and data-driven.
Avoid generic financial disclaimers. Give real, useful analysis.

Format your reply as a JSON object with exactly two keys:
1. "message" — your markdown-formatted analysis (string)
2. "sources" — an array of objects, each with:
   - "label": short source name (e.g. "Yahoo Finance", "SEC Filings", "Llama 3.3 Training Data")
   - "description": one short sentence on what this source contributed
   - "url": a real URL if applicable, or null if it's model knowledge

Always include at least one source. If the data came from the live stock feed provided, include it as a source. If analysis came from your training knowledge, include "Llama 3.3 Training Data" as a source with url: null.

Example format:
{
  "message": "## Analysis\\n**AAPL** is trading at ...",
  "sources": [
    { "label": "Live Market Feed", "description": "Real-time price, open, high, low, and previous close data.", "url": null },
    { "label": "Llama 3.3 Training Data", "description": "Fundamental analysis and market context from model training.", "url": null }
  ]
}

Return ONLY valid JSON. No markdown code fences. No extra text outside the JSON.

Format the "message" value using markdown:
- Use **bold** for ticker symbols, key figures, and important terms
- Use ## for section headings when the response has multiple sections
- Use bullet lists ( - ) for risks, pros/cons, or multiple data points
- Use > blockquotes to highlight a single key takeaway or conclusion
- Use \`inline code\` for specific numbers, percentages, price targets, or formulas
- Keep responses concise and scannable — no walls of text

${
  stockContext
    ? `
Current stock data for ${stockContext.ticker}:
- Price: $${stockContext.price}
- Change: ${stockContext.change} (${stockContext.changePercent}%)
- Day high: $${stockContext.high}
- Day low: $${stockContext.low}
- Open: $${stockContext.open}
- Prev close: $${stockContext.prevClose}`
    : "No stock selected yet."
}`,
        },
        ...messages,
      ],
    })

    const raw = completion.choices[0].message.content ?? ""

    let message = raw
    let sources: { label: string; description: string; url: string | null }[] = []

    try {
      const parsed = JSON.parse(raw)
      message = parsed.message ?? raw
      sources = parsed.sources ?? []
    } catch {
      // Model didn't return valid JSON — fall back to raw text, no sources
      message = raw
      sources = [
        {
          label: "Llama 3.3 Training Data",
          description: "Analysis generated from model training knowledge.",
          url: null,
        },
      ]
    }

    return NextResponse.json({ message, sources })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    )
  }
}