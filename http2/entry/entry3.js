
// entry3.js — main entry that spawns many module requests.
// Reads URL params from the page (location.search) for consistency across entries.
// Params:
//   method=import|script|fetch     -> how to trigger child loads (default: import)
//   prefix=/jsmods                 -> base path for children (default /jsmods)
//   childMin=30 childMax=40        -> number of children per entry (random in range)
//   childDelay=0                   -> ms delay between spawning children (jitter added)
//   header=1                       -> (fetch only) attach ~900B header
//   jitter=10                      -> add random 0..jitter ms extra delay per child
(function(){
  const usp = new URLSearchParams(location.search);
  const method = (usp.get('method')||'import').toLowerCase();
  const prefix = usp.get('prefix') || '/jsmods';
  const childMin = Math.max(1, parseInt(usp.get('childMin')||'30',10));
  const childMax = Math.max(childMin, parseInt(usp.get('childMax')||'40',10));
  const childDelay = Math.max(0, parseInt(usp.get('childDelay')||'0',10));
  const jitter = Math.max(0, parseInt(usp.get('jitter')||'10',10));
  const addHeader = usp.has('header');

  const count = Math.floor(childMin + Math.random() * (childMax - childMin + 1));
  console.log('[entry3] method=%s prefix=%s children=%d delay=%d±%d header=%s',
              method, prefix, count, childDelay, jitter, addHeader);

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function rnd(ms){ return ms + Math.floor(Math.random() * (jitter||0)); }

  async function viaDynamicImport() {
    const tasks = [];
    for (let i=1;i<=count;i++){
      const url = `${prefix}/mod${String(((i*3)%48)||48).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      tasks.push(import(url));
      if (childDelay) await sleep(rnd(childDelay));
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
      const url = `${prefix}/mod${String(((i*3)%48)||48).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      tasks.push(loadOne(url));
      if (childDelay) await sleep(rnd(childDelay));
    }
    return Promise.allSettled(tasks);
  }

  async function viaFetchEval() {
    const tasks = [];
    const headerValue = 'x'.repeat(900);
    for (let i=1;i<=count;i++){
      const url = `${prefix}/mod${String(((i*3)%48)||48).padStart(3,'0')}.js?cb=${Math.random().toString(36).slice(2)}`;
      const p = (async () => {
        const res = await fetch(url, {
          headers: addHeader ? { 'X-Fill-Header': headerValue } : undefined,
          cache: 'no-store',
        });
        const txt = await res.text();
        const blob = new Blob([txt], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        try { await import(blobUrl); } finally { URL.revokeObjectURL(blobUrl); }
      })();
      tasks.push(p);
      if (childDelay) await sleep(rnd(childDelay));
    }
    return Promise.allSettled(tasks);
  }

  (async () => {
    let r;
    if (method === 'import') r = await viaDynamicImport();
    else if (method === 'script') r = await viaScriptTags();
    else r = await viaFetchEval();
    console.log('[entry3] finished (%d children)', r.length);
  })();
})();
