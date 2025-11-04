# CSP Testing Suite

Hosted at  
**https://playwright-karthik.github.io/qatesting/csp-testing/**

This folder contains HTML pages that deliberately trigger or bypass Content Security Policy (CSP) restrictions, useful for:
- Synthetic / Playwright / QA testing
- Root vs Redirect vs Child resource failure analysis
- HTTP header validation

---

## 🌐 Test Pages

| Test Type | File | Expected Behavior |
|------------|------|------------------|
| ✅ Baseline Pass | [`blockcsp-pass.html`](./blockcsp-pass.html) | Loads fonts, images, scripts normally |
| ❌ Root Fail | [`blockcsp-rootfail.html`](./blockcsp-rootfail.html) | Main document blocked via `_headers` CSP |
| ❌ Redirect Fail | [`blockcsp-redirectfail.html`](./blockcsp-redirectfail.html) | Inline redirect script blocked |
| ❌ Child Fail | [`blockcsp-childfail.html`](./blockcsp-childfail.html) | External image blocked |
| 🔁 Redirect Target | [`redirect-target.html`](./redirect-target.html) | Should only load if redirect succeeds |

---

## 🧪 How to Test

### In Browser (Manual)
1. Open DevTools → **Console** + **Network** tab.
2. Visit each test URL:
   - [`blockcsp-pass.html`](https://playwright-karthik.github.io/qatesting/csp-testing/blockcsp-pass.html)
   - [`blockcsp-rootfail.html`](https://playwright-karthik.github.io/qatesting/csp-testing/blockcsp-rootfail.html)
   - [`blockcsp-redirectfail.html`](https://playwright-karthik.github.io/qatesting/csp-testing/blockcsp-redirectfail.html)
   - [`blockcsp-childfail.html`](https://playwright-karthik.github.io/qatesting/csp-testing/blockcsp-childfail.html)

### In Playwright (Automated)
```js
import { test, expect } from '@playwright/test';

test('CSP root fail test', async ({ page }) => {
  const response = await page.goto('https://playwright-karthik.github.io/qatesting/csp-testing/blockcsp-rootfail.html');
  expect(response.status()).not.toBe(200);
});
