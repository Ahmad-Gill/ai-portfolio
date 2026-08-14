import React from "react";
import "../../componentCssFiles/footer.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

// Keep in sync with Contact.js.
const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Ahmad-Gill/Ahmad-Gill" },
  { label: "LinkedIn", href: "https://linkedin.com/in/muhammad-ahmad-gill-427772262" },
  { label: "Email", href: "mailto:m.ahmadgill01@gmail.com" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">{"<Muhammad Ahmad Gill/>"}</span>
          <p>AI &amp; Data Science Specialist · MLOps Engineer · Building intelligent systems.</p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-footer-social">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} Muhammad Ahmad. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
