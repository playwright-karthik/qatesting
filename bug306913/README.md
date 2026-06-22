# Bug 306913 Filmstrip Regression Pages

Static GitHub Pages fixtures for validating Playwright delayed/missing filmstrip frames.

## Files

- `index.html` - launcher page with direct links.
- `filmstrip-delay-regression.html` - primary test page with an initial loader, delayed content, multiple visible state changes, and a configurable Doc Complete delay.
- `filmstrip-fast-spa.html` - fast SPA-style transition page for the risky "step completes too quickly" case.
- `filmstrip-low-visual-change.html` - low visual-change page to verify initial and final frame capture.
- `assets/filmstrip-test.css` - shared styling.

## Recommended URL

After copying this folder into your GitHub Pages repo, use:

```text
https://playwright-karthik.github.io/qatesting/bug306913/filmstrip-delay-regression.html
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
4. Doc Complete should happen near the configured `docCompleteMs` value.
5. No explicit Playwright `waitForTimeout` should be required.

The default Doc Complete target is `5000ms`, and the default loader stays visible for `800ms`. That is intentional because your Step2 only calls `page.goto(...)`; the page must keep the browser load event open long enough for Step2 to collect frames.

To change timings, use URL parameters:

```text
filmstrip-delay-regression.html?docCompleteMs=7000&loaderMs=1000
```

For a stricter loader edge test, use:

```text
filmstrip-delay-regression.html?docCompleteMs=5000&loaderMs=150
```

Avoid making the loader too short for the main regression because filmstrip sampling can legitimately miss a few-millisecond visual state.

## Playwright Snippet For Your 3-Step Check

```js
await Catchpoint.startStep('Step1 ')
await page.goto('https://www.google.com');

await Catchpoint.startStep('Step2 ')
await page.goto('https://playwright-karthik.github.io/qatesting/bug306913/filmstrip-delay-regression.html?docCompleteMs=5000&loaderMs=800');

await Catchpoint.startStep('Step3 ')
await page.goto('https://www.time.com');
```

Do not add `page.waitForTimeout(...)` for this validation. Step2 should stay open because the page itself delays the `load` event / Doc Complete.
