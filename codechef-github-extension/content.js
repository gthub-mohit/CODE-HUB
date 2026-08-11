// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - Content Script Router
// ═══════════════════════════════════════════════════════════════════════════
// Platform-agnostic router that loads the appropriate platform module based on
// the current hostname. Each platform module handles its own submission detection,
// code extraction, and verdict monitoring.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Logging Utility ────────────────────────────────────────────────────
  function log(...args) {
    console.log('%c[CodeHub:Router]', 'color: #3B82F6; font-weight: bold;', ...args);
  }

  // ─── Detect Platform from Hostname ─────────────────────────────────────
  function detectPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('codechef.com')) {
      return 'codechef';
    } else if (hostname.includes('leetcode.com')) {
      return 'leetcode';
    } else if (hostname.includes('codeforces.com')) {
      return 'codeforces';
    }
    
    return null;
  }

  // ─── Listen for messages from platform modules (injected scripts) ──────
  window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;
    
    const message = event.data;
    
    // Handle submission detected (staging only - verdict comes later)
    if (message.type === 'CODEHUB_SUBMISSION_DETECTED') {
      log('📨 Submission detected message received from platform module');
      
      const submissionData = {
        type: 'ACCEPTED_SOLUTION',
        payload: message.payload
      };
      
      // Store in chrome.storage
      chrome.storage.local.set({ pendingSubmission: submissionData }, () => {
        if (chrome.runtime.lastError) {
          log('❌ Storage error:', chrome.runtime.lastError.message);
        } else {
          log('✅ Submission staged in storage');
          log('   Platform:', message.payload.platform);
          log('   Problem:', message.payload.problemCode);
          log('   Language:', message.payload.language);
        }
      });
    }
    
    // Handle accepted verdict (uses previously staged submission)
    else if (message.type === 'CODEHUB_VERDICT_ACCEPTED') {
      log('📨 Accepted verdict message received');
      
      chrome.storage.local.get(['pendingSubmission'], (data) => {
        if (chrome.runtime.lastError) {
          log('❌ Storage error:', chrome.runtime.lastError.message);
          return;
        }
        
        if (!data.pendingSubmission) {
          log('⚠ No pending submission found');
          return;
        }
        
        log('✓ Sending to background for GitHub push');
        
        chrome.runtime.sendMessage(data.pendingSubmission, (response) => {
          if (chrome.runtime.lastError) {
            log('❌ Message error:', chrome.runtime.lastError.message);
            return;
          }
          
          if (response?.success) {
            log('✅ Successfully pushed to GitHub!');
            chrome.storage.local.remove(['pendingSubmission']);
          } else {
            log('❌ Push failed:', response?.error);
          }
        });
      });
    }
    
    // Handle combined accepted solution (stages + pushes in one step)
    // This is the most reliable path - used when we have both code and verdict at once
    else if (message.type === 'CODEHUB_ACCEPTED_SOLUTION') {
      log('📨 Combined accepted solution message received');
      log('   Platform:', message.payload.platform);
      log('   Problem:', message.payload.problemCode);
      log('   Language:', message.payload.language);
      log('   Code length:', message.payload.code?.length || 0, 'bytes');
      
      const submissionData = {
        type: 'ACCEPTED_SOLUTION',
        payload: message.payload
      };
      
      log('✓ Sending directly to background for GitHub push');
      
      chrome.runtime.sendMessage(submissionData, (response) => {
        if (chrome.runtime.lastError) {
          log('❌ Message error:', chrome.runtime.lastError.message);
          return;
        }
        
        if (response?.success) {
          log('✅ Successfully pushed to GitHub!');
          chrome.storage.local.remove(['pendingSubmission']);
        } else {
          log('❌ Push failed:', response?.error);
        }
      });
    }
  });

  // ─── Load Platform Module ───────────────────────────────────────────────
  function loadPlatformModule(platform) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(`platforms/${platform}.js`);
    script.onload = () => {
      log(`Platform module loaded: ${platform}`);
    };
    script.onerror = () => {
      log(`Failed to load platform module: ${platform}`);
    };
    
    (document.head || document.documentElement).appendChild(script);
  }

  // ─── Initialize Router ──────────────────────────────────────────────────
  function init() {
    const platform = detectPlatform();
    
    if (!platform) {
      log('No supported platform detected on:', window.location.hostname);
      return;
    }

    log(`Detected platform: ${platform}`);
    log(`Loading platform module: platforms/${platform}.js`);
    log(`✓ Message listener registered for platform communication`);
    
    // Load the appropriate platform module
    loadPlatformModule(platform);
  }

  // ─── Start Router ───────────────────────────────────────────────────────
  init();

})();
