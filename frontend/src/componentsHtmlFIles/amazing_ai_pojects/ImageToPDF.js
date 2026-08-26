import React, { useEffect, useState } from "react";
import "../../componentCssFiles/toolbox.css";
import Buttons from "../Button";
import Animation from "../Animation";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/g, "");
const IMAGE_TO_PDF_URL = `${API_BASE_URL}/amazing_ai_project/image-to-pdf/`;

function ImageToPDF() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setPdfUrl("");
    setImageFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError("Please select an image file to convert.");
      return;
    }

    setError(null);
    setPdfUrl("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(IMAGE_TO_PDF_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Conversion failed. Please try again.");
      }

      const data = await response.json();
      if (!data?.pdf) {
        throw new Error("Unexpected response from API.");
      }

      setPdfUrl(data.pdf);
    } catch (err) {
      setError(err.message || "Failed to convert image to PDF.");
    } finally {
      setLoading(false);
    }
  };

  const heroButtons = [
    {
      text: loading ? "Converting…" : "Convert Image to PDF",
      type: "teal",
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="project-details-page imagetopdf-page">
      {loading && <Animation fullscreen />}
      <div className="imagetopdf-card">
        <div className="imagetopdf-header">
          <span className="imagetopdf-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V5A1.5 1.5 0 0 1 6 3.5Z" strokeLinejoin="round" />
              <path d="M14 3.5V8h4" strokeLinejoin="round" />
              <path d="M8 15.5l2-3 1.6 2 1.4-2 2 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1>Image to PDF Converter</h1>
            <p className="imagetopdf-subtitle">Upload an image file and generate a downloadable PDF document using the AI toolbox API.</p>
          </div>
        </div>

        <div className="imagetopdf-body">
          <div className="toolbox-form">
            <label className="file-upload-label">
              Upload image file
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {previewUrl && (
              <div className="toolbox-preview">
                <img src={previewUrl} alt="Selected preview" />
              </div>
            )}

            <Buttons buttons={heroButtons} />
            {error && <p className="error">{error}</p>}

            {pdfUrl && (
              <div className="toolbox-result">
                <h2>PDF ready</h2>
                <p>Your image has been converted successfully.</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                  Download PDF
                </a>
                <div className="toolbox-pdf-preview">
                  <iframe
                    src={pdfUrl}
                    title="Generated PDF preview"
                    frameBorder="0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageToPDF;
