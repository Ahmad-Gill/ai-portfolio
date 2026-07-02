import React from "react";
import "../componentCssFiles/navebar.css"; // Navbar CSS
const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || "";
function Navbar({ theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={`${PUBLIC_URL}/logo1.png`} alt="Logo" className="navbar-logo" />
      </div>

      <div className="logo-text">{"<Muhammad Ahmad Gill/>"}</div>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
