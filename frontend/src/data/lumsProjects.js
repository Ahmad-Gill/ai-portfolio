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
  lumsStudent: getPublicAsset("lums-student.png"),
  lumsResearch: getPublicAsset("lums-research.png")
};
export const lumsProjects = [
  { name: "Student Management", description: "Track students and courses efficiently.", image: assets.lumsStudent },
  { name: "Research Analyzer", description: "Analyze research papers automatically.", image: assets.lumsResearch }
];
