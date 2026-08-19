import React from "react";
import useReveal from "../../hooks/useReveal";
import { skillGroups } from "../../data/skills";
import "../../componentCssFiles/skills.css";

function Skills() {
  const revealRef = useReveal();

  return (
    <section className="section skills" id="skills" ref={revealRef}>
      <div className="section-head reveal">
        <span className="section-eyebrow">Toolkit</span>
        <h2 className="section-title">Skills &amp; technologies</h2>
        <p className="section-intro">
          The tools and technologies I use most, grouped by area.
        </p>
      </div>

      <div className="skills-groups">
        {skillGroups.map((group, gi) => (
          <div
            className="skills-group reveal"
            key={group.category}
            style={{ transitionDelay: `${gi * 80}ms`, "--group-color": group.color }}
          >
            <h3 className="skills-group-title">
              <span className="skills-group-marker" aria-hidden="true" />
              {group.category}
            </h3>
            <div className="skills-chip-row">
              {group.skills.map((skill) => (
                <span className="skill-chip" key={skill.name}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
