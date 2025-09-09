import React from "react";
import "../componentCssFiles/button.css"; // CSS for btn classes

// Button Component
function Button({ text, href, type = "blue" }) {
  return (
    <a href={href} className={`btn ${type}`}>
      {text}
    </a>
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
        />
      ))}
    </div>
  );
}

export default Buttons;
