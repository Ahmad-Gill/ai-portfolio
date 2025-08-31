import React from "react";
import "../componentCssFiles/home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Navbar */}
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

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <h3>Marhaban I'm</h3>
          <h1 className="name">Muhammad Ahmad</h1>
          <p className="tagline">💡 Data Scientist & AI Specialist</p>
          <p className="description">
            From exploration in 2021 to mastering data science. I now apply deep
            learning, NLP, and advanced algorithms to deliver impactful insights,
            shaping the future of AI and technology.
          </p>

          <div className="buttons">
            <a href="#contact" className="btn blue">Contact Me</a>
            <a href="#portfolio" className="btn red">View Portfolio →</a>
          </div>
        </div>

        <div className="hero-image">
          {/* ✅ Using image from public folder */}
          <img src="/1.jpg" alt="Profile" />
        </div>
      </div>
    </div>
  );
}

export default Home;
