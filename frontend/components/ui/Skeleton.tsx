interface Props {
  rows?: number
  height?: string
}

export default function Skeleton({ rows = 3, height = "16px" }: Props) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded"
          style={{ height, width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  )
}
