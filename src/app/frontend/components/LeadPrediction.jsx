import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle, Search } from "react-feather";
import { useResponsive } from "../hooks/useResponsive";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import ReactMarkdown from 'react-markdown';

const LeadPrediction = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputContainerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  // Chatbot state
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize model ref to avoid re-creation on each render
  const modelRef = useRef(null);

  const suggestedInputs = [
    "Analyze this suspicious text message for potential scam indicators",
    "Check if this email contains phishing attempts",
    "Identify potential criminal patterns in this conversation",
    "Analyze this social media post for threats",
    "Evaluate this message for potential fraud indicators",
  ];

  // Generate suggestions based on input
  const getSuggestions = () => {
    if (!inputText) return [];
    
    return [
      `Analyze ${inputText} for criminal patterns`,
      `Check if ${inputText} is related to known scams`,
      `Identify potential leads from ${inputText}`
    ];
  };
  
  const suggestions = getSuggestions();

  // Initialize the model only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && !modelRef.current) {
      try {
        modelRef.current = new ChatGoogleGenerativeAI({
          modelName: "gemini-2.0-flash-lite",
          maxOutputTokens: 2048,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          streaming: true,
        });
      } catch (error) {
        console.error("Error initializing model:", error);
      }
    }
  }, []);

  // Handle mouse movement for dynamic glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (inputContainerRef.current) {
        const rect = inputContainerRef.current.getBoundingClientRect();
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
  }, [messages, streamingMessage]);

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
      setInputText(suggestions[selectedSuggestion]);
      setSelectedSuggestion(-1);
    }
    // Escape key
    else if (e.key === "Escape") {
      inputRef.current.blur();
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
    
    if (!inputText) {
      setIsFocused(false);
    }
    setSelectedSuggestion(-1);
  };

  const handleSuggestedInputClick = (input) => {
    setInputText(input);
    setIsFocused(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderMessageContent = (content) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      try {
        // Add user message to chat
        const userMessage = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);
        
        // Clear input and show loading state
        setInputText("");
        setIsLoading(true);
        setIsStreaming(true);
        setStreamingMessage("");
        
        if (!modelRef.current) {
          throw new Error("Model not initialized");
        }
        
        // Prepare system message for lead prediction context
        const systemMessage = {
          role: "system",
          content: "You are J.Ethical Lead Predictor, an AI assistant specialized in analyzing text for potential criminal patterns, scams, threats, and generating investigative leads for law enforcement. Provide detailed analysis and actionable next steps for investigators."
        };
        
        // Stream response
        let fullResponse = "";
        
        const response = await modelRef.current.invoke(
          [systemMessage, ...messages.slice(-10), userMessage],
          {
            callbacks: [{
              handleLLMNewToken(token) {
                fullResponse += token;
                setStreamingMessage(fullResponse);
              }
            }]
          }
        );
        
        // Add AI response to chat
        const aiMessage = { 
          role: 'assistant', 
          content: fullResponse || response.content 
        };
        
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
        setIsStreaming(false);
        setStreamingMessage("");
      }
    }
  };

  return (
    <div className="lead-prediction-page">
      <a href="#input-form" className="skip-to-content">
        Skip to input form
      </a>
      
      <div className={`lead-prediction-container ${isDesktop || isLargeDesktop ? 'desktop-layout' : ''}`}>
        <h2 className="lead-prediction-title">
          <Search size={24} style={{ marginRight: '8px' }} />
          Lead Prediction
        </h2>
        
        {messages.length === 0 && (
          <div className="user-manual">
            <h3>User Manual</h3>
            <ol>
              <li>Copy the suspicious text or link from any source</li>
              <li>Paste the copied text or link into the input box.</li>
              <li>Tap "Analyze" to generate potential leads.</li>
            </ol>
          </div>
        )}
        
        {messages.length === 0 && (
          <div className={`suggested-inputs ${isFocused ? 'minimized' : ''}`}>
            <h3 className="suggested-inputs-title">Suggested Inputs</h3>
            {suggestedInputs.map((input, index) => (
              <div 
                key={index} 
                className="input-item"
                onClick={() => handleSuggestedInputClick(input)}
                tabIndex={0}
                role="button"
                aria-label={`Use input: ${input}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSuggestedInputClick(input);
                  }
                }}
              >
                <div className="input-item-icon">
                  <Search size={16} />
                </div>
                <span className="input-item-text">{input}</span>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div className={`mascot-container ${isFocused ? 'minimized' : ''}`}>
            <div className="mascot">
              <div className="mascot-image-container">
                <div className="lead-predictor-mascot"></div>
              </div>
              <div className="mascot-name">Lead Predictor</div>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="lead-prediction-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👮' : '🔍'}
                </div>
                <div className="message-content">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {isStreaming && streamingMessage && (
              <div className="message ai-message">
                <div className="message-avatar">🔍</div>
                <div className="message-content">
                  {renderMessageContent(streamingMessage)}
                </div>
              </div>
            )}
            {isLoading && !streamingMessage && (
              <div className="message ai-message">
                <div className="message-avatar">🔍</div>
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

        <form onSubmit={handleSubmit} className="input-form" id="input-form">
          <div
            className={`input-wrapper ${isFocused ? "active" : ""}`}
            ref={inputContainerRef}
            style={{
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
            }}
          >
            <div className="liquid-glow"></div>
            <div className="input-bar">
              <div className="input-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={isMobile ? "Enter text to analyze..." : "Paste suspicious text, messages, or content for analysis"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="lead-input"
                ref={inputRef}
                aria-label="Lead analysis input"
                aria-autocomplete="list"
                aria-controls="input-suggestions"
                aria-expanded={isFocused && inputText ? "true" : "false"}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="analyze-button"
                aria-label="Analyze text"
                disabled={isLoading || !inputText.trim()}
              >
                <ArrowUpCircle />
              </button>
            </div>
          </div>
        </form>

        {isFocused && inputText && (
          <div 
            className="input-suggestions" 
            ref={suggestionsRef}
            id="input-suggestions"
            role="listbox"
          >
            <h3 className="suggestions-title">Suggested Analysis</h3>
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
        .lead-prediction-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
        }
        
        .lead-prediction-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .lead-prediction-title {
          display: flex;
          align-items: center;
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #e0e0e0;
        }
        
        .user-manual {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }
        
        .user-manual h3 {
          font-size: 1.2rem;
          margin-bottom: 12px;
          color: #e0e0e0;
        }
        
        .user-manual ol {
          padding-left: 24px;
          margin: 0;
        }
        
        .user-manual li {
          margin-bottom: 8px;
          color: #b0b0b0;
        }
        
        .suggested-inputs {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }
        
        .suggested-inputs.minimized {
          max-height: 0;
          padding: 0;
          overflow: hidden;
          margin: 0;
        }
        
        .suggested-inputs-title {
          font-size: 1.1rem;
          margin-bottom: 12px;
          color: #e0e0e0;
        }
        
        .input-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .input-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .input-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
        }
        
        .input-item-text {
          color: #b0b0b0;
        }
        
        .mascot-container {
          display: flex;
          justify-content: center;
          margin: 32px 0;
          transition: all 0.3s ease;
        }
        
        .mascot-container.minimized {
          max-height: 0;
          margin: 0;
          overflow: hidden;
        }
        
        .mascot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .mascot-image-container {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .lead-predictor-mascot {
          width: 100%;
          height: 100%;
          background-image: url('/lead-predictor-mascot.png');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .mascot-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #e0e0e0;
        }
        
        .lead-prediction-messages {
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
        
        .input-form {
          width: 100%;
          margin-bottom: 16px;
        }
        
        .input-wrapper {
          position: relative;
          border-radius: 24px;
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .input-wrapper.active {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        
        .liquid-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(59, 130, 246, 0.15),
            transparent 60%
          );
        }
        
        .input-wrapper.active .liquid-glow {
          opacity: 1;
        }
        
        .input-bar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          padding: 8px 16px;
        }
        
        .input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #b0b0b0;
        }
        
        .lead-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e0e0e0;
          font-size: 1rem;
          padding: 12px 0;
        }
        
        .lead-input::placeholder {
          color: #707070;
        }
        
        .analyze-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          padding: 8px;
          transition: all 0.2s ease;
        }
        
        .analyze-button:disabled {
          color: #505050;
          cursor: not-allowed;
        }
        
        .analyze-button:not(:disabled):hover {
          transform: scale(1.1);
        }
        
        .input-suggestions {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 12px;
          padding: 16px;
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          z-index: 10;
        }
        
        .suggestions-title {
          font-size: 0.9rem;
          margin-bottom: 12px;
          color: #b0b0b0;
        }
        
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .suggestion-item:hover, .suggestion-item.selected {
          background-color: rgba(59, 130, 246, 0.2);
        }
        
        .suggestion-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }
        
        .suggestion-text {
          color: #d0d0d0;
        }
        
        .skip-to-content {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        
        .skip-to-content:focus {
          position: fixed;
          top: 16px;
          left: 16px;
          width: auto;
          height: auto;
          padding: 16px;
          background-color: #1a1a1a;
          color: #ffffff;
          z-index: 100;
          border-radius: 4px;
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
        
        @media (min-width: 768px) {
          .desktop-layout {
            max-width: 800px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default LeadPrediction; 