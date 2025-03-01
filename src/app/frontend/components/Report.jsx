import React from "react";

export function Report() {
  return (
    <div className="report-container">
      <h2>Report an Incident</h2>
      <form className="report-form">
        <div className="form-group">
          <label>Incident Type</label>
          <select>
            <option>Select incident type</option>
            <option>Scam</option>
            <option>Suspicious Activity</option>
            <option>Child Safety Concern</option>
            <option>Emergency</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Describe the incident..."></textarea>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" placeholder="Enter location" />
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="anonymous" />
          <label htmlFor="anonymous">Report anonymously</label>
        </div>
        <button type="submit" className="submit-button">
          Submit Report
        </button>
      </form>
    </div>
  );
}
