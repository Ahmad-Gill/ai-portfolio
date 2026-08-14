import React from "react";
import useReveal from "../../hooks/useReveal";
import "../../componentCssFiles/contact.css";

const CONTACT_EMAIL = "m.ahmadgill01@gmail.com";
const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Ahmad-Gill/Ahmad-Gill" },
  { label: "LinkedIn", href: "https://linkedin.com/in/muhammad-ahmad-gill-427772262" },
];

function Contact() {
  const revealRef = useReveal();

  return (
    <section className="section contact" id="contact" ref={revealRef}>
      <div className="contact-card reveal">
        <div className="contact-copy">
          <span className="section-eyebrow">Get In Touch</span>
          <h2 className="section-title">Let&rsquo;s build something intelligent</h2>
          <p className="section-intro">
            Have a project, role, or idea in mind? I&rsquo;m always open to
            discussing AI, data, and engineering work.
          </p>
        </div>

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
    </section>
  );
}

export default Contact;
