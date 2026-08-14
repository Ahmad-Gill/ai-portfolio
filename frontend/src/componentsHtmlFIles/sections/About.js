import React from "react";
import useReveal from "../../hooks/useReveal";
import "../../componentCssFiles/about.css";

const PILLARS = [
  {
    label: "AI / ML",
    title: "Applied machine learning",
    description:
      "Designing and fine-tuning models   NLP, generative AI, and computer vision   that solve concrete problems, not just benchmarks.",
  },
  {
    label: "Data Engineering",
    title: "Reliable data platforms",
    description:
      "Building pipelines and retrieval systems (RAG, streaming, ETL) that keep data clean, fresh, and ready for the models that depend on it.",
  },
  {
    label: "MLOps / DevOps",
    title: "Production-grade delivery",
    description:
      "Shipping AI features as real products   containerized, automated with CI/CD, and deployed on Azure   not just notebooks.",
  },
];

const EDUCATION = [
  {
    degree: "MS in Artificial Intelligence",
    school: "Lahore University of Management Sciences (LUMS)",
    period: "2025   2027",
  },
  {
    degree: "BS in Data Science",
    school: "FAST   National University of Computer & Emerging Sciences",
    period: "2021   2025",
    honor: "Gold Medalist · 4.0 CGPA",
  },
];

const CERTIFICATIONS = [
  "Machine Learning, AI, and Data Science (Government of Pakistan)",
  "Foundations: Data, Data, Everywhere (Google)",
  "Prepare Data for Exploration (Google)",
  "Process Data from Dirty to Clean (Google)",
  "Analyze Data to Answer Questions (Google)",
];

function About() {
  const revealRef = useReveal();

  return (
    <section className="section about" id="about" ref={revealRef}>
      <div className="about-grid">
        <div className="section-head reveal about-intro">
          <span className="section-eyebrow">About</span>
          <h2 className="section-title">Engineer at the intersection of AI and data</h2>
          <p className="section-intro">
            I&rsquo;m a Data Scientist &amp; Engineer with hands-on experience in
            Machine Learning, Generative AI, MLOps, and full-stack development.
            I design scalable data solutions, deploy ML models, and build
            automation pipelines on cloud platforms   passionate about turning
            data-driven ideas into products people actually use.
          </p>

          <div className="about-education">
            {EDUCATION.map((item) => (
              <div className="about-education-item" key={item.degree}>
                <span className="about-education-period">{item.period}</span>
                <h4>{item.degree}</h4>
                <span className="about-education-school">{item.school}</span>
                {item.honor && <span className="about-education-honor">{item.honor}</span>}
              </div>
            ))}
          </div>

          <div className="about-certifications">
            <span className="about-certifications-label">Certifications</span>
            <ul>
              {CERTIFICATIONS.map((cert) => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="about-pillars">
          {PILLARS.map((pillar, i) => (
            <div
              className="about-pillar reveal"
              key={pillar.label}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="about-pillar-label">{pillar.label}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
