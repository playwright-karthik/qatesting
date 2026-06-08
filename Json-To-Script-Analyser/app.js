const state = {
  report: null,
};

const els = {
  recorderFile: document.getElementById('recorderFile'),
  scriptFile: document.getElementById('scriptFile'),
  diagnosticFile: document.getElementById('diagnosticFile'),
  diagnosticText: document.getElementById('diagnosticText'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  resetBtn: document.getElementById('resetBtn'),
  statusValue: document.getElementById('statusValue'),
  recorderCount: document.getElementById('recorderCount'),
  scriptCount: document.getElementById('scriptCount'),
  matchedCount: document.getElementById('matchedCount'),
  selectorIssueCount: document.getElementById('selectorIssueCount'),
  interpretationContent: document.getElementById('interpretationContent'),
  verbContent: document.getElementById('verbContent'),
  mappingContent: document.getElementById('mappingContent'),
  selectorContent: document.getElementById('selectorContent'),
  runtimeContent: document.getElementById('runtimeContent'),
  jsonContent: document.getElementById('jsonContent'),
  csvContent: document.getElementById('csvContent'),
};

els.analyzeBtn.addEventListener('click', analyze);
els.resetBtn.addEventListener('click', reset);

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

async function analyze() {
  try {
    const recorderText = await readSingleFile(els.recorderFile);
    const scriptText = await readSingleFile(els.scriptFile);
    const diagnosticFileText = await readSingleFile(els.diagnosticFile, true);
    const diagnosticText = [diagnosticFileText, els.diagnosticText.value].filter(Boolean).join('\n').trim();

    if (!recorderText || !scriptText) {
      throw new Error('Upload recorder.json and generated script.js before analyzing.');
    }

    const recorderJson = parseJsonStrict(recorderText, 'recorder.json');
    const recorderActions = extractRecorderActions(recorderJson);
    const scriptActions = extractScriptActions(scriptText);
    const runtime = extractRuntimeEvidence(diagnosticText);
    const mapping = buildActionMapping(recorderActions, scriptActions);
    const selectorIssues = findSelectorIssues(mapping);
    const missingInitialNavigation = detectMissingInitialNavigation(recorderActions, scriptActions, scriptText);
    const status = determineStatus({
      recorderActions,
      scriptActions,
      mapping,
      selectorIssues,
      runtime,
      missingInitialNavigation,
    });

    state.report = {
      status,
      summary: {
        recorderActions: recorderActions.length,
        scriptVerbs: scriptActions.length,
        matched: mapping.filter((item) => item.verbMatches).length,
        selectorIssues: selectorIssues.length,
      },
      interpretation: buildInterpretation(status, runtime, selectorIssues, missingInitialNavigation),
      checks: {
        recorderJson: recorderActions.length > 0 ? 'OK' : 'ISSUE',
        verbMapping: mapping.every((item) => item.verbMatches) ? 'OK' : 'ISSUE',
        selectorFallback: selectorIssues.length ? 'ISSUE' : 'OK',
        runtimeCore: runtime.present ? 'READ' : 'CHECK',
        missingInitialNavigation: missingInitialNavigation.present ? 'ISSUE' : 'OK',
      },
      recorderActions,
      scriptActions,
      mapping,
      selectorIssues,
      runtime,
      missingInitialNavigation,
    };

    renderReport(state.report);
  } catch (error) {
    renderError(error);
  }
}

function reset() {
  els.recorderFile.value = '';
  els.scriptFile.value = '';
  els.diagnosticFile.value = '';
  els.diagnosticText.value = '';
  state.report = null;
  els.statusValue.textContent = 'WAITING_FOR_INPUT';
  els.recorderCount.textContent = '0';
  els.scriptCount.textContent = '0';
  els.matchedCount.textContent = '0';
  els.selectorIssueCount.textContent = '0';
  els.interpretationContent.innerHTML = '<span class="muted">Upload recorder.json and script.js, then analyze.</span>';
  els.verbContent.innerHTML = '<span class="muted">No analysis yet.</span>';
  els.mappingContent.innerHTML = '<span class="muted">No analysis yet.</span>';
  els.selectorContent.innerHTML = '<span class="muted">No analysis yet.</span>';
  els.runtimeContent.innerHTML = '<span class="muted">No diagnostic data supplied.</span>';
  els.jsonContent.textContent = '{}';
  els.csvContent.textContent = '';
}

async function readSingleFile(input, optional = false) {
  const file = input.files && input.files[0];
  if (!file) {
    return optional ? '' : '';
  }
  return await file.text();
}

function parseJsonStrict(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function extractRecorderActions(recorderJson) {
  const actions = [];
  const events = Array.isArray(recorderJson.events) ? recorderJson.events : [];

  events.forEach((event, eventIndex) => {
    const stepTitle = event?.eventDetails?.title || `Step ${eventIndex + 1}`;
    const rawActions = Array.isArray(event?.eventDetails?.actions) ? event.eventDetails.actions : [];

    rawActions.forEach((action) => {
      const details = action?.eventDetails || {};
      const selectors = details.selectors || {};
      const verb = detectRecorderVerb(details);
      const selectorCandidates = buildExpectedSelectorCandidates(selectors, verb);

      actions.push({
        index: actions.length + 1,
        stepTitle,
        title: details.title || `${verb} action`,
        verb,
        url: details.url || '',
        selectors,
        expectedPriority: selectorCandidates.map((item) => item.label),
        expectedSelectors: selectorCandidates,
      });
    });
  });

  return actions;
}

function detectRecorderVerb(details) {
  if (details.eventType === 2 || details.url) {
    return 'navigate';
  }
  if (details.eventSubType === 1 || details.element?.value !== undefined) {
    return 'fill';
  }
  return 'click';
}

function buildExpectedSelectorCandidates(selectors, verb) {
  if (verb === 'navigate') {
    return [];
  }

  const ordered = [
    { label: 'label', value: selectors.label },
    { label: 'text', value: selectors.text },
    { label: 'css id', value: selectors.id },
    { label: 'css stable ancestor', value: selectors.cssSelectorByStableAncestor },
    { label: 'css class', value: selectors.cssSelectorByClass },
    { label: 'xpath', value: selectors.cssSelectorByText },
    { label: 'xpath', value: selectors.xpath },
    { label: 'tag fallback', value: selectors.tagName },
  ];

  const result = [];
  const seen = new Set();
  ordered.forEach((item) => {
    const value = cleanSelectorValue(item.value);
    if (!value) {
      return;
    }
    const key = `${item.label}:${value}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push({ label: item.label, value });
  });

  return result;
}

function extractScriptActions(scriptText) {
  const actions = [];
  const locatorMap = new Map();
  const lines = scriptText.split(/\r?\n/);

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    const gotoMatch = line.match(/^await\s+page\.goto\((['"`])(.+?)\1/);
    if (gotoMatch) {
      actions.push({
        index: actions.length + 1,
        verb: 'navigate',
        title: `Navigate to "${shorten(gotoMatch[2], 70)}"`,
        url: gotoMatch[2],
        line: lineIndex + 1,
        actualPriority: [],
        actualSelectors: [],
      });
      return;
    }

    const locatorMatch = line.match(/^(?:let\s+)?(locator\d+)\s*=\s*(.+);$/);
    if (locatorMatch) {
      const name = locatorMatch[1];
      if (!locatorMap.has(name)) {
        locatorMap.set(name, []);
      }
      return;
    }

    const descriptionMatch = line.match(/^(locator\d+)Description\s*=\s*(['"`])([\s\S]*)\2;$/);
    if (descriptionMatch) {
      const name = descriptionMatch[1];
      const description = unescapeJsString(descriptionMatch[3]);
      if (!locatorMap.has(name)) {
        locatorMap.set(name, []);
      }
      locatorMap.get(name).push({
        label: classifyScriptSelector(description),
        value: selectorValueFromDescription(description),
        description,
      });
      return;
    }

    const locatorActionMatch = line.match(/^await\s+(locator\d+)\.(click|fill)\(/);
    if (locatorActionMatch) {
      const name = locatorActionMatch[1];
      const method = locatorActionMatch[2];
      const selectors = locatorMap.get(name) || [];
      actions.push({
        index: actions.length + 1,
        verb: method === 'fill' ? 'fill' : 'click',
        title: `${method} using ${name}`,
        line: lineIndex + 1,
        actualPriority: selectors.map((item) => item.label),
        actualSelectors: selectors,
      });
      locatorMap.delete(name);
    }
  });

  return actions;
}

function buildActionMapping(recorderActions, scriptActions) {
  const max = Math.max(recorderActions.length, scriptActions.length);
  const mapping = [];

  for (let i = 0; i < max; i += 1) {
    const recorder = recorderActions[i] || null;
    const script = scriptActions[i] || null;
    mapping.push({
      index: i + 1,
      recorderTitle: recorder?.title || '',
      recorderVerb: recorder?.verb || 'missing',
      scriptVerb: script?.verb || 'missing',
      scriptLine: script?.line || '',
      verbMatches: Boolean(recorder && script && recorder.verb === script.verb),
      expectedPriority: recorder?.expectedPriority || [],
      actualPriority: script?.actualPriority || [],
      expectedSelectors: recorder?.expectedSelectors || [],
      actualSelectors: script?.actualSelectors || [],
    });
  }

  return mapping;
}

function findSelectorIssues(mapping) {
  return mapping
    .filter((item) => item.verbMatches && item.recorderVerb !== 'navigate')
    .map((item) => {
      const diff = firstPriorityDifference(item.expectedPriority, item.actualPriority);
      if (!diff) {
        return null;
      }
      return {
        action: item.index,
        title: item.recorderTitle,
        expectedPriority: item.expectedPriority,
        actualPriority: item.actualPriority,
        reason: diff,
        expectedSelectors: item.expectedSelectors,
        actualSelectors: item.actualSelectors,
      };
    })
    .filter(Boolean);
}

function firstPriorityDifference(expected, actual) {
  const max = Math.max(expected.length, actual.length);
  for (let i = 0; i < max; i += 1) {
    if ((expected[i] || 'missing') !== (actual[i] || 'missing')) {
      return `Expected #${i + 1} ${expected[i] || 'missing'}, found ${actual[i] || 'missing'}.`;
    }
  }
  return '';
}

function detectMissingInitialNavigation(recorderActions, scriptActions, scriptText) {
  const firstRecorder = recorderActions[0];
  const firstScript = scriptActions[0];
  const firstGotoLine = findFirstGotoLine(scriptText);
  const present = Boolean(
    firstRecorder &&
      firstScript &&
      firstRecorder.verb !== 'navigate' &&
      firstScript.verb !== 'navigate' &&
      firstGotoLine &&
      firstScript.line < firstGotoLine
  );

  return {
    present,
    reason: present
      ? 'First generated script action is a user interaction, but the first page.goto() appears later. The start page may never be loaded before Step 1.'
      : '',
    firstRecorderAction: firstRecorder?.title || '',
    firstScriptAction: firstScript?.title || '',
    firstScriptLine: firstScript?.line || '',
    firstGotoLine: firstGotoLine || '',
  };
}

function findFirstGotoLine(scriptText) {
  const lines = scriptText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (/await\s+page\.goto\(/.test(lines[i])) {
      return i + 1;
    }
  }
  return 0;
}

function extractRuntimeEvidence(text) {
  if (!text.trim()) {
    return {
      present: false,
      status: 'NO_DATA',
      message: 'No Core diagnostic data was supplied. Upload or paste diagnostic_results.json to include runtime failure evidence.',
      failures: [],
    };
  }

  const parsed = tryParseJsonFromText(text);
  if (parsed) {
    const failures = [];
    const monitorResults = Array.isArray(parsed.MonitorResults) ? parsed.MonitorResults : [];
    monitorResults.forEach((monitor, monitorIndex) => {
      const browserVersion = monitor?.OtherData?.['results.web-browser.specific-browser-version'] || '';
      const stepResults = Array.isArray(monitor.StepResults) ? monitor.StepResults : [];
      stepResults.forEach((step, stepIndex) => {
        const other = step.OtherData || {};
        const errorDetails = other['common.results.tx.error-details'] || '';
        const errorCode = other['common.results.error-code'] || '';
        if (errorDetails || errorCode) {
          failures.push({
            monitorIndex: monitorIndex + 1,
            stepIndex: stepIndex + 1,
            stepName: other['common.results.tx.step-name'] || `Step ${stepIndex + 1}`,
            errorCode,
            errorDetails,
            browserVersion,
          });
        }
      });
    });

    return {
      present: true,
      status: failures.length ? 'FAILURE_FOUND' : 'NO_FAILURE_FOUND',
      message: failures.length ? `${failures.length} runtime failure(s) found.` : 'Diagnostic JSON was readable, but no runtime failure was found.',
      failures,
      rawType: 'json',
    };
  }

  const fallbackDetails = [];
  const unableMatch = text.match(/Unable to resolve[^\n\r]+/i);
  const failedVerbMatch = text.match(/Failed Verb:[^\n\r]+/i);
  if (unableMatch || failedVerbMatch) {
    fallbackDetails.push({
      stepName: detectStepNameFromText(text),
      errorCode: '',
      errorDetails: unableMatch?.[0] || failedVerbMatch?.[0] || text.slice(0, 240),
      browserVersion: '',
    });
  }

  return {
    present: true,
    status: fallbackDetails.length ? 'FAILURE_FOUND' : 'TEXT_READ',
    message: fallbackDetails.length
      ? `${fallbackDetails.length} runtime failure(s) found from pasted text.`
      : 'Diagnostic text was supplied, but no common failure pattern was detected.',
    failures: fallbackDetails,
    rawType: 'text',
  };
}

function tryParseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (_ignored) {
        return null;
      }
    }
  }
  return null;
}

