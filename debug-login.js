const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🚀 Starting login debug session...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to all requests
  page.on('request', request => {
    console.log('📤 REQUEST:', request.method(), request.url());
  });
  
  // Listen to all responses
  page.on('response', response => {
    console.log('📥 RESPONSE:', response.status(), response.url());
    if (response.status() >= 300 && response.status() < 400) {
      console.log('🔄 REDIRECT detected:', response.headers().location);
    }
  });
  
  // Listen to navigation events
  page.on('framenavigated', frame => {
    console.log('🧭 NAVIGATION:', frame.url());
  });
  
  // Go to login page
  console.log('🌐 Navigating to login page...');
  await page.goto('http://localhost:3001/en/login');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'login-page.png' });
  console.log('📸 Screenshot saved: login-page.png');
  
  // Check if login form is present
  const loginForm = await page.$('form');
  if (loginForm) {
    console.log('✅ Login form found');
    
    // Try to fill and submit the form
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput && passwordInput) {
      console.log('📝 Filling login form...');
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword');
      
      // Submit form
      console.log('🚀 Submitting form...');
      await page.click('button[type="submit"]');
      
      // Wait and see what happens
      await page.waitForTimeout(3000);
      
      console.log('📍 Current URL after form submission:', page.url());
      
      // Take another screenshot
      await page.screenshot({ path: 'after-login-attempt.png' });
      console.log('📸 Screenshot saved: after-login-attempt.png');
    } else {
      console.log('❌ Email or password input not found');
    }
  } else {
    console.log('❌ Login form not found');
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser kept open for manual inspection. Press Ctrl+C to close.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

debugLogin().catch(console.error);