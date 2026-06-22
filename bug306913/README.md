# Bug 306913 Filmstrip Regression Pages

Static GitHub Pages fixtures for validating Playwright delayed/missing filmstrip frames.

## Files

- `index.html` - launcher page with direct links.
- `filmstrip-delay-regression.html` - primary test page with an initial loader, delayed content, and multiple visible state changes.
- `filmstrip-fast-spa.html` - fast SPA-style transition page for the risky "step completes too quickly" case.
- `filmstrip-low-visual-change.html` - low visual-change page to verify initial and final frame capture.
- `assets/filmstrip-test.css` - shared styling.

## Recommended URL

After copying this folder into your GitHub Pages repo, use:

```text
https://playwright-karthik.github.io/qatesting/bug306913-filmstrip/filmstrip-delay-regression.html
```

If you copy only the files directly under `qatesting`, use:

```text
https://playwright-karthik.github.io/qatesting/filmstrip-delay-regression.html
```

## Suggested Bug 306913 Validation

Use `filmstrip-delay-regression.html` as the main page.

Expected filmstrip:

1. First frame should show the loader/boot state near the beginning of the step.
2. Later frames should show the content transition.
3. Final frames should show the ready state.
4. No explicit Playwright `waitForTimeout` should be required after the indicator.

The default loader stays visible for `600ms`. That is intentional: if the loader is only a few milliseconds, a correct filmstrip capture can still miss it due to sampling interval. For an edge test, use a URL parameter such as:

```text
filmstrip-delay-regression.html?loaderMs=150
```

## Playwright Snippet

```js
await page.goto('https://playwright-karthik.github.io/qatesting/bug306913-filmstrip/filmstrip-delay-regression.html');
await page.locator('[data-testid="ready-marker"]').waitFor({ state: 'visible' });
await Catchpoint.setIndicator('filmstrip-delay-ready');
```

Do not add `page.waitForTimeout(...)` after `Catchpoint.setIndicator(...)` when validating the fix.
