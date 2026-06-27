# 🚀 CodeHub v2.0 - CodeChef to GitHub Auto-Syncer

CodeHub is a modern, lightweight, and blazing-fast Manifest V3 Chrome/Brave extension that automatically syncs your accepted CodeChef submissions to GitHub. It automates your competitive programming documentation workflow by creating structured daily logs and detailed summary tables completely hands-free!

---

## ✨ Features

* **Sleek Dev-Centric UI:** Modern dark mode interface with deep space grays, vivid emerald accents for success states, and smooth CSS transitions.
* **Robust Capture-on-Submit Strategy:** Intercepts the "Submit" click to instantly cache your code from the Monaco Editor in local storage, preventing dynamic SPA/React unmounting issues.
* **Chronological Date-Wise Organization:** Automatically groups your code inside folder structures formatted as `DD-MM-YY/` (e.g., `29-06-26/`).
* **Dynamic README.md Generator:** Automatically maintains an elegant daily markdown log table of all problems solved on that specific date (appends rows dynamically without wiping history!).
* **Beautiful Code Headers:** Every pushed file gets an auto-generated ASCII comment box containing the problem code, platform, status, date, and problem URL.
* **Security & Quality of Life:** Password visibility toggle for your Personal Access Token, credentials status indicator, and local submission history panel.

---

## ⚙️ How to Install (For Users / Friends)

Since CodeHub is an open-source tool, you don't need to install it from the Chrome Web Store. Follow these simple steps to load it locally:

1. **Download the Extension:** Go to the **Releases** section on the right side of this GitHub repository and download the `CodeHub-v2.0.zip` file.
2. **Extract the ZIP:** Extract the downloaded file into a dedicated folder on your computer.
3. **Open Extensions Page:** Open your Chromium-based browser (Chrome, Brave, Edge) and navigate to:
   * Chrome: `chrome://extensions/`
   * Brave: `brave://extensions/`
4. **Enable Developer Mode:** Turn ON the **Developer mode** toggle switch in the top-right corner.
5. **Load the Extension:** Click the **Load unpacked** button in the top-left corner, select the extracted folder, and boom—CodeHub is active!

---

## 🔑 Configuration & GitHub PAT Setup Guide

To securely push code directly from your browser to your repository, CodeHub requires a GitHub Personal Access Token (PAT). Here is how to set it up:

### Step 1: Create a GitHub Repository
* Create a repository named `CodeChef-Solutions` (or any name you prefer) on GitHub. Leave it public or private as you wish.

### Step 2: Generate a Personal Access Token (Classic)
1. Go to your GitHub account **Settings** -> Scroll down to **Developer Settings** (left sidebar).
2. Click on **Personal access tokens** -> Select **Tokens (classic)**.
3. Click on the **Generate new token** dropdown and choose **Generate new token (classic)**.
4. Give it a note (e.g., `CodeHub-Extension`).
5. Under **Select scopes**, check the main **`repo`** box (this grants full control of repositories so the extension can commit files).
6. Scroll to the bottom and click **Generate token**.
7. ⚠️ **Copy the token immediately!** It will only be shown once.

### Step 3: Connect CodeHub
1. Click the extension puzzle icon in your browser toolbar and **Pin (📌) CodeHub**.
2. Click on the CodeHub icon to open the popup panel.
3. Enter your **GitHub Username**, the exact **Repository Name**, and paste your **Personal Access Token (PAT)**.
4. Click **Save Configuration**. The status badge will flash green showing **"Connected ✅"**.

---

## 🔄 Automated Workflow

1. Open any problem on CodeChef.
2. Write your solution and hit **Submit**.
3. CodeHub instantly captures your code in the staging memory.
4. Once CodeChef evaluates and flashes **"Correct Answer"**, CodeHub fires the GitHub REST API and pushes your code.

### 📁 Sample Repository Structure After Auto-Push:
```text
YourRepo/
├── 29-06-26/
│   ├── README.md          <-- Daily summary table listing solved problems
│   ├── TOTR.cpp           <-- C++ Solution file with custom header
│   └── FLOW001.py         <-- Another language solution
└── 30-06-26/
    ├── README.md
    └── MAXDIFF.cpp