function detectStepNameFromText(text) {
  const match = text.match(/step\s+(\d+)/i);
  return match ? `Step ${match[1]}` : '';
}

function determineStatus({ mapping, selectorIssues, runtime, missingInitialNavigation }) {
  const hasVerbMismatch = mapping.some((item) => !item.verbMatches);
  const hasRuntimeFailure = runtime.present && runtime.status === 'FAILURE_FOUND';

  if (hasRuntimeFailure && missingInitialNavigation.present) {
    return 'RUNTIME_FAILURE_MISSING_START_PAGE';
  }
  if (hasRuntimeFailure) {
    return 'RUNTIME_FAILURE';
  }
  if (hasVerbMismatch) {
    return 'VERB_MAPPING_ISSUE';
  }
  if (selectorIssues.length) {
    return 'AGENT_CONVERSION_ISSUE';
  }
  return 'OK';
}

function buildInterpretation(status, runtime, selectorIssues, missingInitialNavigation) {
  const blocks = [];

  if (status === 'RUNTIME_FAILURE_MISSING_START_PAGE') {
    blocks.push({
      tone: 'bad',
      title: 'Runtime failure: missing start page before first click',
      text:
        'The generated script starts with a user interaction before loading the page that contains the recorded element. Because the start page is missing, Step 1 cannot find the button or its fallback selectors.',
    });
  } else if (status === 'RUNTIME_FAILURE') {
    blocks.push({
      tone: 'bad',
      title: 'Runtime failure found',
      text: 'The Core diagnostic data contains a runtime failure. Check the Runtime/Core tab for the exact step and error.',
    });
  } else if (status === 'AGENT_CONVERSION_ISSUE') {
    blocks.push({
      tone: 'warn',
      title: 'Agent selector fallback issue',
      text:
        'The JSON actions and Playwright verbs match, but the generated script changed selector fallback priority. This points to converter behavior rather than a missing recorder action.',
    });
  } else if (status === 'VERB_MAPPING_ISSUE') {
    blocks.push({
      tone: 'bad',
      title: 'Verb mapping issue',
      text: 'The recorder actions and generated script verbs do not line up. One or more actions may have been dropped, added, or converted incorrectly.',
    });
  } else {
    blocks.push({
      tone: 'good',
      title: 'No conversion issue detected',
      text: 'Recorder actions, script verbs, and selector fallback priority look aligned based on the supplied files.',
    });
  }

  if (missingInitialNavigation.present) {
    blocks.push({
      tone: 'bad',
      title: 'Start page check',
      text: `${missingInitialNavigation.reason} First script action line: ${missingInitialNavigation.firstScriptLine}. First page.goto line: ${missingInitialNavigation.firstGotoLine}.`,
    });
  }

  if (runtime.present && runtime.failures.length) {
    const firstFailure = runtime.failures[0];
    blocks.push({
      tone: 'bad',
      title: 'Runtime evidence',
      text: `${firstFailure.stepName}: ${firstFailure.errorDetails || firstFailure.errorCode}`,
    });
  } else if (!runtime.present) {
    blocks.push({
      tone: 'warn',
      title: 'Runtime/Core check',
      text: 'No diagnostic_results.json data was supplied. Add it to confirm the actual runtime failure reason.',
    });
  }

  if (selectorIssues.length) {
    blocks.push({
      tone: 'warn',
      title: 'Selector priority',
      text: `${selectorIssues.length} selector priority issue(s) found. Open the Selector Priority tab for exact expected vs actual order.`,
    });
  }

  return blocks;
}

