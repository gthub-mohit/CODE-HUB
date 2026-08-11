# 🔍 CodeHub Debugging Guide

## Common Issues & Solutions

### Issue: "Could not extract code from editor"

This means the extension detected the submit button but couldn't find your code.

#### Quick Fixes

1. **Reload the extension**
   ```
   1. Go to chrome://extensions
   2. Find CodeHub
   3. Click the refresh icon 🔄
   4. Reload the CodeChef page
   ```

2. **Check Console Logs**
   ```
   1. Press F12 to open DevTools
   2. Go to Console tab
   3. Look for [CodeHub] messages
   4. Check what the extraction logs say
   ```

3. **Wait for Editor to Load**
   - Make sure the code editor is fully loaded before submitting
   - Wait 2-3 seconds after page loads
   - Ensure your code is visible in the editor

#### What the Logs Tell You

```javascript
// ✅ Good - Code extracted successfully
[CodeHub] ✅ Code extracted via Monaco API: 234 chars

// ⚠️ Problem - No code found
[CodeHub] ❌ Could not extract code from any source
[CodeHub] Debug info: { monacoAvailable: true, monacoEditorCount: 2, ... }

// 🔄 Retry - Extension trying again
[CodeHub] 🔄 Retrying code extraction...
```

---

## Testing the Extraction

### Method 1: Check Monaco Availability

Open browser console (F12) and run:

```javascript
// Check if Monaco is available
console.log('Monaco available:', !!window.monaco);

// Check editor models
if (window.monaco && window.monaco.editor) {
  const models = window.monaco.editor.getModels();
  console.log('Editor models:', models.length);
  if (models.length > 0) {
    console.log('Code in first model:', models[0].getValue().substring(0, 100));
  }
}

// Check editor instances
if (window.monaco && window.monaco.editor.getEditors) {
  const editors = window.monaco.editor.getEditors();
  console.log('Editor instances:', editors.length);
}
```

### Method 2: Check DOM Elements

```javascript
// Check Monaco editor elements
const monacoEditors = document.querySelectorAll('.monaco-editor');
console.log('Monaco editors found:', monacoEditors.length);

// Check view lines
monacoEditors.forEach((editor, i) => {
  const lines = editor.querySelectorAll('.view-line');
  console.log(`Editor ${i} has ${lines.length} lines`);
});

// Check textareas
const textareas = document.querySelectorAll('textarea');
console.log('Textareas found:', textareas.length);
textareas.forEach((ta, i) => {
  console.log(`Textarea ${i}:`, {
    id: ta.id,
    name: ta.name,
    value: ta.value.substring(0, 50)
  });
});
```

---

## Extraction Strategies Explained

CodeHub tries 6 different methods to get your code:

### Strategy 1: Monaco API ⭐ (Most Reliable)
```javascript
window.monaco.editor.getModels()[0].getValue()
```
- Uses Monaco's official API
- Gets code directly from editor model
- Most reliable when available

### Strategy 2: Monaco Editor Instances
```javascript
window.monaco.editor.getEditors()[0].getValue()
```
- Gets code from editor instances
- Alternative Monaco API method

### Strategy 3: Monaco DOM Parsing
```javascript
document.querySelectorAll('.monaco-editor .view-line')
```
- Extracts code from DOM elements
- Reads visible lines in editor
- Works when API is not accessible

### Strategy 4: CodeMirror (Legacy)
```javascript
document.querySelector('.CodeMirror').CodeMirror.getValue()
```
- For older CodeChef interface
- Fallback for legacy pages

### Strategy 5: Textarea
```javascript
document.querySelector('textarea').value
```
- For simple editor or mobile view
- Filters out input/output fields

### Strategy 6: ContentEditable
```javascript
document.querySelector('[contenteditable="true"]').textContent
```
- Last resort for custom editors

---

## Timing Issues

### Problem: Code Not Loaded Yet

If Monaco editor isn't ready when submit is clicked:

