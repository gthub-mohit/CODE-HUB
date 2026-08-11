# CodeHub v3.0 Testing Checklist

## 🎯 Pre-Testing Setup

### 1. GitHub Repository Setup
- [ ] Create/use existing GitHub repository
- [ ] Generate Personal Access Token with `repo` scope
- [ ] Note down: username, repo name, token

### 2. Extension Installation
- [ ] Open Chrome → `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select extension folder
- [ ] Verify extension icon appears in toolbar

### 3. Configuration
- [ ] Click extension icon
- [ ] Enter GitHub username
- [ ] Enter repository name
- [ ] Paste Personal Access Token
- [ ] Click "Save Configuration"
- [ ] Verify "✓ Configuration saved & verified!" message
- [ ] Status bar should show "Connected" with green indicator

---

## 📝 Test Plan

## Test Group A: CodeChef (Regression Testing)

### Test A1: Basic Submission
**Objective:** Verify existing CodeChef functionality works unchanged

**Steps:**
1. Navigate to `https://www.codechef.com/problems/TEST`
2. Open DevTools Console (F12)
3. Look for log: `[CodeHub:CodeChef] CodeChef module initialized`
4. Write a simple solution:
   ```cpp
   #include <iostream>
   using namespace std;
   int main() {
       int T; cin >> T;
       while(T--) {
           int A, B; cin >> A >> B;
           cout << A + B << endl;
       }
       return 0;
   }
   ```
5. Select Language: C++
6. Click "Submit"
7. Look for log: `[CodeHub:CodeChef] Submit button clicked!`
8. Look for log: `[CodeHub:CodeChef] Code extracted via...`
9. Look for log: `[CodeHub:CodeChef] Submission staged`
10. Wait for "Correct Answer" verdict
11. Look for log: `[CodeHub:CodeChef] Correct Answer detected!`
12. Look for log: `[CodeHub:CodeChef] Successfully pushed to GitHub!`

**Expected Results:**
- [ ] Chrome notification appears: "Pushed to GitHub! [CodeChef]"
- [ ] GitHub repo has new file: `CodeChef/2026-08/TEST.cpp`
- [ ] File has header with Platform: CodeChef
- [ ] README.md created in `CodeChef/2026-08/`
- [ ] Extension popup History tab shows entry with brown "CodeChef" badge

**Debug:**
- If code extraction fails, check editor type (ACE/Monaco) in console
- If verdict not detected, manually check page for "Correct Answer" text

---

### Test A2: Different Language
**Objective:** Verify language detection and file extension

**Steps:**
1. Go to any CodeChef problem
2. Select Language: Python 3
3. Write a Python solution
4. Submit and wait for AC

**Expected Results:**
- [ ] File pushed as `.py` extension
- [ ] Header uses Python comment style (`"""..."""`)

---

### Test A3: Contest Problem
**Objective:** Verify URL parsing for contest problems

**Steps:**
1. Go to an active CodeChef contest
2. Open any problem (URL will be `/CONTEST_CODE/problems/PROBLEM_CODE`)
3. Submit a solution

**Expected Results:**
- [ ] Problem code extracted correctly (not contest code)
- [ ] File pushed with correct problem code

---

## Test Group B: LeetCode (New Feature)

### Test B1: Easy Problem
**Objective:** Verify LeetCode GraphQL interception and verdict detection

**Steps:**
1. Navigate to `https://leetcode.com/problems/two-sum/`
2. Open DevTools Console (F12)
3. Look for log: `[CodeHub:LeetCode] LeetCode module initialized`
4. Look for log: `[CodeHub:LeetCode] Fetch interceptor installed`
5. Write a simple solution:
   ```python
   class Solution:
       def twoSum(self, nums: List[int], target: int) -> List[int]:
           seen = {}
           for i, num in enumerate(nums):
               if target - num in seen:
                   return [seen[target - num], i]
               seen[num] = i
   ```
6. Select Language: Python3
7. Click "Submit"
8. Look for log: `[CodeHub:LeetCode] Submission detected via GraphQL`
9. Look for log: `[CodeHub:LeetCode] Captured submission: { slug: 'two-sum', ... }`
10. Look for log: `[CodeHub:LeetCode] Submission staged`
11. Look for log: `[CodeHub:LeetCode] Starting verdict polling...`
12. Wait for green checkmark + Runtime/Memory stats
13. Look for log: `[CodeHub:LeetCode] Accepted verdict detected!`
14. Look for log: `[CodeHub:LeetCode] Successfully pushed to GitHub!`

**Expected Results:**
- [ ] Chrome notification: "Pushed to GitHub! [LeetCode]"
- [ ] GitHub repo has: `LeetCode/2026-08/two-sum.py`
- [ ] File header shows Platform: LeetCode
- [ ] README.md created in `LeetCode/2026-08/` with title "LeetCode Solutions - August 2026"
- [ ] Popup History shows entry with orange "LeetCode" badge

