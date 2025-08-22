const { chromium } = require('playwright');

async function debugLoginWithValidUser() {
  console.log('🚀 Starting login test with valid user...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to all requests
  page.on('request', request => {
    if (request.url().includes('auth') || request.url().includes('login') || request.url().includes('dashboard')) {
      console.log('📤 REQUEST:', request.method(), request.url());
    }
  });
  
  // Listen to all responses
  page.on('response', response => {
    if (response.url().includes('auth') || response.url().includes('login') || response.url().includes('dashboard')) {
      console.log('📥 RESPONSE:', response.status(), response.url());
      if (response.status() >= 300 && response.status() < 400) {
        console.log('🔄 REDIRECT detected:', response.headers().location);
      }
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
  await page.screenshot({ path: 'login-page-before.png' });
  console.log('📸 Screenshot saved: login-page-before.png');
  
  // Fill and submit the form with valid credentials
  console.log('📝 Filling login form with valid credentials...');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'TestPassword123!');
  
  // Take screenshot before submission
  await page.screenshot({ path: 'login-form-filled.png' });
  console.log('📸 Screenshot saved: login-form-filled.png');
  
  // Submit form
  console.log('🚀 Submitting form...');
  const submitButton = await page.$('button[type="submit"]');
  await submitButton.click();
  
  // Wait and see what happens
  console.log('⏱️ Waiting for response...');
  await page.waitForTimeout(5000);
  
  console.log('📍 Current URL after form submission:', page.url());
  
  // Take another screenshot
  await page.screenshot({ path: 'after-login-with-valid-user.png' });
  console.log('📸 Screenshot saved: after-login-with-valid-user.png');
  
  // Check if we're redirected or if there are errors
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) {
    console.log('✅ Successfully redirected to dashboard!');
  } else if (currentUrl.includes('/login')) {
    console.log('❌ Still on login page - checking for errors...');
    
    // Check for error messages
    const errorElements = await page.$$('[role="alert"], .error, .text-red-500, .text-danger');
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text && text.trim()) {
        console.log('⚠️ Error message found:', text.trim());
      }
    }
  } else {
    console.log('🤔 Unexpected redirect to:', currentUrl);
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser kept open for manual inspection. Press Ctrl+C to close.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

debugLoginWithValidUser().catch(console.error);