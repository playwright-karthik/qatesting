# Range Request Test

Open the GitHub Pages URL. The page requests bytes 0-99 from range-test.bin.

Expected if GitHub Pages supports this request:
- HTTP status 206
- Content-Range begins with bytes 0-99/

If the page reports 200, GitHub Pages did not honor the Range header for this test.
