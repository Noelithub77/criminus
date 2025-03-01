import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle, Search, Info, X, MessageSquare } from "react-feather";
import { useResponsive } from "../hooks/useResponsive";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
// Import CSS
import './LeadPrediction.css';

// Create a safe mermaid initialization function
const initializeMermaid = () => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  try {
    mermaid.initialize({
      startOnLoad: false, // We'll manually render diagrams
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: false,
        padding: 15
      },
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#3b82f6',
        lineColor: '#aaaaaa',
        secondaryColor: '#006100',
        tertiaryColor: '#202020'
      },
      logLevel: 5 // This will silence non-critical errors
    });
    console.log('Mermaid initialized successfully');
  } catch (error) {
    console.error('Failed to initialize mermaid:', error);
  }
};

// Initialize mermaid only on client-side
if (typeof window !== 'undefined') {
  // Delay initialization to ensure document is fully loaded
  if (document.readyState === 'complete') {
    initializeMermaid();
  } else {
    window.addEventListener('load', initializeMermaid);
  }
}

// Dedicated component for Mermaid diagrams
const MermaidDiagram = ({ chart, title }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`).current;

  // Extract title from the first line of the chart if not provided
  const diagramTitle = title || (chart.split('\n')[0].startsWith('%%') ? 
    chart.split('\n')[0].replace('%%', '').trim() : 'Workflow Diagram');

  // Check if we're in the browser environment
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client-side and when we have chart data
    if (!isClient || !chart) return;
    
    const renderDiagram = async () => {
      try {
        // Configure mermaid with cute colors for this specific diagram
        const config = {
          theme: 'default',
          themeVariables: {
            primaryColor: '#6366f1',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#818cf8',
            lineColor: '#a5b4fc',
            secondaryColor: '#f472b6',
            tertiaryColor: '#fef3f2',
            fontSize: '16px'
          },
          flowchart: {
            curve: 'basis',
            htmlLabels: true,
            padding: 15
          },
          securityLevel: 'loose',
          startOnLoad: false
        };

        // Remove title comment if present
        const cleanChart = chart.startsWith('%%') ? 
          chart.split('\n').slice(1).join('\n') : chart;
        
        // Use mermaid.parse to validate the diagram syntax first
        await mermaid.parse(cleanChart);
        
        // If parsing succeeds, render the diagram
        const { svg } = await mermaid.render(id, cleanChart, config);
        
        // Make the SVG more visually appealing
        const enhancedSvg = svg
          .replace(/stroke-width="1"/g, 'stroke-width="2"')
          .replace(/font-size="14px"/g, 'font-size="16px"')
          .replace(/font-family="sans-serif"/g, 'font-family="Inter, sans-serif"');
        
        setSvg(enhancedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid error:", err);
        setError(err.message || "Failed to process diagram");
        setSvg(''); // Clear any previous SVG
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);

    return () => clearTimeout(timer);
  }, [chart, id, isClient]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Show loading state when rendering
  if (!isClient) {
    return (
      <div className="mermaid-wrapper">
        <div className="mermaid-title">{diagramTitle}</div>
        <div className="mermaid-container mermaid-loading">
          <div className="mermaid-loading-indicator">
            <div className="spinner"></div>
            <p>Preparing diagram...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mermaid-error">
        <p>Error rendering diagram: {error}</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div className={`mermaid-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="mermaid-title">{diagramTitle}</div>
      <div className="mermaid-controls">
        <button 
          className="fullscreen-toggle" 
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
        >
          {isFullscreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      {svg ? (
        <div 
          className="mermaid-container" 
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="mermaid-container mermaid-loading">
          <div className="mermaid-loading-indicator">
            <div className="spinner"></div>
            <p>Rendering diagram...</p>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Predefined responses for quick prompts to ensure proper rendering
  const predefinedResponses = {
    "How do you approach a deepfake fraud case?": `# Deepfake Fraud Investigation Approach

When investigating a deepfake fraud case, a structured approach helps identify, analyze, and build evidence against perpetrators.

## Investigation Workflow

\`\`\`mermaid
%% Deepfake Investigation Process
flowchart LR
    A([Initial Report]) --> B([Evidence Collection])
    B --> C{Media Authentication}
    C -->|Authentic| D([Case Closure])
    C -->|Deepfake Detected| E([Technical Analysis])
    E --> F([Source Tracing])
    F --> G([Suspect Identification])
    G --> H{Evidence Sufficient?}
    H -->|No| I([Additional Investigation])
    I --> F
    H -->|Yes| J([Case Building])
    J --> K([Legal Action])
    
    style A fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style B fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style C fill:#fecdd3,stroke:#f43f5e,color:#881337
    style D fill:#86efac,stroke:#22c55e,color:#14532d
    style E fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style F fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style G fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style H fill:#fecdd3,stroke:#f43f5e,color:#881337
    style I fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style J fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
    style K fill:#86efac,stroke:#22c55e,color:#14532d
\`\`\`

## Key Investigation Steps

1. **Initial Report Assessment**
   - Document complaint details
   - Preserve original evidence
   - Establish timeline of events

2. **Evidence Collection**
   - Secure digital evidence
   - Document chain of custody
   - Collect witness statements

3. **Media Authentication**
   - Apply forensic analysis tools
   - Check metadata integrity
   - Analyze audio/visual inconsistencies

4. **Technical Analysis**
   - Identify deepfake indicators
   - Determine creation method
   - Assess sophistication level

5. **Source Tracing**
   - Track digital footprints
   - Analyze network traffic
   - Identify IP addresses

6. **Case Building**
   - Compile comprehensive evidence
   - Prepare expert testimonies
   - Document financial damages

## Investigative Tools

| Tool Category | Purpose | Examples |
|---------------|---------|----------|
| Media Analysis | Detect manipulation markers | Deepware, FaceForensics |
| Network Analysis | Trace distribution sources | Wireshark, NetworkMiner |
| Metadata Extraction | Reveal hidden file data | ExifTool, Metadata++ |
| AI Detection | Identify AI generation patterns | Microsoft Video Authenticator |

This structured approach ensures thorough investigation while maintaining proper evidence handling for successful prosecution.`
  };

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

  // Special effect for handling predefined responses with mermaid diagrams
  useEffect(() => {
    // This effect is no longer needed as we're handling rendering in the MermaidDiagram component
    // The renderMessageContent function will create MermaidDiagram components that handle their own rendering
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
    // Check if we have a predefined response for this prompt
    if (predefinedResponses[prompt]) {
      // Add user message
      const userMessage = { role: 'user', content: prompt };
      
      // Add predefined AI response
      const aiMessage = { 
        role: 'assistant', 
        content: predefinedResponses[prompt]
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setShowQuickPrompts(false);
      
      // Clear input if there was any
      setInputText("");
      
      // Scroll to bottom after a short delay to ensure rendering
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Use the normal API call for other prompts
      setInputText(prompt);
      handleSubmit(new Event('submit'));
    }
  };

  // Custom renderer for Mermaid diagrams and other structured content
  const renderMessageContent = (content) => {
    // Split content to find mermaid diagrams
    const parts = [];
    let lastIndex = 0;
    
    // Regular expression to find mermaid code blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      // Add text before the mermaid block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Extract the mermaid diagram content
      const diagramContent = match[1].trim();
      
      // Look for a title in the diagram content or preceding text
      let title = null;
      
      // First check if the diagram has a title comment
      const firstLine = diagramContent.split('\n')[0];
      if (firstLine && firstLine.startsWith('%%')) {
        title = firstLine.replace(/^%%\s*/, '').trim();
      } else {
        // If no title in diagram, look in preceding text
        const precedingText = content.substring(0, match.index);
        const lines = precedingText.split('\n');
        
        // Check the last few lines for a heading that might be a title
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
          const line = lines[i].trim();
          if (line.startsWith('##') || line.startsWith('###')) {
            title = line.replace(/^#+\s+/, '');
            break;
          }
        }
      }
      
      // Add the mermaid diagram with its title
      parts.push({
        type: 'mermaid',
        content: diagramContent,
        title: title || 'Workflow Diagram'
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // If no mermaid diagrams were found, just return the whole content
    if (parts.length === 0) {
      return (
        <div className="markdown-content">
          <ReactMarkdown 
            children={content}
            components={{
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
    }
    
    // Render the parts
    return (
      <div className="markdown-content">
        {parts.map((part, index) => {
          if (part.type === 'mermaid') {
            return <MermaidDiagram key={index} chart={part.content} title={part.title} />;
          } else {
            // Replace any remaining mermaid code blocks with empty strings
            // to avoid rendering them as code blocks
            const cleanContent = part.content.replace(/```mermaid\n[\s\S]*?```/g, '');
            return (
              <ReactMarkdown 
                key={index}
                children={cleanContent}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="table-container">
                      <table className="structured-table" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => <th className="table-header" {...props} />,
                  td: ({ node, ...props }) => <td className="table-cell" {...props} />,
                }}
              />
            );
          }
        })}
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
          1. For workflows or processes, use Mermaid diagrams with this exact syntax:
          \`\`\`mermaid
          %% Title of the diagram
          flowchart LR
            A([Start]) --> B{Decision}
            B -->|Yes| C([Action])
            B -->|No| D([Other Action])
            
            style A fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
            style B fill:#fecdd3,stroke:#f43f5e,color:#881337
            style C fill:#86efac,stroke:#22c55e,color:#14532d
            style D fill:#c4b5fd,stroke:#8b5cf6,color:#1e1b4b
          \`\`\`
          
          2. For data comparisons, use markdown tables
          3. For step-by-step procedures, use numbered lists
          4. For key findings, use bullet points
          
          If the user asks about investigation workflows, case approaches, or methodologies, ALWAYS include a Mermaid diagram to visualize the process. Use flowchart LR (left to right) direction for better readability and rounded nodes with ([text]) syntax for a more appealing look. Always include a title for the diagram as a comment at the top of the mermaid code using %% syntax.`
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
          {(isDesktop || isLargeDesktop) && showQuickPrompts && (
            <div className="side-panel">
              {messages.length > 0 ? (
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
              ) : (
                <div className="quick-tips">
                  <h3>Quick Tips</h3>
                  <div className="tips-list">
                    <div className="tip-item">
                      <div className="tip-icon">💡</div>
                      <p>Click on diagrams to view them in fullscreen mode</p>
                    </div>
                    <div className="tip-item">
                      <div className="tip-icon">💡</div>
                      <p>Try asking for specific investigation workflows</p>
                    </div>
                    <div className="tip-item">
                      <div className="tip-icon">💡</div>
                      <p>Paste suspicious messages for detailed analysis</p>
                    </div>
                  </div>
                </div>
              )}
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