function renderReport(report) {
  els.statusValue.textContent = report.status;
  els.recorderCount.textContent = String(report.summary.recorderActions);
  els.scriptCount.textContent = String(report.summary.scriptVerbs);
  els.matchedCount.textContent = String(report.summary.matched);
  els.selectorIssueCount.textContent = String(report.summary.selectorIssues);

  els.interpretationContent.innerHTML = report.interpretation.map(renderCallout).join('') + renderChecks(report.checks);
  els.verbContent.innerHTML = renderVerbSummary(report);
  els.mappingContent.innerHTML = renderMappingTable(report.mapping);
  els.selectorContent.innerHTML = renderSelectorIssues(report.selectorIssues);
  els.runtimeContent.innerHTML = renderRuntime(report.runtime, report.missingInitialNavigation);
  els.jsonContent.textContent = JSON.stringify(report, null, 2);
  els.csvContent.textContent = buildCsv(report);
}

function renderError(error) {
  els.statusValue.textContent = 'ANALYSIS_ERROR';
  els.interpretationContent.innerHTML = renderCallout({
    tone: 'bad',
    title: 'Analysis error',
    text: error.message,
  });
}

function renderCallout(item) {
  return `
    <div class="callout ${escapeHtml(item.tone || '')}">
      <strong>${escapeHtml(item.title)}</strong>
      <div>${escapeHtml(item.text)}</div>
    </div>
  `;
}

