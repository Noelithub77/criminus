import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle } from "react-feather";
import { useResponsive } from "../hooks/useResponsive";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const Search = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  // Chatbot state
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const recentSearches = [
    "How can I protect myself from cyber crimes?",
    "What is deepfake fraud, and how is it used in crime?",
    "What are the latest financial crimes and scams?",
    "How to identify phishing attempts?",
    "What should I do if I'm a victim of identity theft?",
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

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        // Add user message to chat
        const userMessage = { role: 'user', content: searchQuery };
        setMessages(prev => [...prev, userMessage]);
        
        // Clear input and show loading state
        setSearchQuery("");
        setIsLoading(true);
        
        // Initialize LangChain's Google Genai model
        const model = new ChatGoogleGenerativeAI({
          modelName: "gemini-2.0-flash-lite",
          maxOutputTokens: 2048,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        });
        
        // Get response from the model
        const response = await model.invoke(searchQuery);
        
        // Add AI response to chat
        const aiMessage = { role: 'assistant', content: response.content };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error getting response:", error);
        // Add error message to chat
        const errorMessage = { 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error processing your request. Please try again." 
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="search-page">
      <a href="#search-form" className="skip-to-content">
        Skip to chat form
      </a>
      
      <div className={`search-container ${isDesktop || isLargeDesktop ? 'desktop-layout' : ''}`}>
        <h2 className="search-title">Chat with J.Ethical</h2>
        
        {messages.length === 0 && (
          <div className={`recent-searches ${isFocused ? 'minimized' : ''}`}>
            <h3 className="recent-searches-title">Suggested Questions</h3>
            {recentSearches.map((search, index) => (
              <div 
                key={index} 
                className="search-item"
                onClick={() => handleSearchItemClick(search)}
                tabIndex={0}
                role="button"
                aria-label={`Ask about ${search}`}
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
        )}

        {messages.length === 0 && (
          <div className={`mascot-container ${isFocused ? 'minimized' : ''}`}>
            <div className="mascot">
              <div className="mascot-image-container">
                <div className="j-ethical-mascot"></div>
              </div>
              <div className="mascot-name">J.Ethical</div>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

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
                placeholder={isMobile ? "Ask me anything..." : "What would you like to know about crime prevention?"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="search-input"
                ref={searchInputRef}
                aria-label="Chat input"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={isFocused && searchQuery ? "true" : "false"}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="send-button"
                aria-label="Send message"
                disabled={isLoading || !searchQuery.trim()}
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
            <h3 className="suggestions-title">Suggested Questions</h3>
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
      
      <style jsx>{`
        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
          max-height: 60vh;
          overflow-y: auto;
          padding: 16px;
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        
        .message {
          display: flex;
          gap: 12px;
          max-width: 80%;
          animation: fadeIn 0.3s ease-out;
        }
        
        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .ai-message {
          align-self: flex-start;
        }
        
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.1);
          font-size: 18px;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          line-height: 1.5;
        }
        
        .user-message .message-content {
          background-color: rgba(59, 130, 246, 0.2);
          border-bottom-right-radius: 4px;
        }
        
        .ai-message .message-content {
          background-color: rgba(255, 255, 255, 0.15);
          border-bottom-left-radius: 4px;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          animation: bounce 1.5s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Search;
