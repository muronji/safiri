import React from "react";
import "../stylesheets/loading.css";

const Loading = ({
  size = "md",
  text = "Loading...",
  overlay = false,
  className = "",
}) => {
  const spinnerClass = `custom-spinner spinner-${size} ${className}`;

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className={spinnerClass} />
        {text && <div className="loading-text">{text}</div>}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={spinnerClass} />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loading;
