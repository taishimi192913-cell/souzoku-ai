import { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PRIVATE_API_URL || "http://127.0.0.1:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const backendResp = await fetch(`${BACKEND_URL}/api/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!backendResp.ok) {
      const text = await backendResp.text().catch(() => "Backend error")
      return new Response(JSON.stringify({ error: "Backend error", detail: text }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await backendResp.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Calculate API error:", error)
    return new Response(JSON.stringify({ error: "バックエンドに接続できません" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}
