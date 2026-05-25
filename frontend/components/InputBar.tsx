"use client"

import { useState, useRef, KeyboardEvent } from "react"

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export default function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const q = text.trim()
    if (!q || disabled) return
    onSend(q)
    setText("")
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="相続税について質問してください..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          送信
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        回答は根拠条文を引用して生成されます。最終的な税務判断は税理士にご相談ください。
      </p>
    </div>
  )
}
