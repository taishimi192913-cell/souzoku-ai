import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.responses import StreamingResponse
from app.models import ChatRequest, CalculateRequest, CalculateResponse, HeirTaxResult, TaxSavingSuggestion, LandValuationDetail
from app.rag_engine import query_rag, SYSTEM_PROMPT, _stream_response
from app.query_expander import search_with_expansion
from app.agentic_search import AgenticSearch
from app.vector_store import get_store
from app.land_valuation import evaluate_land, apply_exemption
from app.tax_calculator import calculate_tax, compute_family_shares, legacy_heir_count, detect_family_pattern
from app.tax_advisor import generate_suggestions
from app.config import ALLOWED_ORIGINS, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="相続税AI相談")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# --- シンプルなレート制限（インメモリ） ---
from collections import defaultdict
from time import time

_rate_limits: dict[str, list[float]] = defaultdict(list)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time()
    # 古いエントリを削除
    window_start = now - RATE_LIMIT_WINDOW
    _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if t > window_start]

    if len(_rate_limits[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"error": "リクエストが多すぎます。しばらく待ってから再試行してください。"},
        )

    _rate_limits[client_ip].append(now)
    return await call_next(request)


def detect_query_type(query: str) -> str:
    complex_keywords = [
        "按分", "計算", "シミュレーション", "比較",
        "どちらが得", "組み合わせ", "複数",
        "小規模宅地", "割合", "割合",
        "ステップ", "手順", "フロー",
        "ケース", "ケーススタディ",
    ]
    if any(kw in query for kw in complex_keywords):
        return "agentic"
    if " " in query.strip() and len(query) > 15:
        return "expanded"
    return "semantic"


@app.get("/api/health")
async def health():
    store = get_store()
    count = store.collection.count()
    return {"status": "ok", "documents": count}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    q = req.query.strip()
    if len(q) < 2 or len(q) > 2000:
        return JSONResponse(
            status_code=400,
            content={"error": "質問は2文字以上2000文字以内で入力してください。"},
        )

    search_type = req.search_type
    if search_type == "auto":
        search_type = detect_query_type(q)

    try:
        if search_type == "agentic":
            agent = AgenticSearch()
            docs = agent.search(q)
            citations = [
                {"law_name": d["law_name"], "article": d["article_num"], "text": d["text"][:200], "relevance": round(1.0 - d["distance"], 3)}
                for d in docs[:5]
            ]
            context = "\n".join(f"【{d['law_name']} {d['article_num']}】{d['text']}" for d in docs)
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"## 検索結果\n{context}\n\n## 質問\n{q}"},
            ]
            return StreamingResponse(
                _stream_response(messages, citations, "agentic"),
                media_type="text/event-stream",
            )

        if search_type == "expanded":
            docs = search_with_expansion(q)
            citations = [
                {"law_name": d["law_name"], "article": d["article_num"], "text": d["text"][:200], "relevance": round(1.0 - d["distance"], 3)}
                for d in docs[:5]
            ]
            context = "\n".join(f"【{d['law_name']} {d['article_num']}】{d['text']}" for d in docs)
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"## 検索結果\n{context}\n\n## 質問\n{q}"},
            ]
            return StreamingResponse(
                _stream_response(messages, citations, "expanded"),
                media_type="text/event-stream",
            )

        return StreamingResponse(
            query_rag(q, "semantic"),
            media_type="text/event-stream",
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return JSONResponse(status_code=500, content={"error": "内部エラーが発生しました。しばらくしてから再試行してください。"})


@app.post("/api/calculate")
async def calculate(req: CalculateRequest):
    try:
        total_land_raw = 0
        total_land_after = 0
        total_building = 0
        land_valuations = []

        for prop in req.assets.properties:
            raw = evaluate_land(prop.land.route_price_per_sqm, prop.land.area_sqm, prop.land.ownership_ratio)
            ex = apply_exemption(raw, prop.land.area_sqm, prop.land.exemption_type, prop.land.ownership_ratio)
            total_land_raw += raw
            total_land_after += ex["after_value"]
            total_building += prop.building.fixed_asset_tax_value
            land_valuations.append(LandValuationDetail(
                label=prop.label or f"物件{len(land_valuations)+1}",
                route_price_per_sqm=prop.land.route_price_per_sqm,
                area_sqm=prop.land.area_sqm,
                raw_value=raw,
                exemption_type=prop.land.exemption_type,
                reduction_amount=ex["reduction"],
                after_value=ex["after_value"],
            ))

        life_insurance_exemption = 5_000_000 * legacy_heir_count(req.family)
        taxable_insurance = max(0, req.assets.life_insurance - life_insurance_exemption)

        gross_estate = total_land_after + total_building + req.assets.savings + req.assets.listed_securities + req.assets.unlisted_stocks + taxable_insurance + req.assets.other_assets - req.assets.debts - req.assets.funeral_expenses

        heir_count = legacy_heir_count(req.family)
        basic_deduction = 30_000_000 + 6_000_000 * heir_count
        taxable_estate = max(0, gross_estate - basic_deduction)

        shares = compute_family_shares(req.family)
        result = calculate_tax(req.family, taxable_estate, shares)

        summary = {
            "gross_estate": gross_estate,
            "basic_deduction": basic_deduction,
            "taxable_estate": taxable_estate,
            "total_tax": result["total_tax"],
            "land_valuations": [lv.model_dump() for lv in land_valuations],
        }

        suggestions = await generate_suggestions(summary, req.family, result)

        return CalculateResponse(
            gross_estate=gross_estate,
            basic_deduction=basic_deduction,
            taxable_estate=taxable_estate,
            total_tax=result["total_tax"],
            per_heir=[HeirTaxResult(**h) for h in result["per_heir"]],
            land_valuations=land_valuations,
            savings_suggestions=[TaxSavingSuggestion(**s) for s in suggestions],
        )
    except Exception as e:
        logger.error(f"Calculate error: {e}")
        return JSONResponse(status_code=500, content={"error": "計算中にエラーが発生しました。入力値をご確認ください。"})
