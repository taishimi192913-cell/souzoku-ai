import type { CalculateResponse } from "@/lib/types"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Button from "./ui/Button"
import Badge from "./ui/Badge"

interface Props {
  result: CalculateResponse
}

const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#8b5cf6", "#ec4899"]

function yen(v: number): string {
  return `¥${v.toLocaleString()}`
}

export default function CalculationResult({ result }: Props) {
  const pieData = result.per_heir
    .filter((h) => h.tax_after_credit > 0)
    .map((h) => ({ name: h.relation, value: h.tax_after_credit }))

  const barData = [
    { name: "純資産額", value: result.gross_estate },
    { name: "基礎控除", value: -result.basic_deduction },
    { name: "課税遺産", value: result.taxable_estate },
    { name: "税額", value: result.total_tax },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg font-bold text-gray-900">計算結果</h2>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          PDF出力
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
        <p className="text-xs text-amber-800 font-medium">
          [重要] この計算は簡易試算です。実際の相続税額とは異なる場合があります。正確な税額計算や申告には必ず税理士にご相談ください。
        </p>
        <p className="text-xs text-amber-700 mt-1">
          本サービスは税理士法に基づく税務相談業務を行うものではありません。
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">純資産額</span>
          <span className="font-semibold">{yen(result.gross_estate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">基礎控除</span>
          <span className="font-semibold text-green-600">- {yen(result.basic_deduction)}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-sm font-bold">
          <span>課税遺産総額</span>
          <span className={result.taxable_estate > 0 ? "text-red-600" : "text-green-600"}>{yen(result.taxable_estate)}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-lg font-bold">
          <span>相続税総額</span>
          <span className={result.total_tax > 0 ? "text-red-600" : "text-green-600"}>{yen(result.total_tax)}</span>
        </div>
      </div>

      {result.total_tax > 0 && pieData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 no-print">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">相続人別 税額割合</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => yen(Number(v) || 0)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 no-print">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">資産構成</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => yen(Number(v) || 0)} />
            <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {result.land_valuations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">土地評価明細</h3>
          <div className="space-y-2">
            {result.land_valuations.map((lv, i) => (
              <div key={i} className="text-xs space-y-1 bg-gray-50 rounded p-2">
                <p className="font-medium">{lv.label}</p>
                <p>{lv.route_price_per_sqm.toLocaleString()} 円/㎡ × {lv.area_sqm}㎡ = {yen(lv.raw_value)}</p>
                {lv.reduction_amount > 0 && (
                  <p className="text-green-600">特例減額 ({lv.exemption_type}): -{yen(lv.reduction_amount)}</p>
                )}
                <p className="font-medium">評価後: {yen(lv.after_value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">相続人別 税額内訳</h3>
        <div className="space-y-2">
          {result.per_heir.map((h, i) => (
            <div key={i} className="text-xs bg-gray-50 rounded p-2 space-y-1">
              <p className="font-medium">{h.relation} ({h.age}歳) — 法定相続分 {(h.statutory_share * 100).toFixed(0)}%</p>
              <p>取得金額: {yen(h.acquired_amount)}</p>
              <p>税額: {yen(h.tax_before_credit)}</p>
              {h.credits_applied.length > 0 && (
                <p className="text-green-600">
                  控除適用 ({h.credits_applied.join(", ")}): {yen(h.tax_before_credit - h.tax_after_credit)}
                </p>
              )}
              <p className="font-medium">納付税額: {yen(h.tax_after_credit)}</p>
              <div className="flex gap-1 mt-1">
                {h.credits_applied.map((c) => (
                  <Badge key={c} color="green">{c}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.savings_suggestions.length > 0 && result.savings_suggestions[0].title !== "税理士への相談をお勧めします" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">節税提案</h3>
          <div className="space-y-2">
            {result.savings_suggestions.map((s, i) => (
              <div key={i} className="border border-green-200 bg-green-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm text-green-800">{s.title}</h4>
                  {s.savings_amount > 0 && (
                    <span className="text-sm font-bold text-green-600">▲{yen(s.savings_amount)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{s.detail}</p>
                {s.citation_law && (
                  <p className="text-xs text-gray-400 mt-1">根拠: {s.citation_law} {s.citation_article}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.total_tax === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          課税遺産総額が基礎控除以下であるため、相続税は発生しません。
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 no-print">
        ※ 本シミュレーションは概算です。実際の税額は不動産の詳細な評価や各種特例の適用条件により変動します。正確な税額計算は税理士にご相談ください。
      </div>
    </div>
  )
}
