# ⚡ CodeHub - Quick Start (5 Minutes)

## 🎯 Goal
Get CodeHub running in under 5 minutes!

---

## Step 1: GitHub Token (2 min)

1. Click here: [**Generate Token**](https://github.com/settings/tokens/new?scopes=repo&description=CodeHub+Extension)
2. Click green **"Generate token"** button at bottom
3. **Copy the token** (starts with `ghp_`)
4. Save it somewhere safe!

---

## Step 2: Install Extension (1 min)

1. Open Chrome → `chrome://extensions`
2. Turn on **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select this folder: `codehub/codechef-github-extension/`
5. Done! ✅

---

## Step 3: Configure (1 min)

1. Click **CodeHub icon** in browser toolbar
2. Fill in:
   - **GitHub Username**: `your-username`
   - **Repository**: `CodeChef-Solutions` (must exist!)
   - **Token**: Paste the token from Step 1
3. Click **"Save Configuration"**
4. Wait for ✅ green checkmark!

---

## Step 4: Test It! (1 min)

1. Go to [CodeChef Practice](https://www.codechef.com/practice)
2. Pick any easy problem
3. Write a solution (make sure it's correct!)
4. Click **Submit**
5. Wait for **"Correct Answer"** ✅
6. Check your GitHub repo!

---

## 🎉 What You'll See on GitHub

```
your-repo/
└── 29-06-26/                    ← Today's date (DD-MM-YY)
    ├── README.md                ← Daily summary table
    └── PROBLEMCODE.cpp          ← Your solution with header
```

**README.md** will contain:
```markdown
# CodeChef Solutions - [Date]

## Problems Solved

| # | Problem | Language | Solution |
|---|---------|----------|----------|
| 1 | [CODE](link) | C++ | [CODE.cpp](./CODE.cpp) |
```

**Your solution** will have a header:
```cpp
/*
 ╔═══════════════════════════════════════════════════════════════════════╗
 ║  Problem  : PROBLEMCODE                                               ║
 ║  Platform : CodeChef                                                  ║
 ║  Status   : Accepted ✅                                               ║
 ║  Date     : June 29, 2026                                             ║
 ║  URL      : https://www.codechef.com/problems/PROBLEMCODE             ║
 ╚═══════════════════════════════════════════════════════════════════════╝
 */

// Your code here
```

---

## 🔍 Troubleshooting

### "Repository not found"
→ Create the repository on GitHub first!

### "Invalid token"
→ Make sure you copied the **entire** token (starts with `ghp_`)

### Code not captured
→ Open browser console (F12), look for `[CodeHub]` logs

### Still stuck?
→ Read [INSTALLATION.md](./INSTALLATION.md) for detailed guide

---

## 📚 Learn More

- **Full Guide**: [README.md](./README.md)
- **Setup Help**: [INSTALLATION.md](./INSTALLATION.md)
- **What Changed**: [CHANGELOG.md](./CHANGELOG.md)
- **Features**: [SUMMARY.md](./SUMMARY.md)

---

## 🎁 Features at a Glance

✅ **Auto-sync** accepted solutions to GitHub  
✅ **Date-wise folders** (`DD-MM-YY/`)  
✅ **Daily README** tracking all problems  
✅ **Beautiful headers** in every solution  
✅ **Modern UI** with dark theme  
✅ **History panel** showing all pushes  
✅ **Zero configuration** after initial setup  

---

## 💡 Pro Tips

1. **Pin the extension** for easy access
2. **Check History tab** to see all your pushes
3. **Multiple problems per day** → All go in same date folder
4. **Private repos work** too (just need the token)
5. **Works on contests** and practice problems

---

## 🚀 Now Go Solve Some Problems!

CodeHub will handle the rest automatically.

**Happy Coding! 🎉**

---

<div align="center">

Need help? Open an issue or read the full docs!

[⬆ Back to Top](#-codehub---quick-start-5-minutes)

</div>
