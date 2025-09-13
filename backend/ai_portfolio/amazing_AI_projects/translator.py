from deep_translator import GoogleTranslator
from groq import Groq
import os


# Groq API function
def groq_completion(prompt: str, model="llama-3.3-70b-versatile"):
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=GROQ_API_KEY)
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


# Function to translate and correct
def translate_and_correct(text: str, target_language: str):
    # Step 1: Translate using deep-translator
    translated_text = GoogleTranslator(source="auto", target=target_language).translate(text)

    # Step 2: Ask Groq to correct/improve the translated text
    prompt = (
        f"Here is a translated text in {target_language}:\n\n{translated_text}\n\n"
        "Check for any errors and correct them. Only provide the corrected translation. "
        "Do not add explanations, suggestions, or extra text."
    )
    corrected_text = groq_completion(prompt)

    return {
        "original": text,
        "translated": translated_text,
        "corrected": corrected_text,
        "language": target_language,
    }
