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
${
  stockContext
    ? `Current stock data for ${stockContext.ticker}:
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

    return NextResponse.json({
      message: completion.choices[0].message.content,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    )
  }
}