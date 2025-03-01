'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { analyzeLinkContent, extractUrls } from '../../utils/linkScraper';

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
      let linkData = null;
      
      // If links are found, scrape them
      if (urls.length > 0) {
        setIsScrapingLinks(true);
        try {
          linkData = await analyzeLinkContent(message);
        } catch (scrapeError) {
          console.error('Error scraping links:', scrapeError);
        } finally {
          setIsScrapingLinks(false);
        }
      }
      
      // Store link analysis results
      setLinkAnalysis(linkData);
      
      // Prepare context for the LLM with link data if available
      let contextWithLinks = message;
      if (linkData && linkData.foundLinks) {
        const linkContext = linkData.processedLinks.map(link => {
          return `
Link: ${link.url}
Title: ${link.title || 'N/A'}
Description: ${link.metaDescription || 'N/A'}
Has Login Form: ${link.hasLoginForm ? 'Yes (SUSPICIOUS)' : 'No'}
Content: ${link.scrapedContent || 'N/A'}
          `.trim();
        }).join('\n\n');
        
        contextWithLinks = `${message}\n\nWEBSITE CONTENT FROM LINKS:\n${linkContext}`;
      }
      
      const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash-lite",
        maxOutputTokens: 2048,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      });

      // Include link data in the prompt if available
      const prompt = linkData && linkData.foundLinks
        ? `You are a spam detection system. Analyze this SMS message and the content of links it contains. Return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array. Pay special attention to phishing attempts, suspicious links, and misleading content.\n\nMESSAGE AND LINK CONTENT:\n${contextWithLinks}`
        : `You are a spam detection system. Analyze this SMS message and return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array: ${message}`;
      
      const response = await model.invoke(prompt);
      
      setResult(response);
      
      try {
        // Try to parse the response content
        const content = response.content || response;
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">SMS Spam Detector</h1>
      
      <div className="space-y-4">
        <textarea
          ref={textareaRef}
          className="w-full p-3 border rounded-lg min-h-[100px] text-black bg-white resize-none overflow-hidden"
          placeholder="Enter SMS message here..."
          value={message}
          onChange={handleMessageChange}
          rows={1}
        />
        
        <button
          onClick={analyzeMessage}
          disabled={loading || isScrapingLinks}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isScrapingLinks ? 'Scraping Links...' : loading ? 'Analyzing...' : 'Analyze Message'}
        </button>
        
        {error && (
          <div className="text-red-500 p-3 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        
        {linkAnalysis && linkAnalysis.foundLinks && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Link Analysis</h3>
            <p className="text-sm text-blue-600 mb-2">
              Found {linkAnalysis.allLinks.length} link(s) in the message. 
              {linkAnalysis.additionalInfo && ` ${linkAnalysis.additionalInfo}`}
            </p>
            
            {/* Link Summary */}
            {linkAnalysis.processedLinks.some(link => link.hasLoginForm || link.hasPasswordFields) && (
              <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-1">⚠️ Warning: Suspicious Links Detected</p>
                <p className="text-xs text-red-600">
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
                  <div key={index} className={`bg-white p-4 rounded-lg border ${isSuspicious ? 'border-red-300' : 'border-blue-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-blue-800 break-all">{link.url}</h4>
                      <div className="flex items-center gap-2">
                        {isSuspicious && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                            <span className="mr-1">⚠️</span> Suspicious
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Link {index + 1}</span>
                      </div>
                    </div>
                    
                    {link.error ? (
                      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                        <p className="font-medium">Error analyzing link:</p>
                        <p>{link.error}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700">Title</p>
                            <p className="text-sm text-gray-900">{link.title || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700">Description</p>
                            <p className="text-sm text-gray-900">{link.metaDescription || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Security indicators */}
                        <div className="flex flex-wrap gap-2">
                          {link.hasForms && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Contains Forms
                            </span>
                          )}
                          {link.hasPasswordFields && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                              Password Fields
                            </span>
                          )}
                          {link.hasLoginForm && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                              ⚠️ Login Form (Potential Phishing)
                            </span>
                          )}
                        </div>
                        
                        {/* Mobile: Only show detailed content when expanded */}
                        <div className={`md:block ${expandedLinks[index] ? 'block' : 'hidden'}`}>
                          {/* Content preview */}
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Content Preview</p>
                            <div className="text-xs p-3 bg-gray-50 rounded max-h-32 overflow-y-auto">
                              {link.scrapedContent ? (
                                <p className="whitespace-pre-wrap text-gray-900">{link.scrapedContent}</p>
                              ) : (
                                <p className="text-gray-500 italic">No content available</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Headers if available */}
                          {link.h1s && link.h1s.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Main Headers</p>
                              <ul className="text-xs list-disc list-inside pl-2">
                                {link.h1s.slice(0, 3).map((header, i) => (
                                  <li key={i} className="text-gray-700">{header}</li>
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
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 md:hidden block w-full text-center py-1 border border-blue-100 rounded"
                    >
                      {expandedLinks[index] ? 'Show less details' : 'Show more details'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {parsedResult && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-700">Spam Score</h3>
                  <div className="text-3xl font-bold text-orange-500">
                    {parsedResult.spamScore}%
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-700">Danger Score</h3>
                  <div className="text-3xl font-bold text-red-500">
                    {parsedResult.dangerScore}%
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Warnings</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <ul className="list-disc pl-5 space-y-2">
                    {parsedResult.warnings?.map((warning, index) => (
                      <li key={index} className="text-gray-700">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-white mb-3">Raw Response</h3>
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 