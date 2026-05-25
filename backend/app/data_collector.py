import httpx
import xml.etree.ElementTree as ET
import json
from pathlib import Path
from app.config import LAW_IDS, DATA_DIR


E_GOV_BASE = "https://laws.e-gov.go.jp/api/1"


def fetch_law_xml(law_id: str) -> str:
    url = f"{E_GOV_BASE}/lawdata/{law_id}"
    resp = httpx.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text


def parse_articles(xml_text: str, law_name: str) -> list[dict]:
    ns = ""  # no namespace if default
    root = ET.fromstring(xml_text)
    articles = []

    law_title_el = root.find(".//LawTitle")
    law_title = law_title_el.text if law_title_el is not None else law_name

    for article in root.findall(".//Article"):
        article_num_el = article.find("ArticleNum")
        article_num = article_num_el.text if article_num_el is not None else ""

        article_title_el = article.find("ArticleTitle")
        article_title = article_title_el.text if article_title_el is not None else ""

        paragraphs = []
        for para in article.findall(".//Paragraph"):
            para_num_el = para.find("ParagraphNum")
            para_num = para_num_el.text if para_num_el is not None else ""

            sentences = []
            for sentence in para.findall(".//Sentence"):
                if sentence.text:
                    sentences.append(sentence.text.strip())

            paragraph_text = "".join(sentences)
            if paragraph_text:
                paragraphs.append({"num": para_num, "text": paragraph_text})

        if not paragraphs:
            sentences = []
            for sentence in article.findall(".//Sentence"):
                if sentence.text:
                    sentences.append(sentence.text.strip())
            if sentences:
                paragraphs.append({"num": "", "text": "".join(sentences)})

        if paragraphs:
            text = "\n".join(p["text"] for p in paragraphs)
            articles.append({
                "law_name": law_title,
                "law_id": law_name,
                "article_num": article_num,
                "article_title": article_title,
                "text": text,
                "paragraphs": paragraphs,
                "source": "e-Gov法令API",
            })

    return articles


def collect_all_laws() -> dict[str, list[dict]]:
    result = {}
    for name, law_id in LAW_IDS.items():
        print(f"Fetching {name} ({law_id})...")
        xml = fetch_law_xml(law_id)
        articles = parse_articles(xml, name)
        result[name] = articles
        print(f"  → {len(articles)} articles parsed")
    return result


def save_articles(data: dict[str, list[dict]]):
    Path(DATA_DIR).mkdir(parents=True, exist_ok=True)
    for name, articles in data.items():
        path = Path(DATA_DIR) / f"{name}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)
        print(f"Saved {path}")


def load_articles(name: str) -> list[dict]:
    path = Path(DATA_DIR) / f"{name}.json"
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


if __name__ == "__main__":
    data = collect_all_laws()
    save_articles(data)
