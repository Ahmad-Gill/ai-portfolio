# =========================
# 2. API Helpers
# =========================
import os
import requests
from groq import Groq

# Environment variables
GROQ_API_KEY      = os.getenv("GROQ_API_KEY")
FACTCHECK_API_KEY = os.getenv("FACTCHECK_API_KEY")     # <-- put in Azure config
NEWS_API_KEY      = os.getenv("NEWS_API_KEY")          # <-- put in Azure config

# -----------------------------
# FactCheck API
def get_factcheck(claim: str):
    try:
        url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        params = {"query": claim, "key": FACTCHECK_API_KEY}
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"FactCheck API failed: {e}"}

# -----------------------------
# News API
def get_news(query: str):
    try:
        url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"News API failed: {e}"}

# -----------------------------
# PubMed API
def get_pubmed(query: str, retmax=3):
    try:
        search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        params = {"db": "pubmed", "term": query, "retmode": "json", "retmax": retmax}
        search_resp = requests.get(search_url, params=params, timeout=10).json()
        pmids = search_resp.get("esearchresult", {}).get("idlist", [])
        articles = []
        for pmid in pmids:
            summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            summary_params = {"db": "pubmed", "id": pmid, "retmode": "json"}
            summary_resp = requests.get(summary_url, params=summary_params, timeout=10).json()
            result = summary_resp.get("result", {}).get(pmid, {})
            title = result.get("title", "")
            source = result.get("source", "PubMed")
            pubdate = result.get("pubdate", "")
            url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
            articles.append(f"{source} ({pubdate}) - {title}: {url}")
        return articles
    except Exception as e:
        return {"error": f"PubMed API failed: {e}"}

# -----------------------------
# Groq Completion
def groq_completion(prompt: str, model="llama-3.3-70b-versatile"):
    if not GROQ_API_KEY:
        raise RuntimeError("Missing GROQ_API_KEY environment variable.")
    client = Groq(api_key=GROQ_API_KEY)
    chat_completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an empathetic fact-checking assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7,
    )
    return chat_completion.choices[0].message.content.strip()

# =========================
# 3. Mythbuster Pipeline
# =========================
def mythbuster_answer(claim: str):
    fact_data = get_factcheck(claim)
    news_data = get_news(claim)
    pubmed_data = get_pubmed(claim)

    sources = []

    # Fact-check results
    for claim_item in fact_data.get("claims", []):
        for review in claim_item.get("claimReview", []):
            publisher = review.get("publisher", {}).get("name", "Unknown")
            url = review.get("url", "")
            snippet = review.get("textualRating", "")
            sources.append({"type": "FactCheck", "publisher": publisher, "url": url, "snippet": snippet})

    # News results (top 3)
    for article in news_data.get("articles", [])[:3]:
        publisher = article.get("source", {}).get("name", "Unknown")
        url = article.get("url", "")
        description = article.get("description", "")
        sources.append({"type": "News", "publisher": publisher, "url": url, "snippet": description})

    # PubMed results
    if isinstance(pubmed_data, list):
        for article in pubmed_data:
            sources.append({"type": "PubMed", "details": article})

    sources_text = "\n".join(
        [f"{s.get('publisher','')}: {s.get('url','')} -- {s.get('snippet','')}" for s in sources if s.get('publisher')]
    ) or "None found"

    prompt = (
        f"Claim: \"{claim}\"\n\n"
        f"Sources:\n{sources_text}\n\n"
        "Instructions:\n"
        "1. Start with empathy; acknowledge the user's concern.\n"
        "2. State clearly if the claim is True, False, Misleading, or Unproven.\n"
        "3. Keep explanation concise (2-3 sentences).\n"
        "4. Educate with accurate facts.\n"
        "5. Reassure the user.\n"
        "6. Suggest self-care and consulting professionals.\n"
    )

    try:
        explanation = groq_completion(prompt)
        claim_status = "Unproven"
        if "True" in explanation:
            claim_status = "True"
        elif "False" in explanation:
            claim_status = "False"
        elif "Misleading" in explanation:
            claim_status = "Misleading"

        return {
            "claim": claim,
            "claim_status": claim_status,
            "explanation": explanation,
            "sources": sources
        }
    except Exception as e:
        return {"error": f"Mythbuster failed: {e}"}
