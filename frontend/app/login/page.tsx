"use client"

import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { FaGoogle } from "react-icons/fa"
import { SiLine } from "react-icons/si"

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-xl font-bold text-gray-900 text-center mb-6">ログイン</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 text-center">
          ログインに失敗しました。もう一度お試しください。
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <FaGoogle className="text-lg" />
          Googleでログイン
        </button>

        <button
          onClick={() => signIn("line", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
        >
          <SiLine className="text-lg" />
          LINEでログイン
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">または</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">メールアドレス</label>
          <input type="email" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" placeholder="your@email.com" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">パスワード</label>
          <input type="password" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" placeholder="パスワード" />
        </div>
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
          ログイン
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        アカウントをお持ちでない方は
        <br />
        GoogleまたはLINEで登録できます
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">読み込み中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
