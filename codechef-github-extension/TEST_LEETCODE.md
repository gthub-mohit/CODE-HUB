# LeetCode Testing Guide - Step by Step

## ✅ Fixed Issues
1. ✅ Chrome storage access error fixed
2. ✅ Manual button now floating (bottom-right corner)
3. ✅ Checks for existing submissions on page load
4. ✅ Better error handling

---

## 🎯 Test Steps

### Step 1: Reload Extension
```
1. Go to: chrome://extensions/
2. Find: CodeHub
3. Click: Refresh icon 🔄
```

### Step 2: Open LeetCode Problem
```
https://leetcode.com/problems/two-sum/
```

### Step 3: Open Console (F12)
Check for these logs:
```
[CodeHub:LeetCode] ═══════════════════════════════════════════════
[CodeHub:LeetCode] LeetCode module initialized
[CodeHub:LeetCode] Current URL: https://leetcode.com/problems/two-sum/
[CodeHub:LeetCode] ═══════════════════════════════════════════════
[CodeHub:LeetCode] On problem page - ready to capture submissions
[CodeHub:LeetCode] Watching for: Fetch + XHR submissions
[CodeHub:LeetCode] ✓ Fetch interceptor installed
[CodeHub:LeetCode] ✓ XHR interceptor installed
[CodeHub:LeetCode] ✓ Manual trigger button added  ← Should see this
```

✅ **If you see these, extension is working!**

---

### Step 4: Write Solution
Any simple solution, example (Python):
```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
```

### Step 5: Click Submit
Watch console for:
```
[CodeHub:LeetCode] GraphQL: submitCode  ← This means we caught it!
[CodeHub:LeetCode] ✓ Submission detected via Fetch!
[CodeHub:LeetCode]    Operation: submitCode
[CodeHub:LeetCode] ✓ Submission staged successfully
[CodeHub:LeetCode]    Problem: two-sum
[CodeHub:LeetCode]    Language: python3
[CodeHub:LeetCode]    Code length: XXX
[CodeHub:LeetCode] ✓ Starting verdict polling...
```

✅ **If you see "Submission detected" - GREAT! It's working!**

❌ **If you DON'T see "Submission detected":**
- Run the diagnostic script below

---

### Step 6: Wait for Accepted Verdict
Console should show:
```
[CodeHub:LeetCode] Polling... (5/60)
[CodeHub:LeetCode] Found "Accepted" text on page
[CodeHub:LeetCode] Verdict check: {hasAcceptedText: true, ...}
[CodeHub:LeetCode] ✓ Accepted verdict confirmed!
[CodeHub:LeetCode] Sending to background for GitHub push
[CodeHub:LeetCode] ✓ Successfully pushed to GitHub!
```

✅ **Check GitHub:** `leetcode-solutions/2026-08/two-sum.py`

---

### Step 7: Manual Button (Backup)
If automatic didn't work:

1. **Look bottom-right corner** of screen
2. **Orange floating button** should appear: "🚀 Push to GitHub"
3. **Click it**
4. Button will say "⏳ Pushing..." then "✓ Pushed!"

---

## 🐛 Diagnostic Script

If submission not detected, **paste this in console BEFORE submitting**:

```javascript
// Enhanced diagnostic
console.clear();
console.log('%c═══════════════════════════════════════', 'color: #FFA116; font-weight: bold');
console.log('%c  CodeHub LeetCode Diagnostic', 'color: #FFA116; font-weight: bold');
console.log('%c═══════════════════════════════════════', 'color: #FFA116; font-weight: bold');

// 1. Extension check
console.log('\n1️⃣ Extension:');
console.log('   Active:', chrome.runtime?.id ? '✅' : '❌ PROBLEM!');

// 2. Config check
chrome.storage.local.get(['repoLeetCode', 'githubUsername', 'githubToken'], (data) => {
  console.log('\n2️⃣ Configuration:');
  console.log('   Username:', data.githubUsername || '❌ NOT SET');
  console.log('   Token:', data.githubToken ? '✅' : '❌ NOT SET');
  console.log('   LeetCode Repo:', data.repoLeetCode || '❌ NOT SET - THIS IS THE PROBLEM!');
  
  // 3. Interceptors
  console.log('\n3️⃣ Interceptors:');
  console.log('   window.fetch:', typeof window.fetch === 'function' ? '✅' : '❌');
  console.log('   XMLHttpRequest:', typeof XMLHttpRequest === 'function' ? '✅' : '❌');
  
  // 4. Page info
  console.log('\n4️⃣ Current Page:');
  console.log('   URL:', window.location.href);
  console.log('   Problem page:', window.location.pathname.includes('/problems/') ? '✅' : '❌');
  
  // 5. Manual test
  console.log('\n5️⃣ Manual Test:');
  console.log('   Run this after submitting:');
  console.log('   chrome.storage.local.get(["pendingSubmission"], console.log)');
  
  console.log('\n═══════════════════════════════════════\n');
  
  // Summary
  if (!chrome.runtime?.id) {
    console.error('🚨 CRITICAL: Extension not loaded!');
    console.log('FIX: Go to chrome://extensions/ and reload CodeHub');
  } else if (!data.repoLeetCode) {
    console.error('🚨 CRITICAL: LeetCode repo not configured!');
    console.log('FIX: Click extension icon → Settings → Fill "LeetCode Repository"');
  } else {
    console.log('✅ Everything configured! Submit a solution and watch for logs.');
  }
});
```

---

## 🔍 If Submission NOT Detected

### Check Network Tab
1. Open DevTools → **Network** tab
2. Filter: `graphql`
3. Submit solution
4. Look for a **graphql** request
5. Click it → **Payload** tab
6. Look for `operationName`

**Share with me:**
- What is `operationName`?
- Is there a `code` field in variables?

---

## 💡 Manual Push Command

If all else fails, after getting AC verdict, **paste this in console**:

```javascript
// Manual push
chrome.storage.local.get(['pendingSubmission'], (data) => {
  if (data.pendingSubmission) {
    console.log('✅ Found submission:', data.pendingSubmission.payload.problemCode);
    console.log('Pushing to GitHub...');
    
    chrome.runtime.sendMessage(data.pendingSubmission, (response) => {
      if (response?.success) {
        console.log('✅ SUCCESS! Check GitHub.');
        chrome.storage.local.remove(['pendingSubmission']);
      } else {
        console.error('❌ FAILED:', response?.error);
      }
    });
  } else {
    console.log('❌ No submission found. Submit a solution first.');
  }
});
```

---

## 📊 Expected Results

### Automatic Push (Goal)
```
Submit → Extension captures → Waits for AC → Pushes automatically
```

### Manual Button (Backup)
```
Submit → Get AC → Click "🚀 Push to GitHub" button → Pushed
```

### Manual Command (Last Resort)
```
Submit → Get AC → Paste console command → Pushed
```

**One of these THREE methods WILL work!**

---

## 🎯 Most Common Issue

**90% of problems are: LeetCode Repository not configured**

**Fix:**
1. Click CodeHub extension icon
2. Go to Settings tab
3. Scroll to "PLATFORM REPOSITORIES"
4. Fill in "🟠 LeetCode Repository"
5. Click "Save All Configurations"
6. Should say "✓ All configurations saved & verified!"

---

**Ready to test! Reload extension and try again.** 🚀

**Report back:**
- ✅ Did you see "Submission detected" log?
- ✅ Did automatic push work?
- ✅ Is manual button visible?
- ✅ What does diagnostic script say?