**Solution**: The extension now waits 100ms, then retries after 500ms if failed.

### Problem: React Re-renders

If page re-renders and loses code:

**Solution**: Code is captured immediately on submit click, before React unmounts.

---

## Advanced Debugging

### Enable Detailed Logging

The content script already has detailed logging with `[CodeHub]` prefix.

To see everything:
1. Open DevTools (F12)
2. Go to Console
3. Filter by: `CodeHub`
4. Submit a solution and watch the logs

### Check Storage

See what's staged:
```javascript
chrome.storage.local.get(['pendingSubmission'], (data) => {
  console.log('Pending:', data.pendingSubmission);
});
```

### Check Submit Button Detection

```javascript
// In console, click submit and run:
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn) {
    console.log('Button clicked:', {
      text: btn.textContent,
      class: btn.className,
      id: btn.id
    });
  }
}, true);
```

---

## Common CodeChef Page Variations

### Practice Problems
- URL: `codechef.com/problems/PROBLEMCODE`
- Editor: Monaco with full features
- Submit: "Submit" button

### Contest Problems
- URL: `codechef.com/CONTESTCODE/problems/PROBLEMCODE`
- Editor: Same Monaco editor
- Submit: May have different button styling

### IDE Mode
- URL: `codechef.com/ide`
- Editor: Full IDE interface
- Submit: May not trigger extension (different flow)

---

## What to Do If Still Failing

### Step 1: Check Page Structure
Open DevTools → Elements tab and look for:
- `.monaco-editor` elements
- `.view-line` elements inside monaco
- `textarea` elements

### Step 2: Manually Test Extraction
Copy this into console:
```javascript
// Test Monaco API
if (window.monaco) {
  const models = window.monaco.editor.getModels();
  console.log('Code:', models[0].getValue());
}

// Test DOM
const lines = document.querySelectorAll('.monaco-editor .view-line');
const code = Array.from(lines).map(l => l.textContent).join('\n');
console.log('Code:', code);
```

### Step 3: Report Issue
If extraction still fails, report with:
1. CodeChef page URL
2. Browser version
3. Console logs (screenshot)
4. DOM structure (DevTools → Elements)

---

## Quick Fixes

### 1. Extension Not Loading
```bash
chrome://extensions → Find CodeHub → Click "Reload"
```

### 2. Old Code Captured
```bash
# Clear storage
chrome.storage.local.clear()
# Or via popup: Reconfigure settings
```

### 3. Multiple Submissions
```bash
# The extension prevents duplicates
# Wait for notification before submitting again
```

---

## Understanding the Flow

```
User writes code
      ↓
Code visible in Monaco editor
      ↓
User clicks Submit 🎯
      ↓
[CodeHub detects click]
      ↓
[Wait 100ms for Monaco]
      ↓
[Try extraction Strategy 1-6]
      ↓
Success → Stage in storage ✅
      ↓
Watch for verdict
      ↓
"Correct Answer" detected
      ↓
Push to GitHub 🚀
```

---

## Success Indicators

You'll know it's working when you see:

```
[CodeHub] Content script initialized
[CodeHub] Setting up submit button listener...
[CodeHub] ✅ Submit listener active
[CodeHub] 🎯 Submit button clicked!
[CodeHub] 🔍 Starting code extraction...
[CodeHub] ✅ Code extracted via Monaco API: 234 chars
[CodeHub] 📦 Submission staged: PROBLEMCODE | C++17 | 234 chars
[CodeHub] 👀 Watching for verdict...
```

---

## Still Having Issues?

1. Check [README.md](./README.md) - Troubleshooting section
2. Check [INSTALLATION.md](./INSTALLATION.md)
3. Review console logs carefully
4. Try on a different problem
5. Report issue with details

---

<div align="center">

**Most Common Fix**: Just reload the extension! 🔄

`chrome://extensions` → Find CodeHub → Click refresh icon

</div>
