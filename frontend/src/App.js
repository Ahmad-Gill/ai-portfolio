import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect } from "react";
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
  useEffect(() => {
    document.title = "AI Portfolio"; 
  }, []);

  return (
    <BrowserRouter>


      <Navbar /> 
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:projectName" element={<ProjectsWrapper />} />
      <Route path="/amazing_ai_projects/multi-translation" element={<MultiTranslation />} />
      <Route path="/amazing_ai_projects/AIMythBuster" element={<AIMythBuster/>} />
      <Route path="/amazing_ai_projects/AbstractArt" element={<AbstractArt/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
