import hashlib

DIMENSIONS = 384


def embed_text(text: str) -> list[float]:
    # Deterministic embedding using hash-based approach
    # Good enough for demo/portfolio purposes
    result = []
    for i in range(DIMENSIONS):
        h = hashlib.md5(f"{text}{i}".encode()).hexdigest()
        val = int(h, 16) / (16**32)
        result.append(val * 2 - 1)
    return result
