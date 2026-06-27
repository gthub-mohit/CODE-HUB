# 📁 CodeHub - Project Structure

## Directory Overview

```
codechef-github-extension/
│
├── 📄 manifest.json            (0.84 KB)  - Extension manifest (Manifest V3)
│
├── 🎨 UI Files
│   ├── popup.html              (11.73 KB) - Modern popup interface
│   ├── popup.css               (15.03 KB) - Complete design system
│   └── popup.js                (9.05 KB)  - UI logic & validation
│
├── ⚙️ Core Extension Files
│   ├── content.js              (14.99 KB) - Capture-on-submit logic
│   └── background.js           (14.33 KB) - GitHub API & README management
│
├── 🖼️ Assets
│   └── icons/
│       ├── icon16.png          - 16x16 toolbar icon
│       ├── icon48.png          - 48x48 management icon
│       └── icon128.png         - 128x128 store icon
│
├── 📚 Documentation
│   ├── README.md               (10.36 KB) - Complete user guide
│   ├── QUICKSTART.md           (3.5 KB)   - 5-minute setup guide
│   ├── INSTALLATION.md         (7.59 KB)  - Detailed installation steps
│   ├── CHANGELOG.md            (12.50 KB) - Full rewrite changelog
│   ├── SUMMARY.md              (14.10 KB) - Feature summary
│   └── PROJECT_STRUCTURE.md    (This file) - Project overview
│
└── 🧪 Testing
    └── debug_test.js           (0.98 KB)  - Debug utilities

Total Files: 17
Total Size: ~111 KB (code + docs)
```

---

## File Descriptions

### Core Extension Files

#### `manifest.json`
```json
{
  "manifest_version": 3,
  "name": "CodeHub",
  "permissions": ["storage", "notifications"],
  "host_permissions": ["codechef.com", "api.github.com"]
}
```
- Declares extension metadata
- Defines permissions
- Links service worker and content scripts
- Manifest V3 compliant

#### `content.js` ⭐ Critical
```javascript
// Runs on CodeChef pages
// Key responsibilities:
- Listen for Submit button clicks
- Extract code from Monaco Editor
- Stage submission in chrome.storage
- Watch for "Correct Answer" verdict
- Send accepted solutions to background script
```
**Key Features**:
- ✅ Multi-strategy Monaco extraction
- ✅ Capture-on-submit (no race conditions)
- ✅ Stable MutationObserver on document.body
- ✅ SPA navigation handling

#### `background.js` ⭐ Critical
```javascript
// Service worker (runs in background)
// Key responsibilities:
- Receive accepted solutions from content script
- Generate date folders (DD-MM-YY)
- Push solution files to GitHub
- Create/update daily README.md
- Manage push history
- Show notifications
```
**Key Features**:
- ✅ Date-wise folder structure
- ✅ Dynamic README generation
- ✅ Base64 encoding/decoding
- ✅ SHA handling for file updates
- ✅ Beautiful solution headers

---

### UI Files

#### `popup.html`
- Modern semantic HTML5
- Inline SVG icons (no dependencies)
- Two panels: Settings & History
- Form with validation
- Accessibility compliant

#### `popup.css`
- **800+ lines** of polished CSS
- Complete design system with CSS variables
- Dark theme with emerald/blue accents
- Smooth animations and transitions
- Responsive layout
- Custom scrollbar styling

**Design Tokens**:
```css
--bg-primary: #0a0a0f      /* Deep space background */
--accent-emerald: #10b981  /* Success green */
--accent-blue: #3b82f6     /* Interactive blue */
--text-primary: #e5e5f0    /* High contrast text */
```

#### `popup.js`
- Form validation
- GitHub API verification
- Status bar updates
- History rendering
- Tab switching
- Password toggle
- Loading states

---

### Documentation Files

#### `README.md` (Primary Documentation)
**Sections**:
1. Features overview
2. Installation guide
3. Usage instructions
4. Repository structure examples
5. Technical details
6. Troubleshooting
7. Customization
8. Contributing

