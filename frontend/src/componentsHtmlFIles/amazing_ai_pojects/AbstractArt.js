import React, { useState } from "react";
import "../../componentCssFiles/abstractArt.css";
import Animation from "../Animation";
import Buttons from "../Button";

function GenerateAbstractArt() {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle API call
  const handleGenerateClick = async (endpoint) => {
    setLoading(true);
    setError(null);
    setImageSrc(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}amazing_ai_project/${endpoint}/`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch API");

      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      setImageSrc(imgUrl);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buttons with onClick
  const heroButtons = [
    { text: "Chaotic Symphony", type: "teal", onClick: () => handleGenerateClick("painting1") },
    { text: "Geometric Horizon", type: "teal", onClick: () => handleGenerateClick("painting2") },
    { text: "Abstract Faces in Motion", type: "teal", onClick: () => handleGenerateClick("painting3") },
    { text: "Abstract Shapes HD", type: "teal", onClick: () => handleGenerateClick("painting4") },
  ];

  return (
    <div className="project-details-page">
      <div className="project-details-card">
        <h1>Generate Abstract Art</h1>
        <p>Click any button to generate unique abstract art using AI.</p>

        {/* ✅ Responsive wrapper */}
        <div className="abstract-buttons-wrapper">
          <Buttons buttons={heroButtons} />
        </div>

        {loading && <Animation fullscreen />}
        {error && <p className="error">{error}</p>}

        {imageSrc && (
          <div className="abstract-result">
            <img src={imageSrc} alt="Abstract Art" className="abstract-image" />
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateAbstractArt;
