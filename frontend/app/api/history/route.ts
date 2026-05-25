import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/history — 履歴一覧取得
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ items: [] })
    }

    // ユーザーをemailで検索
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const items = await prisma.calculationHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        summary: true,
        totalTax: true,
        createdAt: true,
        input: true,
        result: true,
      },
    })

    const history = items.map((item) => ({
      id: item.id,
      date: item.createdAt.toLocaleDateString("ja-JP"),
      summary: item.summary,
      totalTax: item.totalTax,
      result: JSON.parse(item.result),
      input: JSON.parse(item.input),
    }))

    return NextResponse.json({ items: history })
  } catch (error) {
    console.error("History GET error:", error)
    return NextResponse.json({ items: [] })
  }
}

// POST /api/history — 履歴追加
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const { result, input } = body

    if (!result || !input) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const heirs = result.per_heir?.map((h: any) => h.relation).join("+") || "相続人"
    const summary = `${heirs} / 課税資産`

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (user) {
        await prisma.calculationHistory.create({
          data: {
            userId: user.id,
            input: JSON.stringify(input),
            result: JSON.stringify(result),
            totalTax: result.total_tax || 0,
            summary,
          },
        })
      }
    }

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("History POST error:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}

// DELETE /api/history?id=xxx — 履歴削除
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await prisma.calculationHistory.deleteMany({
      where: { id, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("History DELETE error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
