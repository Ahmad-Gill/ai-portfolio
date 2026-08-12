import React, { useState, useRef, useEffect } from "react";
import "../componentCssFiles/chatwidget.css";

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  const toggle = () => setOpen((v) => !v);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    const userMsg = { from: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.ahmadgill.com/api/amazing_ai_project/docmind/ask/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        }
      );
      const data = await res.json();
      const botText = (data && data.answer) || JSON.stringify(data) || "No answer";
      const botMsg = { from: "bot", text: botText };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Error: " + err.message }]);
    } finally {
      setLoading(false);
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
            <div className="chat-controls" style={{ padding: '6px 0' }}>
              <div className="chat-subtitle">Ask questions about your uploaded documents.</div>
            </div>

            <div className="chat-messages" role="log" ref={messagesRef}>
              {messages.length === 0 && <div className="chat-empty">Ask a question about your uploaded documents.</div>}
              {messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.from}`}>
                  <div className="chat-text">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                disabled={loading}
              />
              <button className="btn blue" onClick={send} disabled={loading}>{loading ? "…" : "Send"}</button>
            </div>
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
