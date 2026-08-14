import React from "react";
import "../componentCssFiles/home.css";
import Hero from "./sections/Hero";
import FeaturedProjects from "./sections/FeaturedProjects";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

function Home() {
  return (
    <div className="home-page">
      <Hero />
      <FeaturedProjects />
      <About />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}

export default Home;
