import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../componentCssFiles/projectWarningModal.css";

// Wraps react-router's Link. If a `notice` string is provided, clicking the
// card shows a confirmation modal first (e.g. to warn about a slow/flaky
// backend) and only navigates once the user presses OK.
function ProjectCardLink({ to, notice, className, children, ...rest }) {
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();

  if (!notice) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const handleClick = (e) => {
    e.preventDefault();
    setShowNotice(true);
  };

  const handleConfirm = () => {
    setShowNotice(false);
    navigate(to);
  };

  return (
    <>
      <Link to={to} className={className} onClick={handleClick} {...rest}>
        {children}
      </Link>

      {showNotice && (
        <div
          className="project-notice-backdrop"
          role="presentation"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="project-notice-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Heads up"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="project-notice-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3.5 21.5 20h-19L12 3.5Z" strokeLinejoin="round" />
                <path d="M12 10v4.5M12 17.5h.01" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="project-notice-title">Heads up</h3>
            <p className="project-notice-text">{notice}</p>
            <button type="button" className="btn teal project-notice-ok" onClick={handleConfirm}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectCardLink;
