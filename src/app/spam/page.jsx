"use client";

import { useState, useRef, useEffect } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { analyzeLinkContent, extractUrls } from "../../utils/linkScraper";
import Link from "next/link";
import styles from "./page.module.css";

export default function SpamDetection() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkAnalysis, setLinkAnalysis] = useState(null);
  const [isScrapingLinks, setIsScrapingLinks] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState({});
  const textareaRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Toggle expanded state for a link
  const toggleLinkExpand = (index) => {
    setExpandedLinks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    setIsMounted(true);
    document.documentElement.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";
    document.body.style.width = "100%";
    document.body.style.backgroundColor = "black";
    document.body.style.color = "#d1d5db";
    document.body.style.boxSizing = "border-box";

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message to analyze");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setParsedResult(null);
      setLinkAnalysis(null);

      const urls = extractUrls(message);
      const operations = [];

      const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash-lite",
        maxOutputTokens: 2048,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      });

      const basicPrompt = `You are a spam detection system. Analyze this SMS message and return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array: ${message}`;
      const basicAnalysisPromise = model.invoke(basicPrompt);
      operations.push(basicAnalysisPromise);

      let linkData = null;
      let enhancedAnalysisPromise = null;

      if (urls.length > 0) {
        setIsScrapingLinks(true);

        const linkScrapingPromise = analyzeLinkContent(message)
          .then((data) => {
            linkData = data;
            setLinkAnalysis(data);

            if (data && data.foundLinks && data.processedLinks.length > 0) {
              const linkContext = data.processedLinks
                .map((link) => {
                  return `
Link: ${link.url}
Title: ${link.title || "N/A"}
Description: ${link.metaDescription || "N/A"}
Has Login Form: ${link.hasLoginForm ? "Yes (SUSPICIOUS)" : "No"}
Content: ${link.scrapedContent || "N/A"}
                `.trim();
                })
                .join("\n\n");

              const contextWithLinks = `${message}\n\nWEBSITE CONTENT FROM LINKS:\n${linkContext}`;

              const enhancedPrompt = `You are a spam detection system. Analyze this SMS message and the content of links it contains. Return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array. Pay special attention to phishing attempts, suspicious links, and misleading content.\n\nMESSAGE AND LINK CONTENT:\n${contextWithLinks}`;

              return model.invoke(enhancedPrompt);
            }

            return null;
          })
          .catch((error) => {
            console.error("Error scraping links:", error);
            return null;
          })
          .finally(() => {
            setIsScrapingLinks(false);
          });

        operations.push(linkScrapingPromise);
      }

      const results = await Promise.all(operations);
      const basicAnalysisResult = results[0];
      const enhancedAnalysisResult = urls.length > 0 ? results[1] : null;
      const finalResult = enhancedAnalysisResult || basicAnalysisResult;
      setResult(finalResult);

      try {
        const content = finalResult.content || finalResult;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonStr);
        setParsedResult(parsed);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
      }
    } catch (err) {
      setError("Error analyzing message. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className={styles.spamContainer}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              animation: "spin 1s linear infinite",
              borderRadius: "9999px",
              height: "3rem",
              width: "3rem",
              borderTop: "2px solid #60a5fa",
              borderBottom: "2px solid #60a5fa",
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.spamContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Sathyameva Jayadhe</h1>
        <div
          style={{
            width: "3rem",
            height: "3rem",
            backgroundColor: "#4b5563",
            borderRadius: "9999px",
          }}
        ></div>
      </div>

      {/* Back button */}
      <div>
        <Link href="/" className={styles.backButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              height: "1.25rem",
              width: "1.25rem",
              marginRight: "0.5rem",
            }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      {/* Title with Icon */}
      <div className={styles.titleContainer}>
        <h2 className={styles.appTitle}>Scam Detection</h2>
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        <h3 className={styles.sectionTitle}>Input</h3>

        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Enter input..."
            value={message}
            onChange={handleMessageChange}
            rows={4}
          />

          {message.includes("http") && (
            <div className={styles.linkIndicator}>
              <span style={{ marginRight: "0.5rem" }}>🔗</span>
              <span style={{ fontSize: "0.875rem" }}>Link detected</span>
            </div>
          )}
        </div>

        <button
          onClick={analyzeMessage}
          disabled={loading || isScrapingLinks}
          className={styles.detectButton}
        >
          {isScrapingLinks
            ? "Analyzing..."
            : loading
            ? "Analyzing..."
            : "Detect"}
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {/* Results Section */}
      {parsedResult && (
        <div className={styles.resultsSection}>
          <h3 className={styles.sectionTitle} style={{ color: "#9ca3af" }}>
            Analysis Results
          </h3>

          <div className={styles.resultContainer}>
            <div className={styles.scoreGrid}>
              <div className={styles.scoreCard}>
                <h3 className={`${styles.scoreTitle} ${styles.spamScoreTitle}`}>
                  Spam Score
                </h3>
                <div
                  className={`${styles.scoreValue} ${styles.spamScoreValue}`}
                >
                  {parsedResult.spamScore}%
                </div>
              </div>
              <div className={styles.scoreCard}>
                <h3
                  className={`${styles.scoreTitle} ${styles.dangerScoreTitle}`}
                >
                  Danger Score
                </h3>
                <div
                  className={`${styles.scoreValue} ${styles.dangerScoreValue}`}
                >
                  {parsedResult.dangerScore}%
                </div>
              </div>
            </div>

            <div>
              <h3
                className={styles.scoreTitle}
                style={{ color: "#d1d5db", marginBottom: "0.75rem" }}
              >
                Warnings
              </h3>
              <div className={styles.warningsContainer}>
                <ul className={styles.warningsList}>
                  {parsedResult.warnings?.map((warning, index) => (
                    <li key={index} className={styles.warningItem}>
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
        <div className={styles.linkAnalysisSection}>
          <h3 className={styles.sectionTitle} style={{ color: "#9ca3af" }}>
            Link Analysis
          </h3>

          <div className={styles.resultContainer}>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#9ca3af",
                marginBottom: "1rem",
              }}
            >
              Found {linkAnalysis.allLinks.length} link(s) in the message.
              {linkAnalysis.additionalInfo && ` ${linkAnalysis.additionalInfo}`}
            </p>

            {/* Link Summary */}
            {linkAnalysis.processedLinks.some(
              (link) => link.hasLoginForm || link.hasPasswordFields
            ) && (
              <div className={styles.linkWarning}>
                <p className={styles.linkWarningTitle}>
                  ⚠️ Warning: Suspicious Links Detected
                </p>
                <p className={styles.linkWarningText}>
                  One or more links contain login forms or password fields,
                  which may indicate phishing attempts. Be extremely cautious
                  with these links.
                </p>
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {linkAnalysis.processedLinks.map((link, index) => {
                // Determine if this link has suspicious indicators
                const isSuspicious =
                  link.hasLoginForm || link.hasPasswordFields;

                return (
                  <div
                    key={index}
                    className={`${styles.linkCard} ${
                      isSuspicious ? styles.linkCardSuspicious : ""
                    }`}
                  >
                    <div className={styles.linkHeader}>
                      <h4 className={styles.linkUrl}>{link.url}</h4>
                      <div className={styles.linkBadges}>
                        {isSuspicious && (
                          <span className={styles.suspiciousBadge}>
                            <span style={{ marginRight: "0.25rem" }}>⚠️</span>{" "}
                            Suspicious
                          </span>
                        )}
                        <span className={styles.linkNumberBadge}>
                          Link {index + 1}
                        </span>
                      </div>
                    </div>

                    {link.error ? (
                      <div className={styles.linkError}>
                        <p style={{ fontWeight: "500" }}>
                          Error analyzing link:
                        </p>
                        <p>{link.error}</p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        <div className={styles.linkInfoGrid}>
                          <div className={styles.linkInfoCard}>
                            <p className={styles.linkInfoLabel}>Title</p>
                            <p className={styles.linkInfoValue}>
                              {link.title || "N/A"}
                            </p>
                          </div>
                          <div className={styles.linkInfoCard}>
                            <p className={styles.linkInfoLabel}>Description</p>
                            <p className={styles.linkInfoValue}>
                              {link.metaDescription || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Security indicators */}
                        <div className={styles.securityBadges}>
                          {link.hasForms && (
                            <span className={styles.formBadge}>
                              Contains Forms
                            </span>
                          )}
                          {link.hasPasswordFields && (
                            <span className={styles.passwordBadge}>
                              Password Fields
                            </span>
                          )}
                          {link.hasLoginForm && (
                            <span className={styles.loginFormBadge}>
                              ⚠️ Login Form (Potential Phishing)
                            </span>
                          )}
                        </div>

                        {/* Mobile: Only show detailed content when expanded */}
                        <div
                          className={
                            expandedLinks[index]
                              ? styles.block
                              : styles.hidden + " " + styles.mdBlock
                          }
                        >
                          {/* Content preview */}
                          <div className={styles.contentPreview}>
                            <p className={styles.contentPreviewLabel}>
                              Content Preview
                            </p>
                            <div className={styles.contentPreviewBox}>
                              {link.scrapedContent ? (
                                <p className={styles.contentText}>
                                  {link.scrapedContent}
                                </p>
                              ) : (
                                <p className={styles.noContentText}>
                                  No content available
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Headers if available */}
                          {link.h1s && link.h1s.length > 0 && (
                            <div className={styles.headersSection}>
                              <p className={styles.headersLabel}>
                                Main Headers
                              </p>
                              <ul className={styles.headersList}>
                                {link.h1s.slice(0, 3).map((header, i) => (
                                  <li key={i} className={styles.headerItem}>
                                    {header}
                                  </li>
                                ))}
                                {link.h1s.length > 3 && (
                                  <li className={styles.moreHeadersItem}>
                                    ...and {link.h1s.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Link stats */}
                          {link.linkCount !== undefined && (
                            <div className={styles.linkStats}>
                              Contains {link.linkCount} links
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expand/collapse button for mobile */}
                    <button
                      onClick={() => toggleLinkExpand(index)}
                      className={styles.expandButton}
                    >
                      {expandedLinks[index]
                        ? "Show less details"
                        : "Show more details"}
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
