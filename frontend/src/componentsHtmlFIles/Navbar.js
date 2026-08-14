import React, { useState } from "react";
import "../componentCssFiles/navebar.css"; // Navbar CSS
import { getPublicAsset } from "../utils/publicAsset";

const BASE_URL = (process.env.REACT_APP_PUBLIC_URL || "").replace(/\/+$/, "");

const NAV_LINKS = [
  { label: "About", href: `${BASE_URL}/#about` },
  { label: "Skills", href: `${BASE_URL}/#skills` },
  { label: "Experience", href: `${BASE_URL}/#experience` },
  { label: "Projects", href: `${BASE_URL}/#projects` },
  { label: "Contact", href: `${BASE_URL}/#contact` },
];

function ThemeToggle({ theme, onToggleTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

function Navbar({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-container">
          <img src={getPublicAsset("logo1.png")} alt="Logo" className="navbar-logo" />
        </div>
        <div className="logo-text">{"<Muhammad Ahmad Gill/>"}</div>
      </div>

      <div className="navbar-links">
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>

      <div className="navbar-actions">
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        <button
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
