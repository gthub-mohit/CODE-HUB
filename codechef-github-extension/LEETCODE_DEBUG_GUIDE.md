# LeetCode Debugging Guide

## 🐛 Issue: Submissions Not Pushing to GitHub

If LeetCode submissions aren't being pushed, follow these debugging steps:

---

## ✅ Step 1: Check Console Logs

### Open DevTools Console
1. Go to any LeetCode problem (e.g., `leetcode.com/problems/two-sum/`)
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for orange logs starting with `[CodeHub:LeetCode]`

### Expected Logs on Page Load

You should see:
```
[CodeHub:Router] Detected platform: leetcode
[CodeHub:Router] Loading platform module: platforms/leetcode.js
═══════════════════════════════════════════════
[CodeHub:LeetCode] LeetCode module initialized
[CodeHub:LeetCode] Current URL: https://leetcode.com/problems/two-sum/
═══════════════════════════════════════════════
[CodeHub:LeetCode] On problem page - ready to capture submissions
[CodeHub:LeetCode] ✓ Fetch interceptor installed
```

**If you DON'T see these logs:**
- ❌ Extension not loaded properly
- **Fix:** Reload extension at `chrome://extensions/`

---

## ✅ Step 2: Submit a Problem

### What to Watch For

After clicking "Submit", you should see:

```
[CodeHub:LeetCode] GraphQL request detected: {operationName: "...", ...}
[CodeHub:LeetCode] ✓ Submission detected via GraphQL!
[CodeHub:LeetCode] Operation name: submitCode
[CodeHub:LeetCode] Captured submission details: {
  slug: "two-sum",
  language: "python3",
  codeLength: 245,
  hasCode: true
}
[CodeHub:LeetCode] ✓ Submission staged successfully
[CodeHub:LeetCode] ✓ Starting verdict polling...
```

### Problem A: No GraphQL Request Detected

**Symptoms:**
```
❌ No logs after clicking Submit
```

**Possible Causes:**
1. LeetCode changed their submission API
2. Fetch interceptor installed too late
3. Browser cache issue

**Fixes:**
- Hard refresh page: **Ctrl + Shift + R**
- Clear LeetCode cookies and reload
- Try incognito mode

---

### Problem B: Submission Detected But No Code

**Symptoms:**
```
[CodeHub:LeetCode] ✓ Submission detected via GraphQL!
[CodeHub:LeetCode] ⚠ Warning: No code captured in submission!
[CodeHub:LeetCode] Captured submission details: {codeLength: 0, hasCode: false}
```

**Cause:** Variable name in GraphQL changed

**Fix:** Open Network tab and check what LeetCode sends:
1. Open DevTools → **Network** tab
2. Filter by `/graphql`
3. Submit solution
4. Click the `graphql` request
5. Go to **Payload** tab
6. Look for the submission data structure
7. Take a screenshot and share

---

## ✅ Step 3: Check Verdict Detection

After submission processes, you should see:

```
[CodeHub:LeetCode] Polling... (5/60)
[CodeHub:LeetCode] Found "Accepted" text on page
[CodeHub:LeetCode] Verdict check: {
  hasAcceptedText: true,
  hasStats: true,
  hasSuccessUI: true,
  successElementsCount: 3
}
[CodeHub:LeetCode] ✓ Accepted verdict confirmed!
[CodeHub:LeetCode] Sending to background for GitHub push
[CodeHub:LeetCode] ✓ Successfully pushed to GitHub!
```

### Problem C: Verdict Not Detected

**Symptoms:**
```
[CodeHub:LeetCode] Polling... (5/60)
[CodeHub:LeetCode] Polling... (10/60)
...
[CodeHub:LeetCode] ⏱ Polling timeout - stopping
```

**Cause:** Page doesn't show "Accepted" text or stats

**Debug:**
1. After getting AC, open Console
2. Type: `document.body.innerText.includes('Accepted')`
3. Should return `true`
4. If `false`, LeetCode UI changed

**Temporary Fix:**
Wait for "Accepted" to clearly show on screen, then manually check storage:
```javascript
chrome.storage.local.get(['pendingSubmission'], console.log)
```

If data exists, manually trigger push:
```javascript
chrome.storage.local.get(['pendingSubmission'], (data) => {
  chrome.runtime.sendMessage(data.pendingSubmission, console.log);
});
```

