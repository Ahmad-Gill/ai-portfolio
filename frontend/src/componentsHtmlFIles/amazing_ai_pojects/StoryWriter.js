import React, { useEffect, useRef, useState } from "react";
import "../../componentCssFiles/aimythbuster.css";
import "../../componentCssFiles/storywriter.css";
import Buttons from "../Button";

// Use .env variable for API URL
const API_URL = process.env.REACT_APP_API_URL;

// Generation settings shown in the settings table. Limits match the backend.
const SETTINGS = [
  {
    key: "max_new_tokens",
    label: "max_new_tokens",
    min: 1,
    max: 512,
    step: 1,
    defaultValue: 256,
    help: "Controls story length. The default is 256 and the maximum is 512.",
  },
  {
    key: "temperature",
    label: "temperature",
    min: 0.1,
    max: 2,
    step: 0.1,
    defaultValue: 0.8,
    help: "Higher values give more random stories, lower values more predictable ones.",
  },
  {
    key: "top_p",
    label: "top_p",
    min: 0.1,
    max: 1,
    step: 0.05,
    defaultValue: 0.9,
    help: "Only picks from the most likely words that add up to this probability. Lower keeps the story focused.",
  },
];

const DEFAULTS = Object.fromEntries(SETTINGS.map((s) => [s.key, s.defaultValue]));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function StoryWriter() {
  const [prompt, setPrompt] = useState("Tom found a box");
  const [settings, setSettings] = useState(DEFAULTS);
  // Kept as separate chunks so each new piece can fade in as it arrives
  const [chunks, setChunks] = useState([]);
  const [sentPrompt, setSentPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const controllerRef = useRef(null);
  const gearRef = useRef(null);
  const storyEndRef = useRef(null);

  // Stop any running stream when leaving the page
  useEffect(() => () => controllerRef.current?.abort(), []);

  // Keep the newest text in view while it is being written
  useEffect(() => {
    if (streaming) storyEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [chunks, streaming]);

  const isCustom = SETTINGS.some((s) => settings[s.key] !== s.defaultValue);

  // Snap every value into range, close the pop-up and return focus to the gear
  const closeSettings = () => {
    setSettings((prev) =>
      Object.fromEntries(SETTINGS.map((s) => [s.key, clamp(prev[s.key], s.min, s.max)]))
    );
    setShowSettings(false);
    gearRef.current?.focus();
  };

  // Close the pop-up with Escape
  useEffect(() => {
    if (!showSettings) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSettings]);

  const updateSetting = (setting, raw) => {
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setSettings((prev) => ({ ...prev, [setting.key]: value }));
  };

  // Snap typed values back into range when the field loses focus
  const commitSetting = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting.key]: clamp(prev[setting.key], setting.min, setting.max),
    }));
  };

  const handleStop = () => controllerRef.current?.abort();

  const handleWriteClick = async (text = prompt) => {
    if (!text.trim()) {
      setError("Please enter the start of your story first.");
      return;
    }

    const body = { prompt: text.trim(), stream: true };
    SETTINGS.forEach((s) => {
      body[s.key] = clamp(settings[s.key], s.min, s.max);
    });

    const controller = new AbortController();
    controllerRef.current = controller;
    setStreaming(true);
    setError(null);
    setChunks([]);
    setSentPrompt(body.prompt);
    setCopied(false);

    try {
      const response = await fetch(
        `${API_URL}amazing_ai_project/create-story/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to fetch API");
      }

      // Read the story chunk by chunk as the model writes it
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) setChunks((prev) => [...prev, chunk]);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  };

  const story = chunks.join("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; nothing else to do
    }
  };

  // Button config
  const heroButtons = streaming
    ? [{ text: "Stop", type: "blue", onClick: handleStop }]
    : [{ text: "Write Story", type: "teal", onClick: () => handleWriteClick() }];

  return (
    <div className="project-details-page mythbuster-page story-page">
      <div className="mythbuster-card">
        <div className="mythbuster-header">
          <span className="mythbuster-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19.5V5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7h6M8 11h4" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h1>Create Your Own Story</h1>
            <p className="mythbuster-subtitle">
              Type the first few words and a small language model I trained from scratch writes the rest.
            </p>
          </div>
        </div>

        <div className="mythbuster-body">
          {/* Prompt, settings gear & Button */}
          <div className="aimythbuster-form">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !streaming) handleWriteClick();
              }}
              placeholder="Once upon a time..."
              disabled={streaming}
              required
            />
            <button
              type="button"
              ref={gearRef}
              className={`story-gear-btn${isCustom ? " is-custom" : ""}`}
              onClick={() => setShowSettings(true)}
              disabled={streaming}
              aria-label="Story settings"
              title="Story settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeLinejoin="round" />
              </svg>
            </button>
            <Buttons buttons={heroButtons} />
          </div>

          {/* Settings pop-up */}
          {showSettings && (
            <div className="story-settings-backdrop" role="presentation" onClick={closeSettings}>
              <div
                className="story-settings-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-settings-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="story-settings-head">
                  <h2 id="story-settings-title">Story settings</h2>
                  <button type="button" className="story-close-btn" onClick={closeSettings} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="story-settings-list">
                  {SETTINGS.map((s, i) => (
                    <div className="story-setting" key={s.key}>
                      <div className="story-setting-top">
                        <code>{s.label}</code>
                        <input
                          type="number"
                          min={s.min}
                          max={s.max}
                          step={s.step}
                          value={settings[s.key]}
                          onChange={(e) => updateSetting(s, e.target.value)}
                          onBlur={() => commitSetting(s)}
                          aria-label={s.label}
                        />
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={clamp(settings[s.key], s.min, s.max)}
                        onChange={(e) => updateSetting(s, e.target.value)}
                        aria-label={`${s.label} slider`}
                        autoFocus={i === 0}
                      />
                      <p className="story-setting-help">{s.help}</p>
                    </div>
                  ))}
                </div>

                <div className="story-settings-foot">
                  <button type="button" className="story-link-btn" onClick={() => setSettings(DEFAULTS)}>
                    Reset to defaults
                  </button>
                  <button type="button" className="btn teal" onClick={closeSettings}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          {/* Story output, laid out like a chat thread */}
          {(streaming || story) && (
            <div className="story-thread">
              <div className="story-user-msg">
                <p>{sentPrompt}</p>
              </div>

              <div className="story-reply">
                <div className="story-prose" aria-live="polite" aria-busy={streaming}>
                  {story ? (
                    <p>
                      {chunks.map((chunk, i) => (
                        <span key={i} className={i === 0 ? "story-chunk story-opening" : "story-chunk"}>
                          {chunk}
                        </span>
                      ))}
                      {streaming && <span className="story-cursor" aria-hidden="true" />}
                    </p>
                  ) : (
                    <p className="story-thinking">
                      Writing
                      <span className="story-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </p>
                  )}
                </div>

                {!streaming && story && (
                  <div className="story-actions">
                    <button type="button" className="story-action-btn" onClick={handleCopy}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        {copied ? (
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <>
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
                          </>
                        )}
                      </svg>
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button type="button" className="story-action-btn" onClick={() => handleWriteClick(sentPrompt)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Write again
                    </button>
                  </div>
                )}
                <div ref={storyEndRef} />
              </div>

              <p className="story-disclaimer">
                Written by a small model trained from scratch, so stories may wander or stop mid-sentence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryWriter;
