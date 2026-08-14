import React, { useEffect, useState } from "react";
import "../../componentCssFiles/speechstudio.css";
import Buttons from "../Button";
import Animation from "../Animation";

const BASE_API_URL = (process.env.REACT_APP_API_URL || "https://api.ahmadgill.com").replace(/\/+$/, "");
const SPEECH_API_URL = `${BASE_API_URL}/amazing_ai_project/speechToText/`;

function SpeechStudio() {
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [responseAudioUrl, setResponseAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (responseAudioUrl) URL.revokeObjectURL(responseAudioUrl);
    };
  }, [audioUrl, responseAudioUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);
    setRecordedBlob(null);
    setResponseAudioUrl("");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported by your browser.");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setRecordedBlob(blob);
        setSelectedFile(null);
        setResponseAudioUrl("");
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setResponseAudioUrl("");

      window.setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 6000);
    } catch (err) {
      setError("Unable to access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const convertToWav = async (blob) => {
    if (!blob) return null;
    if (blob.type.includes("wav") || blob.type.includes("wave")) {
      return blob;
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBuffer = encodeWav(audioBuffer);
      return new Blob([wavBuffer], { type: "audio/wav" });
    } catch (err) {
      setError("Unable to convert audio to WAV format. Sending original audio instead.");
      return blob;
    }
  };

  const encodeWav = (audioBuffer) => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    const blockAlign = numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + samples * blockAlign);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i += 1) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i += 1, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * blockAlign, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples * blockAlign, true);

    if (numberOfChannels === 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      for (let i = 0, offset = 44; i < samples; i += 1) {
        floatTo16BitPCM(view, offset, left.subarray(i, i + 1));
        offset += 2;
        floatTo16BitPCM(view, offset, right.subarray(i, i + 1));
        offset += 2;
      }
    } else {
      const input = audioBuffer.getChannelData(0);
      floatTo16BitPCM(view, 44, input);
    }

    return view;
  };

  const handleSubmit = async () => {
    const sourceAudio = selectedFile || recordedBlob;
    if (!prompt.trim() && !sourceAudio) {
      setError("Please provide text or upload/record audio before submitting.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponseAudioUrl("");

    try {
      const wavBlob = await convertToWav(sourceAudio);
      const formData = new FormData();
      formData.append("text", prompt.trim());

      if (wavBlob) {
        formData.append("audio", wavBlob, "speech.wav");
      }

      const response = await fetch(SPEECH_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Submission failed. Please try again.");
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("audio") || contentType.includes("octet-stream")) {
        const audioBlob = await response.blob();
        const urlObject = URL.createObjectURL(audioBlob);
        setResponseAudioUrl(urlObject);
      } else {
        const json = await response.json();
        if (json.audio) {
          setResponseAudioUrl(json.audio);
        } else if (json.audio_url) {
          setResponseAudioUrl(json.audio_url);
        } else {
          throw new Error("The server returned an unexpected response.");
        }
      }
    } catch (err) {
      setError(err.message || "Unable to process audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadedSource = selectedFile || recordedBlob;
  const previewLabel = recordedBlob ? "Recorded clip" : selectedFile ? "Uploaded clip" : "No audio selected";

  const heroButtons = [
    {
      text: loading ? "Processing…" : "Generate Audio",
      type: "teal",
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="project-details-page">
      {loading && <Animation fullscreen />}
      <div className="project-details-card speechstudio-card">
        <h1>Speech Studio</h1>
        <p>
          Upload a short audio file or record your voice, add instructions, and
          receive a polished AI-generated audio response that you can preview
          and download.
        </p>

        <div className="speechstudio-form">
          <label>
            Instruction or text prompt
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the text prompt or instructions for the audio output..."
              rows={4}
            />
          </label>

          <div className="speechstudio-input-row">
            <label className="file-upload-label">
              Upload audio file
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </label>
            <div className="record-controls">
              <button
                type="button"
                className={`btn blue ${recording ? "recording" : ""}`}
                onClick={recording ? handleStopRecording : handleStartRecording}
              >
                {recording ? "Stop recording" : "Record voice (6s)"}
              </button>
            </div>
          </div>

          <div className="speechstudio-preview">
            <span>{previewLabel}</span>
            {uploadedSource && audioUrl && (
              <audio controls src={audioUrl} />
            )}
          </div>

          <Buttons buttons={heroButtons} />
          {error && <p className="error">{error}</p>}
        </div>

        {responseAudioUrl && (
          <div className="speechstudio-result">
            <h2>Audio Output</h2>
            <p>Preview the AI-generated audio and download it as a WAV file.</p>
            <audio controls src={responseAudioUrl} className="result-audio" />
            <a
              className="download-link"
              href={responseAudioUrl}
              download="speech-studio-output.wav"
            >
              Download result
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeechStudio;
