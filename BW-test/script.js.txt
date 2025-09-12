window.addEventListener('load', () => {
  setTimeout(() => {
    const t = performance.timing;
    const p = performance.getEntriesByType("navigation")[0] || {};

    const metrics = {
      "Time to First Byte (TTFB)": (t.responseStart - t.requestStart) + " ms",
      "DOM Content Loaded": (t.domContentLoadedEventEnd - t.navigationStart) + " ms",
      "Load Event": (t.loadEventEnd - t.navigationStart) + " ms",
      "First Paint": (performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A') + " ms",
      "First Contentful Paint": (performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A') + " ms",
      "Transfer Size": (p.transferSize || 'N/A') + " bytes",
      "Decoded Body Size": (p.decodedBodySize || 'N/A') + " bytes",
      "Total Requests": performance.getEntriesByType("resource").length
    };

    let output = '';
    for (const key in metrics) {
      output += `${key}: ${metrics[key]}\n`;
    }

    document.getElementById('perf').textContent = output;
  }, 500);
});
