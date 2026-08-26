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
    <div className="project-details-page abstractart-page">
      {loading && <Animation fullscreen />}
      <div className="abstractart-card">
        <div className="abstractart-header">
          <span className="abstractart-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.2-1.8-.3-.5-.1-1.2.5-1.4.9-.3 1.7-.9 1.7-2 0-.7-.4-1.2-1-1.5-.4-.2-.5-.8-.1-1 .8-.5 1.7-1.2 1.7-2.3 0-2.5-3.5-5-4-8Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="15" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="13" cy="7" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div>
            <h1>Generate Abstract Art</h1>
            <p className="abstractart-subtitle">Click any button to generate unique abstract art using AI.</p>
          </div>
        </div>

        <div className="abstractart-body">
          {/* ✅ Responsive wrapper */}
          <div className="abstract-buttons-wrapper">
            <Buttons buttons={heroButtons} />
          </div>

          {error && <p className="error">{error}</p>}

          {imageSrc && (
            <div className="abstract-result">
              <img src={imageSrc} alt="Abstract Art" className="abstract-image" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenerateAbstractArt;
