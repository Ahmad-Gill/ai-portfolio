import React, { useState, useRef, useEffect } from "react";
import "../componentCssFiles/chatwidget.css";

const RAG_ASK_URL = `${process.env.REACT_APP_API_URL}amazing_ai_project/docmind/ask/`;
const STT_URL = "https://api.upliftai.org/v1/transcribe/speech-to-text";
const TTS_URL = "https://ap-southeast-1.api.upliftai.org/v1/synthesis/text-to-speech";
const TTS_VOICE_ID = "v_8eelc901";
const TTS_OUTPUT_FORMAT = "MP3_22050_128";
const VOICE_TOKEN = process.env.REACT_APP_VOICE_APP_API_TOKEN;
const MAX_RECORDING_MS = 30000;

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("text"); // "text" | "voice"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const messagesRef = useRef(null);

  const toggle = () => setOpen((v) => !v);

  const askDocMind = async (question) => {
    const res = await fetch(RAG_ASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.answer || data.error || "The RAG service could not answer that.");
    }
    return data.answer || JSON.stringify(data);
  };

  const sendText = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((m) => [...m, { from: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const botText = await askDocMind(question);
      setMessages((m) => [...m, { from: "bot", text: botText }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const transcribeAudio = async (file) => {
    if (!VOICE_TOKEN) {
      throw new Error("Voice API token is not configured (REACT_APP_VOICE_APP_API_TOKEN).");
    }
    const formData = new FormData();
    formData.append("file", file, file.name || "recording.webm");

    const res = await fetch(STT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${VOICE_TOKEN}` },
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Transcription failed.");
    }
    const data = await res.json();
    const text = data.transcript || data.text;
    if (!text) throw new Error("No transcript was returned.");
    return text;
  };

  const synthesizeSpeech = async (text) => {
    if (!VOICE_TOKEN) {
      throw new Error("Voice API token is not configured (REACT_APP_VOICE_APP_API_TOKEN).");
    }
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VOICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voiceId: TTS_VOICE_ID,
        text,
        outputFormat: TTS_OUTPUT_FORMAT,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(errText || "Speech synthesis failed.");
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  const processVoice = async (source) => {
    setLoading(true);
    try {
      setVoiceStatus("Transcribing…");
      const transcript = await transcribeAudio(source);
      setMessages((m) => [...m, { from: "user", text: transcript, dir: "rtl", lang: "ur" }]);

      setVoiceStatus("Thinking…");
      const botText = await askDocMind(transcript);

      setVoiceStatus("Generating voice reply…");
      let audioUrl = null;
      try {
        audioUrl = await synthesizeSpeech(botText);
      } catch (ttsErr) {
        // Still show the text answer even if speech synthesis fails.
      }
      setMessages((m) => [...m, { from: "bot", text: botText, dir: "rtl", lang: "ur", audioUrl }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Error: " + err.message }]);
    } finally {
      setVoiceStatus("");
      setLoading(false);
    }
  };

  const handleVoiceFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    processVoice(file);
  };

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages((m) => [...m, { from: "bot", text: "Microphone recording is not supported by your browser." }]);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        processVoice(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Unable to access microphone. Please check permissions." }]);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (messagesRef.current) {
      // allow DOM to update
      requestAnimationFrame(() => {
        try {
          messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
        } catch (e) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);

  return (
    <div>
      <div className={`chat-widget ${open ? "open" : ""}`}>
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="chat-title">DocMind Chat</div>

            </div>
          </div>
          <button className="chat-close" onClick={toggle}>{open ? "✕" : "💬"}</button>
        </div>

        {open && (
          <div className="chat-body">
            <div className="chat-controls">
              <div className="chat-mode-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "text"}
                  className={`chat-mode-tab ${mode === "text" ? "active" : ""}`}
                  onClick={() => setMode("text")}
                >
                  Type a question
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "voice"}
                  className={`chat-mode-tab ${mode === "voice" ? "active" : ""}`}
                  onClick={() => setMode("voice")}
                >
                  Speak in Urdu
                </button>
              </div>
              <div className="chat-subtitle">
                {mode === "text"
                  ? "Ask questions about your uploaded documents."
                  : "Speak your question in Urdu and get a spoken answer back."}
              </div>
            </div>

            <div className="chat-messages" role="log" ref={messagesRef}>
              {messages.length === 0 && <div className="chat-empty">Ask a question about your uploaded documents.</div>}
              {messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.from}`}>
                  <div className="chat-text" dir={m.dir} lang={m.lang}>{m.text}</div>
                  {m.audioUrl && <audio controls autoPlay src={m.audioUrl} className="chat-audio" />}
                </div>
              ))}
              {loading && mode === "voice" && voiceStatus && (
                <div className="chat-message bot">
                  <div className="chat-text chat-status">{voiceStatus}</div>
                </div>
              )}
            </div>

            {mode === "text" ? (
              <div className="chat-input-row">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendText(); }}
                  disabled={loading}
                />
                <button className="btn blue" onClick={sendText} disabled={loading}>{loading ? "…" : "Send"}</button>
              </div>
            ) : (
              <div className="chat-voice-row">
                <button
                  type="button"
                  className={`chat-mic-btn ${recording ? "recording" : ""}`}
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  disabled={loading && !recording}
                  aria-pressed={recording}
                >
                  <span className="chat-mic-dot" aria-hidden />
                  {recording ? "Stop & send" : "Press to speak"}
                </button>
                <label className="chat-voice-upload">
                  or upload
                  <input type="file" accept="audio/*" onChange={handleVoiceFileChange} disabled={loading || recording} />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {!open && (
        <button className="chat-fab" onClick={toggle} aria-label="Open chat">💬</button>
      )}
    </div>
  );
}

export default ChatWidget;
