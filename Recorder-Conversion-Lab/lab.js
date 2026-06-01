// AIASSISTED: created with AI tooling.

(function () {
  'use strict';

  function log(message) {
    const logEl = document.getElementById('event-log');
    if (!logEl) return;
    const time = new Date().toLocaleTimeString();
    logEl.textContent = `[${time}] ${message}\n${logEl.textContent}`;
  }

  function bind(selector, eventName, handler) {
    document.querySelectorAll(selector).forEach(element => {
      element.addEventListener(eventName, handler);
    });
  }

  function initBasicPage() {
    const range = document.getElementById('basic-range');
    const output = document.getElementById('range-output');
    if (range && output) {
      range.addEventListener('input', () => {
        output.value = range.value;
        output.textContent = range.value;
        log(`range=${range.value}`);
      });
    }

    const doubleClick = document.getElementById('double-click-button');
    if (doubleClick) {
      doubleClick.addEventListener('dblclick', () => log('double click captured'));
    }

    const rightClick = document.getElementById('right-click-button');
    if (rightClick) {
      rightClick.addEventListener('contextmenu', event => {
        event.preventDefault();
        log('right click captured');
      });
    }

    const hover = document.getElementById('hover-button');
    if (hover) {
      hover.addEventListener('mouseenter', () => log('hover captured'));
    }

    const alertButton = document.getElementById('alert-button');
    if (alertButton) {
      alertButton.addEventListener('click', () => {
        log('alert opened');
        window.alert('Recorder alert fixture');
      });
    }

    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        const answer = window.confirm('Recorder confirm fixture');
        log(`confirm=${answer}`);
      });
    }

    const delayedButton = document.getElementById('delayed-button');
    if (delayedButton) {
      delayedButton.addEventListener('click', () => {
        log('creating delayed button');
        window.setTimeout(() => {
          const target = document.getElementById('delayed-target');
          const button = document.createElement('button');
          button.type = 'button';
          button.id = 'created-delayed-button';
          button.textContent = 'Created Delayed Button';
          button.addEventListener('click', () => log('created delayed button clicked'));
          target.replaceChildren(button);
        }, 800);
      });
    }
  }

  function initEdgePage() {
    const dynamic = document.getElementById('dynamic-id-button');
    if (dynamic) {
      dynamic.id = `dynamic-id-${Date.now()}`;
      dynamic.addEventListener('click', () => log(`dynamic clicked ${dynamic.id}`));
    }

    const delayed = document.getElementById('create-delayed-edge');
    if (delayed) {
      delayed.addEventListener('click', () => {
        window.setTimeout(() => {
          const zone = document.getElementById('delayed-edge-zone');
          const button = document.createElement('button');
          button.type = 'button';
          button.id = 'edge-delayed-button';
          button.textContent = 'Edge Delayed Button';
          button.addEventListener('click', () => log('edge delayed clicked'));
          zone.replaceChildren(button);
        }, 1000);
      });
    }

    const reveal = document.getElementById('reveal-hidden');
    const hidden = document.getElementById('hidden-target');
    if (reveal && hidden) {
      reveal.addEventListener('click', () => {
        hidden.classList.remove('hidden');
        log('hidden target revealed');
      });
      hidden.addEventListener('click', () => log('hidden target clicked'));
    }
  }

  function bindGenericLogging() {
    bind('button', 'click', event => log(`button click: ${event.currentTarget.textContent.trim()}`));
    bind('input, textarea, select', 'change', event => {
      const target = event.currentTarget;
      log(`${target.id || target.name || target.tagName.toLowerCase()} changed`);
    });
    bind('[contenteditable="true"]', 'input', event => log(`contenteditable=${event.currentTarget.textContent.trim()}`));
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindGenericLogging();
    initBasicPage();
    initEdgePage();
  });
})();
