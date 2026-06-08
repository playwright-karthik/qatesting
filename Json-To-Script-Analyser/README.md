# Json To Script Analyser

Static GitHub Pages tool for checking whether a recorder JSON file was converted into the expected Playwright script.

## Inputs

- `recorder.json`: required
- `script.js`: required
- `diagnostic_results.json`: optional, but recommended for runtime failure explanation
- pasted diagnostic text: optional alternative to uploading the diagnostic JSON

## What It Checks

- Recorder action count
- Generated script verb count
- Action-to-script verb mapping
- Selector fallback priority differences
- Runtime failure evidence from Core diagnostics
- Missing initial navigation/start page before the first user interaction

## Notes

All files are processed locally in the browser. The page does not upload file content anywhere.
