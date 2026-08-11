import os
import shutil
import tempfile

from groq import Groq

from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.vectorstores import FAISS

from .config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    FAISS_INDEX_PATH,
)

from .document_loader import load_document

from .embeddings import (
    embeddings,
    set_vector_store,
    get_retriever,
)


# ============================================================
# Groq Client
# ============================================================

client = Groq(
    api_key=GROQ_API_KEY
)


# ============================================================
# Create Embeddings
# ============================================================

def create_embeddings(
    file_path,
    extension
):
    """
    Process the uploaded document and create a new FAISS index.

    Only one document is active at a time.

    The previous FAISS index is deleted only after the new
    document has been successfully processed and saved.
    """

    # ========================================================
    # 1. Load Document
    # ========================================================

    documents = load_document(
        file_path,
        extension
    )

    if not documents:

        raise ValueError(
            "The uploaded document is empty."
        )



    # ========================================================
    # 2. Semantic Chunking
    # ========================================================

    text_splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type="percentile"
    )

    chunks = text_splitter.split_documents(
        documents
    )

    if not chunks:

        raise ValueError(
            "No semantic chunks were created."
        )


    # ========================================================
    # 3. Create New FAISS
    # ========================================================



    new_vector_store = FAISS.from_documents(
        chunks,
        embeddings
    )



    # ========================================================
    # 4. Prepare Directory
    # ========================================================

    parent_directory = os.path.dirname(
        FAISS_INDEX_PATH
    )

    os.makedirs(
        parent_directory,
        exist_ok=True
    )

    # ========================================================
    # 5. Temporary FAISS Directory
    # ========================================================

    temporary_index_path = tempfile.mkdtemp(
        prefix="docmind_faiss_",
        dir=parent_directory
    )

    try:

        # ====================================================
        # 6. Save New FAISS Temporarily
        # ====================================================

        new_vector_store.save_local(
            temporary_index_path
        )



        # ====================================================
        # 7. Delete Previous FAISS
        # ====================================================

        if os.path.exists(
            FAISS_INDEX_PATH
        ):

            shutil.rmtree(
                FAISS_INDEX_PATH
            )

 

        # ====================================================
        # 8. Activate New FAISS
        # ========================================================

        shutil.move(
            temporary_index_path,
            FAISS_INDEX_PATH
        )

        temporary_index_path = None




    finally:

        # ====================================================
        # 9. Cleanup
        # ====================================================

        if (
            temporary_index_path
            and os.path.exists(
                temporary_index_path
            )
        ):

            shutil.rmtree(
                temporary_index_path
            )

    # ========================================================
    # 10. Update Retriever
    # ========================================================

    set_vector_store(
        new_vector_store
    )



    return len(chunks)


# ============================================================
# Generate RAG Answer
# ============================================================

def generate_answer(
    question
):

    retriever = get_retriever()

    # ========================================================
    # No Document
    # ========================================================

    if retriever is None:

        return get_fallback()

    # ========================================================
    # Retrieve Relevant Chunks
    # ========================================================

    documents = retriever.invoke(
        question
    )

    if not documents:

        return get_fallback()

    # ========================================================
    # Build Context
    # ========================================================

    context = "\n\n".join(
        document.page_content
        for document in documents
    )

    # ========================================================
    # Prompt
    # ========================================================

    prompt = f"""
You are DocMind, an AI clinic assistant.

Answer the user's question ONLY using the
provided document context.

STRICT RULES:

1. Answer only from the provided document context.
2. Never use your general knowledge.
3. Never invent information.
4. Never assume information.
5. If the answer is not available in the context,
   use the fallback response.
6. Respond only in English.
7. Keep the answer clear, natural, helpful, and concise.
8. Never mention FAISS, embeddings, retrieval,
   semantic chunking, or internal system details.

If the requested information is not present
in the document context, respond exactly with:

"Sorry, I don't have that information. Please call
+92 300 1234567 and our representative will guide you."

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}

ANSWER:
"""

    # ========================================================
    # Groq Request
    # ========================================================

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    # ========================================================
    # Return Answer
    # ========================================================

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# ============================================================
# Fallback
# ============================================================

def get_fallback():

    return (
        "Sorry, I don't have that information. "
        "Please call +92 300 1234567 and our "
        "representative will guide you."
    )