import json
import httpx
from app.config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, TOP_K
from app.vector_store import get_store

SYSTEM_PROMPT = """あなたは日本の相続税に特化した法律アシスタントです。

## 絶対ルール
1. 提供された「検索結果」の条文・通達のみを根拠に回答すること
2. 検索結果に含まれない情報は絶対に回答に含めないこと
3. 回答には必ず根拠条文（法律名＋条番号）を明示すること
4. 「〜かもしれません」「思われます」等の曖昧な表現は禁止
5. 検索結果で不足がある場合は「この情報では回答できません」と正直に伝えること

## 回答形式
- 結論を最初に1文で述べる
- 根拠条文を引用する
- 必要に応じて計算式や具体例を示す
"""


def build_context(docs: list[dict]) -> str:
    lines = []
    for doc in docs:
        law = doc["law_name"]
        article = doc["article_num"]
        title = doc["article_title"]
        text = doc["text"]
        header = f"【{law} {article}】{title}" if title else f"【{law} {article}】"
        lines.append(header)
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def query_rag(query: str, search_type: str = "semantic"):
    store = get_store()
    docs = store.search(query, k=TOP_K * 2 if search_type == "semantic" else TOP_K)
    context = build_context(docs)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"## 検索結果\n{context}\n\n## 質問\n{query}"},
    ]

    citations = [
        {
            "law_name": d["law_name"],
            "article": d["article_num"],
            "text": d["text"][:200],
            "relevance": round(1.0 - d["distance"], 3),
        }
        for d in docs[:5]
    ]

    return _stream_response(messages, citations, search_type)


async def _stream_response(messages, citations, search_type: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": messages,
                "stream": True,
                "max_tokens": 4096,
                "temperature": 0.3,
            },
        ) as resp:
            citations_sent = False
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:].strip()
                if payload == "[DONE]":
                    yield json.dumps({"text": "", "done": True, "search_type": search_type}) + "\n"
                    return
                try:
                    data = json.loads(payload)
                    delta = data.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        chunk = {
                            "text": content,
                            "citations": citations if not citations_sent else None,
                            "search_type": search_type,
                            "done": False,
                        }
                        citations_sent = True
                        yield json.dumps(chunk) + "\n"
                except json.JSONDecodeError:
                    continue