function renderChecks(checks) {
  const rows = Object.entries(checks).map(([area, status]) => {
    const tone = status === 'OK' || status === 'READ' ? 'good' : status === 'CHECK' ? 'warn' : 'bad';
    return `<tr><td>${escapeHtml(labelize(area))}</td><td><span class="pill ${tone}">${escapeHtml(status)}</span></td></tr>`;
  });

  return `
    <h3>Checks</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Area</th><th>Status</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function renderVerbSummary(report) {
  const recorderCounts = countBy(report.recorderActions, 'verb');
  const scriptCounts = countBy(report.scriptActions, 'verb');
  const verbs = Array.from(new Set([...Object.keys(recorderCounts), ...Object.keys(scriptCounts)])).sort();
  const rows = verbs.map((verb) => `
    <tr>
      <td>${escapeHtml(verb)}</td>
      <td>${recorderCounts[verb] || 0}</td>
      <td>${scriptCounts[verb] || 0}</td>
      <td>${(recorderCounts[verb] || 0) === (scriptCounts[verb] || 0) ? '<span class="pill good">OK</span>' : '<span class="pill bad">ISSUE</span>'}</td>
    </tr>
  `);

  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Verb</th><th>Recorder JSON</th><th>Generated Script</th><th>Status</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function renderMappingTable(mapping) {
  const rows = mapping.map((item) => `
    <tr>
      <td>${item.index}</td>
      <td>${escapeHtml(item.recorderTitle)}</td>
      <td>${escapeHtml(item.recorderVerb)}</td>
      <td>${escapeHtml(item.scriptVerb)}</td>
      <td>${item.scriptLine || ''}</td>
      <td>${item.verbMatches ? '<span class="pill good">MATCH</span>' : '<span class="pill bad">ISSUE</span>'}</td>
    </tr>
  `);

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Recorder Action</th><th>Recorder Verb</th><th>Script Verb</th><th>Script Line</th><th>Status</th></tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function renderSelectorIssues(issues) {
  if (!issues.length) {
    return '<div class="callout good"><strong>No selector priority issue detected</strong><div>Expected and generated selector order match for all mapped user actions.</div></div>';
  }

  const rows = issues.map((issue) => `
    <tr>
      <td>${issue.action}</td>
      <td>${escapeHtml(issue.title)}</td>
      <td>${escapeHtml(issue.expectedPriority.join(' -> '))}</td>
      <td>${escapeHtml(issue.actualPriority.join(' -> '))}</td>
      <td>${escapeHtml(issue.reason)}</td>
    </tr>
  `);

  const details = issues.map((issue) => `
    <h3>Action ${issue.action}: ${escapeHtml(issue.title)}</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Expected Selector</th><th>Generated Script Selector</th></tr></thead>
        <tbody>${renderSelectorValueRows(issue.expectedSelectors, issue.actualSelectors)}</tbody>
      </table>
    </div>
  `);

  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Action</th><th>Title</th><th>Expected Priority</th><th>Actual Script Priority</th><th>Reason</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
    ${details.join('')}
  `;
}

