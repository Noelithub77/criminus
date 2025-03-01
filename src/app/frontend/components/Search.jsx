import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle } from "react-feather";
const Search = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const recentSearches = [
    "How can I protect myself from cyber crimes ?",
    "What is deepfake fraud, and how is it used in crime?",
    "How can I protect myself from cyber crimes ?",
    "What is deepfake fraud, and how is it used in crime?",
    "What are the latest financial crimes and scams?",
  ];

  // Handle mouse movement for dynamic glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setIsFocused(false);
    }
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="recent-searches">
          {recentSearches.map((search, index) => (
            <div key={index} className="search-item">
              <div className="search-item-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="search-item-text">{search}</span>
            </div>
          ))}
        </div>

        <div className="mascot-container">
          <div className="mascot">
            <div className="mascot-image-container">
              <div className="j-ethical-mascot"></div>
            </div>
            <div className="mascot-name">J.Ethical</div>
          </div>
        </div>

        <div
          className={`search-wrapper ${isFocused ? "active" : ""}`}
          ref={searchContainerRef}
          style={{
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`,
          }}
        >
          <div className="liquid-glow"></div>
          <div className="search-bar">
            <div className="search-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Mew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="search-input"
            />
            <button className="send-button">
              <ArrowUpCircle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
