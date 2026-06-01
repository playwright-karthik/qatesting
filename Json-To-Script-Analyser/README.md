# Json To Script Analyser

Static browser tool for checking whether a frontend recorder JSON file was converted into the expected Playwright script verbs.

## Use Locally

Open `index.html` in a browser.

Upload:

- `recorder.json`
- `script.js`

The page shows:

- summary counts
- JSON verb to Playwright verb summary
- action-by-action mapping table
- selector fallback priority table
- findings
- downloadable JSON and CSV reports

Selector priority checked:

```text
advanced selectors only when advanced selectors exist
otherwise:
role + name -> label -> test id -> text -> css id -> css stable ancestor -> css class -> xpath -> tag fallback
```

## GitHub Pages

Upload these files to a GitHub Pages branch/folder:

```text
index.html
styles.css
app.js
README.md
```

No backend is needed. Files are read in the browser.

## Limits

This static version does not SSH to Agent nodes and does not fetch `/var/CatchPoint/Agent/Plugins/Playwright` folders. Use the local `RecorderConversionAnalyzer` CLI for remote fetch workflows.