function renderSelectorValueRows(expected, actual) {
  const max = Math.max(expected.length, actual.length);
  const rows = [];
  for (let i = 0; i < max; i += 1) {
    rows.push(`
      <tr>
        <td>${escapeHtml(formatSelector(expected[i]))}</td>
        <td>${escapeHtml(formatSelector(actual[i]))}</td>
      </tr>
    `);
  }
  return rows.join('');
}

function renderRuntime(runtime, missingInitialNavigation) {
  const blocks = [];

  if (missingInitialNavigation.present) {
    blocks.push(renderCallout({
      tone: 'bad',
      title: 'Missing initial navigation/start page',
      text: missingInitialNavigation.reason,
    }));
  }

  if (!runtime.present) {
    blocks.push(renderCallout({
      tone: 'warn',
      title: 'No Core diagnostic data supplied',
      text: runtime.message,
    }));
    return blocks.join('');
  }

  blocks.push(renderCallout({
    tone: runtime.failures.length ? 'bad' : 'good',
    title: runtime.status,
    text: runtime.message,
  }));

  if (!runtime.failures.length) {
    return blocks.join('');
  }

  const rows = runtime.failures.map((failure) => `
    <tr>
      <td>${escapeHtml(failure.stepName)}</td>
      <td>${escapeHtml(failure.errorCode)}</td>
      <td>${escapeHtml(failure.errorDetails)}</td>
      <td>${escapeHtml(failure.browserVersion)}</td>
    </tr>
  `);

  blocks.push(`
    <div class="table-wrap">
      <table>
        <thead><tr><th>Step</th><th>Error Code</th><th>Error Details</th><th>Browser</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `);

  return blocks.join('');
}

