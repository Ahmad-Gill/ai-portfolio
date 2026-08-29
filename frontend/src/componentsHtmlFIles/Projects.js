import React from "react";
import "../componentCssFiles/project.css";
import ProjectCardLink from "./ProjectCardLink";

// Import all project data files
import { amazingAI, projectRoutes } from "../data/amazingAI";
import { lumsProjects } from "../data/lumsProjects";

function Projects({ projectName }) {
  const projectDataMap = {
    "Amazing AI Projects": amazingAI,
    "LUMS Academics": lumsProjects,
  };

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
          <ProjectCardLink
            key={proj.name}
            to={projectRoutes[proj.name] || "/"} // dynamically route based on project name
            notice={proj.notice}
            className="project-card"
          >
            <img src={proj.image} alt={proj.name} className="project-image" />
            <h2>{proj.name}</h2>
            <p>Explore this AI project in detail.</p>
          </ProjectCardLink>
        ))}
      </div>
    </div>
  );
}

export default Projects;
