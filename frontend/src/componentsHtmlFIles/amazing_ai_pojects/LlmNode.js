import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../componentCssFiles/aimythbuster.css";
import "../../componentCssFiles/storywriter.css";
import "../../componentCssFiles/llmnode.css";
import Buttons from "../Button";
import { DEFAULT_MODEL, generateStream, listModels } from "../../utils/llmNodeApi";

// Opens an email to the admin so visitors stay on this page
const CONTACT_EMAIL = "m.ahmadgill01@gmail.com";
const KEY_REQUEST_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "API key request: Custom LLM Node"
)}&body=${encodeURIComponent("Hi, I'd like an API key for the Custom LLM Node.\n\nWhat I'll use it for:\n")}`;
const THINK_END = "</think>";

// The model may stream its reasoning before the answer, ending with </think>.
// Until that tag arrives the text is treated as reasoning; if the stream ends
// without one, all of it is the answer.
function splitReasoning(raw, done) {
  const text = raw.replace(/^\s*<think>/, "");
  const end = text.indexOf(THINK_END);
  if (end !== -1) {
    return { reasoning: text.slice(0, end).trim(), answer: text.slice(end + THINK_END.length).trimStart() };
  }
  return done ? { reasoning: "", answer: text.trim() } : { reasoning: text, answer: "" };
}

// Friendlier wording for the errors a visitor can fix themselves
function explainError(err) {
  if (err.status === 401) return `${err.message} Check your key, or email us for a new one.`;
  if (err.status === 429) return `${err.message} Email us to get more.`;
  return err.message || "Something went wrong";
}

function LlmNode() {
  const [models, setModels] = useState([]);
  const [modelsError, setModelsError] = useState(null);
  const [modelName, setModelName] = useState("");
  // Empty means the public test key is used
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState("");
  // Each entry: { prompt, raw, error }. The API has no memory, so every
  // question is answered on its own.
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const controllerRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    listModels()
      .then((list) => {
        setModels(list);
        setModelName((current) => current || (list.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : list[0]) || "");
      })
      .catch((err) => setModelsError(err.message || "Could not load models"));
  }, []);

  // Stop any running stream when leaving the page
  useEffect(() => () => controllerRef.current?.abort(), []);

  // Keep the newest text in view while it is being written
  useEffect(() => {
    if (streaming) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, streaming]);

  const updateLast = (change) =>
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = change(next[next.length - 1]);
      return next;
    });

  const handleSend = async (text = prompt) => {
    const question = text.trim();
    if (!question || streaming) return;
    if (!modelName) {
      setMessages((prev) => [...prev, { prompt: question, raw: "", error: "No model is available right now." }]);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setStreaming(true);
    setPrompt("");
    setCopiedIndex(null);
    setMessages((prev) => [...prev, { prompt: question, raw: "", error: null }]);

    try {
      await generateStream(question, {
        apiKey: apiKey.trim(),
        model: modelName,
        signal: controller.signal,
        onChunk: (chunk) => updateLast((msg) => ({ ...msg, raw: msg.raw + chunk })),
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        updateLast((msg) => ({ ...msg, error: explainError(err) }));
      }
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  };

  const handleStop = () => controllerRef.current?.abort();

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Clipboard can be blocked; nothing else to do
    }
  };

  // Button config
  const sendButtons = streaming
    ? [{ text: "Stop", type: "blue", onClick: handleStop }]
    : [{ text: "Send", type: "teal", onClick: () => handleSend(), disabled: !prompt.trim() }];

  return (
    <div className="project-details-page mythbuster-page story-page llm-page">
      <div className="mythbuster-card">
        <div className="mythbuster-header">
          <span className="mythbuster-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="7" rx="2" />
              <rect x="3" y="13" width="18" height="7" rx="2" />
              <path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h1>Custom LLM Node</h1>
            <p className="mythbuster-subtitle">
              Ask a large language model running on my own server. Answers stream back word by word.
            </p>
          </div>
        </div>

        <div className="mythbuster-body">
          {/* Models served by the node */}
          <div className="llm-section">
            <h2>Available models</h2>
            {modelsError && <p className="error">{modelsError}</p>}
            {!modelsError && models.length === 0 && <p className="llm-muted">Loading models…</p>}
            {models.length > 0 && (
              <div className="llm-models" role="radiogroup" aria-label="Model">
                {models.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={modelName === name}
                    className={`llm-model-chip${modelName === name ? " is-active" : ""}`}
                    onClick={() => setModelName(name)}
                    disabled={streaming}
                  >
                    <span className="llm-model-dot" aria-hidden="true" />
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* API key */}
          <div className="llm-section">
            <label className="llm-label" htmlFor="llm-api-key">
              <h2>API key</h2>
            </label>
            <div className="llm-key-row">
              <input
                id="llm-api-key"
                className="llm-input"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional: your own AG-... key"
                autoComplete="off"
                spellCheck="false"
                disabled={streaming}
              />
              <button
                type="button"
                className="story-action-btn"
                onClick={() => setShowKey((v) => !v)}
                aria-pressed={showKey}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="llm-muted">
              {apiKey.trim()
                ? "Using your own key."
                : "Leave this empty to use the built-in test key, so anyone can try it."}{" "}
              {apiKey && (
                <button type="button" className="story-link-btn" onClick={() => setApiKey("")}>
                  Use the test key instead
                </button>
              )}
            </p>
            <div className="llm-key-request">
              <span>Need your own API key? Keys are issued by the admin.</span>
              <a className="btn ghost" href={KEY_REQUEST_HREF}>
                Email us for a key
              </a>
            </div>
          </div>

          {/* Conversation */}
          {messages.length > 0 && (
            <div className="story-thread llm-thread">
              {messages.map((msg, i) => {
                const isLive = streaming && i === messages.length - 1;
                const { reasoning, answer } = splitReasoning(msg.raw, !isLive);
                return (
                  <React.Fragment key={i}>
                    <div className="story-user-msg">
                      <p>{msg.prompt}</p>
                    </div>
                    <div className="story-reply">
                      <div className="story-prose" aria-live={isLive ? "polite" : undefined} aria-busy={isLive}>
                        {reasoning && (
                          <details className="llm-reasoning">
                            <summary>{isLive && !answer ? "Reasoning… (tap to watch)" : "Show reasoning"}</summary>
                            <p>{reasoning}</p>
                          </details>
                        )}
                        {answer && (
                          <p className="llm-answer">
                            {answer}
                            {isLive && <span className="story-cursor" aria-hidden="true" />}
                          </p>
                        )}
                        {isLive && !answer && (
                          <p className="story-thinking">
                            Thinking
                            <span className="story-dots" aria-hidden="true">
                              <span />
                              <span />
                              <span />
                            </span>
                          </p>
                        )}
                        {msg.error && <p className="error">{msg.error}</p>}
                      </div>
                      {!isLive && answer && (
                        <div className="story-actions">
                          <button type="button" className="story-action-btn" onClick={() => handleCopy(answer, i)}>
                            {copiedIndex === i ? "Copied" : "Copy"}
                          </button>
                          {!streaming && (
                            <button type="button" className="story-action-btn" onClick={() => handleSend(msg.prompt)}>
                              Ask again
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={endRef} />
            </div>
          )}

          {/* Prompt */}
          <div className="llm-compose">
            <textarea
              className="llm-input llm-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for a new line)"
              rows={3}
              disabled={streaming}
              aria-label="Prompt"
            />
            <Buttons buttons={sendButtons} />
          </div>

          <p className="story-disclaimer">
            The server answers one request at a time and the first request after a restart can take up to a minute.
            Answers are capped at about 400 words, and each question is answered on its own.
          </p>

          <p className="llm-admin-link">
            <Link to="/amazing_ai_projects/llm-node/admin">Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LlmNode;
