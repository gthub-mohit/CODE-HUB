# CodeHub - Automated CodeChef & LeetCode to GitHub Sync

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-emerald)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Automatically sync your accepted CodeChef and LeetCode solutions to GitHub with beautiful date-wise organization.**

</div>

---

## ✨ Features

### 🚀 Core Functionality

- **Multi-Platform Sync**: Automatically sync accepted solutions from CodeChef and LeetCode to GitHub
- **Automatic GitHub Push**: Solutions are pushed directly to your configured GitHub repository
- **Capture-on-Submit Strategy**: Captures your code at the moment you submit
- **Automatic Verdict Detection**: Detects successful submissions and triggers the GitHub sync
- **Multi-Language Support**: Supports C++, Python, Java, JavaScript, C#, Go, Rust, and more
- **Platform-Aware Solutions**: Automatically stores the correct platform, problem name, URL, language, and submission details

### 📁 Smart Organization

Solutions are automatically organized using date-wise folders.

Example:

```text
29-06-26/
├── README.md
├── TOTR.cpp
└── TWO_SUM.cpp

Each date folder contains:

A README.md containing all problems solved that day
Individual solution files
Problem links
Programming language information
Platform information
🎨 Beautiful UI
Modern dark theme
Emerald & blue accents
Smooth animations
Live GitHub connection status
GitHub username and repository configuration
Personal Access Token visibility toggle
Submission history
Commit links for successful GitHub pushes
🛡️ Robust Architecture
MutationObserver-based submission and verdict detection
Capture-before-re-render strategy
Handles dynamic React-based interfaces
Platform-specific content extraction
Comprehensive error handling
Manifest V3 compatible
GitHub API integration
🌐 Supported Platforms
CodeChef

CodeHub automatically detects accepted CodeChef submissions and pushes the solution to GitHub.

LeetCode

CodeHub now supports LeetCode as well.

The workflow remains simple:

Open a LeetCode problem
Write your solution
Submit it
Wait for the solution to be accepted
CodeHub automatically pushes it to GitHub

You can configure the GitHub repository where your LeetCode solutions should be stored.

📦 Installation
Prerequisites

Before using CodeHub, you need:

A GitHub account
A GitHub repository for storing your solutions
A GitHub Personal Access Token
Google Chrome or another Chromium-based browser
🔑 1. Generate GitHub Personal Access Token

Go to:

https://github.com/settings/tokens/new?scopes=repo&description=CodeHub+Extension

Create a token with the required repo permissions.

Copy the token after generating it.

⚠️ Keep your GitHub token private. Never share it publicly or commit it to a repository.

📁 2. Create a GitHub Repository

Create a new repository on GitHub.

For example:

CodeChef-Solutions

or

LeetCode-Solutions

The repository can be either public or private.

CodeHub will automatically create and update files inside the repository.

🧩 3. Install CodeHub
Download or clone this repository
Open Chrome
Navigate to:
chrome://extensions/
Enable Developer mode
Click Load unpacked
Select the CodeHub extension folder

The CodeHub extension should now appear in your extensions list.

⚙️ 4. Configure CodeHub

Click the CodeHub extension icon and enter:

GitHub Username
GitHub Repository
GitHub Personal Access Token

For example:

Username: yourusername
Repository: LeetCode-Solutions
Token: github_pat_xxxxxxxxx

Click Save Configuration.

If everything is configured correctly, the connection status should become:

Connected
🚀 Usage
CodeChef
Open any CodeChef problem
Write your solution
Click Submit
CodeHub captures your code
CodeChef returns the verdict
If the solution is accepted, CodeHub pushes it to GitHub
A notification confirms the successful push
LeetCode
Open any LeetCode problem
Write your solution
Click Submit
CodeHub captures the submitted solution
CodeHub detects the accepted submission
The solution is automatically pushed to GitHub
A notification confirms the successful push

No manual copying or uploading is required.

📂 Repository Structure

CodeHub organizes your solutions by date.

For example:

LeetCode-Solutions/
├── 10-08-26/
│   ├── README.md
│   ├── TWO_SUM.cpp
│   └── VALID_PARENTHESES.cpp
│
├── 11-08-26/
│   ├── README.md
│   ├── BINARY_SEARCH.cpp
│   └── MERGE_SORT.cpp
│
└── 12-08-26/
    ├── README.md
    └── SEARCH_INSERT_POSITION.cpp

The same structure can be used for CodeChef solutions.

📝 Daily README

Every date folder contains a README.md that keeps track of the problems solved that day.

Example:

# CodeHub Solutions - Tuesday, August 12, 2026

## Problems Solved

| # | Platform | Problem | Language | Solution |
|---|----------|---------|----------|----------|
| 1 | LeetCode | Two Sum | C++17 | [TWO_SUM.cpp](./TWO_SUM.cpp) |
| 2 | LeetCode | Binary Search | C++17 | [BINARY_SEARCH.cpp](./BINARY_SEARCH.cpp) |
| 3 | CodeChef | Some Problem | C++17 | [PROBLEM.cpp](./PROBLEM.cpp) |

---

<div align="center">
  <sub>Auto-generated by <strong>CodeHub</strong> 🚀</sub>
</div>
💻 Solution File Format

Every solution contains a structured header containing important submission information.

Example:

/*
 ╔═══════════════════════════════════════════════════════════════════════╗
 ║  Problem  : Two Sum                                                   ║
 ║  Platform : LeetCode                                                  ║
 ║  Status   : Accepted                                                  ║
 ║  Date     : August 12, 2026                                           ║
 ║  URL      : https://leetcode.com/problems/two-sum/                    ║
 ╚═══════════════════════════════════════════════════════════════════════╝
*/

#include <iostream>
using namespace std;

int main() {
    // Your solution code...
    return 0;
}
🧠 Technical Details
Capture-on-Submit Strategy

Modern competitive programming platforms use dynamic web applications, which can cause submitted code to disappear or change after submission.

CodeHub solves this by capturing the code before the page re-renders.

The general workflow is:

User clicks Submit
        ↓
CodeHub captures source code
        ↓
Submission data stored temporarily
        ↓
Platform verdict is monitored
        ↓
Solution accepted
        ↓
GitHub API called
        ↓
Solution pushed to repository

This prevents the submitted code from being lost during React re-renders.

🔍 Code Extraction

CodeHub uses multiple strategies depending on the platform.

CodeChef

Code extraction supports:

Monaco Editor API
Monaco DOM parsing
Textarea fallback
LeetCode

CodeHub extracts the submitted solution from the LeetCode editor and associates it with:

Problem title
Problem URL
Programming language
Submission status
Submission date
Platform
👀 Verdict Detection

CodeHub monitors the relevant parts of the webpage to determine whether a submission was accepted.

For dynamically rendered pages, MutationObserver is used to detect changes without relying on fixed DOM elements.

Instead of observing a dynamic element that may disappear:

observer.observe(verdictContainer, {
    childList: true
});

CodeHub can observe a stable parent such as:

observer.observe(document.body, {
    childList: true,
    subtree: true
});

This makes the detection more reliable on React-based websites.

📄 Supported File Extensions
Language	Extension
C++	.cpp
C	.c
Python	.py
Java	.java
JavaScript	.js
TypeScript	.ts
C#	.cs
Go	.go
Rust	.rs
Ruby	.rb
Kotlin	.kt
Swift	.swift
🔧 Troubleshooting
Extension Not Capturing Code

Symptoms:
No solution is captured after submitting.

Possible solutions:

Make sure you are on a supported platform
Reload the problem page
Make sure the editor has completely loaded
Check the browser console for [CodeHub] logs
Try submitting the solution again
GitHub Push Failed

Symptoms:
The solution is accepted but isn't pushed to GitHub.

Check the following:

GitHub username is correct
Repository name is correct
GitHub Personal Access Token is valid
Token has the required permissions
Repository exists
Internet connection is available
README Not Updating

Symptoms:
The solution is pushed but the daily README isn't updated.

Possible solutions:

Check GitHub API permissions
Verify the repository configuration
Check browser console logs
Make sure the existing README has a valid format
Status Shows "Not Connected"

Possible solutions:

Open CodeHub
Verify GitHub username
Verify repository name
Re-enter your Personal Access Token
Click Save Configuration
Check the connection status again
🎨 Customization
Changing Date Format

The date folder format can be modified inside the date formatting function.

Current format:

DD-MM-YY

Example:

12-08-26
Changing Repository Structure

By default:

DD-MM-YY/PROBLEM.ext

You can modify the implementation to use a custom structure such as:

solutions/leetcode/DD-MM-YY/PROBLEM.ext

or:

leetcode/DD-MM-YY/PROBLEM.ext
🤝 Contributing

Contributions are welcome!

Fork the repository
Create a feature branch
git checkout -b feature/AmazingFeature
Commit your changes
git commit -m "Add AmazingFeature"
Push the branch
git push origin feature/AmazingFeature
Open a Pull Request
📜 License

This project is licensed under the MIT License.

🙌 Acknowledgments
Built for the competitive programming community
Inspired by the need for automated and organized solution tracking
Uses the GitHub API for repository management
Built as a Chrome Manifest V3 extension
🐛 Support

If you encounter an issue:

Check the Troubleshooting section
Check browser console logs with the [CodeHub] prefix
Open an issue on GitHub
Submit a feature request if you have an idea
