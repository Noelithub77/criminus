// components/Home.jsx
import React from "react";

export function Home() {
  return (
    <div className="home-container">
      <div className="announcement-section">
        <div className="section-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h2>Announcements</h2>
        </div>
        <div className="announcement-card">
          {/* Placeholder for announcements */}
        </div>
      </div>

      <div className="features-section">
        <h2>Home</h2>
        <div className="feature-list">
          <div className="feature-card">
            <div className="feature-icon"></div>
            <div className="feature-details">
              <h3>Scam Detection</h3>
              <p>
                AI powered tool that will help to detect fraud and prevent
                financial loss
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <div className="feature-details">
              <h3>Anonymous Reporting</h3>
              <p>
                Report crimes and suspicious activities without revealing your
                identity
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <div className="feature-details">
              <h3>Child Safety</h3>
              <p>
                Report child-predatory threats and alert parents in real time
                for immediate protection
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <div className="feature-details">
              <h3>Call Dispatch</h3>
              <p>
                AI-driven emergency response processes different calls for
                assistance
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <div className="feature-details">
              <h3>Heat Maps</h3>
              <p>
                AI-driven emergency response processes different calls for
                assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
