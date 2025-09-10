import React from "react";
import "../componentCssFiles/navebar.css"; // Navbar CSS

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img 
          src="/logo1.png" 
          alt="Logo" 
          className="navbar-logo"
        />
      </div>
      <div className="logo-text">{"<Muhammad Ahmad Gill/>"}</div>
    </nav>
  );
}

export default Navbar;
