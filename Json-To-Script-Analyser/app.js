// AIASSISTED: created with AI tooling.

(function initModule(root) {
  'use strict';

  const PLAYWRIGHT_VERBS = [
    'goto',
    'fill',
    'check',
    'uncheck',
    'click',
    'dblclick',
    'selectOption',
    'setInputFiles',
    'press',
    'hover',
  ];

  const NORMAL_SELECTOR_PRIORITY = [
    'role+name',
    'label',
    'test id',
    'text',
    'css id',
    'css stable ancestor',
    'css class',
    'xpath',
    'tag fallback',
  ];

  function safeText(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function escapeHtml(value) {
    return safeText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function flattenRecorderActions(recorder) {
    const actions = [];
    const steps = [];
    for (const [stepIndex, event] of (recorder.events || []).entries()) {
      const eventDetails = event.eventDetails || {};
      const stepName = eventDetails.title || `Step ${stepIndex + 1}`;
      const stepActions = eventDetails.actions || [];
      steps.push({ stepIndex, stepName, actionCount: stepActions.length });
      for (const [actionIndex, action] of stepActions.entries()) {
        actions.push({
          number: actions.length + 1,
          stepIndex,
          actionIndex,
          stepName,
          raw: action,
          details: action.eventDetails || {},
        });
      }
    }
    return { steps, actions };
  }

  function selectorSummary(selectors) {
    const s = selectors || {};
    return [
      s.label ? `label:${s.label}` : '',
      s.id ? `id:${s.id}` : '',
      s.dataTestId ? `data-testid:${s.dataTestId}` : '',
      s.role ? `role:${s.role}` : '',
      s.text ? `text:${s.text}` : '',
      s.cssSelectorByStableAncestor ? `css:${s.cssSelectorByStableAncestor}` : '',
      s.cssSelectorByClass ? `css:${s.cssSelectorByClass}` : '',
      s.xpath ? `xpath:${s.xpath}` : '',
      s.tagName ? `tag:${s.tagName}` : '',
    ].filter(Boolean).join(' | ');
  }

  function getAdvancedSelectors(details) {
    const selectors = details.selectors || {};
    const candidates = [
      details.advancedSelectors,
      details.advanceSelectors,
      details.advancedSelector,
      details.advanceSelector,
      selectors.advancedSelectors,
      selectors.advanceSelectors,
      selectors.advancedSelector,
      selectors.advanceSelector,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate.filter(Boolean);
      if (typeof candidate === 'string' && candidate.trim()) return [candidate.trim()];
      if (candidate && typeof candidate === 'object') {
        return Object.values(candidate)
          .filter(value => typeof value === 'string' && value.trim())
          .map(value => value.trim());
      }
    }
    return [];
  }

  function expectedSelectorPriority(details) {
    const selectors = details.selectors || {};
    const advancedSelectors = getAdvancedSelectors(details);
    if (advancedSelectors.length) {
      return advancedSelectors.map((value, index) => ({
        kind: `advanced ${index + 1}`,
        value,
        advanced: true,
      }));
    }

    const expected = [];
    if (selectors.role) {
      expected.push({ kind: 'role+name', value: selectors.label || selectors.text || selectors.role });
    }
    if (selectors.label) expected.push({ kind: 'label', value: selectors.label });
    if (selectors.dataTestId) expected.push({ kind: 'test id', value: selectors.dataTestId });
    if (selectors.text) expected.push({ kind: 'text', value: selectors.text });
    if (selectors.id) expected.push({ kind: 'css id', value: selectors.id });
    if (selectors.cssSelectorByStableAncestor) expected.push({ kind: 'css stable ancestor', value: selectors.cssSelectorByStableAncestor });
    if (selectors.cssSelectorByClass) expected.push({ kind: 'css class', value: selectors.cssSelectorByClass });
    if (selectors.xpath) expected.push({ kind: 'xpath', value: selectors.xpath });
    if (selectors.tagName) expected.push({ kind: 'tag fallback', value: selectors.tagName });
    const seen = new Set();
    return expected.filter(item => {
      const key = normalizeSelectorValue(item.value);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function inferSelectorKindFromLocatorExpression(expression) {
    const expr = safeText(expression).trim();
    if (/getByRole\s*\(/.test(expr)) return 'role+name';
    if (/getByLabel\s*\(/.test(expr)) return 'label';
    if (/getByTestId\s*\(/.test(expr)) return 'test id';
    if (/getByText\s*\(/.test(expr)) return 'text';
    if (/locator\s*\(\s*["'`]#/.test(expr)) return 'css id';
    if (/locator\s*\(\s*["'`]xpath=/.test(expr)) return 'xpath';
    if (/locator\s*\(\s*["'`][a-z][a-z0-9-]*["'`]\s*\)/i.test(expr)) return 'tag fallback';
    if (/locator\s*\(/.test(expr) && />|nth-of-type|nth-child/.test(expr)) return 'css stable ancestor';
    if (/locator\s*\(/.test(expr) && /\./.test(expr)) return 'css class';
    if (/locator\s*\(/.test(expr)) return 'advanced/custom';
    return 'unknown';
  }

  function normalizeSelectorValue(value) {
    return safeText(value)
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/^xpath=/, '')
      .replace(/^css=/, '')
      .replace(/^text=/, '')
      .trim();
  }

  function selectorValueLooksSame(expected, expression) {
    const expectedValue = normalizeSelectorValue(expected.value);
    if (!expectedValue) return true;
    const expr = normalizeSelectorValue(expression);
    if (expected.kind === 'role+name') {
      return expected.value === (expression.match(/name\s*:\s*["'`]([^"'`]+)["'`]/) || [])[1] || expr.includes(expectedValue);
    }
    if (expected.kind === 'tag fallback') {
      return new RegExp(`["'\`]${expectedValue}["'\`]`, 'i').test(expr);
    }
    return expr.includes(expectedValue);
  }

  function classifyActualSelector(expression, expectedSelectors, usedKinds) {
    const expressionKind = inferSelectorKindFromLocatorExpression(expression);
    for (const expected of expectedSelectors) {
      if (usedKinds.has(`${expected.kind}:${expected.value}`)) continue;
      if (expressionKind === 'xpath' && expected.kind !== 'xpath') continue;
      if (expressionKind !== 'xpath' && expected.kind === 'xpath') continue;
      if (selectorValueLooksSame(expected, expression)) {
        usedKinds.add(`${expected.kind}:${expected.value}`);
        return expected.kind;
      }
    }
    return expressionKind;
  }

  function extractLocatorBlocks(scriptText) {
    const blockRegex = /let\s+locator(?<num>\d+)\s*=\s*(?<first>[\s\S]*?);\s*(?<body>[\s\S]*?)(?=let\s+locator\d+\s*=|\/\/ do not do this|await\s+context\.close|$)/g;
    const assignRegex = /locator(?<num>\d+)\s*=\s*(?<expr>[\s\S]*?);/g;
    const blocks = new Map();
    let blockMatch;
    while ((blockMatch = blockRegex.exec(scriptText)) !== null) {
      const locatorNumber = Number(blockMatch.groups.num);
      const assignments = [blockMatch.groups.first.trim()];
      let assignMatch;
      while ((assignMatch = assignRegex.exec(blockMatch.groups.body)) !== null) {
        assignments.push(assignMatch.groups.expr.trim());
      }
      blocks.set(locatorNumber, assignments.map((expression, index) => ({
        order: index + 1,
        expression,
        kind: inferSelectorKindFromLocatorExpression(expression),
      })));
    }
    return blocks;
  }

  function hasUsableSelector(details) {
    const selectors = details.selectors || {};
    return Boolean(
      selectors.label ||
      selectors.id ||
      selectors.dataTestId ||
      selectors.role ||
      selectors.text ||
      selectors.cssSelectorByStableAncestor ||
      selectors.cssSelectorByClass ||
      selectors.xpath ||
      selectors.tagName
    );
  }

  function classifyJsonAction(action) {
    const details = action.details || {};
    const element = details.element || {};
    const elementType = element.type || element.tagName || '';
    const title = details.title || '';
    const subType = details.eventSubType;

    if (details.url) {
      return {
        jsonVerb: 'navigate',
        expectedVerb: 'goto',
        expectedValue: details.url,
        target: details.url,
      };
    }

    if (/double-click/i.test(title)) {
      return {
        jsonVerb: 'double-click',
        expectedVerb: 'dblclick',
        expectedValue: '',
        target: selectorSummary(details.selectors),
      };
    }

    if (subType === 0) {
      const jsonVerb = elementType === 'range' ? 'range-click' : 'click';
      return {
        jsonVerb,
        expectedVerb: 'click',
        expectedValue: '',
        target: selectorSummary(details.selectors),
      };
    }

    if (subType === 2 || element.tagName === 'select' || elementType === 'select') {
      return {
        jsonVerb: 'select',
        expectedVerb: 'selectOption',
        expectedValue: (element.selectedOptions || [])[0] || '',
        target: selectorSummary(details.selectors),
      };
    }

    if (subType === 3 || elementType === 'checkbox') {
      const checked = element.checked !== false;
      return {
        jsonVerb: checked ? 'check' : 'uncheck',
        expectedVerb: checked ? 'check' : 'uncheck',
        expectedValue: '',
        target: selectorSummary(details.selectors),
      };
    }

    if (subType === 1 || ['text', 'password', 'textarea', 'date', 'color', 'number'].includes(elementType)) {
      return {
        jsonVerb: 'type',
        expectedVerb: 'fill',
        expectedValue: element.value ?? '',
        target: selectorSummary(details.selectors),
      };
    }

    return {
      jsonVerb: `unknown-${safeText(subType || elementType || 'action')}`,
      expectedVerb: 'click',
      expectedValue: '',
      target: selectorSummary(details.selectors),
    };
  }

  function extractScriptOperations(scriptText) {
    const regex = /(?:(?<object>page|locator\d+)\.)?(?<verb>goto|fill|check|uncheck|click|dblclick|selectOption|setInputFiles|press|hover)\s*\((?<args>[\s\S]*?)\)\s*;/g;
    const operations = [];
    let match;
    while ((match = regex.exec(scriptText)) !== null) {
      const object = match.groups.object || '';
      const verb = match.groups.verb;
      if (!object && verb !== 'goto') continue;
      operations.push({
        index: operations.length + 1,
        object,
        verb,
        args: match.groups.args || '',
        source: match[0],
        offset: match.index,
      });
    }
    return operations;
  }

  function compareSelectorPriority(actions, scriptText) {
    const locatorBlocks = extractLocatorBlocks(scriptText);
    const rows = [];
    let locatorNumber = 0;

    for (const action of actions) {
      const conversion = classifyJsonAction(action);
      if (conversion.expectedVerb === 'goto') continue;
      locatorNumber += 1;

      const expected = expectedSelectorPriority(action.details);
      const actualRaw = locatorBlocks.get(locatorNumber) || [];
      const usedKinds = new Set();
      const actual = actualRaw.map(item => ({
        ...item,
        kind: classifyActualSelector(item.expression, expected, usedKinds),
      }));
      const hasAdvanced = getAdvancedSelectors(action.details).length > 0;
      let status = 'OK';
      const reasons = [];

      if (!actual.length) {
        status = 'MISSING';
        reasons.push('No locator fallback block found in script.');
      }

      if (hasAdvanced && actual.some(item => item.kind !== 'advanced/custom')) {
        status = 'PRIORITY_MISMATCH';
        reasons.push('Advanced selector exists, so normal selectors should not be mixed into fallback order.');
      }

      if (!hasAdvanced) {
        for (let i = 0; i < Math.min(expected.length, actual.length); i += 1) {
          if (expected[i].kind !== actual[i].kind) {
            status = 'PRIORITY_MISMATCH';
            reasons.push(`Expected #${i + 1} ${expected[i].kind}, found ${actual[i].kind}.`);
            break;
          }
          if (!selectorValueLooksSame(expected[i], actual[i].expression)) {
            status = 'SELECTOR_VALUE_MISMATCH';
            reasons.push(`Selector #${i + 1} value does not appear to match JSON ${expected[i].kind}.`);
            break;
          }
        }

        if (actual.length < expected.length) {
          status = status === 'OK' ? 'MISSING_SELECTOR' : status;
          reasons.push(`Script has ${actual.length} selector attempts; JSON supports ${expected.length}.`);
        }
      }

      rows.push({
        actionNumber: action.number,
        locatorNumber,
        title: action.details.title || '',
        expectedOrder: expected.map(item => item.kind).join(' -> '),
        actualOrder: actual.map(item => item.kind).join(' -> '),
        expectedSelectors: expected.map(item => `${item.kind}: ${item.value}`).join(' | '),
        actualSelectors: actual.map(item => `${item.kind}: ${item.expression}`).join(' | '),
        status,
        reason: reasons.join(' '),
      });
    }

    return rows;
  }

  function argsContainValue(args, expectedValue) {
    if (expectedValue === undefined || expectedValue === null || expectedValue === '') return true;
    const value = String(expectedValue);
    return args.includes(JSON.stringify(value)) || args.includes(`'${value.replace(/'/g, "\\'")}'`);
  }

  function validateRecorder(recorder, actions) {
    const issues = [];
    if (!recorder || typeof recorder !== 'object') {
      issues.push({ area: 'JSON', severity: 'error', message: 'Recorder JSON is not an object.' });
      return issues;
    }
    if (!recorder.schemaVersion) {
      issues.push({ area: 'JSON', severity: 'warning', message: 'schemaVersion is missing.' });
    }
    if (!recorder.emulatorType || typeof recorder.emulatorType.width !== 'number' || typeof recorder.emulatorType.height !== 'number') {
      issues.push({ area: 'JSON', severity: 'warning', message: 'emulatorType width/height is missing.' });
    }
    if (!Array.isArray(recorder.events) || recorder.events.length === 0) {
      issues.push({ area: 'JSON', severity: 'error', message: 'events array is missing or empty.' });
      return issues;
    }
    if (actions.length === 0) {
      issues.push({ area: 'JSON', severity: 'error', message: 'No recorder actions found.' });
      return issues;
    }

    for (const action of actions) {
      const details = action.details || {};
      const element = details.element || {};
      const conversion = classifyJsonAction(action);
      if (conversion.expectedVerb !== 'goto' && !hasUsableSelector(details)) {
        issues.push({ area: 'JSON', severity: 'error', action: action.number, message: 'Action has no usable selector.' });
      }
      if (conversion.expectedVerb === 'goto' && !conversion.expectedValue) {
        issues.push({ area: 'JSON', severity: 'error', action: action.number, message: 'Navigation action has no URL.' });
      }
      if (conversion.expectedVerb === 'fill' && conversion.expectedValue === '') {
        issues.push({ area: 'JSON', severity: 'warning', action: action.number, message: 'Fill action has an empty value.' });
      }
      if (conversion.expectedVerb === 'selectOption' && conversion.expectedValue === '') {
        issues.push({ area: 'JSON', severity: 'error', action: action.number, message: 'Select action has no selected option.' });
      }
      if (element.type === 'range') {
        issues.push({ area: 'JSON', severity: 'info', action: action.number, message: 'Range action detected; final state should be validated in runtime evidence.' });
      }
    }

    return issues;
  }

  function compareActionsToScript(actions, operations) {
    const rows = [];
    for (const action of actions) {
      const conversion = classifyJsonAction(action);
      const operation = operations[action.number - 1] || null;
      let status = 'OK';
      let reason = '';

      if (!operation) {
        status = 'MISSING';
        reason = 'Script operation missing.';
      } else if (operation.verb !== conversion.expectedVerb) {
        status = 'VERB_MISMATCH';
        reason = `Expected ${conversion.expectedVerb}, found ${operation.verb}.`;
      } else if (['goto', 'fill', 'selectOption'].includes(conversion.expectedVerb) && !argsContainValue(operation.args, conversion.expectedValue)) {
        status = 'VALUE_MISMATCH';
        reason = `Expected value ${JSON.stringify(conversion.expectedValue)} was not found in script args.`;
      }

      rows.push({
        actionNumber: action.number,
        stepName: action.stepName,
        title: action.details.title || '',
        jsonVerb: conversion.jsonVerb,
        expectedVerb: conversion.expectedVerb,
        actualVerb: operation ? operation.verb : '',
        expectedValue: conversion.expectedValue,
        scriptArgs: operation ? operation.args.trim().replace(/\s+/g, ' ') : '',
        target: conversion.target,
        status,
        reason,
      });
    }

    if (operations.length > actions.length) {
      for (const operation of operations.slice(actions.length)) {
        rows.push({
          actionNumber: '',
          stepName: '',
          title: 'Extra script operation',
          jsonVerb: '',
          expectedVerb: '',
          actualVerb: operation.verb,
          expectedValue: '',
          scriptArgs: operation.args.trim().replace(/\s+/g, ' '),
          target: '',
          status: 'EXTRA_SCRIPT_VERB',
          reason: 'Script has more Playwright operations than recorder actions.',
        });
      }
    }

    return rows;
  }

  function summarizeVerbs(rows) {
    const map = new Map();
    for (const row of rows) {
      const key = [row.jsonVerb, row.expectedVerb, row.actualVerb || 'missing'].join('||');
      if (!map.has(key)) {
        map.set(key, {
          jsonVerb: row.jsonVerb || '-',
          expectedVerb: row.expectedVerb || '-',
          actualVerb: row.actualVerb || '-',
          count: 0,
          ok: 0,
          mismatches: 0,
          actions: [],
        });
      }
      const entry = map.get(key);
      entry.count += 1;
      entry.actions.push(row.actionNumber || '-');
      if (row.status === 'OK') entry.ok += 1;
      else entry.mismatches += 1;
    }
    return [...map.values()];
  }

  function analyzeRecorderAndScript(jsonText, scriptText) {
    let recorder;
    try {
      recorder = JSON.parse(jsonText);
    } catch (error) {
      return {
        classification: 'FE_JSON_ISSUE',
        summary: {},
        rows: [],
        verbRows: [],
        issues: [{ area: 'JSON', severity: 'error', message: `JSON parse failed: ${error.message}` }],
      };
    }

    const { steps, actions } = flattenRecorderActions(recorder);
    const operations = extractScriptOperations(scriptText);
    const rows = compareActionsToScript(actions, operations);
    const selectorRows = compareSelectorPriority(actions, scriptText);
    const issues = validateRecorder(recorder, actions);

    for (const row of rows) {
      if (row.status !== 'OK') {
        issues.push({ area: 'Conversion', severity: 'error', action: row.actionNumber, message: row.reason || row.status });
      }
    }

    for (const row of selectorRows) {
      if (row.status !== 'OK') {
        issues.push({ area: 'Selector Priority', severity: 'error', action: row.actionNumber, message: row.reason || row.status });
      }
    }

    const jsonErrors = issues.some(issue => issue.area === 'JSON' && issue.severity === 'error');
    const conversionErrors = issues.some(issue => ['Conversion', 'Selector Priority'].includes(issue.area) && issue.severity === 'error');
    const classification = jsonErrors ? 'FE_JSON_ISSUE' : conversionErrors ? 'AGENT_CONVERSION_ISSUE' : 'PASS';

    return {
      classification,
      summary: {
        steps: steps.length,
        recorderActions: actions.length,
        scriptOperations: operations.length,
        matchedActions: rows.filter(row => row.status === 'OK').length,
        mismatchCount: rows.filter(row => row.status !== 'OK').length + selectorRows.filter(row => row.status !== 'OK').length,
        selectorPriorityOk: selectorRows.filter(row => row.status === 'OK').length,
        selectorPriorityIssues: selectorRows.filter(row => row.status !== 'OK').length,
      },
      rows,
      selectorRows,
      verbRows: summarizeVerbs(rows),
      issues,
    };
  }

  function statusPill(status) {
    if (status === 'OK') return '<span class="pill ok">OK</span>';
    if (status === 'EXTRA_SCRIPT_VERB') return '<span class="pill warn">EXTRA</span>';
    return `<span class="pill bad">${escapeHtml(status)}</span>`;
  }

  function renderSummary(result) {
    const statusClass = result.classification === 'PASS' ? 'status-pass' : 'status-fail';
    return [
      ['Status', result.classification, statusClass],
      ['Recorder Actions', result.summary.recorderActions ?? 0, ''],
      ['Script Verbs', result.summary.scriptOperations ?? 0, ''],
      ['Matched', result.summary.matchedActions ?? 0, 'status-pass'],
      ['Selector Issues', result.summary.selectorPriorityIssues ?? 0, result.summary.selectorPriorityIssues ? 'status-fail' : ''],
    ].map(([label, value, cls]) => `
      <article class="summary-card ${cls}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </article>
    `).join('');
  }

  function renderVerbSummary(rows) {
    if (!rows.length) return '<div class="empty-state">No verb rows.</div>';
    return `
      <h2>Verb Summary</h2>
      <table>
        <thead>
          <tr>
            <th>JSON Verb</th>
            <th>Expected Playwright Verb</th>
            <th>Actual Script Verb</th>
            <th>Count</th>
            <th>OK</th>
            <th>Mismatches</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="mono">${escapeHtml(row.jsonVerb)}</td>
              <td class="mono">${escapeHtml(row.expectedVerb)}</td>
              <td class="mono">${escapeHtml(row.actualVerb)}</td>
              <td>${row.count}</td>
              <td>${row.ok}</td>
              <td>${row.mismatches}</td>
              <td class="mono">${escapeHtml(row.actions.join(', '))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderActionTable(rows) {
    if (!rows.length) return '<div class="empty-state">No actions.</div>';
    return `
      <h2>Action Mapping</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Step</th>
            <th>JSON Title</th>
            <th>JSON Verb</th>
            <th>Expected Verb</th>
            <th>Actual Verb</th>
            <th>Expected Value</th>
            <th>Script Args</th>
            <th>Target</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="mono">${escapeHtml(row.actionNumber)}</td>
              <td>${escapeHtml(row.stepName)}</td>
              <td>${escapeHtml(row.title)}</td>
              <td class="mono">${escapeHtml(row.jsonVerb)}</td>
              <td class="mono">${escapeHtml(row.expectedVerb)}</td>
              <td class="mono">${escapeHtml(row.actualVerb)}</td>
              <td class="mono">${escapeHtml(row.expectedValue)}</td>
              <td class="mono">${escapeHtml(row.scriptArgs)}</td>
              <td class="mono">${escapeHtml(row.target)}</td>
              <td>${statusPill(row.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderSelectorPriority(rows) {
    if (!rows.length) return '<div class="empty-state">No selector fallback rows.</div>';
    return `
      <h2>Selector Priority</h2>
      <p class="priority-order">Normal priority: ${escapeHtml(NORMAL_SELECTOR_PRIORITY.join(' -> '))}. If advanced selectors exist, only advanced selectors should be used.</p>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Locator</th>
            <th>JSON Title</th>
            <th>Expected Order</th>
            <th>Actual Script Order</th>
            <th>Expected Selectors</th>
            <th>Actual Selectors</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="mono">${escapeHtml(row.actionNumber)}</td>
              <td class="mono">locator${escapeHtml(row.locatorNumber)}</td>
              <td>${escapeHtml(row.title)}</td>
              <td class="mono">${escapeHtml(row.expectedOrder)}</td>
              <td class="mono">${escapeHtml(row.actualOrder)}</td>
              <td class="mono">${escapeHtml(row.expectedSelectors)}</td>
              <td class="mono">${escapeHtml(row.actualSelectors)}</td>
              <td>${statusPill(row.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderFindings(issues) {
    if (!issues.length) return '<h2>Findings</h2><div class="empty-state">No findings.</div>';
    return `
      <h2>Findings</h2>
      <ul class="findings-list">
        ${issues.map(issue => `
          <li>
            <span class="pill ${issue.severity === 'error' ? 'bad' : issue.severity === 'warning' ? 'warn' : 'ok'}">${escapeHtml(issue.severity.toUpperCase())}</span>
            <strong>${escapeHtml(issue.area)}</strong>
            ${issue.action ? `<span class="mono">action ${escapeHtml(issue.action)}</span>` : ''}
            ${escapeHtml(issue.message)}
          </li>
        `).join('')}
      </ul>
    `;
  }

  function toCsv(rows) {
    const headers = ['Action', 'Step', 'JSON Title', 'JSON Verb', 'Expected Verb', 'Actual Verb', 'Expected Value', 'Script Args', 'Target', 'Status', 'Reason'];
    const csvRows = [headers, ...rows.map(row => [
      row.actionNumber,
      row.stepName,
      row.title,
      row.jsonVerb,
      row.expectedVerb,
      row.actualVerb,
      row.expectedValue,
      row.scriptArgs,
      row.target,
      row.status,
      row.reason,
    ])];
    return csvRows.map(cols => cols.map(value => `"${safeText(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function downloadText(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindUi() {
    const jsonInput = document.getElementById('jsonFile');
    const scriptInput = document.getElementById('scriptFile');
    const analyzeButton = document.getElementById('analyzeButton');
    const summary = document.getElementById('summary');
    const verbSummary = document.getElementById('verbSummary');
    const actionTable = document.getElementById('actionTable');
    const selectorPriority = document.getElementById('selectorPriority');
    const findings = document.getElementById('findings');
    const downloadJsonButton = document.getElementById('downloadJsonButton');
    const downloadCsvButton = document.getElementById('downloadCsvButton');
    let lastResult = null;

    async function readFile(input) {
      const file = input.files && input.files[0];
      if (!file) return '';
      return file.text();
    }

    analyzeButton.addEventListener('click', async () => {
      const jsonText = await readFile(jsonInput);
      const scriptText = await readFile(scriptInput);
      if (!jsonText || !scriptText) {
        summary.innerHTML = renderSummary({
          classification: 'INPUT_REQUIRED',
          summary: { recorderActions: 0, scriptOperations: 0, matchedActions: 0, mismatchCount: 0 },
        });
        findings.innerHTML = renderFindings([{ area: 'Input', severity: 'error', message: 'Upload both recorder JSON and generated script.' }]);
        return;
      }

      lastResult = analyzeRecorderAndScript(jsonText, scriptText);
      summary.innerHTML = renderSummary(lastResult);
      verbSummary.innerHTML = renderVerbSummary(lastResult.verbRows);
      actionTable.innerHTML = renderActionTable(lastResult.rows);
      selectorPriority.innerHTML = renderSelectorPriority(lastResult.selectorRows);
      findings.innerHTML = renderFindings(lastResult.issues);
      downloadJsonButton.disabled = false;
      downloadCsvButton.disabled = false;
    });

    downloadJsonButton.addEventListener('click', () => {
      if (!lastResult) return;
      downloadText('json-to-script-analysis.json', JSON.stringify(lastResult, null, 2), 'application/json');
    });

    downloadCsvButton.addEventListener('click', () => {
      if (!lastResult) return;
      downloadText('json-to-script-action-mapping.csv', toCsv(lastResult.rows), 'text/csv');
    });

    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.tab;
        document.querySelectorAll('.tab-button').forEach(item => item.classList.toggle('active', item === button));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === target));
      });
    });

    summary.innerHTML = renderSummary({
      classification: 'READY',
      summary: { recorderActions: 0, scriptOperations: 0, matchedActions: 0, mismatchCount: 0 },
    });
    verbSummary.innerHTML = '<div class="empty-state">Upload files and analyze.</div>';
    actionTable.innerHTML = '<div class="empty-state">Upload files and analyze.</div>';
    selectorPriority.innerHTML = '<div class="empty-state">Upload files and analyze.</div>';
    findings.innerHTML = '<div class="empty-state">Upload files and analyze.</div>';
  }

  const api = {
    analyzeRecorderAndScript,
    classifyJsonAction,
    compareActionsToScript,
    compareSelectorPriority,
    expectedSelectorPriority,
    extractLocatorBlocks,
    extractScriptOperations,
    flattenRecorderActions,
    summarizeVerbs,
    validateRecorder,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.JsonToScriptAnalyser = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', bindUi);
  }
})(typeof window !== 'undefined' ? window : globalThis);
