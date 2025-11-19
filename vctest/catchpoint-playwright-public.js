/**
 * Catchpoint VC Bug Test Script - GitHub Pages Version
 * Playwright automation following exact Catchpoint.startStep() pattern
 * 
 * SETUP REQUIRED:
 * 1. Upload all files from this folder to your GitHub repository
 * 2. Enable GitHub Pages in repository settings
 * 3. Update BASE_URL below with your GitHub username and repository name
 * 4. Install dependencies: npm install playwright
 * 
 * USAGE: node catchpoint-playwright-public.js
 */

const { chromium } = require('playwright');

// Updated with your GitHub Pages URL
const BASE_URL = 'https://playwright-karthik.github.io/qatesting/vctest/';

/**
 * Test 1: Basic Catchpoint Integration Test
 * Tests fundamental VC timing with soft navigation
 */
async function basicCatchpointTest() {
  console.log('🎯 Starting Basic Catchpoint Test (Public)...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Step 1: Navigate to public test page
    await Catchpoint.startStep('Navigate to Public Test Page');
    console.log('📍 Navigating to:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Page loaded successfully');
    await Catchpoint.endStep();

    // Step 2: Perform search interaction (soft navigation)
    await Catchpoint.startStep('Perform Search Interaction');
    console.log('🔍 Triggering search...');
    await page.fill('#search', 'catchpoint test');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    console.log('✅ Search results displayed');
    await Catchpoint.endStep();

    // Step 3: Verify results content
    await Catchpoint.startStep('Verify Search Results');
    const resultsText = await page.textContent('#results');
    console.log('📊 Results:', resultsText);
    
    if (resultsText && resultsText.includes('catchpoint test')) {
      console.log('✅ Search verification passed');
    } else {
      console.log('❌ Search verification failed');
    }
    await Catchpoint.endStep();

    console.log('🎉 Basic Catchpoint Test Completed Successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 2: Comprehensive VC Bug Analysis
 * Tests multiple scenarios to identify VC timing issues
 */
async function comprehensiveCatchpointTest() {
  console.log('🔬 Starting Comprehensive VC Bug Analysis...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Test home page
    await Catchpoint.startStep('Load Home Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.container', { timeout: 10000 });
    await Catchpoint.endStep();

    // Test search functionality
    await Catchpoint.startStep('Test Search Function');
    await page.fill('#search', 'vc bug test');
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
    await page.fill('#name', 'Catchpoint Tester');
    await page.fill('#email', 'test@catchpoint.com');
    await page.fill('#subject', 'VC Bug Testing');
    await page.fill('#message', 'Testing VC timing with complex interactions');
    await Catchpoint.endStep();

    // Test form submission (async soft navigation)
    await Catchpoint.startStep('Submit Contact Form');
    await page.click('#submit-btn');
    await page.waitForSelector('.form-message.success', { timeout: 10000 });
    console.log('📧 Form submission completed');
    await Catchpoint.endStep();

    console.log('🎉 Comprehensive Test Completed Successfully');

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 3: SPA vs Normal Navigation Comparison
 * Direct comparison to highlight VC timing differences
 */
async function spaVsNormalTest() {
  console.log('⚔️ Starting SPA vs Normal Navigation Comparison...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Test normal navigation (full page loads)
    console.log('📖 Testing Normal Navigation...');
    const context1 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page1 = await context1.newPage();

    await Catchpoint.startStep('Normal Nav - Home Page');
    await page1.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Normal Nav - About Page');
    await page1.goto(BASE_URL + 'about.html', { waitUntil: 'networkidle' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Normal Nav - Contact Page');
    await page1.goto(BASE_URL + 'contact.html', { waitUntil: 'networkidle' });
    await page1.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await context1.close();

    // Test SPA navigation (soft navigation)
    console.log('🔄 Testing SPA Navigation...');
    const context2 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page2 = await context2.newPage();

    await Catchpoint.startStep('SPA - Initial Load');
    await page2.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page2.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('SPA - Search Interaction');
    await page2.fill('#search', 'spa navigation test');
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

    await context2.close();

    console.log('🏁 SPA vs Normal Comparison Completed');

  } catch (error) {
    console.error('❌ Comparison test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 4: Performance Baseline Test
 * Establishes baseline metrics for VC timing
 */
async function performanceBaselineTest() {
  console.log('📊 Starting Performance Baseline Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // Multiple iterations to establish baseline
    for (let i = 1; i <= 3; i++) {
      await Catchpoint.startStep(`Baseline Test ${i} - Page Load`);
      await page.goto(BASE_URL + '?test=' + i, { waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 10000 });
      await Catchpoint.endStep();

      await Catchpoint.startStep(`Baseline Test ${i} - Search`);
      await page.fill('#search', `baseline test ${i}`);
      await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
      await Catchpoint.endStep();

      // Clear search for next iteration
      await page.fill('#search', '');
      await page.waitForTimeout(500);
    }

    console.log('📈 Performance Baseline Test Completed');

  } catch (error) {
    console.error('❌ Baseline test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Test 5: Edge Case VC Testing
 * Tests specific edge cases that trigger VC timing issues
 */
async function edgeCaseVCTest() {
  console.log('🎭 Starting Edge Case VC Testing...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    await Catchpoint.startStep('Edge Case - Initial Load');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1', { timeout: 10000 });
    await Catchpoint.endStep();

    // Rapid search interactions
    await Catchpoint.startStep('Edge Case - Rapid Search 1');
    await page.fill('#search', 'rapid test 1');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    await Catchpoint.endStep();

    await Catchpoint.startStep('Edge Case - Rapid Search 2');
    await page.fill('#search', 'rapid test 2');
    await page.waitForTimeout(200); // Don't wait for full completion
    await Catchpoint.endStep();

    // Long content search
    await Catchpoint.startStep('Edge Case - Long Content Search');
    await page.fill('#search', 'this is a very long search query that might cause timing issues with visual completion measurement in catchpoint');
    await page.waitForSelector('#results[style*="block"]', { timeout: 5000 });
    await Catchpoint.endStep();

    // Form rapid interaction
    await page.click('a[href="contact.html"]');
    await page.waitForSelector('#contact-form', { timeout: 5000 });

    await Catchpoint.startStep('Edge Case - Form Rapid Fill');
    await page.fill('#name', 'Edge Case Tester');
    await page.fill('#email', 'edge@test.com');
    await page.fill('#subject', 'Edge case testing');
    await page.fill('#message', 'Testing rapid form interactions');
    await page.click('#submit-btn');
    await page.waitForSelector('.form-message', { timeout: 3000 }); // Partial wait
    await Catchpoint.endStep();

    console.log('🎯 Edge Case Testing Completed');

  } catch (error) {
    console.error('❌ Edge case test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Main execution function
async function runAllTests() {
  console.log('🚀 Starting Catchpoint VC Bug Test Suite - Public Version');
  console.log('🌐 Target URL:', BASE_URL);
  
  if (BASE_URL.includes('YOUR_GITHUB_USERNAME')) {
    console.error('❌ Please update BASE_URL with your actual GitHub username and repository name');
    console.error('📝 Update line 13 in this file');
    return;
  }

  const tests = [
    { name: 'Basic Catchpoint Test', fn: basicCatchpointTest },
    { name: 'Comprehensive VC Analysis', fn: comprehensiveCatchpointTest },
    { name: 'SPA vs Normal Navigation', fn: spaVsNormalTest },
    { name: 'Performance Baseline', fn: performanceBaselineTest },
    { name: 'Edge Case VC Testing', fn: edgeCaseVCTest }
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

  console.log('🏁 All Catchpoint VC tests completed!');
  console.log('📊 Check your Catchpoint dashboard for VC timing analysis');
}

// Export for individual test execution
module.exports = {
  basicCatchpointTest,
  comprehensiveCatchpointTest,
  spaVsNormalTest,
  performanceBaselineTest,
  edgeCaseVCTest,
  runAllTests
};

// Run all tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}