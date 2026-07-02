const publicUrl = process.env.REACT_APP_PUBLIC_URL || "";

const assets = {
  logo1: `${publicUrl}/logo1.png`,
  logo3: `${publicUrl}/logo3.png`,
  image1: `${publicUrl}/1.jpg`,
  image2: `${publicUrl}/2.jpg`,
  animation: `${publicUrl}/Animation.json`,
  lottie: `${publicUrl}/Animation.lottie`,
  multiTranslation: `${publicUrl}/Amazing AI projects/MultiTranslation.jpg`,
  aiMythBuster: `${publicUrl}/Amazing AI projects/AIMythBuster.png`,
  abstractArt: `${publicUrl}/Amazing AI projects/AbstractArt.png`,
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
];