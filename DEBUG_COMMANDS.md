# 🔍 Debug Commands for CodeChef

## Run These in Browser Console (F12)

### 1. Check What Editors Are On The Page

```javascript
console.log('=== EDITOR DEBUG ===');

// Check Monaco
console.log('Monaco available:', !!window.monaco);
if (window.monaco && window.monaco.editor) {
  console.log('Monaco models:', window.monaco.editor.getModels().length);
  console.log('Monaco editors:', window.monaco.editor.getEditors ? window.monaco.editor.getEditors().length : 'N/A');
}

// Check ACE
console.log('ACE available:', !!window.ace);
const aceElements = document.querySelectorAll('.ace_editor, [class*="ace_editor"]');
console.log('ACE elements:', aceElements.length);

// Check Monaco DOM
const monacoElements = document.querySelectorAll('.monaco-editor');
console.log('Monaco DOM elements:', monacoElements.length);

// Check CodeMirror
const cmElements = document.querySelectorAll('.CodeMirror');
console.log('CodeMirror elements:', cmElements.length);

// Check textareas
const textareas = document.querySelectorAll('textarea');
console.log('Textareas:', textareas.length);
textareas.forEach((ta, i) => {
  console.log(`  Textarea ${i}:`, {
    id: ta.id,
    name: ta.name,
    className: ta.className.substring(0, 50),
    hasValue: ta.value.length > 0,
    valueLength: ta.value.length
  });
});
```

### 2. Try to Get Code Manually

```javascript
// Try Monaco
if (window.monaco && window.monaco.editor) {
  const models = window.monaco.editor.getModels();
  if (models.length > 0) {
    console.log('CODE FROM MONACO:');
    console.log(models[0].getValue());
  }
}

// Try ACE
if (window.ace) {
  const aceEls = document.querySelectorAll('.ace_editor');
  aceEls.forEach((el, i) => {
    try {
      const editor = ace.edit(el);
      console.log(`CODE FROM ACE EDITOR ${i}:`);
      console.log(editor.getValue());
    } catch(e) {
      console.log(`ACE ${i} failed:`, e.message);
    }
  });
}

// Try textareas
const textareas = document.querySelectorAll('textarea');
textareas.forEach((ta, i) => {
  if (ta.value.length > 10) {
    console.log(`CODE FROM TEXTAREA ${i}:`);
    console.log(ta.value);
  }
});
```

### 3. Check DOM Structure

```javascript
// Find all potential code containers
const containers = [
  ...document.querySelectorAll('[class*="editor"]'),
  ...document.querySelectorAll('[class*="code"]'),
  ...document.querySelectorAll('[id*="editor"]'),
  ...document.querySelectorAll('[id*="code"]')
];

console.log('Potential code containers:', containers.length);
containers.forEach((el, i) => {
  console.log(`Container ${i}:`, {
    tag: el.tagName,
    id: el.id,
    className: el.className.substring(0, 100),
    children: el.children.length
  });
});
```

### 4. Find Submit Button

```javascript
const buttons = document.querySelectorAll('button');
buttons.forEach((btn, i) => {
  const text = btn.textContent.trim().toLowerCase();
  if (text.includes('submit')) {
    console.log(`Submit button ${i}:`, {
      text: btn.textContent.trim(),
      className: btn.className,
      id: btn.id
    });
  }
});
```

### 5. Full Page Analysis

```javascript
console.log('=== FULL PAGE ANALYSIS ===');
console.log('URL:', window.location.href);
console.log('Path:', window.location.pathname);
console.log('Document ready state:', document.readyState);

// Check all script editors
console.log('\n--- Editors Available ---');
console.log('Monaco:', !!window.monaco);
console.log('ACE:', !!window.ace);
console.log('CodeMirror:', !!window.CodeMirror);

// Check DOM elements
console.log('\n--- DOM Elements ---');
console.log('.monaco-editor:', document.querySelectorAll('.monaco-editor').length);
console.log('.ace_editor:', document.querySelectorAll('.ace_editor').length);
console.log('.CodeMirror:', document.querySelectorAll('.CodeMirror').length);
console.log('textarea:', document.querySelectorAll('textarea').length);
console.log('[contenteditable]:', document.querySelectorAll('[contenteditable="true"]').length);

// Check for React
console.log('\n--- Framework Detection ---');
console.log('React:', document.querySelector('[data-reactroot]') ? 'Yes' : 'No');

// Check main content area
const main = document.querySelector('main') || document.body;
console.log('\n--- Main Content ---');
console.log('Main element children:', main.children.length);
console.log('Total elements:', document.querySelectorAll('*').length);
```

---

## What to Look For

### If Monaco Available
✅ Should see: `Monaco available: true`  
✅ Should see: `Monaco models: 1` or higher  
✅ Can extract with: `window.monaco.editor.getModels()[0].getValue()`

### If ACE Available
✅ Should see: `ACE available: true`  
✅ Should see: `ACE elements: 1` or higher  
✅ Can extract with: `ace.edit(document.querySelector('.ace_editor')).getValue()`

### If Textareas
✅ Should see: `Textareas: 1` or higher  
✅ Check if one has your code  
✅ Can extract with: `document.querySelector('textarea').value`

---

## Report Back

After running these commands, report:

1. **Which editor is available?** (Monaco/ACE/Textarea/None)
2. **Can you manually get the code?** (Copy the successful command)
3. **What's the page URL?**
4. **Screenshot of the output**

This will help me fix the extraction for your specific CodeChef page!

---

## Quick Test Code Extraction

Paste this complete test function:

```javascript
function testCodeExtraction() {
  console.log('🧪 TESTING CODE EXTRACTION');
  
  // Test 1: Monaco
  try {
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models.length > 0) {
        const code = models[0].getValue();
        console.log('✅ Monaco works! Code length:', code.length);
        console.log('First 100 chars:', code.substring(0, 100));
        return;
      }
    }
  } catch(e) {}
  
  // Test 2: ACE
  try {
    const aceEl = document.querySelector('.ace_editor');
    if (aceEl && window.ace) {
      const editor = ace.edit(aceEl);
      const code = editor.getValue();
      console.log('✅ ACE works! Code length:', code.length);
      console.log('First 100 chars:', code.substring(0, 100));
      return;
    }
  } catch(e) {}
  
  // Test 3: Textarea
  try {
    const textareas = document.querySelectorAll('textarea');
    for (const ta of textareas) {
      if (ta.value.length > 20) {
        console.log('✅ Textarea works! Code length:', ta.value.length);
        console.log('Textarea ID:', ta.id);
        console.log('First 100 chars:', ta.value.substring(0, 100));
        return;
      }
    }
  } catch(e) {}
  
  console.log('❌ No extraction method worked');
}

testCodeExtraction();
```

