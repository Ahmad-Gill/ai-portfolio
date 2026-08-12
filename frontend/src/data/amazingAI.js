const getPublicAsset = (path) => {
  const base = (process.env.REACT_APP_PUBLIC_URL || process.env.PUBLIC_URL || "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path.replace(/^\/+/, "")}`;
};

const assets = {
  logo1: getPublicAsset("logo1.png"),
  logo3: getPublicAsset("logo3.png"),
  image1: getPublicAsset("1.jpg"),
  image2: getPublicAsset("2.jpg"),
  animation: getPublicAsset("Animation.json"),
  lottie: getPublicAsset("Animation.lottie"),
  multiTranslation: getPublicAsset("Amazing AI projects/multi_translation.jpg"),
  aiMythBuster: getPublicAsset("Amazing AI projects/ai_mythbuster.png"),
  abstractArt: getPublicAsset("Amazing AI projects/AbstractArt.png"),
  speechStudio: getPublicAsset("speach.png"),
  toolbox: getPublicAsset("Amazing AI projects/tool.png"),
  docmind: getPublicAsset("Amazing AI projects/RAG.png"),
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
      "Upload documents (PDF, TXT, DOCX) and ask questions — a simple RAG pipeline.",
    image: assets.docmind,
  },
];