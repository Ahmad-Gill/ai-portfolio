import React, { useState } from "react";
import "../../componentCssFiles/multitranslation.css";
import Buttons from "../Button";
import Animation from "../Animation";

function MultiTranslation() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("ur"); // default Urdu
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle API call
  const handleTranslateClick = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}amazing_ai_project/translate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch translation");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Buttons
  const heroButtons = [
    {
      text: loading ? "Translating..." : "Translate",
      type: "teal",
      onClick: handleTranslateClick,
      disabled: loading,
    },
  ];

  return (
    <div className="project-details-page multitranslation-page">
      {loading && <Animation fullscreen />}
      <div className="translate-card">
        <div className="translate-header">
          <span className="translate-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 5h9M8 3v2m3.5 0c-1 4-3.2 7-6.5 9M6 10c1 1.8 2.6 3.2 4.5 4.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 21l4-9 4 9M15.3 18h5.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1>Multi Translation</h1>
            <p className="translate-subtitle">Translate text into multiple languages instantly with AI-powered accuracy.</p>
          </div>
        </div>

        <div className="translate-body">
          <div className="multitranslation-form">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              required
            />
            <div className="multitranslation-controls">
              <label className="multitranslation-select-wrap">
                <span className="multitranslation-select-label">Translate to</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="ur">Urdu</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
                <span className="multitranslation-select-arrow" aria-hidden="true" />
              </label>

              <Buttons buttons={heroButtons} />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          {result && (
            <div className="multitranslation-result">
              <table className="result-table">
                <tbody>
                  <tr>
                    <th>Original</th>
                    <td>{result.original}</td>
                  </tr>
                  <tr>
                    <th>Translated</th>
                    <td>{result.translated}</td>
                  </tr>
                  <tr>
                    <th>Corrected</th>
                    <td>{result.corrected}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiTranslation;
