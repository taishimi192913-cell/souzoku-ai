#!/bin/bash
# 相続税AI バックエンド公開スクリプト
# このスクリプトをMacのターミナルで実行してください

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VERCEL="$HOME/.local/bin/vercel"

echo "=== 相続税AI 公開セットアップ ==="
echo ""

# 1. バックエンド起動
echo "[1/4] バックエンド起動中..."
cd "$BACKEND_DIR"

# 既存のプロセスを停止
lsof -ti:8000 | xargs kill 2>/dev/null || true
sleep 1

# バックエンド起動
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "  バックエンド PID: $BACKEND_PID"

# ヘルスチェック待ち
for i in $(seq 1 15); do
  if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "  バックエンド起動完了"
    break
  fi
  sleep 2
done

# 2. Cloudflare Tunnel 起動
echo ""
echo "[2/4] Cloudflare Tunnel 起動中..."
echo "  (Quick Tunnel はログイン不要です)"

# cloudflared 未インストールならインストール
if ! command -v cloudflared &> /dev/null; then
  brew install cloudflared
fi

# トンネル起動（Quick Tunnel — ログイン不要）
TUNNEL_LOG="/tmp/souzoku-ai-tunnel.log"
cloudflared tunnel --url http://localhost:8000 > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!

# URL が表示されるのを待つ
TUNNEL_URL=""
for i in $(seq 1 30); do
  sleep 1
  TUNNEL_URL=$(grep -o 'https://[^.]*\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
done

if [ -z "$TUNNEL_URL" ]; then
  echo "  Tunnel URL の取得に失敗しました。ログ:"
  cat "$TUNNEL_LOG"
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

echo "  Tunnel URL: $TUNNEL_URL"

# 3. Vercel 環境変数設定
echo ""
echo "[3/4] Vercel 環境変数設定..."
cd "$FRONTEND_DIR"

echo "$TUNNEL_URL" | $VERCEL env add NEXT_PRIVATE_API_URL production 2>/dev/null || \
  $VERCEL env rm NEXT_PRIVATE_API_URL production --yes 2>/dev/null && \
  echo "$TUNNEL_URL" | $VERCEL env add NEXT_PRIVATE_API_URL production

# 4. フロントエンド再デプロイ
echo ""
echo "[4/4] フロントエンド再デプロイ..."
$VERCEL --prod --yes

echo ""
echo "=== セットアップ完了 ==="
echo "  バックエンド: $TUNNEL_URL"
echo "  フロントエンド: https://frontend-xi-one-93.vercel.app"
echo ""
echo "  Macで実行中: バックエンド PID=$BACKEND_PID, Tunnel PID=$TUNNEL_PID"
echo "  停止するには: kill $BACKEND_PID $TUNNEL_PID"
