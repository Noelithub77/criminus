// components/Home.jsx
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChildSafety from "./ChildSafety";
import LeadPrediction from "./LeadPrediction";
import Heatmap from "./Heatmap";
import Image from "next/image";

export function Home() {
  const [showChildSafety, setShowChildSafety] = useState(false);
  const [showLeadPrediction, setShowLeadPrediction] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();

  // Handle window-related operations only after component is mounted
  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return <div>Loading...</div>;
  }

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
            <div className="announcement-card" style={{ overflow: 'hidden', width: '100%' }}>
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
                    flexDirection: windowWidth <= 400 ? "column" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "clamp(40px, 12vw, 60px)",
                      height: "clamp(40px, 12vw, 60px)",
                      marginTop: "5px",
                      alignSelf:
                        windowWidth <= 400 ? "center" : "flex-start",
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
                      textAlign: windowWidth <= 400 ? "center" : "left",
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
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
                        maxWidth: "100%"
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
                    Predict potential leads for investigation based on historical
                    data
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
                    Tools and resources to ensure online safety for children
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
                  <h3>Crime Heatmap</h3>
                  <p>
                    Visualize crime hotspots and trends across different regions
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => handleRedirect("/dispatch")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <img src="/assets/Call_dispatch.png" />
                </div>
                <div className="feature-details">
                  <h3>Emergency Dispatch</h3>
                  <p>
                    Quick response system for emergency situations
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => handleRedirect("/anonymousReport")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <img src="/assets/report.svg" />
                </div>
                <div className="feature-details">
                  <h3>Anonymous Reporting</h3>
                  <p>
                    Report crimes anonymously without revealing your identity
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
