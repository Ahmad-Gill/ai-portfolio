import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./componentsHtmlFIles/Navbar";
import Home from "./componentsHtmlFIles/home";
import Projects from "./componentsHtmlFIles/Projects";
import MultiTranslation from "./componentsHtmlFIles/amazing_ai_pojects/MultiTranslation";
import AIMythBuster from "./componentsHtmlFIles/amazing_ai_pojects/AIMythBuster";
import AbstractArt from "./componentsHtmlFIles/amazing_ai_pojects/AbstractArt";
import SpeechStudio from "./componentsHtmlFIles/amazing_ai_pojects/SpeechStudio";
import Toolbox from "./componentsHtmlFIles/amazing_ai_pojects/Toolbox";
import ImageToPDF from "./componentsHtmlFIles/amazing_ai_pojects/ImageToPDF";
import RagDocMind from "./componentsHtmlFIles/amazing_ai_pojects/RagDocMind";
import UrduAudioRag from "./componentsHtmlFIles/amazing_ai_pojects/UrduAudioRag";
import ChatWidget from "./componentsHtmlFIles/ChatWidget";

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
  const BASENAME = process.env.REACT_APP_PUBLIC_URL || "";
  return (
    <BrowserRouter basename={BASENAME}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:projectName" element={<ProjectsWrapper />} />
        <Route
          path="/amazing_ai_projects/multi-translation"
          element={<MultiTranslation />}
        />
        <Route
          path="/amazing_ai_projects/AIMythBuster"
          element={<AIMythBuster />}
        />
        <Route
          path="/amazing_ai_projects/AbstractArt"
          element={<AbstractArt />}
        />
        <Route
          path="/amazing_ai_projects/speech-studio"
          element={<SpeechStudio />}
        />
        <Route
          path="/amazing_ai_projects/toolbox"
          element={<Toolbox />}
        />
        <Route
          path="/amazing_ai_projects/toolbox/image-to-pdf"
          element={<ImageToPDF />}
        />
        <Route
          path="/amazing_ai_projects/docmind-rag"
          element={<RagDocMind />}
        />
        <Route
          path="/amazing_ai_projects/urdu-audio-rag"
          element={<UrduAudioRag />}
        />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
