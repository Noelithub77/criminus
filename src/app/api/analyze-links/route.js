import { NextResponse } from 'next/server';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import cheerio from 'cheerio';
import axios from 'axios';

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
 * Scrape a website using Selenium (server-side only)
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - Object containing scraped data
 */
async function scrapeWebsite(url) {
  // For safety, we'll use a timeout to prevent hanging
  const TIMEOUT = 15000; // 15 seconds
  
  let driver;
  try {
    // Set up Chrome options for headless mode
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Build the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Navigate to the URL
    await driver.get(url);
    
    // Wait for the page to load (wait for body)
    await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);
    
    // Get page source
    const pageSource = await driver.getPageSource();
    
    // Parse with Cheerio
    const $ = cheerio.load(pageSource);
    
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
    console.error(`Error scraping ${url}:`, error);
    
    // Fallback to simple HTTP request if Selenium fails
    try {
      const response = await axios.get(url, { timeout: TIMEOUT });
      const $ = cheerio.load(response.data);
      
      return {
        url,
        title: $('title').text(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        paragraphs: $('p').map((i, el) => $(el).text()).get().slice(0, 5),
        error: 'Selenium failed, using fallback HTTP request',
        scrapedContent: $('body').text().substring(0, 1000) // Limit content size
      };
    } catch (fallbackError) {
      return {
        url,
        error: 'Failed to scrape website',
        errorDetails: fallbackError.message
      };
    }
  } finally {
    // Always quit the driver to clean up resources
    if (driver) {
      await driver.quit().catch(e => console.error('Error quitting driver:', e));
    }
  }
}

/**
 * Analyze links in a message and scrape their content (server-side)
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
      const scrapedData = await scrapeWebsite(url);
      results.push(scrapedData);
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