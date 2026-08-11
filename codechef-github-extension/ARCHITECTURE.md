# CodeHub Architecture Diagram

## 🏗️ System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
│                                                                      │
│  CodeChef.com          LeetCode.com         Codeforces.com          │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐            │
│  │  Write   │         │  Write   │         │  Write   │            │
│  │   Code   │         │   Code   │         │   Code   │            │
│  └─────┬────┘         └─────┬────┘         └─────┬────┘            │
│        │                    │                     │                 │
│        ▼                    ▼                     ▼                 │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐            │
│  │  Submit  │         │  Submit  │         │  Submit  │            │
│  │  Button  │         │  Button  │         │  Button  │            │
│  └──────────┘         └──────────┘         └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTENT SCRIPT LAYER                            │
│                                                                      │
│                       ┌──────────────────┐                          │
│                       │   content.js     │                          │
│                       │   (Router)       │                          │
│                       └────────┬─────────┘                          │
│                                │                                     │
│             Detects hostname & loads appropriate module             │
│                                │                                     │
│        ┌───────────────────────┼───────────────────────┐            │
│        │                       │                       │            │
│        ▼                       ▼                       ▼            │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│  │ codechef.js  │      │ leetcode.js  │      │codeforces.js │     │
│  │              │      │              │      │  (future)    │     │
│  │ • ACE Editor │      │ • GraphQL    │      │ • Form POST  │     │
│  │ • Click      │      │ • Fetch      │      │ • XHR        │     │
│  │   listener   │      │   override   │      │   override   │     │
│  │ • Mutation   │      │ • Polling    │      │ • Polling    │     │
│  │   Observer   │      │   verdict    │      │   verdict    │     │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘     │
│         │                     │                     │              │
│         └──────────────┬──────┴─────────────────────┘              │
│                        │                                            │
│                Stage in chrome.storage.local                        │
│                        │                                            │
│                        ▼                                            │
│              ┌──────────────────────┐                              │
│              │ pendingSubmission    │                              │
│              │ {                    │                              │
│              │   platform: "...",   │                              │
│              │   problemCode: "...",│                              │
│              │   language: "...",   │                              │
│              │   code: "...",       │                              │
│              │   url: "...",        │                              │
│              │   timestamp: "..."   │                              │
│              │ }                    │                              │
│              └──────────┬───────────┘                              │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
         Wait for "Accepted" verdict
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MESSAGING LAYER                                   │
│                                                                      │
│                   chrome.runtime.sendMessage                         │
│                                                                      │
│              { type: 'ACCEPTED_SOLUTION',                           │
│                payload: { ... } }                                   │
│                                                                      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKGROUND SERVICE WORKER                          │
│                                                                      │
│                     ┌────────────────────┐                          │
│                     │   background.js    │                          │
│                     └─────────┬──────────┘                          │
│                               │                                      │
│         Platform-agnostic GitHub API handler                        │
│                               │                                      │
│         ┌─────────────────────┼─────────────────────┐               │
│         │                     │                     │               │
│         ▼                     ▼                     ▼               │
│    Read Config          Format Path           Build Header          │
│    (token, repo)        Platform/YYYY-MM/     with Platform         │
│                         PROBLEM.ext            name                 │
│                               │                     │               │
│                               └──────────┬──────────┘               │
│                                          │                          │
│                                          ▼                          │
│                              ┌────────────────────┐                 │
│                              │ GitHub Contents    │                 │
│                              │ API (PUT)          │                 │
│                              └─────────┬──────────┘                 │
│                                        │                            │
│                        ┌───────────────┼───────────────┐            │
│                        │               │               │            │
│                        ▼               ▼               ▼            │
│                 Push Solution    Update README    Show             │
│                 File              in folder       Notification      │
│                                                                     │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       GITHUB REPOSITORY                              │
│                                                                      │
│  my-repo/                                                           │
│  ├── CodeChef/                                                      │
│  │   ├── 2026-08/                                                   │
│  │   │   ├── PROBLEM1.cpp                                           │
│  │   │   ├── PROBLEM2.py                                            │
│  │   │   └── README.md                                              │
│  │   └── 2026-09/                                                   │
│  │       └── ...                                                    │
│  ├── LeetCode/                                                      │
│  │   ├── 2026-08/                                                   │
│  │   │   ├── two-sum.cpp                                            │
│  │   │   ├── add-two-numbers.py                                     │
│  │   │   └── README.md                                              │
│  │   └── 2026-09/                                                   │
│  │       └── ...                                                    │
│  └── Codeforces/                                                    │
│      └── (future)                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      POPUP UI (popup.html)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  CodeHub v3.0                    [Settings] [History]        │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Supported Platforms:                                        │  │
│  │  [✓ CodeChef] [✓ LeetCode] [⚠ Codeforces]                  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Status: ✓ Connected to user/repo                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Recent Pushes:                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ two-sum          [LeetCode] [AC]                       │ │  │
│  │  │ Python · Aug 11, 2026                                  │ │  │
│  │  │ LeetCode/2026-08/two-sum.py                           │ │  │
│  │  │ View commit →                                          │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ PROBLEM1         [CodeChef] [AC]                       │ │  │
│  │  │ C++ · Aug 10, 2026                                     │ │  │
│  │  │ CodeChef/2026-08/PROBLEM1.cpp                         │ │  │
│  │  │ View commit →                                          │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔑 Key Design Principles

### 1. **Separation of Concerns**
- **Router** (`content.js`): Only detects platform, loads correct module
- **Platform Modules**: Handle platform-specific logic (submission capture, verdict)
- **Background**: Platform-agnostic GitHub operations

