// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - Content Script
// ═══════════════════════════════════════════════════════════════════════════
// Capture-on-Submit Strategy:
// 1. Listen for Submit button clicks
// 2. Extract code from Monaco Editor immediately
// 3. Stage data in chrome.storage.local
// 4. Watch for "Correct Answer" verdict via MutationObserver
// 5. If AC detected, send staged data to background script
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── State Management ───────────────────────────────────────────────────
  let isWatching = false;
  let alreadyProcessed = false;
  let observer = null;

  // ─── Logging Utility ────────────────────────────────────────────────────
  function log(...args) {
    console.log('%c[CodeHub]', 'color: #10b981; font-weight: bold;', ...args);
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

  // ─── Extract Code from Monaco Editor ────────────────────────────────────
  // CodeChef uses Monaco Editor - we need to extract from the editor model
  function extractCodeFromEditor() {
    try {
      log('Starting code extraction...');

      // First, check if we're in an iframe
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length > 0) {
        log('Found', iframes.length, 'iframes on page');
      }

      // Strategy 1: Monaco Editor API (most reliable)
      if (window.monaco && window.monaco.editor) {
        log('Trying Monaco API...');
        const editors = window.monaco.editor.getModels();
        if (editors && editors.length > 0) {
          for (let i = 0; i < editors.length; i++) {
            const code = editors[i].getValue();
            if (code && code.trim().length > 10) {
              log('Code extracted via Monaco API (model', i, '):', code.length, 'chars');
              return code;
            }
          }
        }
        log('Monaco API available but no valid models found');
      } else {
        log('Monaco not available on window object');
      }

      // Strategy 2: Direct Monaco Editor instances
      if (window.monaco && window.monaco.editor) {
        const allEditors = window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : [];
        log('Found', allEditors.length, 'editor instances');
        for (const editor of allEditors) {
          try {
            const code = editor.getValue();
            if (code && code.trim().length > 10) {
              log('Code extracted via Monaco instance:', code.length, 'chars');
              return code;
            }
          } catch (e) {
            // Continue to next editor
          }
        }
      }

      // Strategy 3: Query Monaco Editor DOM (line by line)
      log('Trying Monaco DOM extraction...');
      const monacoElements = document.querySelectorAll('.monaco-editor');
      log('Found', monacoElements.length, 'monaco-editor elements');
      
      for (const editorEl of monacoElements) {
        // Skip minimap and small elements
        if (editorEl.classList.contains('minimap') || 
            editorEl.offsetHeight < 100) {
          continue;
        }

        // Skip console/output areas
        const parent = editorEl.closest('[class*="console"]') || 
                      editorEl.closest('[class*="output"]') ||
                      editorEl.closest('[id*="output"]');
        
        if (parent) {
          log('Skipping console/output editor');
          continue;
        }

        // Try to get text content from view lines
        const viewLines = editorEl.querySelectorAll('.view-line');
        log('Found', viewLines.length, 'view lines in editor');
        
        if (viewLines.length > 0) {
          const code = Array.from(viewLines)
            .map(line => {
              // Get all text content, including from nested spans
              const text = line.textContent || '';
              return text;
            })
            .join('\n');
          
          if (code && code.trim().length > 10) {
            log('Code extracted via Monaco DOM:', code.length, 'chars');
            return code;
          }
        }

        // Alternative: try .view-lines container
        const viewLinesContainer = editorEl.querySelector('.view-lines');
        if (viewLinesContainer) {
          const code = viewLinesContainer.textContent || '';
          if (code && code.trim().length > 10) {
            log('Code extracted via .view-lines container:', code.length, 'chars');
            return code;
          }
        }
      }

      // Strategy 4: ACE Editor (CodeChef uses ACE)
      log('Trying ACE Editor extraction...');
      
      // First, check what's available
      log('window.ace available:', !!window.ace);
      
      // Method 1: Try global editor variable (CodeChef might store it here)
      if (typeof window.editor !== 'undefined' && window.editor) {
        log('Found global window.editor');
        try {
          if (typeof window.editor.getValue === 'function') {
            const code = window.editor.getValue();
            if (code && code.trim().length > 10) {
              log('Code extracted via window.editor.getValue():', code.length, 'chars');
              const normalizedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
              const lineCount = (normalizedCode.match(/\n/g) || []).length + 1;
              log('Total lines:', lineCount);
              log('First line:', normalizedCode.split('\n')[0]);
              return normalizedCode;
            }
          }
          
          if (typeof window.editor.getSession === 'function') {
            const session = window.editor.getSession();
            const lineCount = session.getLength();
            log('window.editor session has', lineCount, 'lines');
            
            const lines = [];
            for (let i = 0; i < lineCount; i++) {
              lines.push(session.getLine(i));
              if (i < 5) {
                log('Line', i, ':', lines[i]);
              }
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
      
      // Method 2: Try to find editor in CodeChef's React/Angular context
      const aceElements = document.querySelectorAll('.ace_editor');
      log('Found', aceElements.length, 'ACE elements');
      
      for (let idx = 0; idx < aceElements.length; idx++) {
        const aceEl = aceElements[idx];
        log('Checking ACE element', idx);
        
        // Try multiple approaches to get editor instance
        
        // Approach 1: Check if element has editor property directly
        if (aceEl.editor) {
          log('Element', idx, 'has .editor property');
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
        
        // Approach 2: Extract from DOM structure
        try {
          const textLayer = aceEl.querySelector('.ace_text-layer');
          if (textLayer) {
            const aceLines = textLayer.querySelectorAll('.ace_line');
            if (aceLines.length > 0) {
              log('Found', aceLines.length, 'ace_line elements in element', idx);
              
              const lines = [];
              for (const aceLine of aceLines) {
                const lineText = aceLine.textContent || '';
                lines.push(lineText);
                if (lines.length <= 5) {
                  log('Line', lines.length - 1, ':', lineText);
                }
              }
              
              const code = lines.join('\n');
              if (code.trim().length > 10) {
                log('Code extracted via DOM structure:', code.length, 'chars');
                log('Total lines:', lines.length);
                return code;
              }
            }
          }
        } catch (e) {
          log('DOM extraction from element', idx, 'failed:', e.message);
        }
      }
      
      // Method 3: Try window.ace.edit with element ID
      if (window.ace && window.ace.edit) {
        log('Trying window.ace.edit with element IDs');
        for (let idx = 0; idx < aceElements.length; idx++) {
          const aceEl = aceElements[idx];
          if (aceEl.id) {
            try {
              log('Trying ace.edit with id:', aceEl.id);
              const editor = window.ace.edit(aceEl.id);
              if (editor && editor.getSession) {
                const session = editor.getSession();
                const lineCount = session.getLength();
                const lines = [];
                for (let i = 0; i < lineCount; i++) {
                  lines.push(session.getLine(i));
                }
                const code = lines.join('\n');
                if (code.trim().length > 10) {
                  log('Code extracted via ace.edit(id):', code.length, 'chars');
                  return code;
                }
              }
            } catch (e) {
              log('ace.edit with id', aceEl.id, 'failed:', e.message);
            }
          }
        }
      }
      
      log('All ACE extraction methods failed');

      // Strategy 5: CodeMirror fallback (older CodeChef interface)
      log('Trying CodeMirror extraction...');
      const codeMirrorElements = document.querySelectorAll('.CodeMirror');
      for (const cm of codeMirrorElements) {
        if (cm.CodeMirror) {
          const code = cm.CodeMirror.getValue();
          if (code && code.trim().length > 10) {
            log('Code extracted via CodeMirror:', code.length, 'chars');
            return code;
          }
        }
      }

      // Strategy 6: Textarea fallback (mobile or simple editor)
      log('Trying textarea extraction...');
      const textareas = document.querySelectorAll('textarea');
      log('Found', textareas.length, 'textareas');
      
      for (const textarea of textareas) {
        const textareaInfo = {
          id: textarea.id,
          name: textarea.name,
          className: textarea.className,
          valueLength: textarea.value.length,
          placeholder: textarea.placeholder
        };
        log('Examining textarea:', textareaInfo);

        // Skip if empty or very short
        if (textarea.value.trim().length < 10) {
          log('Skipping empty/short textarea');
          continue;
        }

        // Check if it looks like a code editor
        const isCodeEditor = 
          textarea.id.toLowerCase().includes('code') || 
          textarea.name.toLowerCase().includes('code') ||
          textarea.className.toLowerCase().includes('code') ||
          textarea.classList.contains('ace_text-input') || // ACE editor
          textarea.placeholder.toLowerCase().includes('code');
        
        // Skip input/output/test case fields
        const isIO = 
          textarea.id.toLowerCase().includes('input') ||
          textarea.id.toLowerCase().includes('output') ||
          textarea.id.toLowerCase().includes('stdin') ||
          textarea.id.toLowerCase().includes('stdout') ||
          textarea.name.toLowerCase().includes('input') ||
          textarea.name.toLowerCase().includes('output') ||
          textarea.closest('[class*="input"]') ||
          textarea.closest('[class*="output"]') ||
          textarea.closest('[class*="test"]');
        
        log('Textarea checks:', { isCodeEditor, isIO });

        // If it has substantial content and isn't obviously I/O, take it
        if (!isIO && textarea.value.trim().length > 10) {
          log('Code extracted via textarea:', textarea.value.length, 'chars');
          log('Textarea sample:', textarea.value.substring(0, 100) + '...');
          return textarea.value;
        }
      }

      // Strategy 7: Look for contenteditable divs
      log('Trying contenteditable extraction...');
      const editableDivs = document.querySelectorAll('[contenteditable="true"]');
      for (const div of editableDivs) {
        const code = div.textContent || div.innerText || '';
        if (code.trim().length > 50) {
          log('Code extracted via contenteditable:', code.length, 'chars');
          return code;
        }
      }

      log('Could not extract code from any source');
      log('Debug info:', {
        monacoAvailable: !!window.monaco,
        monacoEditorCount: monacoElements.length,
        textareaCount: textareas.length
      });
      
      return null;
    } catch (err) {
      log('Error extracting code:', err.message, err.stack);
      return null;
    }
  }

  // ─── Capture Code on Submit Button Click ────────────────────────────────
  function setupSubmitListener() {
    log('Setting up submit button listener...');

    // Use event delegation on document body for dynamically loaded buttons
    document.body.addEventListener('click', function(event) {
      const target = event.target;
      
      // Check if clicked element or parent is a submit button
      const submitButton = target.closest('button, input[type="submit"], a');
      if (!submitButton) return;

      const buttonText = submitButton.textContent.trim().toLowerCase();
      const buttonClass = submitButton.className.toLowerCase();
      const buttonId = submitButton.id.toLowerCase();

      // Match various submit button patterns
      const isSubmitButton = 
        buttonText.includes('submit') ||
        buttonClass.includes('submit') ||
        buttonId.includes('submit') ||
        buttonText === 'run' && buttonClass.includes('submit');

      if (!isSubmitButton) return;

      log('Submit button clicked!');

      // Add a small delay to ensure Monaco is fully ready
      setTimeout(() => {
        // Extract code immediately (before page changes)
        const code = extractCodeFromEditor();
        
        if (!code) {
          log('Failed to capture code on submit');
          
          // Try one more time after a longer delay
          setTimeout(() => {
            log('Retrying code extraction...');
            const retryCode = extractCodeFromEditor();
            if (retryCode) {
              stageSubmission(retryCode);
            } else {
              log('Still could not extract code');
            }
          }, 500);
          return;
        }

        stageSubmission(code);
      }, 100); // Small delay for Monaco to stabilize

    }, true); // Use capture phase to catch events early

    log('Submit listener active');
  }

  // ─── Stage Submission Data ──────────────────────────────────────────────
  function stageSubmission(code) {
    const problemCode = getProblemCode();
    const language = getLanguageFromPage();

    // Stage the submission data in chrome.storage.local
    const submissionData = {
      problemCode,
      language,
      code,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      log('Extension context invalidated - cannot stage submission');
      return;
    }

    chrome.storage.local.set({ pendingSubmission: submissionData }, () => {
      if (chrome.runtime.lastError) {
        log('Storage error:', chrome.runtime.lastError.message);
        return;
      }
      log('Submission staged:', problemCode, '|', language, '|', code.length, 'chars');
    });

    // Reset processing flag
    alreadyProcessed = false;

    // Start watching for verdict if not already watching
    if (!isWatching) {
      startVerdictWatcher();
    }
  }

  // ─── Watch for "Correct Answer" Verdict ─────────────────────────────────
  function startVerdictWatcher() {
    if (isWatching) return;
    
    isWatching = true;
    log('Watching for verdict...');

    // Disconnect previous observer if exists
    if (observer) {
      observer.disconnect();
    }

    // Create new observer watching document.body (reliable, always exists)
    observer = new MutationObserver(() => {
      checkForAcceptedVerdict();
    });

    // Observe document.body with subtree monitoring
    // This fixes the MutationObserver crash by using a stable node
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } else {
      // If body not ready, wait for it
      const bodyObserver = new MutationObserver(() => {
        if (document.body) {
          bodyObserver.disconnect();
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
    }

    // Also do periodic checks (in case mutation observer misses something)
    const checkInterval = setInterval(() => {
      checkForAcceptedVerdict();
    }, 1000);

    // Stop checking after 2 minutes (verdict should appear by then)
    setTimeout(() => {
      clearInterval(checkInterval);
      if (observer) observer.disconnect();
      isWatching = false;
      log('Verdict watch timeout - stopping observer');
    }, 120000);
  }

  // ─── Check for Accepted Verdict ─────────────────────────────────────────
  function checkForAcceptedVerdict() {
    if (alreadyProcessed) return;

    let isAccepted = false;

    // Strategy 1: Element scan for accepted indicators
    const elements = document.querySelectorAll(
      'div, span, p, td, h1, h2, h3, h4, section, article, [class*="verdict"], [class*="result"]'
    );

    for (const el of elements) {
      // Skip elements with too many children (likely containers)
      if (el.children.length > 8) continue;

      const text = (el.textContent || '').trim().toLowerCase();
      const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
      
      // Check for accepted patterns
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

      // Check for green checkmark or success icon
      const hasSuccessIcon = el.querySelector('[class*="check"]') ||
                            el.querySelector('[class*="success"]') ||
                            el.querySelector('svg[class*="check"]');

      if (textMatches || (classMatches && (text.includes('correct') || hasSuccessIcon))) {
        isAccepted = true;
        log('Found AC verdict in element:', el.tagName, className.substring(0, 50));
        break;
      }
    }

    // Strategy 2: Body text scan (fallback)
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

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      log('Extension context invalidated - cannot process verdict');
      return;
    }

    // Mark as processed immediately to prevent double-processing
    alreadyProcessed = true;
    
    log('Correct Answer detected! Processing submission...');

    // Retrieve staged submission data
    chrome.storage.local.get(['pendingSubmission'], (data) => {
      if (chrome.runtime.lastError) {
        log('Storage error:', chrome.runtime.lastError.message);
        alreadyProcessed = false;
        return;
      }

      if (!data.pendingSubmission) {
        log('No pending submission found in storage');
        return;
      }

      const submission = data.pendingSubmission;
      log('Sending to background:', submission.problemCode, '|', submission.code.length, 'chars');

      // Send to background script for GitHub push
      chrome.runtime.sendMessage({
        type: 'ACCEPTED_SOLUTION',
        payload: submission
      }, (response) => {
        if (chrome.runtime.lastError) {
          log('Message error:', chrome.runtime.lastError.message);
          alreadyProcessed = false;
          return;
        }

        if (response?.success) {
          log('Successfully pushed to GitHub!', response.result?.filePath);
          
          // Clear pending submission
          chrome.storage.local.remove(['pendingSubmission'], () => {
            if (chrome.runtime.lastError) {
              log('Storage clear error:', chrome.runtime.lastError.message);
            }
          });
          
          // Stop watching
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

  // ─── Initialization ─────────────────────────────────────────────────────
  function init() {
    log('Content script initialized on:', window.location.pathname);
    
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupSubmitListener);
    } else {
      // Give extra time for React/Monaco to initialize
      setTimeout(() => {
        setupSubmitListener();
      }, 1000); // Wait 1 second after page load
    }

    // Clear any stale pending submissions on page load
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/problems/') && !currentPath.includes('/submit')) {
      if (chrome.runtime?.id) {
        chrome.storage.local.remove(['pendingSubmission'], () => {
          if (chrome.runtime.lastError) {
            log('Storage clear error:', chrome.runtime.lastError.message);
          }
        });
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
      
      // Re-initialize on problem pages
      if (location.pathname.includes('/problems/')) {
        init();
      }
    }
  });

  urlObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // ─── Start ──────────────────────────────────────────────────────────────
  init();

})();
