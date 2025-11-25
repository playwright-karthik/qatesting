
// Loader that dynamically imports many tiny modules concurrently.
// URL params:
//   count=N        -> how many modules to import (default 40)
//   method=import|script|fetch   -> how to trigger requests
//   delay=ms       -> delay between enqueues (default 0)
//   prefix=/jsmods -> where modules live (default /jsmods)
//   header=1       -> (fetch only) attach ~900B header to each request
(function(){
  const usp = new URLSearchParams(location.search);
  const count = Math.min(48, Math.max(1, parseInt(usp.get('count')||'40',10)));
  const method = (usp.get('method')||'import').toLowerCase();
  const delay = Math.max(0, parseInt(usp.get('delay')||'0',10));
  const prefix = usp.get('prefix') || '/jsmods';
  const addHeader = usp.has('header');

  console.log('[loader] method=%s count=%d delay=%d prefix=%s header=%s', method, count, delay, prefix, addHeader);

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  async function viaDynamicImport() {
    const tasks = [];
    for (let i=1;i<=count;i++){
      const url = `${prefix}/mod${String(i).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      tasks.push(import(url));
      if (delay) await sleep(delay);
    }
    return Promise.allSettled(tasks);
  }

  async function viaScriptTags() {
    const head = document.head || document.documentElement;
    function loadOne(url){
      return new Promise((resolve, reject)=>{
        const s = document.createElement('script');
        s.type = 'module';
        s.src = url;
        s.onload = () => resolve(url);
        s.onerror = e => reject(e);
        head.appendChild(s);
      });
    }
    const tasks = [];
    for (let i=1;i<=count;i++){
      const url = `${prefix}/mod${String(i).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      tasks.push(loadOne(url));
      if (delay) await sleep(delay);
    }
    return Promise.allSettled(tasks);
  }

  async function viaFetchEval() {
    const tasks = [];
    const headerValue = 'x'.repeat(900);
    for (let i=1;i<=count;i++){
      const url = `${prefix}/mod${String(i).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      const p = (async () => {
        const res = await fetch(url, {
          headers: addHeader ? { 'X-Fill-Header': headerValue } : undefined,
          cache: 'no-store',
        });
        const txt = await res.text();
        const blob = new Blob([txt], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        try {
          await import(blobUrl);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      })();
      tasks.push(p);
      if (delay) await sleep(delay);
    }
    return Promise.allSettled(tasks);
  }

  (async () => {
    const t0 = performance.now();
    try {
      let r;
      if (method === 'import') r = await viaDynamicImport();
      else if (method === 'script') r = await viaScriptTags();
      else r = await viaFetchEval();
      const dt = (performance.now() - t0).toFixed(0);
      console.log('[loader] done in %sms (%d results)', dt, r.length);
    } catch (e) {
      console.error('[loader] error', e);
    }
  })();

})();
