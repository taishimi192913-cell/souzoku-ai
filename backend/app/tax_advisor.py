import json
import httpx
from app.config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL
from app.vector_store import get_store


ADVISOR_PROMPT = """あなたは相続税の節税アドバイザーです。
与えられた計算結果をもとに、このケースに適用可能な節税方法を具体的に提案してください。

## ルール
- 提案は必ず日本の相続税法・租税特別措置法の条文を根拠にすること
- ユーザーの数値（資産額、相続人数、税額等）を具体的に埋め込むこと
- 提案1つにつき「タイトル」「詳細説明」「削減可能な税額」「根拠条文」を明確に

## 出力形式（JSON配列）
[
  {
    "title": "提案のタイトル",
    "detail": "具体的な説明（数値を埋め込む）",
    "savings_amount": 節税額(円),
    "citation_law": "法律名",
    "citation_article": "条番号"
  }
]

## 重要な特例（参考）
- 配偶者控除（相続税法第19条の2）: 配偶者は1.6億 or 法定相続分まで非課税
- 小規模宅地等の特例（租税特別措置法第69条の4）: 居住用330㎡まで80%減
- 生命保険金の非課税（相続税法第12条）: 500万×法定相続人数まで非課税
- 未成年控除（相続税法第19条の3）: 20歳までの年数×10万
- 障害者控除（相続税法第19条の4）: 85歳までの年数×10万(一般)/20万(特別)
"""


async def generate_suggestions(summary: dict, family: list, raw_calculation: dict) -> list[dict]:
    context = f"""## 計算サマリー
- 純資産額: {summary['gross_estate']:,}円
- 基礎控除: {summary['basic_deduction']:,}円
- 課税遺産総額: {summary['taxable_estate']:,}円
- 相続税総額: {summary['total_tax']:,}円

## 相続人
"""
    for h in raw_calculation["per_heir"]:
        context += f"- {h['relation']}({h['age']}歳): 法定相続分{h['statutory_share']*100:.0f}%, 税額{h['tax_before_credit']:,}円, 控除後{h['tax_after_credit']:,}円\n"

    context += "\n## 資産構成\n"
    for lv in summary.get("land_valuations", []):
        context += f"- {lv['label']}: 土地評価額{lv['raw_value']:,}円 → 特例適用後{lv['after_value']:,}円\n"

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [
                        {"role": "system", "content": ADVISOR_PROMPT},
                        {"role": "user", "content": context},
                    ],
                    "max_tokens": 2048,
                    "temperature": 0.3,
                },
                timeout=20,
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"].strip()

            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            suggestions = json.loads(text)
            for s in suggestions:
                store = get_store()
                if s.get("citation_article"):
                    docs = store.search(f"{s['citation_law']} {s['citation_article']}", k=1)

        return suggestions

    except Exception:
        return [{"title": "税理士への相談をお勧めします", "detail": "個別の事情に応じた節税方法は税理士にご相談ください。", "savings_amount": 0, "citation_law": "", "citation_article": ""}]
