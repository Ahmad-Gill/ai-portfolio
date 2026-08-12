import React, { useState } from "react";
import "../../componentCssFiles/ragdocmind.css";

function RagDocMind() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [, setUploadResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const [modalPassword, setModalPassword] = useState("");
  const [modalUploading, setModalUploading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);

  const openModal = () => {
    setModalFile(null);
    setModalPassword("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFile(null);
    setModalPassword("");
    setModalError(null);
  };

  const handleModalFileChange = (e) => {
    setModalFile(e.target.files[0] || null);
    setModalError(null);
  };

  const handleModalUpload = async (e) => {
    e && e.preventDefault();
    if (!modalFile) return setModalError("Please select a document to upload.");
    setModalUploading(true);
    setModalError(null);
    try {
      const formData = new FormData();
      formData.append("document", modalFile);

      const res = await fetch(
        "https://api.ahmadgill.com/api/amazing_ai_project/upload-document/",
        {
          method: "POST",
          headers: {
            ...(modalPassword ? { "X-DocMind-Password": modalPassword } : {}),
          },
          body: formData,
        }
      );
      const data = await res.json();
      setUploadResult({ ok: res.ok, data });
      // store file and password in main state so ask uses them
      setFile(modalFile);
      setPassword(modalPassword);
      closeModal();
    } catch (err) {
      setModalError(err.message || "Upload failed");
    } finally {
      setModalUploading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question) return alert("Please enter a question.");
    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch(
        "https://api.ahmadgill.com/api/amazing_ai_project/docmind/ask/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(password ? { "X-DocMind-Password": password } : {}),
          },
          body: JSON.stringify({ question }),
        }
      );
      const data = await res.json();
      if (data && data.answer) setAnswer(data.answer);
      else setAnswer(JSON.stringify(data));
    } catch (err) {
      setAnswer("Error: " + err.message);
    } finally {
      setAsking(false);
    }
  };

  const humanFileSize = (size) => {
    if (!size) return "";
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
  };

  return (
    <div className="rag-container">
      <div className="rag-card">
        <div className="rag-header">
          <div className="icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2h6l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 2v6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1>DocMind (RAG)</h1>
            <div className="subtitle">Upload documents and get precise, context-aware answers.</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn blue small" onClick={openModal}>Upload Document</button>
          </div>
        </div>

        <div className="rag-body">
          {/* Upload initiated via header button. File status appears in the Ask column. */}

          {isModalOpen && (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal">
                <button className="modal-close btn small teal" onClick={closeModal}>Cancel</button>
                <h3 style={{ marginTop: 6 }}>Upload document</h3>
                <form onSubmit={handleModalUpload} className="rag-form">
                      <label>
                        Password (required):
                        <input type="text" value={modalPassword} onChange={(e) => setModalPassword(e.target.value)} placeholder="Required password" required />
                      </label>

                  <label>
                    Choose file:
                    <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleModalFileChange} />
                  </label>

                  {modalError && <div className="upload-error">{modalError}</div>}

                  <div className="rag-actions buttons" style={{ marginTop: 8 }}>
                    <button className="btn blue" type="submit" disabled={modalUploading}>{modalUploading ? "Uploading..." : "Upload"}</button>
                    <button type="button" className="btn teal small" onClick={closeModal}>Close</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="qa-column">
            <div className="rag-section">
              <h2>Ask a question</h2>
              <form onSubmit={handleAsk} className="rag-form">
                <label>
                  Question:
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask something about your uploaded document"
                  />
                </label>

                <div className="rag-actions buttons">
                  <button className="btn blue" type="submit" disabled={asking}>
                    {asking ? "Thinking..." : "Ask"}
                  </button>
                  <button
                    type="button"
                    className="btn teal small"
                    onClick={() => { setQuestion(""); setAnswer(null); }}
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div style={{ marginTop: 12 }}>
                  <div className="answer-box">{answer ?? "Ask a question to see an answer here."}</div>
                  {file ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="file-info">Uploaded: {file.name} — {humanFileSize(file.size)}</div>
                      <button className="btn teal small" onClick={() => { setFile(null); setUploadResult(null); setPassword(""); }}>Remove document</button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }} className="help">No document uploaded — click Upload to add one.</div>
                  )}
              </div>
            </div>

            <div className="rag-section">
              <h3>About DocMind</h3>
              <p className="help">Ask questions about documents you've uploaded — answers are generated by searching the uploaded content and synthesizing a concise reply.</p>
              <p className="help tagline">Designed for simplicity and privacy-conscious workflows; nothing technical is exposed here.</p>
            </div>
          </div>

          <div className="side-column"></div>
        </div>
      </div>
    </div>
  );
}

export default RagDocMind;