**Target Audience**: End users & developers

#### `QUICKSTART.md` (Fast Setup)
- 5-minute setup guide
- Minimal explanations
- Direct links
- Pro tips

**Target Audience**: Impatient users 😄

#### `INSTALLATION.md` (Detailed Setup)
- Step-by-step with screenshots
- Troubleshooting for each step
- Security & privacy info
- Common questions

**Target Audience**: First-time users

#### `CHANGELOG.md` (Technical Deep Dive)
- Before/after comparisons
- Bug fixes explained
- Architecture changes
- Code examples
- Migration guide

**Target Audience**: Developers & reviewers

#### `SUMMARY.md` (Executive Overview)
- Features checklist
- Deliverables list
- Statistics
- Quick reference

**Target Audience**: Project stakeholders

#### `PROJECT_STRUCTURE.md` (This File)
- File organization
- Size breakdown
- Responsibility mapping
- Quick navigation

**Target Audience**: New contributors

---

## Code Organization

### Content Script Flow
```
Page Load
    ↓
Setup submit listener
    ↓
User clicks submit → Capture code → Stage in storage
    ↓
Start MutationObserver
    ↓
Detect "Correct Answer"
    ↓
Retrieve staged data
    ↓
Send to background
```

### Background Script Flow
```
Receive message
    ↓
Validate config
    ↓
Format date folder (DD-MM-YY)
    ↓
Push solution file
    ↓
Check if README exists
    ↓
Create/Update README
    ↓
Save to history
    ↓
Show notification
```

### UI Flow
```
Load config from storage
    ↓
Display status
    ↓
User edits settings
    ↓
Validate inputs
    ↓
Verify via GitHub API
    ↓
Save to storage
    ↓
Update status bar
```

---

## Dependencies

### External Libraries
**None!** 🎉

The extension is 100% vanilla JavaScript with no external dependencies:
- ❌ No jQuery
- ❌ No React/Vue
- ❌ No CSS frameworks
- ❌ No build tools required

### Browser APIs Used
- Chrome Extension API (`chrome.*`)
- Fetch API (for GitHub)
- MutationObserver (for DOM watching)
- Local Storage (`chrome.storage.local`)
- Notifications (`chrome.notifications`)

---

## File Relationships

```
┌─────────────────────────────────────────────────┐
│              Browser Extension                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  manifest.json                                   │
│       │                                          │
│       ├─── content.js ──────────────┐            │
│       │    (CodeChef pages)         │            │
│       │                             │            │
│       └─── background.js ───────────┤            │
│            (Service Worker)         │            │
│                                     │            │
│  popup.html + popup.css + popup.js ─┤            │
│  (User interface)                   │            │
│                                     │            │
│  chrome.storage.local ──────────────┘            │
│  (Shared state)                                  │
│                                                  │
└─────────────────────────────────────────────────┘
         │                    │
         │                    └─── GitHub API
         │                         (Push code)
         │
         └─── CodeChef Website
              (Capture submissions)
```

---

## Size Breakdown

### Code Files (65 KB)
```
background.js    14.33 KB  (22%)  - GitHub integration
popup.css        15.03 KB  (23%)  - Design system
content.js       14.99 KB  (23%)  - Capture logic
popup.html       11.73 KB  (18%)  - UI structure
popup.js          9.05 KB  (14%)  - UI logic
───────────────────────────────────
Total            65.13 KB
```

### Documentation (46 KB)
```
SUMMARY.md       14.10 KB  (31%)
CHANGELOG.md     12.50 KB  (27%)
README.md        10.36 KB  (22%)
INSTALLATION.md   7.59 KB  (16%)
QUICKSTART.md     1.45 KB   (4%)
───────────────────────────────────
Total            46.00 KB
```

### Total Project
```
Code:            65 KB
Documentation:   46 KB
Assets:          ~5 KB (icons)
───────────────────────
Total:          ~116 KB
```

