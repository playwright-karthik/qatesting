const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'dist-interactions');

if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR);

const pages = {
    'mouse-interactions.html': {
        title: 'Advanced Mouse & Pointer Interactions',
        content: `
            <p class="instruction">Interact with the targets below using different mouse behaviors. The monitor will display the captured automation metrics.</p>
            
            <div class="test-grid">
                <div class="card">
                    <h3>Click & Right-Click Tracker</h3>
                    <button id="mouse-click-btn" class="interactive-box">Left, Right, or Middle Click Me</button>
                </div>

                <div class="card">
                    <h3>Double Click Tracker</h3>
                    <button id="mouse-double-btn" class="interactive-box">Double Click Me</button>
                </div>

                <div class="card">
                    <h3>Hover & Movement Target</h3>
                    <div id="mouse-hover-zone" class="interactive-box zone">Hover/Move Mouse In This Zone</div>
                </div>

                <div class="card">
                    <h3>Mouse Down / Up (Click & Hold)</h3>
                    <button id="mouse-hold-btn" class="interactive-box">Hold Me Down</button>
                </div>
            </div>

            <div class="live-monitor">
                <h3>Captured Live Mouse Metrics:</h3>
                <p><strong>Device/Pointer Type:</strong> <span id="metric-pointer-type" class="badge">None</span></p>
                <p><strong>Action Captured:</strong> <span id="metric-action" class="badge blue">None</span></p>
                <p><strong>Button Pressed:</strong> <span id="metric-button" class="badge orange">None</span></p>
                <p><strong>Coordinates (X, Y):</strong> <span id="metric-coords">0, 0</span></p>
            </div>

            <script>
                const pType = document.getElementById('metric-pointer-type');
                const pAction = document.getElementById('metric-action');
                const pButton = document.getElementById('metric-button');
                const pCoords = document.getElementById('metric-coords');

                function updateMetrics(e, actionName) {
                    pType.innerText = e.pointerType || (e.type.includes('mouse') ? 'mouse' : 'unknown');
                    pAction.innerText = actionName;
                    
                    let btnClicked = 'Left Button';
                    if (e.button === 1) btnClicked = 'Middle Button';
                    if (e.button === 2) btnClicked = 'Right Button/Context Menu';
                    pButton.innerText = btnClicked;
                    pCoords.innerText = e.clientX + 'px, ' + e.clientY + 'px';
                }

                const clickBtn = document.getElementById('mouse-click-btn');
                clickBtn.addEventListener('pointerdown', (e) => {
                    if(e.button !== 2) updateMetrics(e, 'Single Click (Pointer Down)');
                });
                clickBtn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    updateMetrics(e, 'Right-Click Context Menu Triggered');
                });

                document.getElementById('mouse-double-btn').addEventListener('dblclick', (e) => {
                    updateMetrics(e, 'Double Click Detected');
                });

                const hoverZone = document.getElementById('mouse-hover-zone');
                hoverZone.addEventListener('pointerenter', (e) => updateMetrics(e, 'Mouse Entered Element (Hover)'));
                hoverZone.addEventListener('pointermove', (e) => {
                    pCoords.innerText = e.clientX + 'px, ' + e.clientY + 'px';
                });
                hoverZone.addEventListener('pointerleave', (e) => updateMetrics(e, 'Mouse Left Element'));

                const holdBtn = document.getElementById('mouse-hold-btn');
                holdBtn.addEventListener('pointerdown', (e) => updateMetrics(e, 'Mouse Button Held Down'));
                holdBtn.addEventListener('pointerup', (e) => updateMetrics(e, 'Mouse Button Released'));
            </script>
        `
    },
    'keyboard-shortcuts.html': {
        title: 'Keyboard Shortcuts & Hotkeys Capture',
        content: `
            <p class="instruction">Focus on the input field or the page canvas and fire complex hotkey combinations (e.g., Ctrl+S, Shift+Enter, Arrow Keys).</p>
            
            <div class="test-grid">
                <div class="card">
                    <h3>Active Keyboard Focus Input</h3>
                    <input type="text" id="keyboard-input" placeholder="Click here and press keys..." style="max-width:100%;">
                </div>
            </div>

            <div class="live-monitor">
                <h3>Captured Live Keyboard Metrics:</h3>
                <p><strong>Key Value:</strong> <span id="key-value" class="badge">None</span></p>
                <p><strong>Key Code:</strong> <span id="key-code" class="badge orange">None</span></p>
                <p><strong>Modifier Keys Active:</strong></p>
                <ul style="list-style:none; padding:0; display:flex; gap:10px;">
                    <li><span id="mod-ctrl" class="badge gray">Ctrl</span></li>
                    <li><span id="mod-shift" class="badge gray">Shift</span></li>
                    <li><span id="mod-alt" class="badge gray">Alt</span></li>
                    <li><span id="mod-meta" class="badge gray">Meta/OS</span></li>
                </ul>
                <p><strong>Last Command Chain Combination:</strong> <span id="key-combination" style="font-weight:bold; color:red;">None</span></p>
            </div>

            <script>
                const kVal = document.getElementById('key-value');
                const kCode = document.getElementById('key-code');
                const mCtrl = document.getElementById('mod-ctrl');
                const mShift = document.getElementById('mod-shift');
                const mAlt = document.getElementById('mod-alt');
                const mMeta = document.getElementById('mod-meta');
                const kCombo = document.getElementById('key-combination');

                document.getElementById('keyboard-input').addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) e.preventDefault();

                    kVal.innerText = e.key === ' ' ? 'Spacebar' : e.key;
                    kCode.innerText = e.code;

                    e.ctrlKey ? mCtrl.className = 'badge blue' : mCtrl.className = 'badge gray';
                    e.shiftKey ? mShift.className = 'badge blue' : mShift.className = 'badge gray';
                    e.altKey ? mAlt.className = 'badge blue' : mAlt.className = 'badge gray';
                    e.metaKey ? mMeta.className = 'badge blue' : mMeta.className = 'badge gray';

                    let combos = [];
                    if (e.ctrlKey) combos.push('Control');
                    if (e.shiftKey) combos.push('Shift');
                    if (e.altKey) combos.push('Alt');
                    if (e.metaKey) combos.push('Meta');
                    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
                        combos.push(e.key);
                    }
                    kCombo.innerText = combos.join(' + ');
                });
            </script>
        `
    },
    'touch-gestures.html': {
        title: 'Touchscreen & Mobile Emulation Gestures',
        content: `
            <p class="instruction">Test your device emulation settings here. Works with real mobile hardware or Playwright's emulated touchscreens via <code>hasTouch: true</code>.</p>
            
            <div class="test-grid">
                <div class="card">
                    <h3>Multi-Touch Sandbox Area</h3>
                    <div id="touch-zone" class="interactive-box zone" style="height:180px; background:#fff3cd; border-color:#ffecb5;">Perform Touch Tap or Swipe Gestures Here</div>
                </div>
            </div>

            <div class="live-monitor">
                <h3>Captured Live Touch Metrics:</h3>
                <p><strong>Touch Support Detected on Browser:</strong> <span id="touch-supported" class="badge">Checking...</span></p>
                <p><strong>Last Touch Event Type:</strong> <span id="touch-event-type" class="badge blue">None</span></p>
                <p><strong>Active Touch Points count:</strong> <span id="touch-points" class="badge orange">0</span></p>
                <p><strong>Primary Touch Position:</strong> <span id="touch-pos">X: 0, Y: 0</span></p>
            </div>

            <script>
                const tSupport = document.getElementById('touch-supported');
                const tType = document.getElementById('touch-event-type');
                const tPoints = document.getElementById('touch-points');
                const tPos = document.getElementById('touch-pos');

                const isTouchActive = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                tSupport.innerText = isTouchActive ? 'YES (Touch Capable)' : 'NO (Desktop Mouse Mode Only)';
                tSupport.className = isTouchActive ? 'badge green' : 'badge red';

                const touchZone = document.getElementById('touch-zone');

                function handleTouch(e, label) {
                    e.preventDefault();
                    tType.innerText = label;
                    tPoints.innerText = e.touches.length;
                    if(e.touches.length > 0) {
                        tPos.innerText = 'X: ' + Math.round(e.touches[0].clientX) + 'px, Y: ' + Math.round(e.touches[0].clientY) + 'px';
                    }
                }

                touchZone.addEventListener('touchstart', (e) => handleTouch(e, 'Touch Start (Finger Down)'), {passive: false});
                touchZone.addEventListener('touchmove', (e) => handleTouch(e, 'Touch Move (Dragging/Swiping)'), {passive: false});
                touchZone.addEventListener('touchend', (e) => {
                    tType.innerText = 'Touch End (Finger Lifted)';
                    tPoints.innerText = e.touches.length;
                });
            </script>
        `
    }
};

