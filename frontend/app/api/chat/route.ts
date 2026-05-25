import { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PRIVATE_API_URL || "http://127.0.0.1:8000"

export async function POST(req: NextRequest) {
  try {
    const { query, search_type } = await req.json()

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "質問を入力してください" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const backendResp = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, search_type: search_type || "auto" }),
    })

    if (!backendResp.ok) {
      const errorText = await backendResp.text().catch(() => "Backend error")
      return new Response(JSON.stringify({ error: errorText }), {
        status: backendResp.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const encoder = new TextEncoder()
    const stream = backendResp.body!

    return new Response(
      new ReadableStream({
        async start(controller) {
          const reader = stream.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(encoder.encode(`data: ${line}\n\n`))
              }
            }
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    )
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "バックエンドに接続できません" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}
