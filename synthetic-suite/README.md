# GitHub Pages Synthetic Waterfall Test Suite

Upload the contents of this folder under your repository's `qatesting/` directory.

Main page:
`https://playwright-karthik.github.io/qatesting/custompages1.html`

## Examples

CSS only, 3 requests:
`custompages1.html?count=3&type=css`

JavaScript only, 4 requests:
`custompages1.html?count=4&type=js`

Images only, 5 requests:
`custompages1.html?count=5&type=img`

JSON/fetch only:
`custompages1.html?count=3&type=json`

Iframes only:
`custompages1.html?count=2&type=iframe`

Independent counts:
`custompages1.html?css=3&js=4&img=5&json=2&iframe=1`

All types, 3 each:
`custompages1.html?count=3&type=all`

`?count=3` is also treated as 3 of every supported type.

## Supported parameters

- `css`
- `js`
- `img`
- `json`
- `iframe`
- `count`
- `type=css|js|img|json|iframe|all`
- `cacheBust=false` to disable automatic cache-busting

Each type supports 0-100 resources.

## Important

These are real HTTP requests to separate static resources, so they appear independently
in Chrome/Playwright network waterfalls. GitHub Pages cannot provide server-side dynamic
delay/status-code/redirect behavior. This suite focuses on deterministic static child-request counts.
