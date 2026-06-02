import os

import requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")


def embed_text(text: str) -> list[float]:
    response = requests.post(
        "https://openrouter.ai/api/v1/embeddings",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "openai/text-embedding-3-small",
            "input": text,
        },
        timeout=60,
    )

    try:
        response.raise_for_status()
    except requests.HTTPError as error:
        raise RuntimeError(
            f"OpenRouter embeddings request failed with {response.status_code}: {response.text}"
        ) from error

    data = response.json()
    if not isinstance(data, dict):
        raise RuntimeError(f"Unexpected OpenRouter response: {data}")

    if "data" not in data or not data["data"]:
        raise RuntimeError(f"OpenRouter response missing embeddings data: {data}")

    embedding = data["data"][0].get("embedding")
    if not isinstance(embedding, list):
        raise RuntimeError(f"OpenRouter response missing embedding vector: {data}")

    return embedding
