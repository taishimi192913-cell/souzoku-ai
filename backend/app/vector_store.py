import chromadb
from chromadb.config import Settings
from chromadb.errors import InvalidCollectionException
from pathlib import Path
import json
import logging
from typing import Optional
from app.config import CHROMA_PERSIST_DIR, EMBED_MODEL, CHUNK_SIZE, CHUNK_OVERLAP, TOP_K, DATA_DIR

logger = logging.getLogger(__name__)

COLLECTION_NAME = "souzoku_laws"

# 埋め込みモデルは遅延ロード（本番起動時のメモリ節約のため）
_embedder_cache: dict = {}


def _get_embedder(model_name: str = None):
    """遅延ロード: 必要になるまで SentenceTransformer を import しない"""
    if model_name is None:
        model_name = EMBED_MODEL
    if model_name not in _embedder_cache:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {model_name}")
        _embedder_cache[model_name] = SentenceTransformer(
            model_name,
            trust_remote_code=True,
        )
    return _embedder_cache[model_name]


class VectorStore:
    def __init__(self, lazy_embedder: bool = True):
        persist = str(Path(CHROMA_PERSIST_DIR).resolve())
        self.client = chromadb.PersistentClient(
            path=persist,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self._get_or_create_collection()
        self._lazy = lazy_embedder
        if not lazy_embedder:
            self._embedder = _get_embedder()
            self._splitter = self._create_splitter()
        else:
            self._embedder = None
            self._splitter = None

    @property
    def embedder(self):
        if self._embedder is None:
            self._embedder = _get_embedder()
        return self._embedder

    @property
    def splitter(self):
        if self._splitter is None:
            self._splitter = self._create_splitter()
        return self._splitter

    def _create_splitter(self):
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        return RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", "。", "、", ""],
        )

    def _get_or_create_collection(self):
        try:
            return self.client.get_collection(COLLECTION_NAME)
        except InvalidCollectionException:
            return self.client.create_collection(
                COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )

    def index_all_laws(self):
        existing = self.collection.count()
        if existing > 0:
            logger.info(f"Collection already has {existing} documents, skipping indexing")
            return

        all_chunks = []
        for json_file in Path(DATA_DIR).glob("*.json"):
            with open(json_file, encoding="utf-8") as f:
                articles = json.load(f)
            for article in articles:
                law_name = article["law_name"]
                article_num = article["article_num"]
                article_title = article["article_title"]
                text = article["text"]

                chunks = self.splitter.split_text(text)
                for i, chunk in enumerate(chunks):
                    meta = {
                        "law_name": law_name,
                        "article_num": article_num,
                        "article_title": article_title,
                        "source": "e-Gov法令API",
                        "chunk_index": str(i),
                    }
                    all_chunks.append((chunk, meta))

        if not all_chunks:
            logger.warning("No documents to index. Run data_collector.py first.")
            return

        ids = [f"doc_{i}" for i in range(len(all_chunks))]
        texts = [c[0] for c in all_chunks]
        metadatas = [c[1] for c in all_chunks]

        logger.info(f"Embedding {len(texts)} chunks with {EMBED_MODEL}...")
        # バッチ処理でメモリ節約
        batch_size = 64
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embs = self.embedder.encode(batch, show_progress_bar=True).tolist()
            all_embeddings.extend(batch_embs)

        self.collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas,
            embeddings=all_embeddings,
        )
        logger.info(f"Indexed {len(texts)} chunks into ChromaDB")

    def search(self, query: str, k: Optional[int] = None) -> list[dict]:
        if k is None:
            k = TOP_K
        query_emb = self.embedder.encode(query).tolist()
        results = self.collection.query(
            query_embeddings=[query_emb],
            n_results=k,
        )
        docs = []
        for i in range(len(results["ids"][0])):
            docs.append({
                "text": results["documents"][0][i],
                "law_name": results["metadatas"][0][i]["law_name"],
                "article_num": results["metadatas"][0][i]["article_num"],
                "article_title": results["metadatas"][0][i].get("article_title", ""),
                "distance": results["distances"][0][i] if results.get("distances") else 0,
            })
        return docs

    def health_check(self) -> dict:
        """ヘルスチェック: モデルロード状態とコレクション件数を返す"""
        return {
            "collection_count": self.collection.count(),
            "model_loaded": self._embedder is not None,
            "model_name": EMBED_MODEL,
        }


_store: Optional[VectorStore] = None


def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore(lazy_embedder=True)
    return _store
