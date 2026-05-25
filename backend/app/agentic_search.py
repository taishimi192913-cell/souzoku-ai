import httpx
import json
from app.config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL
from app.vector_store import get_store

MAX_ROUNDS = 3

PLANNER_PROMPT = """あなたは相続税の調査計画立案者です。
ユーザーの質問に答えるために、どの条文や通達を調査すべきかを計画してください。

以下の形式で出力してください：
```
検索1: <検索キーワード>
検索2: <検索キーワード>
...
```

法律用語を使って具体的に。条番号が推測できる場合は条番号も含めてください。
"""


class AgenticSearch:
    def __init__(self):
        self.store = get_store()

    def _call_deepseek(self, messages: list, max_tokens: int = 4096) -> str:
        resp = httpx.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.3,
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

    def _extract_search_terms(self, text: str) -> list[str]:
        terms = []
        for line in text.split("\n"):
            if "検索" in line and ":" in line:
                term = line.split(":", 1)[1].strip()
                if term:
                    terms.append(term)
        return terms

    def search(self, query: str) -> list[dict]:
        plan_text = self._call_deepseek(
            [
                {"role": "system", "content": PLANNER_PROMPT},
                {"role": "user", "content": query},
            ],
            max_tokens=512,
        )

        search_terms = self._extract_search_terms(plan_text)
        if not search_terms:
            search_terms = [query]

        all_docs = []
        seen = set()

        for term in search_terms[:5]:
            docs = self.store.search(term, k=3)
            for d in docs:
                if d["text"] not in seen:
                    seen.add(d["text"])
                    all_docs.append(d)

        conversation = [
            {"role": "system", "content": "あなたは相続税の専門家です。"},
            {"role": "user", "content": f"## 質問\n{query}\n\n## 調査計画\n{plan_text}\n\n## 調査結果\n{self._format_docs(all_docs)}\n\nこの情報で回答できますか？足りない場合は、さらに検索すべきキーワードを「検索: <キーワード>」の形式で教えてください。"},
        ]

        for _ in range(MAX_ROUNDS - 1):
            response = self._call_deepseek(conversation)
            conversation.append({"role": "assistant", "content": response})

            if "検索:" not in response and "search:" not in response.lower() and "足りない" not in response and "不足" not in response:
                return all_docs

            new_terms = self._extract_search_terms(response)
            if not new_terms:
                return all_docs

            for term in new_terms:
                docs = self.store.search(term, k=3)
                for d in docs:
                    if d["text"] not in seen:
                        seen.add(d["text"])
                        all_docs.append(d)

            conversation.append({
                "role": "user",
                "content": f"追加の検索結果:\n{self._format_docs(docs)}\nこれで回答できますか？",
            })

        return all_docs

    def _format_docs(self, docs: list[dict]) -> str:
        lines = []
        for doc in docs:
            lines.append(f"【{doc['law_name']} {doc['article_num']}】")
            lines.append(doc["text"])
            lines.append("")
        return "\n".join(lines)