const commonStyle = `
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #333; background: #f0f2f5; }
    h1 { color: #1a1a1a; margin-bottom: 5px; font-size: 1.8rem; }
    .instruction { color: #666; margin-bottom: 20px; font-size: 0.95rem; }
    .back-link { display: inline-block; margin-bottom: 15px; color: #0066cc; text-decoration: none; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    
    .test-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e1e4e8; }
    .card h3 { margin-top: 0; margin-bottom: 15px; font-size: 1rem; color: #444; }
    
    .interactive-box { display: block; width: 100%; padding: 15px; text-align: center; border: 2px dashed #0066cc; background: #e6f0fa; color: #0066cc; font-weight: bold; font-size: 1rem; border-radius: 6px; cursor: pointer; box-sizing: border-box; transition: all 0.2s; }
    .interactive-box:active { background: #b3d4f5; }
    .interactive-box.zone { height: 120px; display: flex; align-items: center; justify-content: center; border-color: #28a745; background: #e8f5e9; color: #28a745; cursor: crosshair; }
    
    .live-monitor { background: #1e1e1e; color: #a9b7c6; padding: 20px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .live-monitor h3 { color: #fff; margin-top:0; border-bottom: 1px solid #333; padding-bottom: 8px; font-size: 1.1rem; }
    .live-monitor p { margin: 10px 0; font-size: 0.95rem; }
    
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold; color: white; display: inline-block;}
    .badge.gray { background: #555; }
    .badge.blue { background: #0066cc; }
    .badge.orange { background: #e67e22; }
    .badge.green { background: #27ae60; }
    .badge.red { background: #c0392b; }
`; // <-- Backtick was missing here!

