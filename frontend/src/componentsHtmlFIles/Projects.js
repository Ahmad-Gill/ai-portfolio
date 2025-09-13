import React from "react";
import { Link } from "react-router-dom";
import "../componentCssFiles/project.css";

// Import all project data files
import { amazingAI } from "../data/amazingAI";
import { lumsProjects } from "../data/lumsProjects";

function Projects({ projectName }) {
  const projectDataMap = {
    "Amazing AI Projects": amazingAI,
    "LUMS Academics": lumsProjects,
  };

  const projects = projectDataMap[projectName] || [];

  // Map project names to their detail page paths
  const projectRoutes = {
    "AI Chatbot": "/ai-chatbot",
    "Generate Abstract Painting": "/amazing_ai_projects/AbstractArt",
    "Multi Translation": "/amazing_ai_projects/multi-translation",
    "AI Myth Buster": "/amazing_ai_projects/AIMythBuster",
    // add more if needed
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>{projectName}</h1>
        <p>
          Here you can showcase all the projects related to <strong>{projectName}</strong>.
        </p>
      </div>

      <div className="projects-list">
        {projects.length === 0 && <p>No projects found for this category.</p>}
        {projects.map((proj) => (
          <Link
            key={proj.name}
            to={projectRoutes[proj.name] || "/"} // dynamically route based on project name
            className="project-card"
          >
            <img src={proj.image} alt={proj.name} className="project-image" />
            <h2>{proj.name}</h2>
            <p>{proj.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Projects;