**Debug:**
- If submission not captured: Check Network tab for `/graphql` POST with `submitCode`
- If verdict not detected: Ensure page shows both "Accepted" text AND "Runtime:" stats

---

### Test B2: Different Language
**Objective:** Verify LeetCode language mapping

**Steps:**
1. Go to `https://leetcode.com/problems/reverse-integer/`
2. Select Language: C++
3. Write and submit solution

**Expected Results:**
- [ ] File pushed as `reverse-integer.cpp`
- [ ] Header uses C++ comment style

---

### Test B3: Slug with Numbers
**Objective:** Test problem slug parsing edge case

**Steps:**
1. Go to `https://leetcode.com/problems/3sum/`
2. Submit solution

**Expected Results:**
- [ ] File name is `3sum.cpp` (not `sum.cpp`)

---

### Test B4: Multiple Submissions
**Objective:** Verify only final submission is captured

**Steps:**
1. Go to any LeetCode problem
2. Submit wrong solution (will fail)
3. Immediately submit correct solution
4. Wait for second submission to show AC

**Expected Results:**
- [ ] Only one file pushed (the correct one)
- [ ] No duplicate pushes

---

## Test Group C: Popup UI

### Test C1: Platform Indicators
**Objective:** Verify UI shows all platforms

**Steps:**
1. Click extension icon

**Expected Results:**
- [ ] "Supported Platforms:" section visible
- [ ] CodeChef badge shows with checkmark (brown color)
- [ ] LeetCode badge shows with checkmark (orange color)
- [ ] Codeforces badge shows grayed out with warning icon
- [ ] Hover over Codeforces shows "Coming soon" tooltip

---

### Test C2: History Display
**Objective:** Verify platform badges in history

**Steps:**
1. After completing tests A1 and B1
2. Open popup → History tab

**Expected Results:**
- [ ] Both entries visible
- [ ] CodeChef entry has brown "CodeChef" badge
- [ ] LeetCode entry has orange "LeetCode" badge
- [ ] Each entry shows correct file path
- [ ] "View commit →" links work

---

### Test C3: Settings Persistence
**Objective:** Verify config survives extension reload

**Steps:**
1. Note current config
2. Go to `chrome://extensions/`
3. Click reload icon for CodeHub
4. Open popup

**Expected Results:**
- [ ] Status still shows "Connected"
- [ ] Username, repo name retained
- [ ] Token still saved (appears as dots)

---

## Test Group D: Edge Cases

### Test D1: Extension Reload During Submission
**Objective:** Test resilience to context invalidation

**Steps:**
1. Start a submission on CodeChef/LeetCode
2. While waiting for verdict, reload extension
3. Verdict appears

**Expected Results:**
- [ ] Console shows: "Extension context invalidated"
- [ ] No crash or error
- [ ] No duplicate notification

---

### Test D2: Invalid Configuration
**Objective:** Verify error handling for missing config

**Steps:**
1. Open popup → Settings
2. Clear all fields
3. Try to submit on any platform with AC verdict

**Expected Results:**
- [ ] Notification shows: "GitHub token not configured"
- [ ] No crash

---

### Test D3: Network Failure
**Objective:** Test offline resilience

**Steps:**
1. Disconnect internet
2. Submit and get AC verdict

**Expected Results:**
- [ ] Console shows GitHub API error
- [ ] Notification shows error message
- [ ] Extension remains functional

---

### Test D4: Multiple Platforms Same Session
**Objective:** Verify modules don't interfere

**Steps:**
1. Submit on CodeChef → get AC
2. Without closing browser, go to LeetCode
3. Submit on LeetCode → get AC

**Expected Results:**
- [ ] Both push successfully
- [ ] Each goes to correct folder
- [ ] No cross-contamination

---

### Test D5: SPA Navigation
**Objective:** Test platform module reinitialization

