// components/Home.jsx
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChildSafety from "./ChildSafety";
import AnonymousReporting from "./AnonymousReporting";
import Heatmap from "./Heatmap";

export function Home() {
  const [showChildSafety, setShowChildSafety] = useState(false);
  const [showAnonymousReporting, setShowAnonymousReporting] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const router = useRouter();

  const handleChildSafetyClick = () => {
    setShowChildSafety(true);
  };

  const handleAnonymousReportingClick = () => {
    setShowAnonymousReporting(true);
  };
  const handleHeatmapClick = () => {
    setShowHeatmap(true);
  };
  const handleBackClick = () => {
    setShowChildSafety(false);
    setShowAnonymousReporting(false);
    setShowHeatmap(false);
  };

  const handleRedirect = (path) => {
    router.push(path);
  };

  return (
    <div className="home-container">
      {showChildSafety ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#121212",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <ChildSafety />
        </div>
      ) : showAnonymousReporting ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#121212",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <AnonymousReporting />
        </div>
      ) : showHeatmap ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#121212",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <Heatmap />
        </div>
      ) : (
        <>
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
              <div
                className="feature-card"
                onClick={() => handleRedirect("/spam")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon"></div>
                <div className="feature-details">
                  <h3>Scam Detection</h3>
                  <p>
                    AI powered tool that will help to detect fraud and prevent
                    financial loss
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleAnonymousReportingClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon"></div>
                <div className="feature-details">
                  <h3>Anonymous Reporting</h3>
                  <p>
                    Report crimes and suspicious activities without revealing
                    your identity
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => window.open("http://localhost:5000", "_blank")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </div>
                <div className="feature-details">
                  <h3>Gender Detection & Safety</h3>
                  <p>
                    AI-powered real-time gender detection and safety monitoring
                    system with advanced alerts
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleChildSafetyClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon"></div>
                <div className="feature-details">
                  <h3>Child Safety</h3>
                  <p>
                    Report child-predatory threats and alert parents in real
                    time for immediate protection
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleHeatmapClick}
                style={{ cursor: "pointer" }}
              >
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
        </>
      )}
    </div>
  );
}
