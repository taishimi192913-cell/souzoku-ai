"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { loadHistory, type HistoryItem } from "@/lib/history"
import Link from "next/link"

function yen(v: number): string {
  return `¥${v.toLocaleString()}`
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  return (
    <div className="flex-1 max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">マイページ</h1>
      <p className="text-sm text-gray-500 mb-6">
        {session?.user?.name ?? "ゲスト"}さん、こんにちは
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">計算履歴</h2>
          <Link href="/simulator" className="text-sm text-blue-600 hover:text-blue-800">
            新しい計算
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">まだ計算履歴がありません</p>
            <Link href="/simulator" className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800">
              最初の計算をする
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <Link key={item.id} href="/simulator" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">{item.summary}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{yen(item.totalTax)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
