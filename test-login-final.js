const { chromium } = require('playwright');

async function testLoginFlow() {
  console.log('🚀 Testing complete login flow...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: false,
    slowMo: 800
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to navigation events
  page.on('framenavigated', frame => {
    console.log('🧭 NAVIGATION:', frame.url());
  });
  
  try {
    // Step 1: Go to login page
    console.log('📍 Step 1: Navigate to login page');
    await page.goto('http://localhost:3001/en/login');
    await page.waitForTimeout(2000);
    
    // Step 2: Fill and submit login form
    console.log('📍 Step 2: Fill login form');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    console.log('📍 Step 3: Submit form');
    await page.click('button[type="submit"]');
    
    // Wait for authentication and redirect
    console.log('📍 Step 4: Wait for authentication...');
    await page.waitForTimeout(3000);
    
    // Check final URL
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard!');
      await page.screenshot({ path: 'login-success.png' });
    } else if (finalUrl.includes('/login')) {
      console.log('❌ FAILED: Still on login page');
      await page.screenshot({ path: 'login-failed.png' });
    } else {
      console.log('🤔 UNEXPECTED: Redirected to', finalUrl);
      await page.screenshot({ path: 'login-unexpected.png' });
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow().catch(console.error);