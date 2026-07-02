import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Buttons from "./Button";
import "../componentCssFiles/home.css";
const publicUrl = process.env.PUBLIC_URL;
const BASE_URL = process.env.REACT_APP_PUBLIC_URL || "";
const assets = {
  logo1: `${publicUrl}/logo1.png`,
  logo3: `${publicUrl}/logo3.png`,
  image1: `${publicUrl}/1.jpg`,
  image2: `${publicUrl}/2.jpg`,
  animation: `${publicUrl}/Animation.json`,
  lottie: `${publicUrl}/Animation.lottie`,
};

function Home() {
  const navigate = useNavigate();

  const heroButtons = [
    {
      text: "Explore AI Projects",

      href: `${BASE_URL}/projects/Amazing%20AI%20Projects`,

      type: "teal",
    },

    {
      text: "Download CV",

      href: "#",

      type: "blue",
    },
  ];

  const projectOptions = ["Amazing AI Projects"];
  const [selectedProject, setSelectedProject] = useState("");

  const handleProjectChange = (e) => {
    const project = e.target.value;
    setSelectedProject(project);
    navigate(`/projects/${encodeURIComponent(project)}`);
  };

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-copy">
          <small className="eyebrow">
            AI Portfolio • Data Science • Innovation
          </small>
          <h1 className="hero-title">Muhammad Ahmad</h1>
          <p className="hero-subtitle">
            I build intelligent systems with data science, NLP, and modern AI
            solutions that turn ideas into real-world impact.
          </p>

          <div className="hero-badges">
            <span>AI Specialist</span>
            <span>Data Scientist</span>
            <span>Deep Learning</span>
          </div>

          <div className="hero-buttons">
            <Buttons buttons={heroButtons} />
          </div>

          <div className="hero-stats">
            <div>
              <strong>5+</strong>
              <span>Years of Practice</span>
            </div>
            <div>
              <strong>12+</strong>
              <span>AI Projects</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Client Focus</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-card">
            <img src={assets.image1} alt="Profile" />
          </div>
        </div>
      </div>

      <section className="explore-projects">
        <div className="explore-copy">
          <p className="section-label">Featured Work</p>
          <h2>Explore my latest portfolio</h2>
          <p>
            Choose a project category to jump straight into examples of my
            latest AI and data science solutions.
          </p>
        </div>

        <div className="explore-actions">
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
      </section>
    </div>
  );
}

export default Home;
