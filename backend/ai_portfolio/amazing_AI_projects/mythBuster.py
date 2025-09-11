# =========================
# 2. API Helpers
# =========================
import os
import requests
import json
from groq import Groq

# API Keys (replace with environment variables if needed)
GROQ_API_KEY      = "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"
FACTCHECK_API_KEY = "AIzaSyCHNSWmKuXKcr8TOwe1KXPJmakpa2VgMZs"  
NEWS_API_KEY      = "f0341d1c65a3455e96764779d9a8ac01"

client = Groq(api_key=GROQ_API_KEY)

# -----------------------------
# FactCheck API
def get_factcheck(claim: str):
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {"query": claim, "key": FACTCHECK_API_KEY}
    resp = requests.get(url, params=params)
    return resp.json()

# -----------------------------
# News API
def get_news(query: str):
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}"
    resp = requests.get(url)
    return resp.json()

# -----------------------------
# PubMed API
def get_pubmed(query: str, retmax=3):
    search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {"db": "pubmed", "term": query, "retmode": "json", "retmax": retmax}
    search_resp = requests.get(search_url, params=params).json()
    pmids = search_resp.get("esearchresult", {}).get("idlist", [])
    articles = []
    for pmid in pmids:
        summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        summary_params = {"db": "pubmed", "id": pmid, "retmode": "json"}
        summary_resp = requests.get(summary_url, params=summary_params).json()
        result = summary_resp.get("result", {}).get(pmid, {})
        title = result.get("title", "")
        source = result.get("source", "PubMed")
        pubdate = result.get("pubdate", "")
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        articles.append(f"{source} ({pubdate}) - {title}: {url}")
    return articles

# -----------------------------
# Groq Completion
def groq_completion(prompt: str, model="llama-3.3-70b-versatile"):
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an empathetic fact-checking assistant."},
            {"role": "user", "content": prompt}
        ],
        model=model,
        max_tokens=500,
        temperature=0.7,
    )
    return chat_completion.choices[0].message.content

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
    for article in pubmed_data:
        sources.append({"type": "PubMed", "details": article})

    sources_text = "\n".join(
        [f"{s['publisher']}: {s['url']} -- {s.get('snippet','')}" for s in sources if s.get('publisher')]
    ) or "None found"

    prompt = (
        f"Claim: \"{claim}\"\n\n"
        f"Sources:\n{sources_text}\n\n"
        "Instructions:\n"
        "1. Start with empathy; acknowledge the user's concern and feelings.\n"
        "2. State clearly if the claim is True, False, Misleading, or Unproven.\n"
        "3. Keep explanation concise (2-3 sentences).\n"
        "4. Educate the user with accurate medical or scientific facts.\n"
        "5. Reassure the user that any issues are due to biological or medical factors, not their fault.\n"
        "6. Include gentle emotional support, e.g., it's normal to feel worried, and they're not alone.\n"
        "7. Suggest self-care and seeking support from loved ones or professionals if needed.\n"
        "8. Encourage consulting a healthcare professional for personalized advice.\n"
        "9. Include only concise, relevant sources (publisher + URL) if available.\n"
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
        elif "Unproven" in explanation:
            claim_status = "Unproven"

        result_json = {
            "claim": claim,
            "claim_status": claim_status,
            "explanation": explanation,
            "sources": sources
        }
        return result_json

    except Exception as e:
        return {"error": str(e)}
