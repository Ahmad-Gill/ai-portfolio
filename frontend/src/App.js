import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./componentsHtmlFIles/Navbar";
import Home from "./componentsHtmlFIles/home";
import Projects from "./componentsHtmlFIles/Projects";
import MultiTranslation from "./componentsHtmlFIles/amazing_ai_pojects/MultiTranslation";
import AIMythBuster from "./componentsHtmlFIles/amazing_ai_pojects/AIMythBuster";
import AbstractArt from "./componentsHtmlFIles/amazing_ai_pojects/AbstractArt";

function ProjectsWrapper() {
  const { projectName } = useParams();
  return <Projects projectName={decodeURIComponent(projectName)} />;
}

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.title = "AI Portfolio";
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:projectName" element={<ProjectsWrapper />} />
        <Route path="/amazing_ai_projects/multi-translation" element={<MultiTranslation />} />
        <Route path="/amazing_ai_projects/AIMythBuster" element={<AIMythBuster />} />
        <Route path="/amazing_ai_projects/AbstractArt" element={<AbstractArt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
