import os

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from .config import (
    EMBEDDING_MODEL,
    FAISS_INDEX_PATH,
    RETRIEVER_K,
)


# ============================================================
# Embedding Model
# ============================================================

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL
)


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

    if not os.path.exists(
        FAISS_INDEX_PATH
    ):



        _vector_store = None
        _retriever = None

        return False

    try:

        _vector_store = FAISS.load_local(
            FAISS_INDEX_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )

        _retriever = _vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": RETRIEVER_K
            }
        )


        return True

    except Exception as e:



        _vector_store = None
        _retriever = None

        return False


# ============================================================
# Set Active Vector Store
# ============================================================

def set_vector_store(
    new_vector_store
):

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
            "k": RETRIEVER_K
        }
    )




# ============================================================
# Get Active Retriever
# ============================================================

def get_retriever():

    return _retriever


# ============================================================
# Load FAISS When Django Starts
# ============================================================

load_vector_store()