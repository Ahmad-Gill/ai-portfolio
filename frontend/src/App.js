import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./componentsHtmlFIles/home";
import Semester from "./componentsHtmlFIles/Semester";

function App() {
  // Set App Name in browser tab
  useEffect(() => {
    document.title = "AI Portfolio"; 
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/semester" element={<Semester />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
