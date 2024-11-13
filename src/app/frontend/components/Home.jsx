// components/Home.jsx
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChildSafety from "./ChildSafety";
import LeadPrediction from "./LeadPrediction";
import Heatmap from "./Heatmap";
import Image from "next/image";

export function Home() {
  const [showChildSafety, setShowChildSafety] = useState(false);
  const [showLeadPrediction, setShowLeadPrediction] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const router = useRouter();

  const handleChildSafetyClick = () => {
    setShowChildSafety(true);
  };

  const handleLeadPredictionClick = () => {
    setShowLeadPrediction(true);
  };

  const handleHeatmapClick = () => {
    setShowHeatmap(true);
  };

  const handleBackClick = () => {
    setShowChildSafety(false);
    setShowLeadPrediction(false);
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
      ) : showLeadPrediction ? (
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
          <LeadPrediction />
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
              <img src="/assets/bell.png" />
              <h2>Announcements</h2>
            </div>
            <div className="announcement-card">
              <div
                style={{
                  backgroundColor: "#5190a5",
                  width: "100%",
                  borderRadius: "20px",
                  padding: "clamp(12px, 4vw, 20px)",
                  display: "flex",
                  flexDirection: "column",
                  color: "#333",
                  fontFamily: "Arial, sans-serif",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "clamp(8px, 3vw, 15px)",
                    flexDirection: window.innerWidth <= 400 ? "column" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "clamp(40px, 12vw, 60px)",
                      height: "clamp(40px, 12vw, 60px)",
                      marginTop: "5px",
                      alignSelf:
                        window.innerWidth <= 400 ? "center" : "flex-start",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "100%", height: "100%", fill: "#2a4045" }}
                    >
                      <path d="M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2z M15,15.5h-6v-1.4c0-2,4-3.1,6-3.1V15.5z M12,9c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,9,12,9z" />
                    </svg>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: window.innerWidth <= 400 ? "center" : "left",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "clamp(18px, 5vw, 24px)",
                        fontWeight: "bold",
                        margin: "0 0 clamp(6px, 2vw, 10px) 0",
                        color: "#333",
                      }}
                    >
                      Aluva Cyber Police
                    </h3>
                    <p
                      style={{
                        fontSize: "clamp(14px, 3.5vw, 16px)",
                        lineHeight: "1.4",
                        margin: "0",
                      }}
                    >
                      Online Fraud scam investigation. Apprehend the thief and
                      earn an opportunity to receive a reward of 1 lakh!
                    </p>
                  </div>
                </div>
              </div>
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
                <div className="feature-icon">
                  <img src="/assets/scam.svg" />
                </div>
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
                onClick={handleLeadPredictionClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <img src="/assets/lead_prediction.svg" />
                </div>
                <div className="feature-details">
                  <h3>Lead Prediction</h3>
                  <p>
                    Analyze text for criminal patterns with interactive
                    flowcharts, diagrams, and structured insights for
                    investigations
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => window.open("http://localhost:5000", "_blank")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <img src="/assets/gender_detect.svg" />
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
                <div className="feature-icon">
                  <img src="/assets/child_safety.svg" />
                </div>
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
                <div className="feature-icon">
                  <img src="/assets/heatmap.svg" />
                </div>
                <div className="feature-details">
                  <h3>Heat Maps</h3>
                  <p>
                    AI-driven emergency response processes different calls for
                    assistance
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => handleRedirect("/dispatch")}
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="feature-details">
                  <h3>Emergency Dispatch call</h3>
                  <p>
                    AI-powered emergency dispatch system that provides immediate
                    assistance and guidance during emergencies
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
