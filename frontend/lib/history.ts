import type { CalculateResponse } from "./types"

const STORAGE_KEY = "souzoku-history"

export interface HistoryItem {
  id: string
  date: string
  summary: string
  totalTax: number
  result: CalculateResponse
  input: object
}

// API経由で履歴を保存（ログイン時）
async function saveToServer(result: CalculateResponse, input: object): Promise<void> {
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, input }),
    })
  } catch {
    // サーバー保存失敗時は localStorage のみで継続
  }
}

// API経由で履歴を取得
async function loadFromServer(): Promise<HistoryItem[]> {
  try {
    const resp = await fetch("/api/history")
    if (resp.ok) {
      const data = await resp.json()
      return data.items || []
    }
  } catch {
    // サーバー取得失敗時は localStorage でフォールバック
  }
  return []
}

// API経由で履歴を削除
async function deleteFromServer(id: string): Promise<void> {
  try {
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" })
  } catch {
    // 削除失敗は無視
  }
}

export function saveHistory(result: CalculateResponse, input: object): void {
  // localStorage に保存（非ログイン時のフォールバック）
  const items = loadFromLocalStorage()
  const heirs = result.per_heir.map((h) => h.relation).join("+")
  items.unshift({
    id: Date.now().toString(36),
    date: new Date().toLocaleDateString("ja-JP"),
    summary: `${heirs} / 課税資産`,
    totalTax: result.total_tax,
    result,
    input,
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  // サーバーにも非同期保存（ログイン時のみ有効）
  saveToServer(result, input)
}

// 履歴読み込み（サーバー優先、非ログイン時はlocalStorage）
export async function loadHistoryAsync(): Promise<HistoryItem[]> {
  const serverItems = await loadFromServer()
  if (serverItems.length > 0) {
    return serverItems
  }
  return loadFromLocalStorage()
}

// 同期版（旧API互換、localStorageのみ）
export function loadHistory(): HistoryItem[] {
  return loadFromLocalStorage()
}

function loadFromLocalStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function deleteHistoryAsync(id: string): Promise<void> {
  // localStorage から削除
  const items = loadFromLocalStorage().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  // サーバーからも削除
  await deleteFromServer(id)
}

export function deleteHistory(id: string): void {
  const items = loadFromLocalStorage().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  deleteFromServer(id)
}
