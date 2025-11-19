# Catchpoint VC Bug Test - GitHub Pages

🎯 **Public deployment for Catchpoint Visual Completion (VC) bug testing and SPA navigation analysis**

## 📁 Files to Upload

Upload all these files to your GitHub repository for GitHub Pages:

- `index.html` - Main test page with soft navigation
- `about.html` - About page for navigation testing  
- `contact.html` - Contact form for complex interactions
- `catchpoint-playwright-public.js` - Playwright test scripts
- `catchpoint-puppeteer-public.js` - Puppeteer test scripts
- `README.md` - This documentation

## 🚀 Quick Setup

1. **Create GitHub Repository**
   - Create a new public repository on GitHub
   - Name it something like `catchpoint-vc-test`

2. **Upload Files**
   - Upload all files from this folder to your repository
   - Commit and push to main branch

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch" 
   - Choose "main" branch and "/ (root)" folder
   - Save settings

4. **Update Test Scripts** (Already Done!)
   - The test scripts are pre-configured for your URL:
   - `https://playwright-karthik.github.io/qatesting/vctest/`
   - No additional configuration needed!

## 🌐 Access Your Test

Once deployed, your test will be available at:
```
https://playwright-karthik.github.io/qatesting/vctest/
```

## 🔬 Test Scenarios

### 1. Basic SPA Testing
- Navigate to the main page
- Type in the search box
- Observe soft navigation (no page reload)
- Compare VC timing with full navigation

### 2. Complex Interactions
- Visit the Contact page
- Fill out the form completely
- Submit and wait for success message
- Analyze VC timing for async operations

### 3. Navigation Comparison
- Test normal navigation (clicking links)
- Test soft navigation (search interactions)
- Compare VC vs Webpage Response Time

## 🛠️ Using with Catchpoint

### Option 1: Manual Testing
- Use the live GitHub Pages URL in your Catchpoint tests
- Configure monitors to test the different pages
- Analyze VC timing in Catchpoint dashboard

### Option 2: Automated Testing
- Install Playwright: `npm install playwright`
- Install Puppeteer: `npm install puppeteer`
- Update BASE_URL in test scripts
- Run: `node catchpoint-playwright-public.js`
- Run: `node catchpoint-puppeteer-public.js`

## 📊 Expected VC Bug Behavior

**Normal Scenario:**
- Visually Complete ≤ Webpage Response Time

**VC Bug Scenario:**
- Visually Complete > Webpage Response Time
- Occurs during soft navigation (search, form submission)
- More noticeable with slower network conditions

## 🎯 Key Features

- ✅ **Public Access** - No VPN dependency
- ✅ **SPA Navigation** - Soft navigation without page reloads
- ✅ **Timing Delays** - 1200ms delays to make VC measurable
- ✅ **Multiple Scenarios** - Search, forms, navigation
- ✅ **Catchpoint Ready** - Follows exact API patterns
- ✅ **Cross-browser** - Works with Playwright and Puppeteer

## 🚨 Troubleshooting

**If tests fail:**
1. Verify GitHub Pages is enabled and deployed
2. Check that BASE_URL is correctly updated in test scripts
3. Ensure all HTML files are accessible via browser
4. Test the search functionality manually first

**If VC bug doesn't reproduce:**
1. Try slower network conditions
2. Test with different browsers
3. Increase delay timing in HTML files if needed
4. Check Catchpoint configuration for VC measurement

## 📝 Notes

- The 1200ms delay in search results is intentional for VC timing
- Contact form has 2-second submission delay for async testing
- All interactions are designed to trigger VC measurement points
- No server-side dependencies - pure client-side testing

---

🔗 **Ready to test your Catchpoint product with public access!**