function buildCsv(report) {
  const lines = [];
  lines.push(['section', 'action', 'title', 'expected', 'actual', 'reason'].map(csvEscape).join(','));

  report.selectorIssues.forEach((issue) => {
    lines.push([
      'selector_issue',
      issue.action,
      issue.title,
      issue.expectedPriority.join(' -> '),
      issue.actualPriority.join(' -> '),
      issue.reason,
    ].map(csvEscape).join(','));
  });

  report.mapping.forEach((item) => {
    lines.push([
      'action_mapping',
      item.index,
      item.recorderTitle,
      item.recorderVerb,
      item.scriptVerb,
      item.verbMatches ? 'MATCH' : 'ISSUE',
    ].map(csvEscape).join(','));
  });

  report.runtime.failures.forEach((failure) => {
    lines.push([
      'runtime_failure',
      failure.stepName,
      failure.errorCode,
      failure.errorDetails,
      failure.browserVersion,
      '',
    ].map(csvEscape).join(','));
  });

  if (report.missingInitialNavigation.present) {
    lines.push([
      'missing_initial_navigation',
      report.missingInitialNavigation.firstScriptLine,
      report.missingInitialNavigation.firstRecorderAction,
      `first page.goto line ${report.missingInitialNavigation.firstGotoLine}`,
      report.missingInitialNavigation.firstScriptAction,
      report.missingInitialNavigation.reason,
    ].map(csvEscape).join(','));
  }

  return lines.join('\n');
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function formatSelector(item) {
  if (!item) {
    return '';
  }
  return `${item.label}: ${item.value || item.description || ''}`;
}

function classifyScriptSelector(description) {
  const value = selectorValueFromDescription(description);
  if (description.startsWith('label:')) {
    return 'label';
  }
  if (description.startsWith('text:')) {
    return 'text';
  }
  if (description.startsWith('xpath:')) {
    return 'xpath';
  }
  if (description.startsWith('css:')) {
    if (value.startsWith('body >')) {
      return 'tag fallback';
    }
    if (value.startsWith('#')) {
      return 'css id';
    }
    if (value.includes('>') && !value.startsWith('body >')) {
      return 'css stable ancestor';
    }
    return 'css class';
  }
  return 'selector';
}

function selectorValueFromDescription(description) {
  return cleanSelectorValue(description.replace(/^(label|text|xpath|css):/, ''));
}

function cleanSelectorValue(value) {
  return String(value || '').trim();
}

function unescapeJsString(value) {
  return value.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function labelize(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function shorten(value, length) {
  const text = String(value || '');
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