// Generate Subpages
Object.entries(pages).forEach(([filename, page]) => {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <style>${commonStyle}</style>
</head>
<body>
    <a href="index.html" class="back-link">← Back to Device Interaction Index</a>
    <h1>${page.title}</h1>
    <hr style="border:0; border-top: 1px solid #d1d5db; margin-bottom: 20px;">
    ${page.content}
</body>
</html>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, filename), htmlTemplate);
    console.log(`Generated Event Target: [${filename}]`);
});

// Generate Master Index Dashboard
const indexLinks = Object.entries(pages)
    .map(([filename, page]) => `<li><a href="${filename}">${page.title}</a> <code>(${filename})</code></li>`)
    .join('\n        ');

const indexTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright I/O Peripheral Test Bench</title>
    <style>
        ${commonStyle}
        ul { list-style: none; padding: 0; }
        li { margin: 15px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 6px solid #0066cc; display: flex; justify-content: space-between; align-items: center;}
        li a { font-weight: bold; color: #0066cc; text-decoration: none; font-size: 1.2rem; }
        li a:hover { text-decoration: underline; }
        code { background: #eee; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem; color: #333; }
    </style>
</head>
<body>
    <h1>Catchpoint Agent I/O Validation Page Dashboard</h1>
    <p class="instruction">This suite evaluates complex peripheral hardware API hooks. Run your recorded automated browser footsteps against these links to assert if simulated native interactions render correctly.</p>
    <hr style="border:0; border-top: 1px solid #d1d5db; margin: 25px 0;">
    <ul>
        ${indexLinks}
    </ul>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexTemplate);
console.log('\x1b[32m%s\x1b[0m', '✓ Interaction test bench index.html generated successfully.');