---

## Lines of Code

### JavaScript
```
content.js       ~500 lines
background.js    ~400 lines
popup.js         ~200 lines
────────────────────────
Total           ~1100 lines
```

### HTML/CSS
```
popup.html       ~200 lines
popup.css        ~800 lines
────────────────────────
Total          ~1000 lines
```

### Documentation
```
README.md        ~500 lines
INSTALLATION.md  ~400 lines
CHANGELOG.md     ~600 lines
SUMMARY.md       ~450 lines
QUICKSTART.md    ~150 lines
────────────────────────
Total          ~2100 lines
```

### Grand Total
**~4,200 lines** of production code + documentation

---

## Git Ignore Recommendations

If using Git, create a `.gitignore`:

```gitignore
# Development
.vscode/
.idea/
*.log

# OS files
.DS_Store
Thumbs.db

# Temporary
*.tmp
*.bak

# Package files (if adding build process)
node_modules/
dist/
*.zip
```

---

## Versioning Scheme

Current: **v2.0.0**

Follows semantic versioning:
```
MAJOR.MINOR.PATCH

2.0.0 → Complete rewrite
2.0.1 → Bug fix
2.1.0 → New feature
3.0.0 → Breaking change
```

---

## Build/Deployment

### Development
```bash
# No build required! Just:
1. Load unpacked in chrome://extensions
2. Make changes
3. Click reload icon
```

### Production (Chrome Web Store)
```bash
1. Zip the extension folder
2. Upload to Chrome Web Store Developer Dashboard
3. Fill in store listing
4. Submit for review
```

**Files to include in ZIP**:
- ✅ manifest.json
- ✅ All .js files
- ✅ popup.html, popup.css
- ✅ icons/
- ✅ README.md
- ❌ .vscode/ (exclude)
- ❌ debug_test.js (optional)

---

## Maintenance Checklist

### Before Each Release
- [ ] Test on latest Chrome version
- [ ] Verify GitHub API still works
- [ ] Check CodeChef UI hasn't changed
- [ ] Update version in manifest.json
- [ ] Update CHANGELOG.md
- [ ] Test all features manually

### Monthly
- [ ] Review GitHub API rate limits
- [ ] Check for Monaco editor changes
- [ ] Update dependencies (if any added)

### When CodeChef Updates
- [ ] Test submit button detection
- [ ] Verify Monaco extraction still works
- [ ] Check verdict detection
- [ ] Update selectors if needed

---

## Quick Navigation

**Need to modify...**

| Task | Edit These Files |
|------|------------------|
| Code capture logic | `content.js` |
| GitHub API calls | `background.js` |
| Folder structure | `background.js` → `formatDateFolder()` |
| README format | `background.js` → `createNewReadme()` |
| UI appearance | `popup.css` |
| UI layout | `popup.html` |
| UI behavior | `popup.js` |
| Extension name | `manifest.json` |
| Permissions | `manifest.json` |

---

## Contributing Guidelines

### Code Style
- Use 2-space indentation
- Add comments for complex logic
- Use descriptive variable names
- Keep functions focused and small

### Before Submitting PR
1. Test thoroughly
2. Update relevant documentation
3. Add entry to CHANGELOG.md
4. Ensure no console errors

### Commit Message Format
```
type(scope): description

Examples:
feat(ui): add dark mode toggle
fix(capture): improve Monaco detection
docs(readme): update installation steps
```

---

## Support & Resources

- 📖 [README](./README.md) - Start here
- ⚡ [Quick Start](./QUICKSTART.md) - 5-min setup
- 🔧 [Installation](./INSTALLATION.md) - Detailed guide
- 📝 [Changelog](./CHANGELOG.md) - What changed
- 📊 [Summary](./SUMMARY.md) - Feature overview

---

<div align="center">

**CodeHub v2.0** - Production Ready ✨

Made with ❤️ for competitive programmers

</div>
