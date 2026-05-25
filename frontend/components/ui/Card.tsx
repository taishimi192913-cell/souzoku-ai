import { ReactNode } from "react"

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, children, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {title && (
        <div className="px-4 pt-4 pb-2">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}
