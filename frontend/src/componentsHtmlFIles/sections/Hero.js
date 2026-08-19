import React, { useEffect, useState } from "react";
import Buttons from "../Button";
import { getPublicAsset } from "../../utils/publicAsset";
import "../../componentCssFiles/hero.css";

const BASE_URL = (process.env.REACT_APP_PUBLIC_URL || "").replace(/\/+$/, "");
const PROFILE_IMAGE = getPublicAsset("1.jpg");

const STATS = [
  { value: "2+", label: "yrs experience" },
  { value: "14+", label: "AI/ML projects" },
  { value: "7", label: "live tools" },
];

const ROLES = ["intelligent systems", "ML pipelines", "data platforms", "AI products"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function RoleCycler() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let swapTimeout;
    const interval = setInterval(() => {
      setVisible(false);
      swapTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, 320);
    }, 2600);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimeout);
    };
  }, []);

  return (
    <span className={`role-cycler-word ${visible ? "is-visible" : ""}`}>
      {ROLES[index]}
    </span>
  );
}

function Hero() {
  const heroButtons = [
    {
      text: "Explore AI Projects",
      href: `${BASE_URL}/projects/Amazing%20AI%20Projects`,
      type: "teal",
    },
    {
      text: "Download CV",
      href: getPublicAsset("CV/MUHAMMAD AHMAD.pdf"),
      type: "blue",
      target: "_blank",
    },
  ];

  return (
    <section className="hero" id="home">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg-grid" />
        <div className="hero-bg-lines" />
        <span className="hero-glow hero-glow-1" />
        <span className="hero-glow hero-glow-2" />
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <span className="section-eyebrow hero-eyebrow">
            AI Engineer <span className="eyebrow-dot" aria-hidden="true" /> ML{" "}
            <span className="eyebrow-dot" aria-hidden="true" /> Data Engineer{" "}
            <span className="eyebrow-dot" aria-hidden="true" /> Data Scientist{" "}
            <span className="eyebrow-dot" aria-hidden="true" /> MLOps
          </span>

           <h1 className="hero-title" aria-label="Muhammad Ahmad">
            <span className="hero-name hero-name-primary">Muhammad</span>
            <span className="hero-name hero-name-accent">Ahmad</span>
          </h1>

          <p className="hero-role-line">
            I build <RoleCycler />
          </p>

          <p className="hero-subtitle">
            I design and ship applied AI systems   from NLP and generative models
            to production-grade data pipelines on Azure   turning research-grade
            ideas into tools people actually use.
          </p>

          <div className="hero-buttons">
            <Buttons buttons={heroButtons} />
          </div>

          <div className="hero-credibility" role="list">
            {STATS.map((stat) => (
              <span className="hero-stat" role="listitem" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-photo-wrap">
            <span className="hero-photo-ring" aria-hidden="true" />
            <span className="hero-photo-glow" aria-hidden="true" />
            <div className="hero-photo-frame">
              <img src={PROFILE_IMAGE} alt="Muhammad Ahmad" />
              <span className="hero-photo-scan" aria-hidden="true" />
              <span className="hero-photo-shade" aria-hidden="true" />
            </div>

            <div className="hero-orbit-chip hero-orbit-chip-1">
              <span>AI / ML</span>
            </div>

            <div className="hero-orbit-chip hero-orbit-chip-2">
              <span>Data Science</span>
            </div>

            <div className="hero-orbit-chip hero-orbit-chip-3">
              <span>NLP</span>
            </div>

            <div className="hero-orbit-chip hero-orbit-chip-4">
              <span>Azure</span>
            </div>

            <div className="hero-orbit-chip hero-orbit-chip-5">
              <span>AWS</span>
            </div>

            <a href="#projects" className="hero-orbit-chip hero-orbit-chip-cta" aria-label="View AI projects">
              <span aria-hidden="true">↗</span>
            </a>

            <div className="hero-photo-badge">
              <span>
                <strong>Gold Medalist</strong>
                <em>4.0 CGPA · FAST-NUCES</em>
              </span>
            </div>
          </div>
        </div>
      </div>

      <a href="#projects" className="hero-scroll-cue" aria-label="Scroll to projects">
        <span className="hero-scroll-cue-line" />
        Scroll
      </a>
    </section>
  );
}

export default Hero;
