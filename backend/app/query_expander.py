import httpx
from app.config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL
from app.vector_store import get_store

EXPAND_PROMPT = """あなたは検索クエリ拡張の専門家です。
ユーザーの質問から、法律の条文検索に適した検索キーワードを5つ生成してください。

以下のルールに従ってください：
- 法律用語を優先（例：「配偶者控除」「第19条の2」等）
- 言い換えを含める（例：「妻」→「配偶者」）
- 関連する条文番号があれば含める
- カンマ区切りで1行に出力する
- キーワードのみを出力し、説明は不要
"""


def expand_query(query: str) -> list[str]:
    resp = httpx.post(
        f"{DEEPSEEK_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": EXPAND_PROMPT},
                {"role": "user", "content": query},
            ],
            "max_tokens": 256,
            "temperature": 0.3,
        },
        timeout=15,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    keywords = [k.strip() for k in text.replace("。", "").split("、") if k.strip()]
    return keywords[:6]


def search_with_expansion(query: str) -> list[dict]:
    store = get_store()
    keywords = expand_query(query)
    all_queries = [query] + keywords

    seen_texts = set()
    combined = []
    for q in all_queries:
        docs = store.search(q, k=3)
        for d in docs:
            if d["text"] not in seen_texts:
                seen_texts.add(d["text"])
                combined.append(d)

    combined.sort(key=lambda x: x["distance"])
    return combined[:8]
