"use client"

import Link from "next/link"
import { useSession, signIn } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex items-center gap-2">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          相
        </div>
        <span className="font-semibold text-lg text-gray-900">相続税AI</span>
      </Link>
      <nav className="ml-8 flex gap-6 text-sm">
        <Link href="/simulator" className="text-gray-500 hover:text-blue-600 transition-colors no-underline">
          シミュレーション
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        {session ? (
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors no-underline">
            {session.user?.name ?? "マイページ"}
          </Link>
        ) : (
          <button onClick={() => signIn()} className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            ログイン
          </button>
        )}
      </div>
    </header>
  )
}
