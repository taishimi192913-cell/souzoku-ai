import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-6 py-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">相続税AI &copy; {new Date().getFullYear()}</p>
        <div className="flex gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600 transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">プライバシー</Link>
          <span className="text-gray-300">バックエンドはローカル起動が必要です</span>
        </div>
      </div>
    </footer>
  )
}
