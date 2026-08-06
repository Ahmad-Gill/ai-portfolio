import React from "react";
import { Link } from "react-router-dom";
import "../componentCssFiles/button.css"; // CSS for btn classes

const isInternalLink = (href) => href && href.startsWith("/") && !href.startsWith("//");

// Button Component
function Button({ text, href, type = "blue", onClick, target = "_self" }) {
  if (href) {
    if (isInternalLink(href) && target !== "_blank") {
      return (
        <Link to={href} className={`btn ${type}`}>
          {text}
        </Link>
      );
    }

    // Render as a link for external paths or new tab targets
    return (
      <a href={href} className={`btn ${type}`} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
        {text}
      </a>
    );
  }

  // Render as a clickable button
  return (
    <button className={`btn ${type}`} onClick={onClick} type="button">
      {text}
    </button>
  );
}

// Buttons Container (Dynamic)
function Buttons({ buttons }) {
  return (
    <div className="buttons">
      {buttons.map((btn, index) => (
        <Button
          key={index}
          text={btn.text}
          href={btn.href}
          type={btn.type}
          onClick={btn.onClick}
          target={btn.target}
        />
      ))}
    </div>
  );
}

export default Buttons;
