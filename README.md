# 相続税AI

家族構成と資産を入力するだけで相続税を3分で試算。条文ベースのAIが節税方法を提案する無料Webサービス。

## 構成

```
souzoku-ai/
├── frontend/      # Next.js (Vercel にデプロイ)
│   ├── app/       # ページ + API Routes
│   ├── components/
│   └── prisma/    # SQLite (計算履歴)
├── backend/       # FastAPI (Mac ローカルで起動)
│   ├── app/       # RAG検索 + 税額計算
│   └── data/      # ChromaDB + 法令JSON
└── deploy.sh      # 公開用スクリプト
```

## 公開URL

- フロントエンド: https://frontend-xi-one-93.vercel.app
- バックエンド: Mac上で起動 → Cloudflare Tunnel 経由で公開

## ローカル起動方法

```bash
# バックエンド + トンネル + フロントエンド再デプロイ
bash deploy.sh

# 停止
lsof -ti:8000 | xargs kill
```

## 技術スタック

| 層 | 技術 |
|---|------|
| フロントエンド | Next.js 16 + React 19 + Tailwind CSS v4 |
| バックエンド | FastAPI + Python 3.9 |
| ベクトルDB | ChromaDB + BAAI/bge-m3 |
| LLM | DeepSeek API (deepseek-v4-flash) |
| 法令データ | e-Gov法令API (相続税法/施行令/租税特別措置法) |
| 公開 | Vercel + Cloudflare Tunnel |

## 注意事項

- 本サービスは簡易試算ツールです。税理士による税務相談の代替ではありません
- バックエンドはMacが起動しているときのみ利用可能です
- APIキー等の認証情報はGitHubに含まれていません