---

## ✅ Step 4: Check GitHub Push

### Expected Background Logs

Switch to **Background Service Worker** logs:
1. Go to `chrome://extensions/`
2. Find "CodeHub"
3. Click **"service worker"** link
4. Check logs:

```
[CodeHub] Processing: LeetCode / two-sum → leetcode-solutions / 2026-08/two-sum.py
[CodeHub] Success: leetcode-solutions / 2026-08/two-sum.py
```

### Problem D: Background Error

**Symptoms:**
```
[CodeHub] Error: LeetCode repository not configured
```

**Fix:**
1. Open extension popup
2. Settings tab
3. Verify **LeetCode Repository** field is filled
4. Click "Save All Configurations"
5. Wait for success message

---

## ✅ Step 5: Verify on GitHub

Check your `leetcode-solutions` repository:

**Expected Structure:**
```
leetcode-solutions/
└── 2026-08/
    ├── two-sum.py
    └── README.md
```

**If file missing:**
- Check GitHub API errors in background console
- Verify token has `repo` scope
- Check rate limits: https://github.com/settings/tokens

---

## 🔧 Quick Diagnostic Script

Paste this in LeetCode console to check everything:

```javascript
// CodeHub LeetCode Diagnostic
console.log('=== CodeHub Diagnostic ===');

// Check if module loaded
console.log('1. Module loaded:', 
  document.documentElement.innerHTML.includes('[CodeHub:LeetCode]') ? '✓' : '❌');

// Check extension context
console.log('2. Extension active:', chrome.runtime?.id ? '✓' : '❌');

// Check storage
chrome.storage.local.get(['pendingSubmission', 'repoLeetCode'], (data) => {
  console.log('3. LeetCode repo configured:', data.repoLeetCode ? '✓' : '❌', data.repoLeetCode);
  console.log('4. Pending submission:', data.pendingSubmission ? '✓ (staged)' : '❌ (none)');
  if (data.pendingSubmission) {
    console.log('   Problem:', data.pendingSubmission.payload.problemCode);
    console.log('   Code length:', data.pendingSubmission.payload.code.length);
  }
});

// Check page content
console.log('5. "Accepted" text on page:', 
  document.body.innerText.includes('Accepted') ? '✓' : '❌');

console.log('6. Current URL:', window.location.href);
console.log('=== End Diagnostic ===');
```

---

## 🚨 Common Issues & Fixes

### Issue 1: "GraphQL request detected" but never "Submission detected"

**Cause:** Operation name doesn't match our patterns

**Fix:** Check Network tab GraphQL request → Share `operationName` field

---

### Issue 2: Polling starts but never finds verdict

**Cause:** LeetCode UI changed

**Quick Test:**
After AC verdict shows, run:
```javascript
const text = document.body.innerText;
console.log('Has Accepted:', text.includes('Accepted'));
console.log('Has Runtime:', text.includes('Runtime'));
console.log('Has Memory:', text.includes('Memory'));
```

All should be `true`

---

### Issue 3: "Successfully pushed to GitHub!" but no file

**Causes:**
1. Wrong repo name (typo)
2. Token expired
3. GitHub API error

**Check:**
```javascript
chrome.storage.local.get(['repoLeetCode', 'githubUsername'], console.log)
```

Then manually check: `https://github.com/{username}/{repo}`

---

## 📸 What to Share if Stuck

1. **Console logs** (from problem page load → after submit)
2. **Network tab** screenshot of `/graphql` request
3. **Extension popup** screenshot (Settings tab)
4. **GitHub repo** URL
5. **Background console** logs (service worker)

---

## 🎯 Quick Fix Checklist

Before asking for help, try:

- [ ] Hard refresh LeetCode page (Ctrl + Shift + R)
- [ ] Reload extension at `chrome://extensions/`
- [ ] Check console for `[CodeHub:LeetCode]` logs
- [ ] Verify LeetCode repo configured in popup
- [ ] Check GitHub repo exists
- [ ] Try a simple problem (e.g., "Two Sum")
- [ ] Check if CodeChef still works (to isolate issue)

---

**Updated:** LeetCode module now has:
- ✅ Enhanced GraphQL detection (more patterns)
- ✅ Better logging with emojis
- ✅ More lenient verdict detection
- ✅ Detailed diagnostic messages

**Reload extension and try again!** 🚀
