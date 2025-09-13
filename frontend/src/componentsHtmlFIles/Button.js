import React from "react";
import "../componentCssFiles/button.css"; // CSS for btn classes

// Button Component
function Button({ text, href, type = "blue", onClick }) {
  if (href) {
    // Render as a link
    return (
      <a href={href} className={`btn ${type}`}>
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
          onClick={btn.onClick} // <-- pass the click handler here
        />
      ))}
    </div>
  );
}

export default Buttons;
