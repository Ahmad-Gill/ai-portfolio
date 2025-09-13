import React, { useState } from "react";
import "../../componentCssFiles/multitranslation.css";
import Buttons from "../Button";
import Animation from "../Animation";

const API_URL = process.env.REACT_APP_API_URL;

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
    <div className="project-details-page">
      <div className="project-details-card">
        <h1>Multi Translation</h1>
        <p>Translate text into multiple languages instantly with AI-powered accuracy.</p>

        <div className="multitranslation-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate..."
            rows={4}
            required
          />
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

          <Buttons buttons={heroButtons} />
        </div>

        {loading && <Animation fullscreen />}
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
  );
}

export default MultiTranslation;
