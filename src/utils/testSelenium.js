const axios = require('axios');
const { extractUrls } = require('./linkScraper');

// Test function to verify API setup
async function testApiSetup() {
  console.log('Testing link analysis API...');
  
  try {
    // Test with a safe website
    const testMessage = 'Check out this link: https://www.example.com';
    console.log(`Testing with message: "${testMessage}"`);
    
    // Extract URLs to verify client-side functionality
    const urls = extractUrls(testMessage);
    console.log(`Found ${urls.length} URLs: ${JSON.stringify(urls)}`);
    
    // Call the API directly for testing
    const response = await axios.post('http://localhost:3000/api/analyze-links', { 
      message: testMessage 
    });
    
    console.log('API test completed successfully!');
    console.log('Result:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('NOTE: Make sure your Next.js server is running on http://localhost:3000');
  
  testApiSetup()
    .then(success => {
      if (success) {
        console.log('✅ Link analysis API is working correctly!');
        process.exit(0);
      } else {
        console.error('❌ Link analysis API test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error running test:', error);
      process.exit(1);
    });
}

module.exports = { testApiSetup }; 