import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle, Search, Info, X, MessageSquare } from "react-feather";
import { useResponsive } from "../hooks/useResponsive";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
// Import CSS
import './LeadPrediction.css';

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
  });
}

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
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  // Initialize model ref to avoid re-creation on each render
  const modelRef = useRef(null);

  // Quick prompts for structured responses
  const quickPrompts = [
    {
      title: "Deepfake Fraud Investigation",
      prompt: "How do you approach a deepfake fraud case?",
      description: "Get a workflow diagram for investigating deepfake fraud"
    },
    {
      title: "Phishing Analysis",
      prompt: "What's the process for analyzing a phishing campaign?",
      description: "View structured analysis steps for phishing"
    },
    {
      title: "Cryptocurrency Scam",
      prompt: "How to investigate a cryptocurrency scam?",
      description: "See investigation workflow for crypto scams"
    }
  ];

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

  // Process Mermaid diagrams after rendering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        mermaid.init('.mermaid');
      }, 200);
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

  const handleQuickPromptClick = (prompt) => {
    setInputText(prompt);
    handleSubmit(new Event('submit'));
  };

  // Custom renderer for Mermaid diagrams and other structured content
  const renderMessageContent = (content) => {
    // Process content to identify and handle Mermaid diagrams
    const processedContent = content.replace(
      /```mermaid\n([\s\S]*?)```/g,
      (match, diagramCode) => {
        return `<div class="mermaid-container"><div class="mermaid">${diagramCode}</div></div>`;
      }
    );

    return (
      <div className="markdown-content">
        <ReactMarkdown 
          children={processedContent}
          components={{
            div: ({ node, className, children, ...props }) => {
              if (className === 'mermaid-container') {
                return <div className="mermaid-container" {...props} dangerouslySetInnerHTML={{ __html: children }} />;
              }
              return <div className={className} {...props}>{children}</div>;
            },
            table: ({ node, ...props }) => (
              <div className="table-container">
                <table className="structured-table" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => <th className="table-header" {...props} />,
            td: ({ node, ...props }) => <td className="table-cell" {...props} />,
          }}
        />
      </div>
    );
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
        setShowQuickPrompts(false);
        
        if (!modelRef.current) {
          throw new Error("Model not initialized");
        }
        
        // Prepare system message for lead prediction context with structured output instructions
        const systemMessage = {
          role: "system",
          content: `You are J.Ethical Lead Predictor, an AI assistant specialized in analyzing text for potential criminal patterns, scams, threats, and generating investigative leads for law enforcement. 
          
          Provide detailed analysis and actionable next steps for investigators.
          
          When appropriate, use structured formats:
          1. For workflows or processes, use Mermaid diagrams (syntax: \`\`\`mermaid flowchart TD or graph TD\`\`\`)
          2. For data comparisons, use markdown tables
          3. For step-by-step procedures, use numbered lists
          4. For key findings, use bullet points
          
          If the user asks about investigation workflows, case approaches, or methodologies, ALWAYS include a Mermaid diagram to visualize the process.`
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
      <div className={`lead-prediction-container ${isDesktop || isLargeDesktop ? 'desktop-layout' : ''}`}>
        <header className="lead-prediction-header">
          <h2 className="lead-prediction-title">
            <Search size={24} style={{ marginRight: '8px' }} />
            Lead Prediction
          </h2>
          <button 
            className="info-button"
            onClick={() => setShowQuickPrompts(!showQuickPrompts)}
            aria-label={showQuickPrompts ? "Hide quick prompts" : "Show quick prompts"}
          >
            {showQuickPrompts ? <X size={20} /> : <Info size={20} />}
          </button>
        </header>
        
        <div className="content-container">
          {/* Main chat area */}
          <div className="chat-container">
            {messages.length === 0 ? (
              <div className="welcome-container">
                <div className="user-manual">
                  <h3>Lead Prediction Tool</h3>
                  <p>Analyze suspicious content and generate investigative leads</p>
                  <ol>
                    <li>Copy the suspicious text or link from any source</li>
                    <li>Paste the copied text or link into the input box</li>
                    <li>Tap "Analyze" to generate potential leads</li>
                  </ol>
                </div>
                
                {showQuickPrompts && (
                  <div className="quick-prompts">
                    <h3>Try Structured Analysis</h3>
                    <div className="quick-prompts-grid">
                      {quickPrompts.map((item, index) => (
                        <div 
                          key={index} 
                          className="quick-prompt-card"
                          onClick={() => handleQuickPromptClick(item.prompt)}
                        >
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                          <div className="prompt-icon">
                            <MessageSquare size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
          </div>
          
          {/* Side panel for suggestions (desktop only) */}
          {(isDesktop || isLargeDesktop) && showQuickPrompts && messages.length > 0 && (
            <div className="side-panel">
              <div className="suggested-inputs">
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
            </div>
          )}
        </div>
        
        {/* Fixed input form at the bottom */}
        <div className="fixed-input-container">
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
      </div>
    </div>
  );
};

export default LeadPrediction; 