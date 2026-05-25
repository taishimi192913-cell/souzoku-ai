import os
import re
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- DeepSeek API 設定 ---
# 優先順位: 環境変数 > .envファイル > ~/.deepseek/config.toml
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

if not DEEPSEEK_API_KEY:
    # .env から読む
    env_key = os.getenv("DEEPSEEK_API_KEY", "")
    if env_key:
        DEEPSEEK_API_KEY = env_key

if not DEEPSEEK_API_KEY:
    # ~/.deepseek/config.toml から読む（フォールバック）
    config_toml = Path.home() / ".deepseek" / "config.toml"
    if config_toml.exists():
        with open(config_toml) as f:
            content = f.read()
        match = re.search(r'api_key\s*=\s*"([^"]+)"', content)
        if match:
            DEEPSEEK_API_KEY = match.group(1)

DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")

# --- ChromaDB ---
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
DATA_DIR = os.path.join(os.path.dirname(CHROMA_PERSIST_DIR), "laws")

# --- 法令ID ---
LAW_IDS = {
    "souzokuzeiho": "325AC0000000073",
    "souzokuzeiho_seirei": "325CO0000000071",
    "sochiho": "325AC0000000067",
}

# --- 埋め込みモデル ---
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-m3")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "600"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
TOP_K = int(os.getenv("TOP_K", "5"))

# --- セキュリティ ---
# 本番用: 環境変数 ALLOWED_ORIGINS にカンマ区切りで許可するオリジンを指定
# 例: ALLOWED_ORIGINS="https://souzoku-ai.com,https://souzoku-ai.vercel.app"
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# 開発用: 許可オリジンが未設定の場合はローカル開発URLを自動許可
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

# レート制限
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "30"))  # 1分あたり
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))     # 秒

# 路線価API
LAND_PRICE_API_KEY = os.getenv("LAND_PRICE_API_KEY", "")
