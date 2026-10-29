# Registration assertion fixture

This is a static GitHub Pages fixture for the ecommerce registration assertions in the supplied Playwright script. The page provides the expected OpenCart-style registration controls and selectors. Submitting without checking the privacy policy displays the exact warning checked by Step 10.

## Publish with GitHub Pages

1. Create or choose a GitHub repository and add `index.html` from this folder at the repository root (or keep this folder as the root of a `gh-pages` branch).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the branch containing `index.html` and the `/ (root)` folder, then save.
4. Wait for GitHub Pages to publish the site. The URL will be `https://<your-github-username>.github.io/<repository-name>/` for a project site.
5. Send me that published URL. I can then check it against the exact steps and adjust only the `page.goto(...)` URLs if needed.

The fixture does not create accounts or send form data to a server; it is a static page and keeps submission on the page.
