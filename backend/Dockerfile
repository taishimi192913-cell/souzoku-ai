# 相続税AI バックエンド 本番用 Dockerfile
# 必要メモリ: 3GB+ (BGE-M3: 2GB, ChromaDB: 0.5GB, FastAPI: 0.5GB)
FROM python:3.11-slim

WORKDIR /app

# システム依存
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python依存を先にインストール（キャッシュ効率化）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコード
COPY . .

# データディレクトリ
RUN mkdir -p data/laws data/chroma

# BGE-M3を事前ダウンロード（起動時間短縮）
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3', trust_remote_code=True)"

EXPOSE 8000

# 本番モード（reload=False）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
