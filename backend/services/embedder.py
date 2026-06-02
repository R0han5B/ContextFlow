import hashlib
import os

import requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings"
OPENROUTER_MODEL = "openai/text-embedding-3-small"
REQUEST_TIMEOUT_SECONDS = 60
LOCAL_DIMENSIONS = 384


def _local_embed_text(text: str) -> list[float]:
    result = []
    for index in range(LOCAL_DIMENSIONS):
        digest = hashlib.md5(f"{text}{index}".encode()).hexdigest()
        value = int(digest, 16) / (16**32)
        result.append(value * 2 - 1)
    return result


def _openrouter_embed_text(text: str) -> list[float]:
    response = requests.post(
        OPENROUTER_EMBEDDINGS_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENROUTER_MODEL,
            "input": text,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )

    try:
        response.raise_for_status()
    except requests.HTTPError as error:
        raise RuntimeError(
            f"OpenRouter embeddings request failed with {response.status_code}: {response.text}"
        ) from error

    data = response.json()
    if not isinstance(data, dict) or "data" not in data or not data["data"]:
        raise RuntimeError(f"Unexpected OpenRouter response: {data}")

    embedding = data["data"][0].get("embedding")
    if not isinstance(embedding, list):
        raise RuntimeError(f"OpenRouter response missing embedding vector: {data}")

    return embedding


def embed_text(text: str) -> list[float]:
    if not OPENROUTER_API_KEY:
        return _local_embed_text(text)

    try:
        return _openrouter_embed_text(text)
    except Exception as error:
        print(f"OpenRouter embedding failed, using local fallback: {error}")
        return _local_embed_text(text)
