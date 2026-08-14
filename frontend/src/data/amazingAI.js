import { getPublicAsset } from "../utils/publicAsset";

const assets = {
  multiTranslation: getPublicAsset("Amazing AI projects/multi_translation.jpg"),
  aiMythBuster: getPublicAsset("Amazing AI projects/ai_mythbuster.png"),
  abstractArt: getPublicAsset("Amazing AI projects/AbstractArt.png"),
  speechStudio: getPublicAsset("speach.png"),
  toolbox: getPublicAsset("Amazing AI projects/tool.png"),
  docmind: getPublicAsset("Amazing AI projects/RAG.png"),
  urduAudioRag: getPublicAsset("Amazing AI projects/UrduRAg.png"),
};

// Maps a project's display name to its detail page route.
export const projectRoutes = {
  "AI Chatbot": "/ai-chatbot",
  "Generate Abstract Painting": "/amazing_ai_projects/AbstractArt",
  "Multi Translation": "/amazing_ai_projects/multi-translation",
  "AI Myth Buster": "/amazing_ai_projects/AIMythBuster",
  "Speech Studio": "/amazing_ai_projects/speech-studio",
  "AI Tool Box": "/amazing_ai_projects/toolbox",
  "DocMind (RAG)": "/amazing_ai_projects/docmind-rag",
  "Urdu Audio RAG": "/amazing_ai_projects/urdu-audio-rag",
};

export const amazingAI = [
  {
    name: "Multi Translation",
    description:
      "Translate text into multiple languages instantly with AI-powered accuracy.",
    image: assets.multiTranslation,
  },
  {
    name: "AI Myth Buster",
    description:
      "Debunk myths and clarify misconceptions using verified AI knowledge.",
    image: assets.aiMythBuster,
  },
  {
    name: "Generate Abstract Painting",
    description:
      "Create unique, AI-generated abstract paintings with vibrant colors and patterns.",
    image: assets.abstractArt,
  },
  {
    name: "Speech Studio",
    description:
      "Upload or record a short audio clip, add a prompt, and receive a clean AI-generated audio response.",
    image: assets.speechStudio,
  },
  {
    name: "AI Tool Box",
    description:
      "Access multiple AI utilities in one place, starting with image-to-PDF conversion.",
    image: assets.toolbox,
  },
  {
    name: "DocMind (RAG)",
    description:
      "Upload documents (PDF, TXT, DOCX) and ask questions   a simple RAG pipeline.",
    image: assets.docmind,
  },
  {
    name: "Urdu Audio RAG",
    description:
      "Speak a question in Urdu and get a spoken answer back   a full voice-in, voice-out RAG pipeline.",
    image: assets.urduAudioRag,
  },
];
