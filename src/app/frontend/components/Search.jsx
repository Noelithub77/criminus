import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle } from "react-feather";
import { useResponsive } from "../hooks/useResponsive";

const Search = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  const recentSearches = [
    "How can I protect myself from cyber crimes ?",
    "What is deepfake fraud, and how is it used in crime?",
    "How can I protect myself from cyber crimes ?",
    "What is deepfake fraud, and how is it used in crime?",
    "What are the latest financial crimes and scams?",
  ];

  // Generate suggestions based on search query
  const getSuggestions = () => {
    if (!searchQuery) return [];
    
    return [
      `How to prevent ${searchQuery}?`,
      `Latest news about ${searchQuery}`,
      `Report ${searchQuery} incident`
    ];
  };
  
  const suggestions = getSuggestions();

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

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (selectedSuggestion < suggestions.length - 1) {
        setSelectedSuggestion(prev => prev + 1);
      }
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectedSuggestion > 0) {
        setSelectedSuggestion(prev => prev - 1);
      }
    }
    // Enter key
    else if (e.key === "Enter" && selectedSuggestion >= 0) {
      e.preventDefault();
      setSearchQuery(suggestions[selectedSuggestion]);
      setSelectedSuggestion(-1);
    }
    // Escape key
    else if (e.key === "Escape") {
      searchInputRef.current.blur();
      setIsFocused(false);
      setSelectedSuggestion(-1);
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestion >= 0 && suggestionsRef.current) {
      const suggestionElements = suggestionsRef.current.querySelectorAll('.suggestion-item');
      if (suggestionElements[selectedSuggestion]) {
        suggestionElements[selectedSuggestion].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedSuggestion]);

  const handleFocus = () => {
    setIsFocused(true);
    setSelectedSuggestion(-1);
  };

  const handleBlur = (e) => {
    // Prevent blur if clicking on a suggestion
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (!searchQuery) {
      setIsFocused(false);
    }
    setSelectedSuggestion(-1);
  };

  const handleSearchItemClick = (search) => {
    setSearchQuery(search);
    setIsFocused(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search submission
      console.log("Search submitted:", searchQuery);
      // You could add API call here
    }
  };

  return (
    <div className="search-page">
      <a href="#search-form" className="skip-to-content">
        Skip to search form
      </a>
      
      <div className={`search-container ${isDesktop || isLargeDesktop ? 'desktop-layout' : ''}`}>
        <h2 className="search-title">Search for Information</h2>
        
        <div className={`recent-searches ${isFocused ? 'minimized' : ''}`}>
          <h3 className="recent-searches-title">Recent Searches</h3>
          {recentSearches.map((search, index) => (
            <div 
              key={index} 
              className="search-item"
              onClick={() => handleSearchItemClick(search)}
              tabIndex={0}
              role="button"
              aria-label={`Search for ${search}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSearchItemClick(search);
                }
              }}
            >
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

        <div className={`mascot-container ${isFocused ? 'minimized' : ''}`}>
          <div className="mascot">
            <div className="mascot-image-container">
              <div className="j-ethical-mascot"></div>
            </div>
            <div className="mascot-name">J.Ethical</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="search-form" id="search-form">
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
                placeholder={isMobile ? "Search..." : "What would you like to know about crime prevention?"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="search-input"
                ref={searchInputRef}
                aria-label="Search input"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={isFocused && searchQuery ? "true" : "false"}
              />
              <button 
                type="submit" 
                className="send-button"
                aria-label="Submit search"
              >
                <ArrowUpCircle />
              </button>
            </div>
          </div>
        </form>

        {isFocused && searchQuery && (
          <div 
            className="search-suggestions" 
            ref={suggestionsRef}
            id="search-suggestions"
            role="listbox"
          >
            <h3 className="suggestions-title">Suggested Searches</h3>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className={`suggestion-item ${selectedSuggestion === index ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestion(index)}
                  tabIndex={0}
                  role="option"
                  aria-selected={selectedSuggestion === index}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSuggestionClick(suggestion);
                    }
                  }}
                >
                  <div className="suggestion-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="suggestion-text">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
