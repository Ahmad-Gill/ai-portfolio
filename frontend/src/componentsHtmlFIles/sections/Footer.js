import React from "react";
import "../../componentCssFiles/footer.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const EXPLORE_LINKS = [
  { label: "Featured AI Projects", href: "#projects" },
  { label: "GitHub", href: "https://github.com/Ahmad-Gill/Ahmad-Gill" },
  { label: "LinkedIn", href: "https://linkedin.com/in/muhammad-ahmad-gill-427772262" },
];

// Keep in sync with Contact.js.
const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/Ahmad-Gill/Ahmad-Gill",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/muhammad-ahmad-gill-427772262",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.5 21h-3.37v-6.28c0-1.5-.03-3.42-2.08-3.42-2.09 0-2.41 1.63-2.41 3.31V21H9.27V8.5h3.24v1.71h.05c.45-.86 1.56-1.77 3.21-1.77 3.44 0 4.73 2.62 4.73 5.71V21Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:m.ahmadgill01@gmail.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="m3.5 6 8.5 6.5L20.5 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 6 8.5 6.5L20.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M5.5 3.5h3l1.5 4-2 1.5a12.5 12.5 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackToTop() {
  return (
    <a href="#home" className="site-footer-top" aria-label="Back to top">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span className="site-footer-watermark" aria-hidden="true">AG</span>

      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-status">
            <span className="site-footer-status-dot" aria-hidden="true" />
            Open to new opportunities
          </span>
          <p>AI &amp; Data Science Specialist · MLOps Engineer · Building intelligent systems.</p>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Navigation</span>
          <nav className="site-footer-links" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Explore</span>
          <nav className="site-footer-links" aria-label="Explore">
            {EXPLORE_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Contact</span>
          <a className="site-footer-contact-item" href="mailto:m.ahmadgill01@gmail.com">
            <MailIcon />
            m.ahmadgill01@gmail.com
          </a>
          <a className="site-footer-contact-item" href="tel:+923070131060">
            <PhoneIcon />
            +92 307 0131060
          </a>
          <span className="site-footer-contact-item">Based in Pakistan · UTC+5</span>

          <div className="site-footer-social">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="site-footer-social-link"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} Muhammad Ahmad. All rights reserved.</span>
        <BackToTop />
      </div>
    </footer>
  );
}

export default Footer;
