import React from "react";
import useReveal from "../../hooks/useReveal";
import { experience, notableProjects } from "../../data/experience";
import "../../componentCssFiles/experience.css";

function Experience() {
  const revealRef = useReveal();

  return (
    <section className="section experience" id="experience" ref={revealRef}>
      <div className="section-head reveal">
        <span className="section-eyebrow">Journey</span>
        <h2 className="section-title">Experience</h2>
        <p className="section-intro">
          Roles where I&rsquo;ve shipped ML, data, and cloud infrastructure work.
        </p>
      </div>

      <div className="experience-timeline">
        {experience.map((item, i) => (
          <div
            className="experience-item reveal"
            key={`${item.role}-${item.period}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="experience-marker" aria-hidden="true">
              <span className="experience-dot" />
            </div>
            <div className="experience-card">
              <span className="experience-period">{item.period}</span>
              <h3>{item.role}</h3>
              <span className="experience-org">{item.org}</span>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="notable-projects reveal">
        <h3 className="notable-projects-title">Notable Academic &amp; Research Projects</h3>
        <div className="notable-projects-grid">
          {notableProjects.map((project, i) => (
            <div
              className="notable-project-card reveal"
              key={project.title}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="notable-project-tag">{project.tag}</span>
              <h4>{project.title}</h4>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
