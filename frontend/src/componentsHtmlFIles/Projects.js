import React from "react";
import "../componentCssFiles/project.css";

// Import all project data files
import { amazingAI } from "../data/amazingAI";
import { lumsProjects } from "../data/lumsProjects";

function Projects({ projectName }) {
  // Map projectName to the corresponding JS file
  const projectDataMap = {
    "Amazing AI Projects": amazingAI,
    "LUMS Academics": lumsProjects
  };

  // Get projects for this category
  const projects = projectDataMap[projectName] || [];

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
          <div key={proj.name} className="project-card">
            <img src={proj.image} alt={proj.name} className="project-image" />
            <h2>{proj.name}</h2>
            <p>{proj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
