"use client"

import { useState } from "react"
import type { FamilyMember, PropertyInput, AssetInput } from "@/lib/types"

const EXEMPTION_OPTIONS = [
  { value: "none", label: "適用しない" },
  { value: "特定居住用宅地", label: "特定居住用宅地 (330㎡まで80%減)" },
  { value: "特定事業用宅地", label: "特定事業用宅地 (400㎡まで80%減)" },
  { value: "貸付事業用宅地", label: "貸付事業用宅地 (200㎡まで50%減)" },
]

const RELATION_OPTIONS = ["配偶者", "子", "親", "孫", "兄弟姉妹", "その他"]

interface Props {
  onCalculate: (data: object) => void
  loading: boolean
}

let propId = 0

function emptyProperty(): PropertyInput {
  return {
    label: `物件 ${++propId}`,
    land: { route_price_per_sqm: 0, area_sqm: 0, ownership_ratio: 100, exemption_type: "none" },
    building: { fixed_asset_tax_value: 0 },
  }
}

export default function AssetForm({ onCalculate, loading }: Props) {
  const [step, setStep] = useState(1)
  const [family, setFamily] = useState<FamilyMember[]>([
    { relation: "配偶者", age: 0, is_minor: false, is_disabled: false },
  ])
  const [properties, setProperties] = useState<PropertyInput[]>([emptyProperty()])
  const [savings, setSavings] = useState("")
  const [listedSecurities, setListedSecurities] = useState("")
  const [unlistedStocks, setUnlistedStocks] = useState("")
  const [lifeInsurance, setLifeInsurance] = useState("")
  const [otherAssets, setOtherAssets] = useState("")
  const [debts, setDebts] = useState("")
  const [funeralExpenses, setFuneralExpenses] = useState("")

  const addFamilyMember = () => {
    setFamily([...family, { relation: "子", age: 0, is_minor: false, is_disabled: false }])
  }

  const updateFamilyMember = (i: number, field: keyof FamilyMember, value: unknown) => {
    const updated = [...family]
    ;(updated[i] as any)[field] = value
    setFamily(updated)
  }

  const removeFamilyMember = (i: number) => {
    if (family.length <= 1) return
    setFamily(family.filter((_, idx) => idx !== i))
  }

  const addProperty = () => setProperties([...properties, emptyProperty()])

  const updateProperty = (i: number, field: string, value: unknown) => {
    const updated = [...properties]
    const keys = field.split(".")
    let obj: any = updated[i]
    for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]]
    obj[keys[keys.length - 1]] = value
    setProperties(updated)
  }

  const removeProperty = (i: number) => {
    if (properties.length <= 1) return
    setProperties(properties.filter((_, idx) => idx !== i))
  }

  const heirCountInfo = () => {
    const count = family.filter((m) => ["配偶者", "子", "親", "孫"].includes(m.relation)).length
    return `基礎控除: 3,000万 + 600万 × ${count}人 = ${(3000 + 600 * count).toLocaleString()}万円`
  }

  const parse = (s: string) => {
    const raw = s.replace(/,/g, "").trim()
    return raw === "" ? 0 : parseInt(raw, 10) || 0
  }

  const handleSubmit = () => {
    const toYen = (v: string) => parse(v) * 10000

    const data: { family: FamilyMember[]; assets: AssetInput } = {
      family: family.map((m) => ({ ...m, age: m.age || 0 })),
      assets: {
        properties: properties.map((p) => ({
          ...p,
          land: {
            ...p.land,
            route_price_per_sqm: toYen(String(p.land.route_price_per_sqm)),
            area_sqm: parse(String(p.land.area_sqm)),
            ownership_ratio: parse(String(p.land.ownership_ratio)) || 100,
          },
          building: { fixed_asset_tax_value: toYen(String(p.building.fixed_asset_tax_value)) },
        })),
        savings: toYen(savings),
        listed_securities: toYen(listedSecurities),
        unlisted_stocks: toYen(unlistedStocks),
        life_insurance: toYen(lifeInsurance),
        other_assets: toYen(otherAssets),
        debts: toYen(debts),
        funeral_expenses: toYen(funeralExpenses),
      },
    }
    onCalculate(data)
  }

  const disabled = loading

  return (
    <div className="space-y-6">
      {/* ステップインジケーター */}
      <div className="flex gap-2 mb-2">
        {[
          { num: 1, label: "家族構成" },
          { num: 2, label: "不動産" },
          { num: 3, label: "金融資産" },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              step === s.num
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">家族構成</h2>
        <p className="text-xs text-gray-500 mb-3">{heirCountInfo()}</p>
        <div className="space-y-2">
          {family.map((m, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <select value={m.relation} onChange={(e) => updateFamilyMember(i, "relation", e.target.value)} disabled={disabled} className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                {RELATION_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
              <input type="number" value={m.age || ""} onChange={(e) => updateFamilyMember(i, "age", parseInt(e.target.value) || 0)} disabled={disabled} className="w-16 text-sm border border-gray-300 rounded px-2 py-1" placeholder="年齢" min={0} />
              <span className="text-xs text-gray-500">歳</span>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={m.is_minor} onChange={(e) => updateFamilyMember(i, "is_minor", e.target.checked)} disabled={disabled} /> 未成年
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={m.is_disabled} onChange={(e) => updateFamilyMember(i, "is_disabled", e.target.checked)} disabled={disabled} /> 障害者
              </label>
              {family.length > 1 && (
                <button onClick={() => removeFamilyMember(i)} disabled={disabled} className="text-xs text-red-500 hover:text-red-700 ml-auto">削除</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addFamilyMember} disabled={disabled} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ 相続人を追加</button>
      </section>
      )}

      {step === 2 && (
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">不動産</h2>
        {properties.map((prop, i) => (
          <div key={i} className="mb-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <input type="text" value={prop.label} onChange={(e) => updateProperty(i, "label", e.target.value)} disabled={disabled} className="text-sm font-medium border border-gray-300 rounded px-2 py-1 w-40" />
              {properties.length > 1 && (
                <button onClick={() => removeProperty(i)} disabled={disabled} className="text-xs text-red-500 hover:text-red-700">削除</button>
              )}
            </div>
            <div className="text-xs text-blue-600 mb-2">
              <a href="https://www.rosenka.nta.go.jp/" target="_blank" rel="noopener noreferrer">
                路線価を国税庁サイトで調べる
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">路線価 (万円/㎡)</label>
                <input type="number" value={prop.land.route_price_per_sqm || ""} onChange={(e) => updateProperty(i, "land.route_price_per_sqm", e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">地積 (㎡)</label>
                <input type="number" value={prop.land.area_sqm || ""} onChange={(e) => updateProperty(i, "land.area_sqm", e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" step="0.1" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">所有割合 (%)</label>
                <input type="number" value={prop.land.ownership_ratio} onChange={(e) => updateProperty(i, "land.ownership_ratio", e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" min={0} max={100} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">小規模宅地等の特例</label>
                <select value={prop.land.exemption_type} onChange={(e) => updateProperty(i, "land.exemption_type", e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  {EXEMPTION_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">建物の固定資産税評価額 (万円)</label>
                <input type="number" value={prop.building.fixed_asset_tax_value || ""} onChange={(e) => updateProperty(i, "building.fixed_asset_tax_value", e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addProperty} disabled={disabled} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ 不動産を追加</button>
      </section>
      )}

      {step === 3 && (
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">金融資産・その他</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">預貯金 (万円)</label>
            <input type="text" value={savings} onChange={(e) => setSavings(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">上場有価証券 (万円)</label>
            <input type="text" value={listedSecurities} onChange={(e) => setListedSecurities(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">非上場株式等 (万円)</label>
            <input type="text" value={unlistedStocks} onChange={(e) => setUnlistedStocks(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">生命保険金 (万円)</label>
            <input type="text" value={lifeInsurance} onChange={(e) => setLifeInsurance(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">非課税枠: 500万 × legatees</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">その他資産 (万円)</label>
            <input type="text" value={otherAssets} onChange={(e) => setOtherAssets(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">債務 (万円)</label>
            <input type="text" value={debts} onChange={(e) => setDebts(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">葬式費用 (万円)</label>
            <input type="text" value={funeralExpenses} onChange={(e) => setFuneralExpenses(e.target.value)} disabled={disabled} className="w-full text-sm border border-gray-300 rounded px-2 py-1" placeholder="0" />
          </div>
        </div>
      </section>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 計算中...</>
        ) : (
          "計算する"
        )}
      </button>
    </div>
  )
}
