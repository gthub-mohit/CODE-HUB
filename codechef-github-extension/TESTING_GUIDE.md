# CodeHub Extension - Testing Guide

## Quick Test Procedure

### 1. Reload the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Find "CodeHub" extension
3. Click the **reload** button (🔄 icon)
4. Verify it shows version **3.1.1**
5. Check that there are no errors in the extension card

### 2. Test LeetCode (THE FIX)

#### Step 1: Open Console
1. Go to any LeetCode problem: https://leetcode.com/problems/two-sum/
2. Open DevTools (F12) → Console tab
3. Keep console visible during the entire test

#### Step 2: Expected Initial Logs
You should immediately see:
```
[CodeHub:Router] Detected platform: leetcode
[CodeHub:Router] Loading platform module: platforms/leetcode.js
[CodeHub:Router] ✓ Message listener registered for platform communication
[CodeHub:LeetCode] 🚀 Early interceptors installed (IIFE)
[CodeHub:LeetCode] ═══════════════════════════════════════════════
[CodeHub:LeetCode] LeetCode module initialized
[CodeHub:LeetCode] Current URL: https://leetcode.com/problems/two-sum/
[CodeHub:LeetCode] ═══════════════════════════════════════════════
[CodeHub:LeetCode] ✓ Interceptors ready (installed in IIFE)
[CodeHub:LeetCode] ✓ Watching for GraphQL submissions...
```

✅ **If you see these logs** → Interceptors are installed correctly!  
❌ **If you DON'T see these logs** → Extension not loaded, try reloading

#### Step 3: Write and Submit Solution
1. Write any valid solution (doesn't need to be correct initially)
2. Click **Submit** button (NOT "Run Code")
3. Watch the console

#### Step 4: Expected Submission Logs
After clicking Submit, you should see:
```
[CodeHub:LeetCode] 📡 GraphQL operation: submitCode
[CodeHub:LeetCode] 🎯 SUBMISSION CAPTURED via Fetch! submitCode
[CodeHub:LeetCode] ✓ Code captured: 234 bytes
[CodeHub:LeetCode] ✓ Problem: two-sum
[CodeHub:LeetCode] ✓ Language: cpp
[CodeHub:LeetCode] ✓ Starting verdict polling...
[CodeHub:Router] 📨 Submission detected message received from platform module
[CodeHub:Router] ✅ Submission staged in storage
[CodeHub:Router]    Platform: LeetCode
[CodeHub:Router]    Problem: two-sum
[CodeHub:Router]    Language: cpp
[CodeHub:LeetCode] Polling... (5/60)
[CodeHub:LeetCode] Polling... (10/60)
```

✅ **If you see "SUBMISSION CAPTURED"** → Fix is working!  
❌ **If you DON'T see this** → Interceptor not catching the request

#### Step 5: Wait for Accepted Verdict
Once LeetCode shows "Accepted" on screen:
```
[CodeHub:LeetCode] Found "Accepted" text on page
[CodeHub:LeetCode] ✓ Accepted verdict confirmed!
[CodeHub:LeetCode] ✅ Sent accepted verdict notification to content script
[CodeHub:Router] 📨 Accepted verdict message received
[CodeHub:Router] ✓ Sending to background for GitHub push
[CodeHub:Router] ✅ Successfully pushed to GitHub!
```

#### Step 6: Verify on GitHub
1. Go to your LeetCode repository on GitHub
2. Check for new commit
3. Path should be: `YYYY-MM/two-sum.cpp` (or .java, .py, etc.)
4. File should contain your submitted code

### 3. Test CodeChef (Already Working)

1. Go to any CodeChef problem
2. Submit a solution
3. Should still work as before (this fix doesn't affect CodeChef)

---

## Troubleshooting

### ❌ ERROR: "Cannot read properties of undefined (reading 'local')"

**Before Fix**: This error appeared in console  
**After Fix**: Should NOT appear anymore

If you still see this:
1. Make sure you reloaded the extension
2. Hard refresh the LeetCode page (Ctrl+Shift+R)
3. Check that version is 3.1.1 in `chrome://extensions/`

### ❌ No "SUBMISSION CAPTURED" log appears

**Possible causes:**

1. **Interceptors installed too late**
   - Check if you see "🚀 Early interceptors installed (IIFE)"
   - If not, the script didn't load properly

2. **LeetCode uses different operation name**
   - Look in DevTools → Network tab
   - Filter by "graphql"
   - Click Submit
   - Find the GraphQL request
   - Check "operationName" in the request payload
   - Report the exact name so we can add it

3. **Extension not active**
   - Click extension icon
   - Make sure GitHub token and repository are configured

### ❌ Submission captured but not pushed to GitHub

**Possible causes:**

1. **Verdict never detected**
   - Check if you see "Polling..." messages
   - If polling stops before "Accepted verdict confirmed", the verdict detection failed
   - Make sure the submission actually got "Accepted" (not Wrong Answer, etc.)

2. **GitHub credentials not set**
   - Click extension icon
   - Verify token and username are filled
   - Click "Verify Repository" to test connection

3. **Wrong repository name**
   - Extension uses separate repos per platform
   - Make sure "LeetCode Repo Name" is set correctly

---

## What Should Work Now

✅ **LeetCode submissions** → Should be detected and pushed  
✅ **CodeChef submissions** → Should still work (unchanged)  
✅ **Separate repos** → CodeChef → `repoCodeChef`, LeetCode → `repoLeetCode`  
✅ **No Chrome API errors** → Fixed with postMessage architecture  

## What Still Needs Testing

⚠️ **Codeforces** → Not implemented yet (placeholder only)  
⚠️ **Edge cases** → Network errors, invalid tokens, etc.  
⚠️ **Different languages** → Test with Python, Java, JavaScript, etc.  

---

**Last Updated**: 2026-08-12  
**Version**: 3.1.1  
**Status**: Ready for testing
