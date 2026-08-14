import { getPublicAsset } from "../utils/publicAsset";

const assets = {
  lumsStudent: getPublicAsset("lums-student.png"),
  lumsResearch: getPublicAsset("lums-research.png"),
};

export const lumsProjects = [
  { name: "Student Management", description: "Track students and courses efficiently.", image: assets.lumsStudent },
  { name: "Research Analyzer", description: "Analyze research papers automatically.", image: assets.lumsResearch },
];
