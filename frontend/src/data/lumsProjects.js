const publicUrl = process.env.PUBLIC_URL;

const assets = {
  logo1: `${publicUrl}/logo1.png`,
  logo3: `${publicUrl}/logo3.png`,
  image1: `${publicUrl}/1.jpg`,
  image2: `${publicUrl}/2.jpg`,
  animation: `${publicUrl}/Animation.json`,
  lottie: `${publicUrl}/Animation.lottie`,
  lumsStudent: `${publicUrl}/lums-student.png`,
  lumsResearch: `${publicUrl}/lums-research.png`
};
export const lumsProjects = [
  { name: "Student Management", description: "Track students and courses efficiently.", image: assets.lumsStudent },
  { name: "Research Analyzer", description: "Analyze research papers automatically.", image: assets.lumsResearch }
];
