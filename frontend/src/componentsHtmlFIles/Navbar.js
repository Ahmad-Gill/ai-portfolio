import React from "react";
import "../componentCssFiles/navebar.css"; // Keep CSS shared for now

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">{"<Muhammad Ahmad Gill/>"}</div>
      <ul>
        <li className="active">Home</li>
        <li>About</li>
        <li>Skills</li>
        <li>Projects</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
}

export default Navbar;
