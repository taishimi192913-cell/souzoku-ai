import { ReactNode } from "react"

type Color = "blue" | "green" | "yellow" | "red" | "gray"

interface Props {
  color?: Color
  children: ReactNode
}

const colors: Record<Color, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
}

export default function Badge({ color = "gray", children }: Props) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  )
}
