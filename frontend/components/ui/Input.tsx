import { InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  unit?: string
  error?: string
  hint?: string
}

export default function Input({ label, unit, error, hint, className = "", ...props }: Props) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs text-gray-500">{label}</label>
      )}
      <div className="relative">
        <input
          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none transition-colors
            ${error ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"}
            disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
