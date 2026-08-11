import os

# ============================================================
# Low-memory configuration
# ============================================================

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")


try:
    import torch

    torch.set_num_threads(1)
    torch.set_num_interop_threads(1)

except Exception:
    torch = None


from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from .config import (
    EMBEDDING_MODEL,
    FAISS_INDEX_PATH,
    RETRIEVER_K,
)


# ============================================================
# Lazy Embedding Model
# ============================================================

_embeddings = None


def get_embeddings():
    """
    Load the HuggingFace embedding model only when required.

    This prevents Django/Gunicorn from loading the model
    during application startup.
    """

    global _embeddings

    if _embeddings is not None:
        return _embeddings

    print("Loading HuggingFace embedding model...")

    _embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={
            "device": "cpu",
        },
        encode_kwargs={
            "normalize_embeddings": True,
        },
    )

    print("HuggingFace embedding model loaded.")

    return _embeddings


# ============================================================
# Backward-Compatible Lazy Proxy
# ============================================================

class LazyEmbeddings:
    """
    Allows existing code such as:

        from .embeddings import embeddings

    to continue working without loading the model during
    Django startup.
    """

    def __getattr__(self, name):
        return getattr(
            get_embeddings(),
            name,
        )


# Keep this name because other files may import it.
embeddings = LazyEmbeddings()


# ============================================================
# Active Vector Store
# ============================================================

_vector_store = None
_retriever = None


# ============================================================
# Load Existing FAISS Index
# ============================================================

def load_vector_store():

    global _vector_store
    global _retriever

    if not os.path.exists(FAISS_INDEX_PATH):

        _vector_store = None
        _retriever = None

        return False

    try:

        print("Loading FAISS vector store...")

        _vector_store = FAISS.load_local(
            FAISS_INDEX_PATH,
            get_embeddings(),
            allow_dangerous_deserialization=True,
        )

        _retriever = _vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": RETRIEVER_K,
            },
        )

        print("FAISS vector store loaded successfully.")

        return True

    except Exception as e:

        print(
            f"Failed to load FAISS vector store: {e}"
        )

        _vector_store = None
        _retriever = None

        return False


# ============================================================
# Set Active Vector Store
# ============================================================

def set_vector_store(new_vector_store):

    global _vector_store
    global _retriever

    if new_vector_store is None:

        _vector_store = None
        _retriever = None

        return

    _vector_store = new_vector_store

    _retriever = new_vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": RETRIEVER_K,
        },
    )


# ============================================================
# Get Active Vector Store
# ============================================================

def get_vector_store():

    return _vector_store


# ============================================================
# Get Active Retriever
# ============================================================

def get_retriever():

    return _retriever


# ============================================================
# Get Embedding Model
# ============================================================

def get_embedding_model():

    return get_embeddings()


# ============================================================
# IMPORTANT
# ============================================================
#
# DO NOT call load_vector_store() here.
#
# Calling it during Django startup would load the HuggingFace
# model immediately and can cause OOM on the 1 GB EC2 instance.
#
# load_vector_store()
# ============================================================