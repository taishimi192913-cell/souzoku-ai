import { useEffect, useState } from "react"
import { loadHistory, loadHistoryAsync, deleteHistoryAsync, type HistoryItem } from "@/lib/history"

interface Props {
  onSelect: (item: HistoryItem) => void
  onDelete: () => void
}

function yen(v: number): string {
  return `¥${v.toLocaleString()}`
}

export default function HistorySidebar({ onSelect, onDelete }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 非同期で読み込み（サーバー優先）
    loadHistoryAsync().then(setItems)
  }, [])

  const handleDelete = async (id: string) => {
    await deleteHistoryAsync(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    onDelete()
  }

  if (items.length === 0) return null

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-sm no-print">
        履歴
      </button>
      <div className={`${open ? "block" : "hidden"} lg:block w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 overflow-y-auto no-print`}>
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">計算履歴</h3>
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="group flex items-center gap-1">
                <button onClick={() => { onSelect(item); setOpen(false) }} className="flex-1 text-left text-xs p-2 rounded hover:bg-white transition-colors">
                  <p className="text-gray-900 truncate">{item.summary}</p>
                  <p className="text-gray-400">{item.date} · {yen(item.totalTax)}</p>
                </button>
                <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-xs text-red-500 p-1 hover:bg-red-50 rounded transition-opacity" title="削除">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
