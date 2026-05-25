"use client"

import { useState } from "react"
import type { CalculateResponse } from "@/lib/types"
import AssetForm from "@/components/AssetForm"
import CalculationResult from "@/components/CalculationResult"
import HistorySidebar from "@/components/HistorySidebar"
import Skeleton from "@/components/ui/Skeleton"
import { saveHistory, type HistoryItem } from "@/lib/history"

export default function SimulatorPage() {
  const [result, setResult] = useState<CalculateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastInput, setLastInput] = useState<object | null>(null)

  const handleCalculate = async (data: object) => {
    setLoading(true)
    setResult(null)
    setError("")
    setLastInput(data)
    try {
      const resp = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!resp.ok) throw new Error("計算に失敗しました。入力値をご確認ください。")
      const json: CalculateResponse = await resp.json()
      setResult(json)
      saveHistory(json, data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.result)
    setLastInput(item.input)
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <HistorySidebar onSelect={handleHistorySelect} onDelete={() => {}} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        <div className="flex-1 p-4 lg:max-w-2xl mx-auto w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">相続税シミュレーション</h1>
          <AssetForm onCalculate={handleCalculate} loading={loading} />
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
        <div className="w-full lg:w-[500px] border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
          {loading ? (
            <div className="p-4 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <Skeleton rows={5} height="20px" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <Skeleton rows={3} height="16px" />
              </div>
            </div>
          ) : result ? (
            <CalculationResult result={result} />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm">左のフォームに入力して</p>
              <p className="text-sm">「計算する」を押してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
