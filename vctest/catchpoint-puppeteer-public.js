/**
 * Catchpoint VC Bug Test Script - Puppeteer Public Version
 * Puppeteer automation following exact Catchpoint.startStep() pattern
 * 
 * SETUP REQUIRED:
 * 1. Upload all files from this folder to your GitHub repository
 * 2. Enable GitHub Pages in repository settings
 * 3. Update BASE_URL below with your GitHub username and repository name
 * 4. Install dependencies: npm install puppeteer
 * 
 * USAGE: node catchpoint-puppeteer-public.js
 */

const puppeteer = require('puppeteer');

// Updated with your GitHub Pages URL
const BASE_URL = 'https://playwright-karthik.github.io/qatesting/vctest/';

/**
 * Test 1: Basic Catchpoint Integration Test (Puppeteer)
 * Tests fundamental VC timing with soft navigation
 */
async function basicCatchpointTestPuppeteer() {
  console.log('🎯 Starting Basic Catchpoint Test (Puppeteer Public)...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();

  try {
    // Step 1: Navigate to public test page
    await Catchpoint.startStep('Navigate to Public Test Page');
    console.log('📍 Navigating to:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Page loaded successfully');
    await Catchpoint.endStep();

    // Step 2: Perform search interaction (soft navigation)
    await Catchpoint.startStep('Perform Search Interaction');
    console.log('🔍 Triggering search...');
    await page.type('#search', 'catchpoint test');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    console.log('✅ Search results displayed');
    await Catchpoint.endStep();

    // Step 3: Verify results content
    await Catchpoint.startStep('Verify Search Results');
    const resultsText = await page.$eval('#results', el => el.textContent);
    console.log('📊 Results:', resultsText);
    
    if (resultsText && resultsText.includes('catchpoint test')) {
      console.log('✅ Search verification passed');
    } else {
      console.log('❌ Search verification failed');
    }
    await Catchpoint.endStep();

    console.log('🎉 Basic Catchpoint Test (Puppeteer) Completed Successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 2: Comprehensive VC Bug Analysis (Puppeteer)
 * Tests multiple scenarios to identify VC timing issues
 */
async function comprehensiveCatchpointTestPuppeteer() {
  console.log('🔬 Starting Comprehensive VC Bug Analysis (Puppeteer)...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();

  try {
    // Test home page
    await Catchpoint.startStep('Load Home Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.container', { timeout: 10000 });
    await Catchpoint.endStep();

    // Test search functionality
    await Catchpoint.startStep('Test Search Function');
    await page.type('#search', 'vc bug test');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    await Catchpoint.endStep();

    // Test navigation to About page
    await Catchpoint.startStep('Navigate to About Page');
    await page.click('a[href="about.html"]');
    await page.waitForSelector('h1', { timeout: 5000 });
    await Catchpoint.endStep();

    // Test navigation to Contact page
    await Catchpoint.startStep('Navigate to Contact Page');
    await page.click('a[href="contact.html"]');
    await page.waitForSelector('#contact-form', { timeout: 5000 });
    await Catchpoint.endStep();

    // Test form interaction (complex soft navigation)
    await Catchpoint.startStep('Fill Contact Form');
    await page.type('#name', 'Catchpoint Tester');
    await page.type('#email', 'test@catchpoint.com');
    await page.type('#subject', 'VC Bug Testing');
    await page.type('#message', 'Testing VC timing with complex interactions');
    await Catchpoint.endStep();

    // Test form submission (async soft navigation)
    await Catchpoint.startStep('Submit Contact Form');
    await page.click('#submit-btn');
    await page.waitForSelector('.form-message.success', { timeout: 10000 });
    console.log('📧 Form submission completed');
    await Catchpoint.endStep();

    console.log('🎉 Comprehensive Test (Puppeteer) Completed Successfully');

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 3: SPA vs Normal Navigation Comparison (Puppeteer)
 * Direct comparison to highlight VC timing differences
 */
async function spaVsNormalTestPuppeteer() {
  console.log('⚔️ Starting SPA vs Normal Navigation Comparison (Puppeteer)...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    // Test normal navigation (full page loads)
    console.log('📖 Testing Normal Navigation...');
    const page1 = await browser.newPage();

    await Catchpoint.startStep('Normal Nav - Home Page');
    await page1.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Normal Nav - About Page');
    await page1.goto(BASE_URL + 'about.html', { waitUntil: 'networkidle0' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Normal Nav - Contact Page');
    await page1.goto(BASE_URL + 'contact.html', { waitUntil: 'networkidle0' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await page1.close();

    // Test SPA navigation (soft navigation)
    console.log('🔄 Testing SPA Navigation...');
    const page2 = await browser.newPage();

    await Catchpoint.startStep('SPA - Initial Load');
    await page2.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page2.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('SPA - Search Interaction');
    await page2.type('#search', 'spa navigation test');
    await page2.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('SPA - Click About Link');
    await page2.click('a[href="about.html"]');
    await page2.waitForSelector('h1', { timeout: 5000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('SPA - Click Contact Link');
    await page2.click('a[href="contact.html"]');
    await page2.waitForSelector('#contact-form', { timeout: 5000 });
    await Catchpoint.endStep();

    await page2.close();

    console.log('🏁 SPA vs Normal Comparison (Puppeteer) Completed');

  } catch (error) {
    console.error('❌ Comparison test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 4: Interactive DOM Testing (Puppeteer)
 * Tests complex DOM interactions for VC timing
 */
async function interactiveDOMTestPuppeteer() {
  console.log('🎭 Starting Interactive DOM Testing (Puppeteer)...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();

  try {
    await Catchpoint.startStep('DOM Test - Initial Load');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    // Test DOM manipulation
    await Catchpoint.startStep('DOM Test - Evaluate Script');
    await page.evaluate(() => {
      const results = document.getElementById('results');
      results.style.display = 'block';
      results.innerHTML = '🔬 DOM manipulation test in progress...';
    });
    await page.waitForTimeout(1000);
    await Catchpoint.endStep();

    // Test multiple DOM updates
    await Catchpoint.startStep('DOM Test - Multiple Updates');
    for (let i = 1; i <= 3; i++) {
      await page.evaluate((iteration) => {
        const results = document.getElementById('results');
        results.innerHTML = `📊 DOM update ${iteration}/3 completed`;
      }, i);
      await page.waitForTimeout(400);
    }
    await Catchpoint.endStep();

    // Test form dynamic validation
    await page.click('a[href="contact.html"]');
    await page.waitForSelector('#contact-form', { timeout: 5000 });

    await Catchpoint.startStep('DOM Test - Form Validation');
    await page.type('#name', 'DOM Tester');
    await page.evaluate(() => {
      document.getElementById('name').blur();
    });
    await page.waitForSelector('#name-error', { timeout: 2000 });
    await Catchpoint.endStep();

    console.log('🎯 Interactive DOM Testing (Puppeteer) Completed');

  } catch (error) {
    console.error('❌ DOM test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 5: Performance Timing Test (Puppeteer)
 * Measures performance with Puppeteer's metrics
 */
async function performanceTimingTestPuppeteer() {
  console.log('📈 Starting Performance Timing Test (Puppeteer)...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();

  try {
    await Catchpoint.startStep('Performance - Page Load');
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing);
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Page load time: ${loadTime}ms`);
    console.log(`📈 Performance metrics available:`, typeof performanceMetrics);
    
    await page.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Performance - Search Interaction');
    const searchStartTime = Date.now();
    await page.type('#search', 'performance test');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    const searchTime = Date.now() - searchStartTime;
    console.log(`🔍 Search interaction time: ${searchTime}ms`);
    await Catchpoint.endStep();

    await Catchpoint.startStep('Performance - Navigation');
    const navStartTime = Date.now();
    await page.click('a[href="about.html"]');
    await page.waitForSelector('h1', { timeout: 5000 });
    const navTime = Date.now() - navStartTime;
    console.log(`🔗 Navigation time: ${navTime}ms`);
    await Catchpoint.endStep();

    console.log('📊 Performance Timing Test (Puppeteer) Completed');

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Main execution function
async function runAllTestsPuppeteer() {
  console.log('🚀 Starting Catchpoint VC Bug Test Suite - Puppeteer Public Version');
  console.log('🌐 Target URL:', BASE_URL);
  
  if (BASE_URL.includes('YOUR_GITHUB_USERNAME')) {
    console.error('❌ Please update BASE_URL with your actual GitHub username and repository name');
    console.error('📝 Update line 13 in this file');
    return;
  }

  const tests = [
    { name: 'Basic Catchpoint Test (Puppeteer)', fn: basicCatchpointTestPuppeteer },
    { name: 'Comprehensive VC Analysis (Puppeteer)', fn: comprehensiveCatchpointTestPuppeteer },
    { name: 'SPA vs Normal Navigation (Puppeteer)', fn: spaVsNormalTestPuppeteer },
    { name: 'Interactive DOM Testing (Puppeteer)', fn: interactiveDOMTestPuppeteer },
    { name: 'Performance Timing Test (Puppeteer)', fn: performanceTimingTestPuppeteer }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🎬 Running: ${test.name}`);
      await test.fn();
      console.log(`✅ ${test.name} completed successfully\n`);
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      console.log(`⏭️ Continuing to next test...\n`);
    }
  }

  console.log('🏁 All Catchpoint VC tests (Puppeteer) completed!');
  console.log('📊 Check your Catchpoint dashboard for VC timing analysis');
}

// Export for individual test execution
module.exports = {
  basicCatchpointTestPuppeteer,
  comprehensiveCatchpointTestPuppeteer,
  spaVsNormalTestPuppeteer,
  interactiveDOMTestPuppeteer,
  performanceTimingTestPuppeteer,
  runAllTestsPuppeteer
};

// Run all tests if script is executed directly
if (require.main === module) {
  runAllTestsPuppeteer().catch(console.error);
}