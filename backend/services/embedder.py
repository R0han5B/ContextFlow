from sentence_transformers import SentenceTransformer

# Load model once at startup, not on first request.
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded successfully")


def embed_text(text: str) -> list[float]:
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts using the preloaded model."""
    if not texts:
        return []

    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()
