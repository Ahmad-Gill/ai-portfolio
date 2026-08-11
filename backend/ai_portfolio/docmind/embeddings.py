import os

# ============================================================
# IMPORTANT: Keep CPU resource usage low
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
#
# DO NOT initialize HuggingFaceEmbeddings when Django starts.
#
# The model can consume a significant amount of RAM.
# We only load it when FAISS is actually required.
# ============================================================

_embeddings = None


def get_embeddings():
    """
    Return the shared HuggingFace embedding model.

    The model is created only on the first call.
    """

    global _embeddings

    if _embeddings is not None:
        return _embeddings

    print("Loading embedding model...")

    _embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={
            "device": "cpu",
        },
        encode_kwargs={
            "normalize_embeddings": True,
        },
    )

    print("Embedding model loaded successfully.")

    return _embeddings


# ============================================================
# Active Vector Store
# ============================================================

_vector_store = None
_retriever = None


# ============================================================
# Load Existing FAISS Index
# ============================================================

def load_vector_store():
    """
    Load the existing FAISS index.

    The embedding model is loaded lazily only when the
    FAISS index actually exists.
    """

    global _vector_store
    global _retriever

    # --------------------------------------------------------
    # No FAISS index
    # --------------------------------------------------------

    if not os.path.exists(FAISS_INDEX_PATH):

        _vector_store = None
        _retriever = None

        return False

    try:

        print("Loading FAISS vector store...")

        # ----------------------------------------------------
        # Load embeddings only when needed
        # ----------------------------------------------------

        embedding_model = get_embeddings()

        _vector_store = FAISS.load_local(
            FAISS_INDEX_PATH,
            embedding_model,
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
# Load FAISS When Explicitly Requested
# ============================================================
#
# IMPORTANT:
#
# Do NOT automatically call:
#
#     load_vector_store()
#
# at the bottom of this file.
#
# That would load the HuggingFace model during Django/Gunicorn
# startup and can cause OOM on a ~1 GB EC2 instance.
# ============================================================