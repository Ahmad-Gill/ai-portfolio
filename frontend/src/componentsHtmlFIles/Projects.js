import React from "react";
import "../componentCssFiles/project.css"; // Reuse your CSS
import Buttons from "./Button"; // Optional, in case you want buttons here

function Projects({ projectName }) {
  // Example buttons for project page
  const projectButtons = [
    { text: "Back to Home", href: "/", type: "blue" },
    { text: "Contact Me", href: "#contact", type: "teal" }
  ];

  return (
    <div className="projects-page">
      {/* Hero-like header */}
      <div className="projects-header">
        <h1>Projects: {projectName}</h1>
        <p>
          Here you can showcase all the projects related to <strong>{projectName}</strong>.
        </p>
      </div>

      {/* Optional Buttons */}
      <div className="buttons">
        <Buttons buttons={projectButtons} />
      </div>

      {/* Project details / cards */}
      <div className="projects-list">
        <p>Project content will go here. You can create cards or sections for each project.</p>
      </div>
    </div>
  );
}

export default Projects;
