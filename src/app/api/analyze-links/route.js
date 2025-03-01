import { NextResponse } from 'next/server';

/**
 * Extract URLs from a text message
 * @param {string} message - The message to extract URLs from
 * @returns {Array} - Array of URLs found in the message
 */
function extractUrls(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.match(urlRegex) || [];
}

/**
 * Analyze a website using HTTP requests (without Selenium)
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} - Object containing analyzed data
 */
async function analyzeWebsite(url) {
  // For safety, we'll use a timeout to prevent hanging
  const TIMEOUT = 10000; // 10 seconds
  
  try {
    // Import axios dynamically
    const { default: axios } = await import('axios');
    
    // Make the HTTP request
    const response = await axios.get(url, { 
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Import cheerio dynamically
    const cheerioModule = await import('cheerio');
    const cheerio = cheerioModule.default || cheerioModule;
    
    // Parse with Cheerio
    const $ = cheerio.load(response.data);
    
    // Extract useful information
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((i, el) => $(el).text()).get();
    const links = $('a').map((i, el) => $(el).attr('href')).get();
    const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 10); // Limit to first 10 paragraphs
    
    // Extract forms if any (potential phishing indicators)
    const hasForms = $('form').length > 0;
    const hasPasswordFields = $('input[type="password"]').length > 0;
    const hasLoginForm = hasForms && (
      $('form:contains("login")').length > 0 || 
      $('form:contains("sign in")').length > 0 ||
      hasPasswordFields
    );
    
    return {
      url,
      title,
      metaDescription,
      h1s,
      paragraphs,
      linkCount: links.length,
      hasForms,
      hasPasswordFields,
      hasLoginForm,
      scrapedContent: paragraphs.join(' ').substring(0, 1000) // Limit content size
    };
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error);
    return {
      url,
      error: 'Failed to analyze website',
      errorDetails: error.message
    };
  }
}

/**
 * Analyze links in a message
 * @param {string} message - The message containing URLs to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeLinkContent(message) {
  const urls = extractUrls(message);
  
  if (urls.length === 0) {
    return {
      foundLinks: false,
      message: 'No links found in the message'
    };
  }
  
  // Only process the first 3 links to avoid performance issues
  const linksToProcess = urls.slice(0, 3);
  const results = [];
  
  for (const url of linksToProcess) {
    try {
      const analyzedData = await analyzeWebsite(url);
      results.push(analyzedData);
    } catch (error) {
      results.push({
        url,
        error: 'Failed to analyze link',
        errorDetails: error.message
      });
    }
  }
  
  return {
    foundLinks: true,
    processedLinks: results,
    allLinks: urls,
    additionalInfo: urls.length > 3 ? `${urls.length - 3} more links were found but not processed` : ''
  };
}

// API route handler
export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const result = await analyzeLinkContent(message);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze links', details: error.message },
      { status: 500 }
    );
  }
} 