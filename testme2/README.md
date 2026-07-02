# testme2 - Playwright Testing Sandbox App (Approach B)

This setup uses **Approach B**, launching an isolated browser tab window containing your dynamically injected HTML workspace payload.

## Playwright Target Interaction Script Template

When working with popups/new tabs, you must watch the page context events to intercept and switch to the newly spawned page pointer.

```javascript
import { test, expect } from '@playwright/test';

test('Dynamic assertion inside target popup tab', async ({ page, context }) => {
  // 1. Navigate to your new Approach B GitHub page path
  await page.goto('[https://playwright-karthik.github.io/qatesting/testme2/](https://playwright-karthik.github.io/qatesting/testme2/)');

  // 2. Clear template structure definitions
  const testHTML = `
    <!doctype html>
    <html>
      <head><title>Popup Target Sandbox</title></head>
      <body>
        <div id="card">KarthikLocal---Assertions</div>
        <button id="submit-button">Submit</button>
      </body>
    </html>
  `;
  
  // 3. Populate code canvas input area
  await page.locator('#html-input').fill(testHTML);

  // 4. Start waiting for the popup page event BEFORE clicking the launch button
  const pagePromise = context.waitForEvent('page');
  
  // 5. Click the button that triggers the window popup
  await page.locator('#run-popup').click();
  
  // 6. Resolve the page promise to gain access to the new tab window
  const newTab = await pagePromise;
  await newTab.waitForLoadState(); // Ensure the injected markup finishes loading

  // 7. Assert matching elements directly on the new page instance!
  await expect(newTab.locator('#card')).toBeAttached();
  await expect(newTab.locator('#card')).toHaveText('KarthikLocal---Assertions');
});
