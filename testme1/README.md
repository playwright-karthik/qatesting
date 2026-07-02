# testme1 - Playwright Testing Sandbox App (Approach A)

This folder contains a dynamic workspace configuration allowing testing execution to target runtime injected layouts inside an iframe window container cleanly.

## Playwright Target Interaction Script Template

```javascript
import { test, expect } from '@playwright/test';

test('Dynamic assertion inside sandbox iframe', async ({ page }) => {
  // 1. Navigate to your new GitHub page path
  await page.goto('[https://playwright-karthik.github.io/qatesting/testme1/](https://playwright-karthik.github.io/qatesting/testme1/)');

  // 2. Clear template structure definitions
  const testHTML = `
    <!doctype html>
    <html>
      <body>
        <div class="header-box" id="card">KarthikLocal---Assertions</div>
        <button id="submit-button">Submit</button>
      </body>
    </html>
  `;
  
  // 3. Populate code canvas
  await page.locator('#html-input').fill(testHTML);
  await page.locator('#run-iframe').click();

  // 4. Scope selectors directly into the isolated sandbox canvas iframe
  const sandbox = page.frameLocator('#output-frame');
  
  // 5. Assert matching elements directly inside without switching browser windows!
  await expect(sandbox.locator('#card')).toBeAttached();
  await expect(sandbox.locator('#card')).toHaveText('KarthikLocal---Assertions');
});
