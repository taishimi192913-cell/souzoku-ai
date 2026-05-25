"use client"

import { useRef, useEffect } from "react"
import type { Message } from "@/lib/types"
import MessageBubble from "./MessageBubble"

interface Props {
  messages: Message[]
}

export default function ChatArea({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-5xl mb-4">📜</div>
            <p className="text-lg font-medium">相続税について質問してください</p>
            <p className="text-sm mt-2">
              例: 「相続税の基礎控除は？」 / 「配偶者控除の要件は？」
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
