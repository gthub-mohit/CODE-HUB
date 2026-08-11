// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - LeetCode Platform Module
// ═══════════════════════════════════════════════════════════════════════════
// Handles LeetCode-specific submission detection and code extraction
// Uses GraphQL interception + submission page detection + DOM scraping
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Logging Utility ────────────────────────────────────────────────────
  function log(...args) {
    console.log('%c[CodeHub:LeetCode]', 'color: #FFA116; font-weight: bold;', ...args);
  }

  // ─── State Management ───────────────────────────────────────────────────
  let isWatching = false;
  let pollInterval = null;
  let alreadyProcessed = false;
  let pendingSubmissionCode = null;
  let pendingSubmissionLang = null;
  let pendingSubmissionSlug = null;

  // ─── Extract Problem Slug from URL ──────────────────────────────────────
  function getProblemSlug() {
    const match = window.location.pathname.match(/\/problems\/([^\/]+)/);
    if (match) {
      return match[1];
    }
    return 'unknown-problem';
  }

  // ─── Check if we're on a submission result page ─────────────────────────
  function isSubmissionResultPage() {
    // URL pattern: /problems/slug/submissions/1234567890/
    return /\/problems\/[^\/]+\/submissions\/\d+/.test(window.location.pathname);
  }

  // ─── Extract submission ID from URL ─────────────────────────────────────
  function getSubmissionIdFromUrl() {
    const match = window.location.pathname.match(/\/submissions\/(\d+)/);
    return match ? match[1] : null;
  }

  // ─── Map LeetCode language slug to readable name ────────────────────────
  function normalizeLang(lang) {
    if (!lang) return 'cpp';
    const l = lang.toLowerCase();
    // LeetCode uses slugs like "cpp", "python3", "java", "javascript", etc.
    if (l.includes('cpp') || l.includes('c++')) return 'C++';
    if (l.includes('python3') || l.includes('python')) return 'Python';
    if (l.includes('java') && !l.includes('javascript')) return 'Java';
    if (l.includes('javascript') || l === 'js') return 'JavaScript';
    if (l.includes('typescript')) return 'TypeScript';
    if (l.includes('csharp') || l.includes('c#')) return 'C#';
    if (l.includes('golang') || l === 'go') return 'Go';
    if (l.includes('rust')) return 'Rust';
    if (l.includes('kotlin')) return 'Kotlin';
    if (l.includes('swift')) return 'Swift';
    if (l.includes('ruby')) return 'Ruby';
    if (l === 'c') return 'C';
    return lang;
  }

  // ─── Setup must happen in IIFE to run before page scripts ─────────────
  (function installInterceptorsImmediately() {
    const originalFetch = window.fetch;
    // Store original fetch globally so our direct API calls can bypass the interceptor
    window.__codehub_originalFetch = originalFetch;

    window.fetch = async function(...args) {
      const [url, options] = args;

      if (url && url.includes('/graphql') && options && options.method === 'POST') {
        try {
          const body = options.body;
          let parsedBody;

          if (typeof body === 'string') {
            parsedBody = JSON.parse(body);
          } else {
            parsedBody = body;
          }

          const operationName = parsedBody.operationName || '';

          // Log ALL GraphQL operations for debugging
          if (operationName) {
            log('📡 GraphQL operation:', operationName);
          }

          // ── Intercept submit call (captures code BEFORE submission) ──
          if (operationName && operationName.toLowerCase().includes('submit')) {
            log('🎯 SUBMISSION CAPTURED via Fetch!', operationName);

            const variables = parsedBody.variables || {};
            const code = variables.code || variables.typedCode || '';
            const lang = variables.lang || variables.language || 'cpp';
            const slug = variables.questionSlug || variables.slug || getProblemSlug();

            if (code && code.length > 0) {
              log('✓ Code captured:', code.length, 'bytes');
              log('✓ Problem:', slug);
              log('✓ Language:', lang);

              // Store for later when verdict is confirmed
              pendingSubmissionCode = code;
              pendingSubmissionLang = lang;
              pendingSubmissionSlug = slug;

              // Also notify content script to stage it
              window.postMessage({
                type: 'CODEHUB_SUBMISSION_DETECTED',
                payload: {
                  platform: 'LeetCode',
                  problemCode: slug,
                  language: normalizeLang(lang),
                  code: code,
                  url: window.location.href,
                  timestamp: new Date().toISOString()
                }
              }, '*');

              // Start polling for verdict
              startVerdictPolling();
            }
          }
        } catch (e) {
          // Ignore parse errors
        }

        // ── Intercept the RESPONSE for submission detail queries ──
        // This catches the response when LeetCode fetches submission details
        try {
          const body = options.body;
          let parsedBody;
          if (typeof body === 'string') {
            parsedBody = JSON.parse(body);
          } else {
            parsedBody = body;
          }
          const operationName = parsedBody.operationName || '';

          if (operationName &&
              (operationName.toLowerCase().includes('submissiondetail') ||
               operationName.toLowerCase().includes('submissiondata') ||
               operationName === 'submissionDetails')) {
            log('📡 Intercepting submission detail response for:', operationName);

            // Clone the response so we can read it
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();

            // Process asynchronously
            clonedResponse.json().then(data => {
              try {
                const submission = data?.data?.submissionDetails ||
                                   data?.data?.submissionDetail ||
                                   data?.data?.submission || null;

                if (submission) {
                  // Extract language - handle both string and object formats
                  let langValue = submission.lang || submission.language || 'cpp';
                  if (typeof langValue === 'object') {
                    langValue = langValue.verboseName || langValue.name || 'cpp';
                  }

                  log('📦 Got submission details from GraphQL response');
                  log('   Status:', submission.statusDisplay || submission.status);
                  log('   Lang:', langValue);

                  const isAccepted =
                    submission.statusDisplay === 'Accepted' ||
                    submission.status === 'Accepted' ||
                    submission.status === 10; // LeetCode uses 10 for Accepted

                  if (isAccepted && submission.code) {
                    log('✅ Accepted submission found via GraphQL response!');
                    handleAcceptedSubmission(
                      submission.code,
                      langValue,
                      getProblemSlug()
                    );
                  }
                }
              } catch (e) {
                log('Error parsing submission details:', e.message);
              }
            }).catch(() => {});

            return response;
          }
        } catch (e) {
          // Ignore
        }
      }

      return originalFetch.apply(this, args);
    };

    log('🚀 Early interceptors installed (IIFE)');
  })();

  // ─── Handle a confirmed accepted submission ─────────────────────────────
  function handleAcceptedSubmission(code, lang, slug) {
    if (alreadyProcessed) {
      log('Already processed this submission, skipping');
      return;
    }
    alreadyProcessed = true;
    stopPolling();

    log('🚀 Sending accepted submission to content script');
    log('   Problem:', slug);
    log('   Language:', normalizeLang(lang));
    log('   Code length:', code.length, 'bytes');

    // Use combined message - stages and pushes in one atomic operation
    // This is the most reliable path, avoiding timing issues
    window.postMessage({
      type: 'CODEHUB_ACCEPTED_SOLUTION',
      payload: {
        platform: 'LeetCode',
        problemCode: slug,
        language: normalizeLang(lang),
        code: code,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }, '*');

    log('✅ Sent combined accepted solution message to content script');
  }

  // ─── Start Polling for Verdict (DOM-based) ──────────────────────────────
  function startVerdictPolling() {
    if (isWatching) {
      log('Already watching for verdict');
      return;
    }

    isWatching = true;
    let pollCount = 0;
    log('✓ Starting verdict polling...');

    const maxPolls = 60;

    pollInterval = setInterval(() => {
      pollCount++;

      if (pollCount > maxPolls) {
        log('⏱ Polling timeout - stopping');
        stopPolling();
        return;
      }

      if (pollCount % 5 === 0) {
        log(`Polling... (${pollCount}/${maxPolls})`);
      }

      checkVerdictOnPage();
    }, 1000);
  }

  // ─── Stop Polling ───────────────────────────────────────────────────────
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isWatching = false;
  }

  // ─── Check for Accepted Verdict on Page ─────────────────────────────────
  function checkVerdictOnPage() {
    if (alreadyProcessed) return;

    const bodyText = document.body.innerText || '';

    // Look for "Accepted" text
    const hasAcceptedText =
      /\baccepted\b/i.test(bodyText) ||
      bodyText.includes('Your submission has been accepted');

    if (!hasAcceptedText) return;

    log('Found "Accepted" text on page');

    // Additional confirmation: runtime/memory stats or success UI
    const hasStats =
      /runtime/i.test(bodyText) ||
      /memory/i.test(bodyText) ||
      /faster than/i.test(bodyText) ||
      /less than/i.test(bodyText) ||
      /beats/i.test(bodyText);

    const successElements = document.querySelectorAll(
      '[class*="success"], [class*="accepted"], [class*="Success"], [class*="Accepted"], ' +
      '[data-e2e-locator*="success"], [id*="success"], svg[class*="check"]'
    );
    const hasSuccessUI = successElements.length > 0;

    if (hasAcceptedText && (hasStats || hasSuccessUI)) {
      log('✓ Accepted verdict confirmed via DOM polling!');

      // If we have pending code from the interceptor, use it
      if (pendingSubmissionCode) {
        handleAcceptedSubmission(
          pendingSubmissionCode,
          pendingSubmissionLang || 'cpp',
          pendingSubmissionSlug || getProblemSlug()
        );
      } else {
        // Try to scrape code from the page
        const scrapedCode = scrapeCodeFromPage();
        const scrapedLang = scrapeLanguageFromPage();
        if (scrapedCode) {
          handleAcceptedSubmission(scrapedCode, scrapedLang, getProblemSlug());
        } else {
          log('⚠ Could not find code to push');
        }
      }
    }
  }

  // ─── Scrape code from the submission result page ────────────────────────
  function scrapeCodeFromPage() {
    log('Attempting to scrape code from page DOM...');

    // Strategy 1: Monaco editor (LeetCode uses Monaco)
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models && models.length > 0) {
        for (const model of models) {
          const code = model.getValue();
          if (code && code.trim().length > 10) {
            log('✓ Code scraped via Monaco API:', code.length, 'chars');
            return code;
          }
        }
      }
    }

    // Strategy 2: Monaco DOM - view-lines
    const viewLines = document.querySelectorAll('.view-line');
    if (viewLines.length > 0) {
      const code = Array.from(viewLines)
        .map(line => line.textContent || '')
        .join('\n');
      if (code && code.trim().length > 10) {
        log('✓ Code scraped via Monaco DOM (.view-line):', code.length, 'chars');
        return code;
      }
    }

    // Strategy 3: Code element on submission detail page
    // LeetCode submission pages often show code in a <code> or <pre> block
    const codeBlocks = document.querySelectorAll('pre code, code[class*="language-"], div[class*="code-area"] code');
    for (const block of codeBlocks) {
      const code = block.textContent;
      if (code && code.trim().length > 10) {
        log('✓ Code scraped via <code> block:', code.length, 'chars');
        return code;
      }
    }

    // Strategy 4: Any <pre> with substantial code
    const preBlocks = document.querySelectorAll('pre');
    for (const pre of preBlocks) {
      const code = pre.textContent;
      if (code && code.trim().length > 30 &&
          (code.includes('{') || code.includes('def ') || code.includes('class '))) {
        log('✓ Code scraped via <pre> block:', code.length, 'chars');
        return code;
      }
    }

    log('⚠ Could not scrape code from page');
    return null;
  }

  // ─── Scrape language from the page ──────────────────────────────────────
  function scrapeLanguageFromPage() {
    // Look for language indicators on the page
    const langSelectors = [
      '[class*="lang"]', '[class*="language"]',
      'button[class*="lang"]', 'div[class*="lang"]'
    ];

    for (const selector of langSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.textContent.trim();
        if (/^(C\+\+|Python|Java|JavaScript|TypeScript|C#|Go|Rust|Ruby|Kotlin|Swift|C)\s*\d*$/i.test(text)) {
          return text;
        }
      }
    }

    // Check the page body for language mentions near "Language:" label
    const bodyText = document.body.innerText || '';
    const langMatch = bodyText.match(/(?:Language|Lang)[:\s]*(C\+\+|Python3?|Java|JavaScript|TypeScript|C#|Go|Rust|Ruby|Kotlin|Swift)/i);
    if (langMatch) return langMatch[1];

    return 'cpp';
  }

  // ─── Handle submission result page (arrived via navigation) ─────────────
  function handleSubmissionResultPage() {
    const submissionId = getSubmissionIdFromUrl();
    const slug = getProblemSlug();

    log('📋 On submission result page');
    log('   Submission ID:', submissionId);
    log('   Problem slug:', slug);

    if (!submissionId) {
      log('⚠ No submission ID in URL, falling back to DOM polling');
      startVerdictPolling();
      return;
    }

    // PRIMARY APPROACH: Fetch submission details directly via LeetCode's GraphQL API
    // This is the most reliable method since we have the submission ID from the URL
    // We poll the API because the submission might still be judging
    let apiPollCount = 0;
    const maxApiPolls = 30;

    const apiPoller = setInterval(() => {
      apiPollCount++;

      if (alreadyProcessed) {
        clearInterval(apiPoller);
        return;
      }

      if (apiPollCount > maxApiPolls) {
        log('⏱ API polling timeout after', maxApiPolls, 'seconds');
        clearInterval(apiPoller);
        // Last resort: try DOM scraping
        tryDomScraping(slug);
        return;
      }

      if (apiPollCount % 3 === 0) {
        log(`API polling... (${apiPollCount}/${maxApiPolls})`);
      }

      fetchSubmissionDetails(submissionId, slug, () => {
        clearInterval(apiPoller);
      });
    }, 1500);
  }

  // ─── Try DOM scraping as fallback ───────────────────────────────────────
  function tryDomScraping(slug) {
    log('Trying DOM scraping as fallback...');

    const bodyText = document.body.innerText || '';
    const hasAccepted = /\baccepted\b/i.test(bodyText);

    if (!hasAccepted) {
      log('⚠ Page does not show Accepted verdict');
      return;
    }

    if (pendingSubmissionCode) {
      handleAcceptedSubmission(pendingSubmissionCode, pendingSubmissionLang || 'cpp', slug);
      return;
    }

    const code = scrapeCodeFromPage();
    const lang = scrapeLanguageFromPage();
    if (code) {
      handleAcceptedSubmission(code, lang, slug);
    } else {
      log('⚠ Could not extract code from page');
    }
  }

  // ─── Get CSRF token from cookies ────────────────────────────────────────
  function getCsrfToken() {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  }

  // ─── Fetch submission details via LeetCode GraphQL API ──────────────────
  function fetchSubmissionDetails(submissionId, slug, onSuccess) {
    if (!submissionId) {
      log('⚠ No submission ID to fetch');
      return;
    }

    if (alreadyProcessed) return;

    const csrfToken = getCsrfToken();
    log('📡 Fetching submission details for ID:', submissionId, csrfToken ? '(with CSRF)' : '(no CSRF token found)');

    const query = `
      query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          runtime
          runtimeDisplay
          runtimePercentile
          memory
          memoryDisplay
          memoryPercentile
          code
          lang {
            name
            verboseName
          }
          statusDisplay
          timestamp
          question {
            titleSlug
            title
          }
        }
      }
    `;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add CSRF token if available (LeetCode requires this)
    if (csrfToken) {
      headers['x-csrftoken'] = csrfToken;
    }

    // Use the original fetch to avoid our own interceptor re-processing this
    const fetchFn = window.__codehub_originalFetch || window.fetch;

    fetchFn('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        query: query,
        variables: { submissionId: parseInt(submissionId) },
        operationName: 'submissionDetails'
      })
    })
    .then(res => {
      if (!res.ok) {
        log('⚠ API returned status:', res.status);
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;

      const details = data?.data?.submissionDetails;
      if (!details) {
        log('⚠ No submission details in API response, will retry...');
        return; // Keep polling
      }

      log('📦 Got submission details from API');
      log('   Status:', details.statusDisplay);

      // Known final verdicts — stop polling for these
      const finalVerdicts = [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compile Error',
        'Output Limit Exceeded'
      ];

      const isFinal = finalVerdicts.includes(details.statusDisplay);

      // If not a final verdict, keep polling (covers "Internal Error", "Pending", null, empty, etc.)
      if (!isFinal) {
        log('   Status not final yet ("' + details.statusDisplay + '"), will retry...');
        return;
      }

      // Extract language
      let langName = 'cpp';
      if (details.lang) {
        langName = details.lang.verboseName || details.lang.name || 'cpp';
      }
      log('   Language:', langName);
      log('   Code length:', details.code?.length || 0);

      if (details.statusDisplay === 'Accepted' && details.code) {
        const titleSlug = details.question?.titleSlug || slug;
        log('✅ Accepted! Pushing to GitHub...');
        handleAcceptedSubmission(details.code, langName, titleSlug);
        if (onSuccess) onSuccess();
      } else {
        log('   Verdict:', details.statusDisplay, '- not Accepted, skipping');
        if (onSuccess) onSuccess(); // Stop polling for final non-accepted verdicts
      }
    })
    .catch(err => {
      log('⚠ API call failed:', err.message);
    });
  }

  // ─── Initialize ─────────────────────────────────────────────────────────
  function init() {
    log('═══════════════════════════════════════════════');
    log('LeetCode module initialized');
    log('Current URL:', window.location.href);
    log('═══════════════════════════════════════════════');
    log('✓ Interceptors ready (installed in IIFE)');
    log('✓ Watching for GraphQL submissions...');

    // Reset state on init
    alreadyProcessed = false;

    // KEY FIX: If we're on a submission result page, handle it directly
    if (isSubmissionResultPage()) {
      log('📋 Detected submission result page URL!');
      handleSubmissionResultPage();
    }
  }

  // ─── SPA Navigation Handler ─────────────────────────────────────────────
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      stopPolling();
      alreadyProcessed = false;

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
