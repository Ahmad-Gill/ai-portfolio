import React, { useEffect, useState } from "react";
import Buttons from "../Button";
import { getPublicAsset } from "../../utils/publicAsset";
import "../../componentCssFiles/hero.css";

const BASE_URL = (process.env.REACT_APP_PUBLIC_URL || "").replace(/\/+$/, "");
const PROFILE_IMAGE = getPublicAsset("1.jpg");

const STATS = [
  { value: "2+", label: "yrs experience" },
  { value: "14+", label: "AI/ML projects" },
  { value: "6", label: "live tools" },
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
          <span className="section-eyebrow">
            AI Engineer <span className="eyebrow-dot">·</span> ML{" "}
            <span className="eyebrow-dot">·</span> Data Engineer{" "}
            <span className="eyebrow-dot">·</span> MLOps
          </span>

          <h1 className="hero-title">
            Muhammad
            <br />
            <span className="hero-title-mark">Ahmad</span>
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
            <span className="hero-photo-frame-outline" aria-hidden="true" />
            <div className="hero-photo-card">
              <img src={PROFILE_IMAGE} alt="Muhammad Ahmad" />
            </div>
            <div className="hero-photo-badge">
              <span className="hero-photo-badge-icon">🏆</span>
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
