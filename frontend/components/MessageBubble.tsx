import type { Message } from "@/lib/types"

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200"} rounded-2xl px-4 py-3`}>
        {message.search_type && !isUser && (
          <span className="inline-block text-xs text-gray-400 mb-1">
            {message.search_type === "semantic" && "⚡ 高速検索"}
            {message.search_type === "expanded" && "🔍 拡張検索"}
            {message.search_type === "agentic" && "🤖 エージェント検索"}
          </span>
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {message.citations && message.citations.length > 0 && !isUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">引用根拠:</p>
            <div className="space-y-1">
              {message.citations.map((c, i) => (
                <div key={i} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                  <span className="font-medium">{c.law_name} {c.article}</span>
                  <span className="ml-2 text-gray-400">関連度: {c.relevance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
