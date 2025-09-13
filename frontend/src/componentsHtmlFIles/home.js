import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Buttons from "./Button";
import "../componentCssFiles/home.css";

function Home() {
  const navigate = useNavigate();

  const heroButtons = [
    // { text: "Contact Me", href: "#contact", type: "blue" },
    // { text: "View Portfolio →", href: "#portfolio", type: "teal" }
  ];

  // List of project categories
  const projectOptions = [
    // "LUMS Academics",
    // "FAST Academics",
    "Amazing AI Projects"
  ];

  const [selectedProject, setSelectedProject] = useState("");

  const handleProjectChange = (e) => {
    const project = e.target.value;
    setSelectedProject(project);

    // Navigate to the projects page dynamically
    // encodeURIComponent ensures spaces or special characters work in URL
    navigate(`/projects/${encodeURIComponent(project)}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <h3>Marhaban I'm</h3>
          <h1 className="name">Muhammad Ahmad</h1>
          <p className="tagline">💡 Data Scientist & AI Specialist</p>
          <p className="description">
            From exploration in 2021 to mastering data science. I now apply deep
            learning, NLP, and advanced algorithms to deliver impactful insights,
            shaping the future of AI and technology.
          </p>

          <Buttons buttons={heroButtons} />
        </div>

        <div className="hero-image">
          <img src="/1.jpg" alt="Profile" />
        </div>
      </div>

      {/* Explore Projects Section */}
      <div className="explore-projects">
        <h2>Explore Projects</h2>
        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="projects-dropdown"
        >
          <option disabled value="">
            Select a project
          </option>
          {projectOptions.map((project, index) => (
            <option key={index} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Home;
