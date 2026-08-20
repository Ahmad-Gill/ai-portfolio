import React, { useEffect, useState } from "react";
import "../../componentCssFiles/urduaudiorag.css";
import Animation from "../Animation";

const BASE_API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const VOICE_TOKEN = process.env.REACT_APP_VOICE_APP_API_TOKEN;

const STT_URL = "https://api.upliftai.org/v1/transcribe/speech-to-text";
const RAG_ASK_URL = `${BASE_API_URL}/amazing_ai_project/docmind/ask/`;
const TTS_URL = "https://ap-southeast-1.api.upliftai.org/v1/synthesis/text-to-speech";
const TTS_VOICE_ID = "v_8eelc901";
const TTS_OUTPUT_FORMAT = "MP3_22050_128";

const STAGES = {
  IDLE: "idle",
  TRANSCRIBING: "transcribing",
  ASKING: "asking",
  SYNTHESIZING: "synthesizing",
};

const MAX_RECORDING_MS = 30000;

function UrduAudioRag() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerAudioUrl, setAnswerAudioUrl] = useState("");
  const [stage, setStage] = useState(STAGES.IDLE);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (answerAudioUrl) URL.revokeObjectURL(answerAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetOutputs = () => {
    setError(null);
    setTranscript("");
    setAnswer("");
    if (answerAudioUrl) URL.revokeObjectURL(answerAudioUrl);
    setAnswerAudioUrl("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetOutputs();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported by your browser.");
      return;
    }

    try {
      resetOutputs();
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
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const newUrl = URL.createObjectURL(blob);
        setAudioFile(blob);
        setAudioUrl(newUrl);

        // Speak, and the audio is sent automatically once recording stops.
        processAudio(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      setError("Unable to access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
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

  const askDocMind = async (question) => {
    const res = await fetch(RAG_ASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.answer || data.error || "The RAG service could not answer that question.");
    }
    return data.answer;
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

  const processAudio = async (source) => {
    if (!source) {
      setError("Please choose or record an Urdu audio clip first.");
      return;
    }
    setError(null);
    setTranscript("");
    setAnswer("");
    if (answerAudioUrl) URL.revokeObjectURL(answerAudioUrl);
    setAnswerAudioUrl("");

    try {
      setStage(STAGES.TRANSCRIBING);
      const text = await transcribeAudio(source);
      setTranscript(text);

      setStage(STAGES.ASKING);
      const ragAnswer = await askDocMind(text);
      setAnswer(ragAnswer);

      setStage(STAGES.SYNTHESIZING);
      const spokenUrl = await synthesizeSpeech(ragAnswer);
      setAnswerAudioUrl(spokenUrl);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setStage(STAGES.IDLE);
    }
  };

  const handleProcess = () => processAudio(audioFile);

  const busy = stage !== STAGES.IDLE;
  const stageLabel = {
    [STAGES.TRANSCRIBING]: "Transcribing Urdu audio…",
    [STAGES.ASKING]: "Asking DocMind…",
    [STAGES.SYNTHESIZING]: "Synthesizing the answer…",
  }[stage];

  return (
    <div className="uar-container">
      {busy && <Animation fullscreen />}
      <div className="uar-card">
        <div className="uar-header">
          <div className="icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1>Urdu Audio RAG</h1>
            <div className="subtitle">Speak in Urdu, get a spoken answer from DocMind.</div>
          </div>
        </div>

        <div className="uar-body">
          <div className="uar-section">
            <h2>1. Provide Urdu audio</h2>

            <div className="uar-mic-row">
              <button
                type="button"
                className={`uar-mic-btn ${recording ? "recording" : ""}`}
                onClick={recording ? handleStopRecording : handleStartRecording}
                disabled={busy && !recording}
                aria-pressed={recording}
              >
                <span className="uar-mic-dot" aria-hidden />
                {recording ? "Stop & send" : "Press to speak"}
              </button>
              <span className="help">
                {recording ? "Listening… press stop when you're done." : "Or choose a file below."}
              </span>
            </div>

            <label className="uar-file-label">
              Choose audio file
              <input type="file" accept="audio/*" onChange={handleFileChange} disabled={recording} />
            </label>

            {audioUrl && (
              <div className="uar-preview">
                <audio controls src={audioUrl} />
              </div>
            )}

            <div className="uar-actions">
              <button className="btn blue" onClick={handleProcess} disabled={busy || recording || !audioFile}>
                {busy ? stageLabel : "Transcribe, Ask & Speak"}
              </button>
            </div>

            {error && <p className="error">{error}</p>}
          </div>

          {transcript && (
            <div className="uar-section">
              <h2>2. Transcript</h2>
              <div className="uar-box" dir="rtl" lang="ur">{transcript}</div>
            </div>
          )}

          {answer && (
            <div className="uar-section">
              <h2>3. DocMind answer</h2>
              <div className="uar-box" dir="rtl" lang="ur">{answer}</div>
            </div>
          )}

          {answerAudioUrl && (
            <div className="uar-section">
              <h2>4. Spoken answer</h2>
              <audio controls autoPlay src={answerAudioUrl} className="uar-result-audio" />
              <a className="download-link" href={answerAudioUrl} download="urdu-audio-rag-answer.mp3">
                Download audio
              </a>
            </div>
          )}

          <div className="uar-section">
            <h3>About this pipeline</h3>
            <p className="help">
              Your audio is transcribed to Urdu text, the text is sent to the DocMind RAG endpoint as a
              question, and the answer is synthesized back into speech — a full voice-in, voice-out RAG loop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UrduAudioRag;
