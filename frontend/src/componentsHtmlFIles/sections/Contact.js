import React from "react";
import useReveal from "../../hooks/useReveal";
import { getPublicAsset } from "../../utils/publicAsset";
import "../../componentCssFiles/contact.css";

const CONTACT_EMAIL = "m.ahmadgill01@gmail.com";
const CONTACT_VISUAL_IMAGE = getPublicAsset("Amazing AI projects/programming.jpg");
const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Ahmad-Gill/Ahmad-Gill" },
  { label: "LinkedIn", href: "https://linkedin.com/in/muhammad-ahmad-gill-427772262" },
];

function Contact() {
  const revealRef = useReveal();

  return (
    <section className="section contact" id="contact" ref={revealRef}>
      <div
        className="contact-card reveal"
        style={{ "--contact-bg-image": `url("${CONTACT_VISUAL_IMAGE}")` }}
      >
        <span className="contact-shine" aria-hidden="true" />

        <div className="contact-copy">
          <span className="contact-eyebrow">Get In Touch</span>
          <h2 className="section-title">
            Let&rsquo;s build something <span className="contact-title-highlight">intelligent</span>
          </h2>
          <p className="section-intro">
            Have a project, role, or idea in mind? I&rsquo;m always open to
            discussing AI, data, and engineering work.
          </p>

          <div className="contact-actions">
            <a className="btn teal" href={`mailto:${CONTACT_EMAIL}`}>
              Email me
            </a>
            <div className="contact-social">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-terminal">
          <div className="contact-terminal-bar">
            <span className="contact-terminal-dot contact-terminal-dot-red" />
            <span className="contact-terminal-dot contact-terminal-dot-yellow" />
            <span className="contact-terminal-dot contact-terminal-dot-green" />
            <span className="contact-terminal-title">contact.sh</span>
          </div>
          <div className="contact-terminal-body">
            <p>
              <span className="contact-terminal-prompt">$</span>whoami
            </p>
            <p className="contact-terminal-output">Muhammad Ahmad — AI/ML Engineer</p>
            <p className="contact-terminal-spacer" aria-hidden="true" />
            <p>
              <span className="contact-terminal-prompt">$</span>status --check
            </p>
            <p className="contact-terminal-output">
              <span className="contact-terminal-ok">✓</span>available for new projects
            </p>
            <p className="contact-terminal-output">
              <span className="contact-terminal-ok">✓</span>response time ~24h
            </p>
            <p className="contact-terminal-output">
              <span className="contact-terminal-ok">✓</span>based in Pakistan (UTC+5)
            </p>
            <p className="contact-terminal-spacer" aria-hidden="true" />
            <p>
              <span className="contact-terminal-prompt">$</span>connect --email
              <span className="contact-terminal-cursor" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
