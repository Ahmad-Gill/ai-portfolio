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
          Hover or focus a skill for a quick note on how I use it.
        </p>
      </div>

      <div className="skills-groups">
        {skillGroups.map((group, gi) => (
          <div className="skills-group reveal" key={group.category} style={{ transitionDelay: `${gi * 80}ms` }}>
            <h3 className="skills-group-title">{group.category}</h3>
            <div className="skills-chip-row">
              {group.skills.map((skill) => (
                <span className="skill-chip" tabIndex={0} key={skill.name}>
                  {skill.name}
                  <span className="skill-chip-detail">{skill.detail}</span>
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
