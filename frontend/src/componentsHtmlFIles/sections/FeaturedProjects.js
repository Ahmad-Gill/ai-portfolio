import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../../hooks/useReveal";
import { amazingAI, projectRoutes } from "../../data/amazingAI";
import "../../componentCssFiles/featuredProjects.css";

function FeaturedProjects() {
  const revealRef = useReveal();

  return (
    <section className="section featured-projects" id="projects" ref={revealRef}>
      <div className="section-head reveal">
        <span className="section-eyebrow">Selected Work</span>
        <h2 className="section-title">Featured AI Projects</h2>
        <p className="section-intro">
          Applied AI tools I&rsquo;ve shipped   NLP, generative models, speech, and
          retrieval-augmented systems you can try live right now.
        </p>
      </div>

      <div className="featured-projects-grid">
        {amazingAI.map((proj, i) => (
          <Link
            key={proj.name}
            to={projectRoutes[proj.name] || "/"}
            className="featured-project-card reveal"
            style={{ transitionDelay: `${(i % 6) * 70}ms` }}
          >
            <div className="featured-project-media">
              <img src={proj.image} alt={proj.name} loading="lazy" />
            </div>
            <div className="featured-project-body">
              <h3>{proj.name}</h3>
              <p>{proj.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="featured-projects-footer reveal">
        <Link to="/projects/Amazing%20AI%20Projects" className="btn ghost">
          View all AI projects
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProjects;
