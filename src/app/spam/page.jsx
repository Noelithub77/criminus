'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { analyzeLinkContent, extractUrls } from '../../utils/linkScraper';
import Link from 'next/link';

// Add CSS to ensure full width
const pageStyles = {
  minHeight: '100vh',
  width: '100vw',
  maxWidth: '100%',
  margin: 0,
  padding: '1.5rem',
  backgroundColor: 'black',
  color: '#d1d5db',
  boxSizing: 'border-box'
};

export default function SpamDetection() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkAnalysis, setLinkAnalysis] = useState(null);
  const [isScrapingLinks, setIsScrapingLinks] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState({});
  const textareaRef = useRef(null);

  // Toggle expanded state for a link
  const toggleLinkExpand = (index) => {
    setExpandedLinks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Add effect to force layout recalculation after component mounts
  useEffect(() => {
    // Force layout recalculation
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 0);
  }, []);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message to analyze');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setParsedResult(null);
      setLinkAnalysis(null);
      
      // Check if the message contains links
      const urls = extractUrls(message);
      
      // Start both operations in parallel
      const operations = [];
      
      // 1. Start the basic LLM analysis immediately
      const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash-lite",
        maxOutputTokens: 2048,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      });
      
      const basicPrompt = `You are a spam detection system. Analyze this SMS message and return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array: ${message}`;
      const basicAnalysisPromise = model.invoke(basicPrompt);
      operations.push(basicAnalysisPromise);
      
      // 2. Start link scraping in parallel (if links exist)
      let linkData = null;
      let enhancedAnalysisPromise = null;
      
      if (urls.length > 0) {
        setIsScrapingLinks(true);
        
        // Create a promise for link scraping
        const linkScrapingPromise = analyzeLinkContent(message)
          .then(data => {
            linkData = data;
            setLinkAnalysis(data);
            
            // If links were found and scraped successfully, do an enhanced analysis
            if (data && data.foundLinks && data.processedLinks.length > 0) {
              // Prepare context with link data
              const linkContext = data.processedLinks.map(link => {
                return `
Link: ${link.url}
Title: ${link.title || 'N/A'}
Description: ${link.metaDescription || 'N/A'}
Has Login Form: ${link.hasLoginForm ? 'Yes (SUSPICIOUS)' : 'No'}
Content: ${link.scrapedContent || 'N/A'}
                `.trim();
              }).join('\n\n');
              
              const contextWithLinks = `${message}\n\nWEBSITE CONTENT FROM LINKS:\n${linkContext}`;
              
              // Create enhanced prompt with link data
              const enhancedPrompt = `You are a spam detection system. Analyze this SMS message and the content of links it contains. Return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array. Pay special attention to phishing attempts, suspicious links, and misleading content.\n\nMESSAGE AND LINK CONTENT:\n${contextWithLinks}`;
              
              // Start enhanced analysis
              return model.invoke(enhancedPrompt);
            }
            
            // If no links were found or scraping failed, return null
            return null;
          })
          .catch(error => {
            console.error('Error scraping links:', error);
            return null;
          })
          .finally(() => {
            setIsScrapingLinks(false);
          });
        
        operations.push(linkScrapingPromise);
      }
      
      // Wait for all operations to complete
      const results = await Promise.all(operations);
      
      // Use enhanced analysis if available, otherwise use basic analysis
      const basicAnalysisResult = results[0];
      const enhancedAnalysisResult = urls.length > 0 ? results[1] : null;
      
      // Prefer enhanced analysis if available
      const finalResult = enhancedAnalysisResult || basicAnalysisResult;
      setResult(finalResult);
      
      try {
        // Try to parse the response content
        const content = finalResult.content || finalResult;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonStr);
        setParsedResult(parsed);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
      }
    } catch (err) {
      setError('Error analyzing message. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyles}>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/frontend" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Frontend</span>
        </Link>
      </div>
      
      {/* Header with name */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-medium text-gray-300">Sathyameva Jayadhe</h1>
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
      </div>
      
      {/* Scam Detection Title with Icon */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="w-14 h-14 bg-transparent rounded-full flex items-center justify-center border-2 border-blue-400 relative">
            <span className="text-blue-400 text-2xl font-bold">S</span>
            <div className="absolute -right-1 -bottom-1 w-8 h-8 bg-black flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-4xl font-bold text-blue-400">Scam Detection</h2>
      </div>
      
      {/* Input Section */}
      <div className="mt-12">
        <h3 className="text-2xl mb-6 text-blue-400">Input</h3>
        
        <div className="bg-gray-500 bg-opacity-30 rounded-lg p-6 mb-6">
          <textarea
            ref={textareaRef}
            className="w-full p-3 border-0 rounded-lg min-h-[120px] text-gray-300 bg-transparent resize-none focus:outline-none"
            placeholder="Enter input..."
            value={message}
            onChange={handleMessageChange}
            rows={4}
          />
          
          {/* Link icon */}
          {message.includes('http') && (
            <div className="flex items-center mt-2 text-gray-500">
              <span className="mr-2">🔗</span>
              <span className="text-sm">Link detected</span>
            </div>
          )}
        </div>
        
        <button
          onClick={analyzeMessage}
          disabled={loading || isScrapingLinks}
          className="w-full bg-teal-700 text-white py-3 px-4 rounded-lg hover:bg-teal-600 disabled:opacity-50 text-lg font-medium"
        >
          {isScrapingLinks ? 'Analyzing...' : loading ? 'Analyzing...' : 'Detect'}
        </button>
        
        {error && (
          <div className="text-red-400 p-3 rounded-lg bg-red-900 bg-opacity-30 mt-4">
            {error}
          </div>
        )}
      </div>
      
      {/* Results Section */}
      {parsedResult && (
        <div className="mt-10 space-y-6">
          <h3 className="text-2xl mb-6 text-gray-400">Analysis Results</h3>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-orange-400">Spam Score</h3>
                <div className="text-3xl font-bold text-orange-300">
                  {parsedResult.spamScore}%
                </div>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-red-400">Danger Score</h3>
                <div className="text-3xl font-bold text-red-300">
                  {parsedResult.dangerScore}%
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-3">Warnings</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {parsedResult.warnings?.map((warning, index) => (
                    <li key={index} className="text-gray-300">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Link Analysis Section */}
      {linkAnalysis && linkAnalysis.foundLinks && (
        <div className="mt-10 space-y-6">
          <h3 className="text-2xl mb-6 text-gray-400">Link Analysis</h3>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-sm text-gray-400 mb-4">
              Found {linkAnalysis.allLinks.length} link(s) in the message. 
              {linkAnalysis.additionalInfo && ` ${linkAnalysis.additionalInfo}`}
            </p>
            
            {/* Link Summary */}
            {linkAnalysis.processedLinks.some(link => link.hasLoginForm || link.hasPasswordFields) && (
              <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg mb-6 border border-red-800">
                <p className="text-sm font-medium text-red-400 mb-1">⚠️ Warning: Suspicious Links Detected</p>
                <p className="text-xs text-red-300">
                  One or more links contain login forms or password fields, which may indicate phishing attempts.
                  Be extremely cautious with these links.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {linkAnalysis.processedLinks.map((link, index) => {
                // Determine if this link has suspicious indicators
                const isSuspicious = link.hasLoginForm || link.hasPasswordFields;
                
                return (
                  <div key={index} className={`bg-gray-700 p-4 rounded-lg border ${isSuspicious ? 'border-red-800' : 'border-gray-600'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-blue-300 break-all">{link.url}</h4>
                      <div className="flex items-center gap-2">
                        {isSuspicious && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-900 text-red-300 flex items-center">
                            <span className="mr-1">⚠️</span> Suspicious
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">Link {index + 1}</span>
                      </div>
                    </div>
                    
                    {link.error ? (
                      <div className="text-red-400 text-sm p-2 bg-red-900 bg-opacity-30 rounded">
                        <p className="font-medium">Error analyzing link:</p>
                        <p>{link.error}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-800 rounded">
                            <p className="text-sm font-medium text-gray-400">Title</p>
                            <p className="text-sm text-gray-300">{link.title || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-800 rounded">
                            <p className="text-sm font-medium text-gray-400">Description</p>
                            <p className="text-sm text-gray-300">{link.metaDescription || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Security indicators */}
                        <div className="flex flex-wrap gap-2">
                          {link.hasForms && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 bg-opacity-30 text-yellow-300">
                              Contains Forms
                            </span>
                          )}
                          {link.hasPasswordFields && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-900 bg-opacity-30 text-orange-300">
                              Password Fields
                            </span>
                          )}
                          {link.hasLoginForm && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-900 bg-opacity-30 text-red-300">
                              ⚠️ Login Form (Potential Phishing)
                            </span>
                          )}
                        </div>
                        
                        {/* Mobile: Only show detailed content when expanded */}
                        <div className={`md:block ${expandedLinks[index] ? 'block' : 'hidden'}`}>
                          {/* Content preview */}
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-400 mb-1">Content Preview</p>
                            <div className="text-xs p-3 bg-gray-800 rounded max-h-32 overflow-y-auto">
                              {link.scrapedContent ? (
                                <p className="whitespace-pre-wrap text-gray-300">{link.scrapedContent}</p>
                              ) : (
                                <p className="text-gray-500 italic">No content available</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Headers if available */}
                          {link.h1s && link.h1s.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-400 mb-1">Main Headers</p>
                              <ul className="text-xs list-disc list-inside pl-2">
                                {link.h1s.slice(0, 3).map((header, i) => (
                                  <li key={i} className="text-gray-300">{header}</li>
                                ))}
                                {link.h1s.length > 3 && (
                                  <li className="text-gray-500 italic">...and {link.h1s.length - 3} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {/* Link stats */}
                          {link.linkCount !== undefined && (
                            <div className="text-xs text-gray-500">
                              Contains {link.linkCount} links
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Expand/collapse button for mobile */}
                    <button 
                      onClick={() => toggleLinkExpand(index)}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 md:hidden block w-full text-center py-1 border border-gray-600 rounded"
                    >
                      {expandedLinks[index] ? 'Show less details' : 'Show more details'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 