import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../componentCssFiles/home.css";

const Semester = () => {
  const [semester, setSemester] = useState("");
  const query = new URLSearchParams(useLocation().search);
  const university = query.get("university");

  return (
    <div className="home-container">
      <div className="hero">
        <h1 className="title">{university} - Select Semester</h1>

        <div className="form-section">
          <label>Select Semester:</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">-- Choose --</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Semester;
