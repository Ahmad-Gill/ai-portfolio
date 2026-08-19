import React from "react";
import useReveal from "../../hooks/useReveal";
import "../../componentCssFiles/about.css";

const PILLARS = [
  {
    label: "Data Science",
    title: "Statistical & exploratory analysis",
    summary:
      "Turning raw, messy data into clear insights through rigorous analysis and experimentation.",
    highlights: ["Exploratory data analysis", "A/B testing & experimentation"],
  },
  {
    label: "AI / ML",
    title: "Applied machine learning",
    summary:
      "Designing and fine-tuning models that solve concrete problems, not just benchmarks.",
    highlights: [
      "Building & training models",
      "Fine-tuning large language models",
      "Model deployment & serving",
      "NLP, generative AI & computer vision",
    ],
  },
  {
    label: "Data Engineering",
    title: "Reliable data platforms",
    summary:
      "Building pipelines and retrieval systems that keep data clean, fresh, and dependable.",
    highlights: ["RAG & streaming pipelines", "Production-grade ETL"],
  },
  {
    label: "MLOps / DevOps",
    title: "Production-grade delivery",
    summary: "Shipping AI features as real products, not just notebooks.",
    highlights: ["Containerized CI/CD delivery", "Deployed & monitored on Azure"],
  },
];

const TOOLKIT = [
  { label: "Python", active: true },
  { label: "PyTorch" },
  { label: "LangChain", active: true },
  { label: "Azure" },
  { label: "Docker" },
  { label: "SQL" },
  { label: "RAG Systems", active: true },
  { label: "FastAPI" },
];

const EDUCATION = [
  {
    abbr: "MS",
    field: "Artificial Intelligence",
    school: "Lahore University of Management Sciences (LUMS)",
    period: "2025 — 2027",
  },
  {
    abbr: "BS",
    field: "Data Science",
    school: "FAST — National University of Computer & Emerging Sciences",
    period: "2021 — 2025",
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
      <span className="about-glow about-glow-1" aria-hidden="true" />
      <span className="about-glow about-glow-2" aria-hidden="true" />

      <div className="about-grid">
        <div className="section-head reveal about-intro">
          <span className="section-eyebrow">About</span>
          <h2 className="section-title">
            Engineer at the intersection of <span className="about-title-highlight">AI and data</span>
          </h2>
          <p className="section-intro">
            I&rsquo;m a Data Scientist &amp; Engineer with hands-on experience in
            Machine Learning, Generative AI, MLOps, and full-stack development.
            I design scalable data solutions, deploy ML models, and build
            automation pipelines on cloud platforms   passionate about turning
            data-driven ideas into products people actually use.
          </p>

          <div className="about-toolkit">
            <span className="about-toolkit-label">Core Toolkit</span>
            <div className="about-toolkit-chips">
              {TOOLKIT.map((tool) => (
                <span
                  className={`about-chip ${tool.active ? "is-active" : ""}`}
                  key={tool.label}
                >
                  {tool.label}
                </span>
              ))}
            </div>
          </div>

          <div className="about-education">
            {EDUCATION.map((item) => (
              <div className="about-education-item" key={item.field}>
                <span className="about-education-period">{item.period}</span>
                <h4>
                  <span className="about-degree-abbr">{item.abbr}</span> in {item.field}
                </h4>
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
              data-index={`0${i + 1}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="about-pillar-label">{pillar.label}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.summary}</p>
              <ul className="about-pillar-highlights">
                {pillar.highlights.map((point) => (
                  <li key={point}>
                    <span className="about-check" aria-hidden="true">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
