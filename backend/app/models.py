from pydantic import BaseModel
from typing import Optional


class Citation(BaseModel):
    law_name: str
    article: str
    text: str
    relevance: float


class ChatRequest(BaseModel):
    query: str
    search_type: Optional[str] = "auto"


class StreamChunk(BaseModel):
    text: str
    citations: Optional[list[Citation]] = None
    search_type: str = "semantic"
    done: bool = False


class FamilyMember(BaseModel):
    relation: str
    age: int
    is_minor: bool = False
    is_disabled: bool = False


class LandInput(BaseModel):
    route_price_per_sqm: int = 0
    area_sqm: float = 0
    ownership_ratio: float = 100
    exemption_type: str = "none"


class BuildingInput(BaseModel):
    fixed_asset_tax_value: int = 0


class PropertyInput(BaseModel):
    label: str = ""
    land: LandInput = LandInput()
    building: BuildingInput = BuildingInput()


class AssetInput(BaseModel):
    properties: list[PropertyInput] = []
    savings: int = 0
    listed_securities: int = 0
    unlisted_stocks: int = 0
    life_insurance: int = 0
    other_assets: int = 0
    debts: int = 0
    funeral_expenses: int = 0


class CalculateRequest(BaseModel):
    family: list[FamilyMember]
    assets: AssetInput


class HeirTaxResult(BaseModel):
    relation: str
    age: int
    statutory_share: float
    acquired_amount: int
    tax_before_credit: int
    tax_after_credit: int
    credits_applied: list[str]


class TaxSavingSuggestion(BaseModel):
    title: str
    detail: str
    savings_amount: int = 0
    citation_law: str = ""
    citation_article: str = ""


class LandValuationDetail(BaseModel):
    label: str
    route_price_per_sqm: int
    area_sqm: float
    raw_value: int
    exemption_type: str
    reduction_amount: int
    after_value: int


class CalculateResponse(BaseModel):
    gross_estate: int
    basic_deduction: int
    taxable_estate: int
    total_tax: int
    per_heir: list[HeirTaxResult]
    land_valuations: list[LandValuationDetail] = []
    savings_suggestions: list[TaxSavingSuggestion] = []
