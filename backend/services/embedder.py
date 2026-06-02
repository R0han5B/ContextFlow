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
    )
    data = response.json()
    return data["data"][0]["embedding"]
