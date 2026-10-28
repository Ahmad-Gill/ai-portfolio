import React, { useEffect, useState } from "react";
import "../componentCssFiles/navebar.css"; // Navbar CSS
import { getPublicAsset } from "../utils/publicAsset";

const BASE_URL = (process.env.REACT_APP_PUBLIC_URL || "").replace(/\/+$/, "");

const NAV_LINKS = [
  { label: "About", href: `${BASE_URL}/#about` },
  { label: "Skills", href: `${BASE_URL}/#skills` },
  { label: "Experience", href: `${BASE_URL}/#experience` },
  { label: "Projects", href: `${BASE_URL}/#projects` },
  { label: "Apps", href: `${BASE_URL}/#apps` },
  { label: "Contact", href: `${BASE_URL}/#contact` },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="navbar">
      <div className={`navbar-inner ${scrolled ? "is-scrolled" : ""}`}>
        <div className="navbar-brand">
          <div className="logo-container">
            <img src={getPublicAsset("logo1.png")} alt="Logo" className="navbar-logo" />
          </div>
        </div>

        <div className="navbar-links">
          {NAV_LINKS.map((link) =>
            link.label === "Contact" ? (
              <a key={link.label} href={link.href} className="navbar-cta">
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href} className="navbar-link">
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="navbar-actions">
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