### 2. **Standardized Contract**
All platforms send identical message format:
```javascript
{
  type: 'ACCEPTED_SOLUTION',
  payload: {
    platform: string,
    problemCode: string,
    language: string,
    code: string,
    url: string,
    timestamp: string
  }
}
```

### 3. **Isolation**
- Each platform module is self-contained
- No shared state between modules
- Adding/removing platforms doesn't affect others

### 4. **Fail-Safe**
- Extension context validation (`chrome.runtime?.id`)
- Storage error handling
- Multiple code extraction fallbacks

---

## 🔄 Data Flow Sequence

### CodeChef Example

```
User writes code
      ↓
User clicks "Submit"
      ↓
codechef.js captures click
      ↓
Extract code from ACE Editor
      ↓
Stage in chrome.storage.local
      ↓
Start MutationObserver
      ↓
Page shows "Correct Answer"
      ↓
Observer detects verdict
      ↓
Read staged submission
      ↓
Send message to background
      ↓
background.js receives message
      ↓
Format: CodeChef/2026-08/PROBLEM.cpp
      ↓
Build header with CodeChef platform
      ↓
PUT to GitHub API
      ↓
Update README in CodeChef/2026-08/
      ↓
Save to push history
      ↓
Show Chrome notification
      ↓
Clear pending submission
```

### LeetCode Example

```
User writes code
      ↓
User clicks "Submit"
      ↓
LeetCode makes GraphQL request
      ↓
leetcode.js intercepts fetch
      ↓
Extract code from GraphQL variables
      ↓
Stage in chrome.storage.local
      ↓
Start polling (every 1s)
      ↓
Check page for "Accepted" + "Runtime:"
      ↓
Both found → Accepted!
      ↓
Read staged submission
      ↓
Send message to background
      ↓
background.js receives message
      ↓
Format: LeetCode/2026-08/two-sum.py
      ↓
Build header with LeetCode platform
      ↓
PUT to GitHub API
      ↓
Update README in LeetCode/2026-08/
      ↓
Save to push history with platform
      ↓
Show notification "[LeetCode]"
      ↓
Stop polling
```

---

## 📦 Module Dependencies

```
manifest.json
    ↓
  Loads
    ↓
┌───────────┬──────────────────┬─────────────┐
│           │                  │             │
▼           ▼                  ▼             ▼
content.js  background.js    popup.html   popup.js
    │                           │             │
    │ Dynamically loads         │ Uses        │
    ▼                           ▼             ▼
platforms/                  popup.css    chrome.storage
├── codechef.js
├── leetcode.js
└── codeforces.js

All modules use:
- chrome.storage.local (staging)
- chrome.runtime.sendMessage (communication)
- chrome.runtime.id (context validation)
```

---

## 🎯 Extension Lifecycle

### Installation
```
1. User installs extension
2. manifest.json registers:
   - content_scripts for all platforms
   - background service worker
   - host_permissions granted
3. Popup shows "Not configured"
```

### Configuration
```
1. User opens popup
2. Enters GitHub token, username, repo
3. Extension verifies repo exists (GitHub API)
4. Saves to chrome.storage.local
5. Status bar shows "Connected"
```

### Active Use
```
1. User navigates to supported platform
2. content.js loads appropriate module
3. Module installs interceptors/listeners
4. User solves problem
5. User submits
6. Module captures code
7. Module watches for verdict
8. On AC → push to GitHub
9. Notification shown
10. History updated
```

### Module Lifecycle (per page load)
```
content.js runs at document_start
    ↓
Detect hostname
    ↓
Load platform module (inject script tag)
    ↓
Platform module init()
    ↓
Install interceptors (before any requests)
    ↓
Setup DOM watchers
    ↓
Wait for user action
```

---

## 🧩 Extensibility Examples

### Adding HackerRank

**Step 1:** Create `platforms/hackerrank.js`
```javascript
(function () {
  // ... standard module structure
  // Intercept submission
  // Watch for verdict
  // Send standardized message
})();
```

**Step 2:** Update `content.js`
```javascript
if (hostname.includes('hackerrank.com')) {
  return 'hackerrank';
}
```

**Step 3:** Update `manifest.json`
```json
"https://www.hackerrank.com/*"
```

**Done!** No other files change.

### Adding Statistics Feature

**Step 1:** Create `stats.html` and `stats.js`

**Step 2:** Read `pushHistory` from storage

**Step 3:** Aggregate by platform, language, date

**Step 4:** Display charts

**No changes to core logic needed!**

---

## 🛡️ Error Handling

```
┌─────────────────────────────────────────────┐
│         Error Scenarios Handled             │
├─────────────────────────────────────────────┤
│                                             │
│ 1. Extension context invalidated           │
│    → Check chrome.runtime?.id before ops   │
│                                             │
│ 2. Storage errors                          │
│    → Check chrome.runtime.lastError        │
│                                             │
│ 3. Code extraction fails                   │
│    → Multiple fallback strategies          │
│                                             │
│ 4. GitHub API errors                       │
│    → Return error to sender, show in popup │
│                                             │
│ 5. Network errors                          │
│    → Caught in async/await blocks          │
│                                             │
│ 6. Verdict timeout                         │
│    → Stop watching after 2 minutes         │
│                                             │
│ 7. Missing configuration                   │
│    → Clear error message in notification   │
│                                             │
└─────────────────────────────────────────────┘
```

---

This architecture ensures **scalability**, **maintainability**, and **reliability** while keeping the codebase clean and modular.
