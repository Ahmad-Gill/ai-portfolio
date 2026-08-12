import React from "react";
import { useNavigate } from "react-router-dom";
import "../../componentCssFiles/project.css";
import "../../componentCssFiles/toolbox.css";

const publicUrl = process.env.PUBLIC_URL || "";

const tools = [
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Upload an image and convert it into a PDF.",
    active: true,
    path: "/amazing_ai_projects/toolbox/image-to-pdf",
    image: `${publicUrl}/Amazing AI projects/imageToPDF.png`,
  },
  {
    id: "text-enhancer",
    title: "Text Enhancer",
    description: "Coming soon: a smart writing improvement tool.",
    active: false,
    image: `${publicUrl}/Amazing AI projects/multi_translation.jpg`,
  },
  {
    id: "audio-summary",
    title: "Audio Summary",
    description: "Coming soon: summarize audio recordings into notes.",
    active: false,
    image: `${publicUrl}/speach.png`,
  },
    {
    id: "audio-summary",
    title: "Audio Summary",
    description: "Coming soon: summarize audio recordings into notes.",
    active: false,
    image: `${publicUrl}/speach.png`,
  },
];

function Toolbox() {
  const navigate = useNavigate();

  const handleToolClick = (tool) => {
    if (!tool.active) return;
    navigate(tool.path);
  };

  return (
    <div className="projects-page toolbox-page">
      <div className="projects-header">
        <h1>AI Tool Box</h1>
        <p>Choose a tool to open its dedicated page.</p>
      </div>

      <div className="projects-list">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`project-card toolbox-card-button ${tool.active ? "" : "disabled"}`}
            onClick={() => handleToolClick(tool)}
            disabled={!tool.active}
          >
            <div className="toolbox-card-image">
              <img src={tool.image} alt={tool.title} />
            </div>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Toolbox;
