# Recorder Conversion Lab

Static GitHub Pages-ready fixture pages for testing frontend recorder JSON to Agent Playwright script conversion.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Help and recording workflow. |
| `basic-elements.html` | Common web interactions and action verbs. |
| `selector-priority.html` | Selector fallback priority validation. |
| `edge-cases.html` | Ambiguous selectors, dynamic elements, hidden elements, iframe, and special text. |
| `iframe-content.html` | Fixture page loaded inside the edge-case iframe. |

## Recommended Flow

1. Open one page in the browser.
2. Start the FE recorder.
3. Perform the listed interactions.
4. Save the generated `recorder.json`.
5. Let Agent convert it into `script.js`.
6. Upload both files into the Json-To-Script-Analyser.
7. Review Verb Summary, Action Mapping, Selector Priority, and Findings.

## Selector Priority

Expected normal selector order:

```text
role + name -> label -> test id -> text -> css id -> css stable ancestor -> css class -> xpath -> tag fallback
```

If advanced selectors exist in recorder JSON, Agent should use only advanced selectors in priority order.
