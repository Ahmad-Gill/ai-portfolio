import os


# ============================================================
# FAISS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FAISS_INDEX_PATH = os.getenv(
    "FAISS_INDEX_PATH",
    os.path.join(
        BASE_DIR,
        "faiss_index"
    )
)


# ============================================================
# Authentication
# ============================================================

DOCMIND_UPLOAD_PASSWORD = os.getenv(
    "DOCMIND_UPLOAD_PASSWORD"
)


# ============================================================
# Groq
# ============================================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

GROQ_MODEL = os.getenv(
    "DOCMIND_GROQ_MODEL",
    "openai/gpt-oss-120b"
)


# ============================================================
# Embeddings
# ============================================================

EMBEDDING_MODEL = os.getenv(
    "DOCMIND_EMBEDDING_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)


# ============================================================
# Retriever
# ============================================================

RETRIEVER_K = int(
    os.getenv(
        "DOCMIND_RETRIEVER_K",
        "3"
    )
)


# ============================================================
# Supported Documents
# ============================================================

SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt"
}