import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./componentsHtmlFIles/Navbar";
import Home from "./componentsHtmlFIles/home";
import Projects from "./componentsHtmlFIles/Projects";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
