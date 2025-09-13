import React, { useState } from "react";
import "../../componentCssFiles/aimythbuster.css";
import Buttons from "../Button";
import Animation from "../Animation";

// Use .env variable for API URL
const API_URL = process.env.REACT_APP_API_URL;

function AIMythBuster() {
  const [userClaim, setUserClaim] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle API call
  const handleSubmitClick = async () => {
    if (!userClaim.trim()) {
      setError("Please enter a claim first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}amazing_ai_project/aimythbuster/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim: userClaim }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch API");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Button config
  const heroButtons = [
    {
      text: loading ? "Checking..." : "Submit Claim",
      type: "teal",
      onClick: handleSubmitClick,
      disabled: loading,
    },
  ];

  return (
    <div className="project-details-page">
      <div className="project-details-card">
        <h1>AI Myth Buster</h1>
        <p>Enter any claim and find out if it is misleading, true, or unproven.</p>

        {/* Input & Button */}
        <div className="aimythbuster-form">
          <input
            type="text"
            value={userClaim}
            onChange={(e) => setUserClaim(e.target.value)}
            placeholder="Enter a claim..."
            required
          />
          <Buttons buttons={heroButtons} />
        </div>

        {loading && <Animation fullscreen />}
        {error && <p className="error">{error}</p>}

        {/* Results */}
        {result && (
          <div className="aimythbuster-result">
            <h2>Result</h2>

            {/* Scrollable wrapper for main table */}
            <div className="table-wrapper">
              <table className="result-table">
                <tbody>
                  <tr>
                    <th>Claim</th>
                    <td>{result.claim}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{result.claim_status}</td>
                  </tr>
                  <tr>
                    <th>Explanation</th>
                    <td>{result.explanation}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sources table */}
            {result?.sources?.length > 0 && (
              <>
                <h2>Sources</h2>
                <div className="table-wrapper">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Publisher</th>
                        <th>Snippet</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sources.map((src, idx) => (
                        <tr key={idx}>
                          <td>{src.publisher || "Unknown"}</td>
                          <td>{src.snippet || src.details || "—"}</td>
                          <td>
                            {src.url ? (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIMythBuster;