**Steps:**
1. On LeetCode, go to problem A
2. Submit (don't wait for verdict)
3. Navigate to problem B (LeetCode's SPA routing)
4. Submit problem B

**Expected Results:**
- [ ] Module detects navigation (check console)
- [ ] Polling stops for problem A
- [ ] Problem B submission works correctly

---

## Test Group E: GitHub Output Verification

### Test E1: Folder Structure
**Objective:** Verify correct folder hierarchy

**Navigate to GitHub repo and check:**
- [ ] Root has folders: `CodeChef/`, `LeetCode/`
- [ ] CodeChef has `2026-08/` folder
- [ ] LeetCode has `2026-08/` folder
- [ ] No old format folders (`DD-MM-YY/`)

---

### Test E2: File Content
**Objective:** Verify solution file structure

**Open any pushed solution file:**
- [ ] Header comment present
- [ ] Platform field matches source
- [ ] Problem code correct
- [ ] Date formatted nicely
- [ ] URL clickable
- [ ] Code below header intact
- [ ] No extra whitespace issues

---

### Test E3: README Files
**Objective:** Verify README generation

**Open `CodeChef/2026-08/README.md`:**
- [ ] Title: "CodeChef Solutions - August 2026"
- [ ] Table headers: #, Problem, Language, Solution
- [ ] Each problem listed
- [ ] Problem links work
- [ ] Solution links work (relative paths)

**Open `LeetCode/2026-08/README.md`:**
- [ ] Title: "LeetCode Solutions - August 2026"
- [ ] Same table structure

---

### Test E4: Commit Messages
**Objective:** Verify commit format

**Check recent commits:**
- [ ] Format: `Solved {PROBLEM} on {Platform} [Language]`
- [ ] Example: `Solved two-sum on LeetCode [Python3]`
- [ ] Example: `Solved TEST on CodeChef [C++]`

---

## Test Group F: Performance & Stability

### Test F1: Rapid Submissions
**Objective:** Stress test

**Steps:**
1. Submit 5 problems rapidly on CodeChef
2. All get AC within 1 minute

**Expected Results:**
- [ ] All 5 pushed correctly
- [ ] No missed submissions
- [ ] No duplicate pushes
- [ ] README updated with all 5

---

### Test F2: Memory Leaks
**Objective:** Check for resource leaks

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Submit 10 problems (get AC for all)
4. Take another heap snapshot
5. Compare

**Expected Results:**
- [ ] No significant memory growth
- [ ] Event listeners cleaned up

---

### Test F3: Long Session
**Objective:** Verify stability over time

**Steps:**
1. Keep browser open for 1 hour
2. Submit problems periodically

**Expected Results:**
- [ ] All pushes work
- [ ] No degradation
- [ ] No console errors

---

## 🐛 Bug Reporting Template

If any test fails, document using:

```
### Bug: [Short Description]

**Test:** [Test ID, e.g., B1]
**Platform:** CodeChef / LeetCode / Codeforces
**Browser:** Chrome [version]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
...

**Actual Behavior:**
...

**Console Logs:**
```
[paste relevant logs]
```

**Screenshots:**
[attach if relevant]

**Additional Context:**
...
```

---

## ✅ Final Checklist

Before marking v3.0 as production-ready:

- [ ] All Test Group A tests pass (CodeChef)
- [ ] All Test Group B tests pass (LeetCode)
- [ ] All Test Group C tests pass (Popup UI)
- [ ] All Test Group D tests pass (Edge Cases)
- [ ] All Test Group E tests pass (GitHub Output)
- [ ] Test Group F stability tests pass
- [ ] No console errors in any test
- [ ] Extension icon always shows (no crashes)
- [ ] Popup opens quickly (<1s)
- [ ] GitHub rate limit not hit during testing
- [ ] Documentation reviewed and accurate

---

## 📊 Test Results Template

Copy and fill out:

```
# CodeHub v3.0 Test Results

Date: ___________
Tester: ___________
Browser: Chrome ___________

## Test Group A: CodeChef
- A1: ☐ Pass ☐ Fail - Notes: ___________
- A2: ☐ Pass ☐ Fail - Notes: ___________
- A3: ☐ Pass ☐ Fail - Notes: ___________

## Test Group B: LeetCode
- B1: ☐ Pass ☐ Fail - Notes: ___________
- B2: ☐ Pass ☐ Fail - Notes: ___________
- B3: ☐ Pass ☐ Fail - Notes: ___________
- B4: ☐ Pass ☐ Fail - Notes: ___________

## Test Group C: Popup UI
- C1: ☐ Pass ☐ Fail - Notes: ___________
- C2: ☐ Pass ☐ Fail - Notes: ___________
- C3: ☐ Pass ☐ Fail - Notes: ___________

## Test Group D: Edge Cases
- D1: ☐ Pass ☐ Fail - Notes: ___________
- D2: ☐ Pass ☐ Fail - Notes: ___________
- D3: ☐ Pass ☐ Fail - Notes: ___________
- D4: ☐ Pass ☐ Fail - Notes: ___________
- D5: ☐ Pass ☐ Fail - Notes: ___________

## Test Group E: GitHub Output
- E1: ☐ Pass ☐ Fail - Notes: ___________
- E2: ☐ Pass ☐ Fail - Notes: ___________
- E3: ☐ Pass ☐ Fail - Notes: ___________
- E4: ☐ Pass ☐ Fail - Notes: ___________

## Test Group F: Performance
- F1: ☐ Pass ☐ Fail - Notes: ___________
- F2: ☐ Pass ☐ Fail - Notes: ___________
- F3: ☐ Pass ☐ Fail - Notes: ___________

## Overall Result
☐ All tests passed - Ready for production
☐ Minor issues found - Needs fixes
☐ Major issues found - Needs rework

Bugs found: ___________
Blockers: ___________
```

---

**Happy Testing! 🚀**
