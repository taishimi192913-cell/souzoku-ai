export interface Citation {
  law_name: string
  article: string
  text: string
  relevance: number
}

export interface StreamChunk {
  text: string
  citations: Citation[] | null
  search_type: string
  done: boolean
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
  search_type?: string
}

export interface FamilyMember {
  relation: string
  age: number
  is_minor: boolean
  is_disabled: boolean
}

export interface LandInput {
  route_price_per_sqm: number
  area_sqm: number
  ownership_ratio: number
  exemption_type: string
}

export interface BuildingInput {
  fixed_asset_tax_value: number
}

export interface PropertyInput {
  label: string
  land: LandInput
  building: BuildingInput
}

export interface AssetInput {
  properties: PropertyInput[]
  savings: number
  listed_securities: number
  unlisted_stocks: number
  life_insurance: number
  other_assets: number
  debts: number
  funeral_expenses: number
}

export interface HeirTaxResult {
  relation: string
  age: number
  statutory_share: number
  acquired_amount: number
  tax_before_credit: number
  tax_after_credit: number
  credits_applied: string[]
}

export interface TaxSavingSuggestion {
  title: string
  detail: string
  savings_amount: number
  citation_law: string
  citation_article: string
}

export interface LandValuationDetail {
  label: string
  route_price_per_sqm: number
  area_sqm: number
  raw_value: number
  exemption_type: string
  reduction_amount: number
  after_value: number
}

export interface CalculateResponse {
  gross_estate: number
  basic_deduction: number
  taxable_estate: number
  total_tax: number
  per_heir: HeirTaxResult[]
  land_valuations: LandValuationDetail[]
  savings_suggestions: TaxSavingSuggestion[]
}
