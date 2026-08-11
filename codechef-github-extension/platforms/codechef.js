// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - CodeChef Platform Module
// ═══════════════════════════════════════════════════════════════════════════
// Handles CodeChef-specific submission detection and code extraction
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── State Management ───────────────────────────────────────────────────
  let isWatching = false;
  let alreadyProcessed = false;
  let observer = null;

  // ─── Logging Utility ────────────────────────────────────────────────────
  function log(...args) {
    console.log('%c[CodeHub:CodeChef]', 'color: #10b981; font-weight: bold;', ...args);
  }

  // ─── Extract Problem Code from URL ──────────────────────────────────────
  function getProblemCode() {
    const path = window.location.pathname;
    // Match patterns like /problems/PROBLEMCODE or /CONTESTCODE/problems/PROBLEMCODE
    const match = path.match(/\/problems\/([A-Z0-9_]+)/i);
    if (match) return match[1].toUpperCase();
    
    // Fallback: last segment
    const segments = path.split('/').filter(s => s);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1].toUpperCase();
      if (/^[A-Z0-9_]{2,15}$/.test(lastSegment)) return lastSegment;
    }
    
    return 'UNKNOWN';
  }

  // ─── Extract Language from Page UI ──────────────────────────────────────
  function getLanguageFromPage() {
    // Try to find language selector dropdown or button
    const selectors = [
      '[class*="language-select"]',
      '[class*="lang-select"]',
      'button[class*="language"]',
      'div[class*="language"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.textContent.trim();
        // Match common language patterns
        if (/^(C\+\+|Python|Java|JavaScript|C#|Ruby|Go|Rust)/i.test(text)) {
          return text;
        }
      }
    }

    // Fallback: scan document body
    const bodyText = document.body?.innerText || '';
    const langMatch = bodyText.match(/(C\+\+17|C\+\+14|C\+\+|Python\s*3|Python|Java\s*\d*|JavaScript)/i);
    if (langMatch) return langMatch[1];

    return 'C++'; // Default fallback
  }

  // ─── Extract Code from Monaco/ACE Editor ────────────────────────────────
  function extractCodeFromEditor() {
    try {
      log('Starting code extraction...');

      // Strategy 1: Monaco Editor API
      if (window.monaco && window.monaco.editor) {
        log('Trying Monaco API...');
        const editors = window.monaco.editor.getModels();
        if (editors && editors.length > 0) {
          for (let i = 0; i < editors.length; i++) {
            const code = editors[i].getValue();
            if (code && code.trim().length > 10) {
              log('Code extracted via Monaco API:', code.length, 'chars');
              return code;
            }
          }
        }
      }

      // Strategy 2: ACE Editor (CodeChef uses ACE)
      if (typeof window.editor !== 'undefined' && window.editor) {
        log('Found global window.editor');
        try {
          if (typeof window.editor.getValue === 'function') {
            const code = window.editor.getValue();
            if (code && code.trim().length > 10) {
              log('Code extracted via window.editor.getValue():', code.length, 'chars');
              return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            }
          }
          
          if (typeof window.editor.getSession === 'function') {
            const session = window.editor.getSession();
            const lineCount = session.getLength();
            const lines = [];
            for (let i = 0; i < lineCount; i++) {
              lines.push(session.getLine(i));
            }
            const code = lines.join('\n');
            if (code.trim().length > 10) {
              log('Code extracted via window.editor.getSession():', code.length, 'chars');
              return code;
            }
          }
        } catch (e) {
          log('window.editor failed:', e.message);
        }
      }
      
      // Strategy 3: ACE Editor DOM extraction
      const aceElements = document.querySelectorAll('.ace_editor');
      for (let idx = 0; idx < aceElements.length; idx++) {
        const aceEl = aceElements[idx];
        
        if (aceEl.editor) {
          try {
            const session = aceEl.editor.getSession();
            const lineCount = session.getLength();
            const lines = [];
            for (let i = 0; i < lineCount; i++) {
              lines.push(session.getLine(i));
            }
            const code = lines.join('\n');
            if (code.trim().length > 10) {
              log('Code extracted via aceEl.editor:', code.length, 'chars');
              return code;
            }
          } catch (e) {
            log('aceEl.editor failed:', e.message);
          }
        }
        
        // Extract from DOM structure
        try {
          const textLayer = aceEl.querySelector('.ace_text-layer');
          if (textLayer) {
            const aceLines = textLayer.querySelectorAll('.ace_line');
            if (aceLines.length > 0) {
              const lines = [];
              for (const aceLine of aceLines) {
                lines.push(aceLine.textContent || '');
              }
              const code = lines.join('\n');
              if (code.trim().length > 10) {
                log('Code extracted via DOM structure:', code.length, 'chars');
                return code;
              }
            }
          }
        } catch (e) {
          log('DOM extraction failed:', e.message);
        }
      }

      // Strategy 4: Monaco DOM extraction
      const monacoElements = document.querySelectorAll('.monaco-editor');
      for (const editorEl of monacoElements) {
        if (editorEl.classList.contains('minimap') || editorEl.offsetHeight < 100) {
          continue;
        }

        const viewLines = editorEl.querySelectorAll('.view-line');
        if (viewLines.length > 0) {
          const code = Array.from(viewLines)
            .map(line => line.textContent || '')
            .join('\n');
          
          if (code && code.trim().length > 10) {
            log('Code extracted via Monaco DOM:', code.length, 'chars');
            return code;
          }
        }
      }

      // Strategy 5: Textarea fallback
      const textareas = document.querySelectorAll('textarea');
      for (const textarea of textareas) {
        if (textarea.value.trim().length < 10) continue;

        const isIO = 
          textarea.id.toLowerCase().includes('input') ||
          textarea.id.toLowerCase().includes('output') ||
          textarea.name.toLowerCase().includes('input') ||
          textarea.name.toLowerCase().includes('output');
        
        if (!isIO && textarea.value.trim().length > 10) {
          log('Code extracted via textarea:', textarea.value.length, 'chars');
          return textarea.value;
        }
      }

      log('Could not extract code from any source');
      return null;
    } catch (err) {
      log('Error extracting code:', err.message);
      return null;
    }
  }

  // ─── Setup Submit Button Listener ───────────────────────────────────────
  function setupSubmitListener() {
    log('Setting up submit button listener...');

    document.body.addEventListener('click', function(event) {
      const target = event.target;
      const submitButton = target.closest('button, input[type="submit"], a');
      if (!submitButton) return;

      const buttonText = submitButton.textContent.trim().toLowerCase();
      const buttonClass = submitButton.className.toLowerCase();
      const buttonId = submitButton.id.toLowerCase();

      const isSubmitButton = 
        buttonText.includes('submit') ||
        buttonClass.includes('submit') ||
        buttonId.includes('submit');

      if (!isSubmitButton) return;

      log('Submit button clicked!');

      setTimeout(() => {
        const code = extractCodeFromEditor();
        if (!code) {
          log('Failed to capture code on submit');
          setTimeout(() => {
            const retryCode = extractCodeFromEditor();
            if (retryCode) {
              stageSubmission(retryCode);
            }
          }, 500);
          return;
        }
        stageSubmission(code);
      }, 100);

    }, true);

    log('Submit listener active');
  }

  // ─── Stage Submission Data ──────────────────────────────────────────────
  function stageSubmission(code) {
    const problemCode = getProblemCode();
    const language = getLanguageFromPage();

    const submissionData = {
      type: 'ACCEPTED_SOLUTION',
      payload: {
        platform: 'CodeChef',
        problemCode,
        language,
        code,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    if (!chrome.runtime?.id) {
      log('Extension context invalidated');
      return;
    }

    chrome.storage.local.set({ pendingSubmission: submissionData }, () => {
      if (chrome.runtime.lastError) {
        log('Storage error:', chrome.runtime.lastError.message);
        return;
      }
      log('Submission staged:', problemCode, '|', language);
    });

    alreadyProcessed = false;

    if (!isWatching) {
      startVerdictWatcher();
    }
  }

  // ─── Watch for "Correct Answer" Verdict ─────────────────────────────────
  function startVerdictWatcher() {
    if (isWatching) return;
    
    isWatching = true;
    log('Watching for verdict...');

    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(() => {
      checkForAcceptedVerdict();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    const checkInterval = setInterval(() => {
      checkForAcceptedVerdict();
    }, 1000);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (observer) observer.disconnect();
      isWatching = false;
      log('Verdict watch timeout');
    }, 120000);
  }

  // ─── Check for Accepted Verdict ─────────────────────────────────────────
  function checkForAcceptedVerdict() {
    if (alreadyProcessed) return;

    let isAccepted = false;

    const elements = document.querySelectorAll(
      'div, span, p, td, h1, h2, h3, h4, section, article, [class*="verdict"], [class*="result"]'
    );

    for (const el of elements) {
      if (el.children.length > 8) continue;

      const text = (el.textContent || '').trim().toLowerCase();
      const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
      
      const acceptedPatterns = [
        'correct answer',
        'accepted',
        'status: ac',
        'result: ac',
        'verdict: accepted'
      ];

      const textMatches = acceptedPatterns.some(pattern => text === pattern || text.includes(pattern));
      const classMatches = className.includes('correct') || 
                          className.includes('accepted') ||
                          className.includes('success') && className.includes('verdict');

      const hasSuccessIcon = el.querySelector('[class*="check"]') ||
                            el.querySelector('[class*="success"]') ||
                            el.querySelector('svg[class*="check"]');

      if (textMatches || (classMatches && (text.includes('correct') || hasSuccessIcon))) {
        isAccepted = true;
        log('Found AC verdict');
        break;
      }
    }

    if (!isAccepted) {
      const bodyText = document.body?.innerText || '';
      if (bodyText.includes('Correct Answer') || 
          bodyText.includes('Status: AC') ||
          bodyText.includes('Result: Accepted')) {
        isAccepted = true;
        log('Found AC verdict in body text');
      }
    }

    if (!isAccepted) return;

    if (!chrome.runtime?.id) {
      log('Extension context invalidated');
      return;
    }

    alreadyProcessed = true;
    log('Correct Answer detected! Processing submission...');

    chrome.storage.local.get(['pendingSubmission'], (data) => {
      if (chrome.runtime.lastError) {
        log('Storage error:', chrome.runtime.lastError.message);
        alreadyProcessed = false;
        return;
      }

      if (!data.pendingSubmission) {
        log('No pending submission found');
        return;
      }

      chrome.runtime.sendMessage(data.pendingSubmission, (response) => {
        if (chrome.runtime.lastError) {
          log('Message error:', chrome.runtime.lastError.message);
          alreadyProcessed = false;
          return;
        }

        if (response?.success) {
          log('Successfully pushed to GitHub!');
          chrome.storage.local.remove(['pendingSubmission']);
          if (observer) {
            observer.disconnect();
            isWatching = false;
          }
        } else {
          log('Push failed:', response?.error);
          alreadyProcessed = false;
        }
      });
    });
  }

  // ─── Initialize ─────────────────────────────────────────────────────────
  function init() {
    log('CodeChef module initialized');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupSubmitListener);
    } else {
      setTimeout(setupSubmitListener, 1000);
    }

    const currentPath = window.location.pathname;
    if (!currentPath.includes('/problems/')) {
      if (chrome.runtime?.id) {
        chrome.storage.local.remove(['pendingSubmission']);
      }
    }
  }

  // ─── SPA Navigation Handler ─────────────────────────────────────────────
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      alreadyProcessed = false;
      
      if (observer) {
        observer.disconnect();
        isWatching = false;
      }

      log('Navigation detected:', location.pathname);
      
      if (location.pathname.includes('/problems/')) {
        init();
      }
    }
  });

  urlObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  init();

})();
