# 🚀 CodeHub Installation Guide

## Prerequisites

Before installing CodeHub, make sure you have:

1. ✅ **Google Chrome** or **Chromium-based browser** (Edge, Brave, etc.)
2. ✅ **GitHub Account** - [Sign up here](https://github.com/join) if you don't have one
3. ✅ **GitHub Repository** - Where your solutions will be stored
4. ✅ **Personal Access Token** - With `repo` scope

---

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository settings:
   - **Name**: `CodeChef-Solutions` (or any name you prefer)
   - **Description**: "My CodeChef solutions organized by date"
   - **Visibility**: Choose Public or Private
   - ✅ Check **"Add a README file"** (optional)
4. Click **"Create repository"**

---

## Step 2: Generate Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
   
   Or use this direct link: [Generate New Token](https://github.com/settings/tokens/new?scopes=repo&description=CodeHub+Extension)

2. Token settings:
   - **Note**: `CodeHub Extension`
   - **Expiration**: Choose duration (recommend "No expiration" for convenience)
   - **Scopes**: ✅ Check **`repo`** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`

3. Click **"Generate token"**

4. 🔒 **IMPORTANT**: Copy your token immediately!
   - It starts with `ghp_` or `github_pat_`
   - You won't be able to see it again
   - Store it safely (you'll need it in Step 4)

---

## Step 3: Install CodeHub Extension

### Option A: Load Unpacked (Development)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/yourusername/codehub.git
   ```
   Or download as ZIP and extract.

2. Open Chrome and navigate to:
   ```
   chrome://extensions
   ```

3. Enable **"Developer mode"** (toggle in top-right corner)

4. Click **"Load unpacked"**

5. Select the extension folder:
   ```
   codehub/codechef-github-extension/
   ```

6. CodeHub should now appear in your extensions list! 🎉

### Option B: Install from Chrome Web Store (Future)

*Coming soon! The extension will be available on Chrome Web Store after review.*

---

## Step 4: Configure CodeHub

1. **Open the Extension**
   - Click the CodeHub icon in your browser toolbar
   - If you don't see it, click the puzzle icon → Pin CodeHub

2. **Enter Configuration**
   
   The settings panel will open. Fill in:

   - **GitHub Username**
     ```
     your-github-username
     ```
     *(Not your email, just the username)*

   - **Repository Name**
     ```
     CodeChef-Solutions
     ```
     *(The repo you created in Step 1)*

   - **Personal Access Token**
     ```
     ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
     *(The token you generated in Step 2)*

3. **Save Configuration**
   - Click the **"Save Configuration"** button
   - Extension will verify your credentials
   - Wait for the success message: ✅ "Configuration saved & verified!"

4. **Check Status**
   - Status bar should turn **green**
   - Should display: `username/repository-name`

---

## Step 5: Test It!

1. **Go to CodeChef**
   - Open [CodeChef](https://www.codechef.com)
   - Navigate to any practice problem

2. **Write a Solution**
   - Write your code in the editor
   - Make sure it's correct (test it!)

3. **Submit**
   - Click the **"Submit"** button
   - CodeHub will capture your code at this moment

4. **Get Accepted**
   - Wait for the verdict
   - When it shows **"Correct Answer"** ✅
   - CodeHub automatically pushes to GitHub

5. **Check Notification**
   - You should see a browser notification:
     ```
     ✅ Pushed to GitHub!
     PROBLEMCODE → your-repo/DD-MM-YY/PROBLEMCODE.ext
     ```

6. **Verify on GitHub**
   - Go to your repository
   - You should see a new folder: `DD-MM-YY/`
   - Inside: `PROBLEMCODE.ext` and `README.md`

---

## 🎉 You're All Set!

CodeHub is now active and will automatically sync all your accepted CodeChef solutions!

### What Happens Next?

Every time you get an **Accepted** verdict on CodeChef:

1. ⚡ **Instant Capture** - Code is saved the moment you click submit
2. 👀 **Verdict Watch** - Monitors for "Correct Answer"
3. 📁 **Smart Organization** - Creates date folder (`DD-MM-YY/`)
4. 📄 **README Update** - Adds entry to daily summary
5. 🚀 **GitHub Push** - Commits to your repository
6. 🔔 **Notification** - Confirms successful push

---

## 📊 View Your History

1. Click the CodeHub icon
2. Switch to the **"History"** tab
3. See all your pushed solutions with:
   - Problem code
   - Language used
   - Date and time
   - File path
   - Direct link to GitHub commit

---

## ❓ Troubleshooting

### "Repository not found" error

**Problem**: Token works but repo not found

**Solution**:
- Double-check repository name (case-sensitive!)
- Ensure repo exists on GitHub
- If private repo, ensure token has `repo` scope

### "Invalid token" error

**Problem**: Token rejected by GitHub

**Solution**:
- Regenerate token with correct scopes
- Make sure you copied the entire token
- Check token hasn't expired

### Extension not capturing code

**Problem**: No push after accepted verdict

**Solution**:
- Check browser console for `[CodeHub]` logs
- Ensure you're on a CodeChef problem page
- Try reloading the page
- Make sure you clicked "Submit" (not just "Run")

### Status shows "Not Connected"

**Problem**: Red status indicator

**Solution**:
- Re-enter all three fields
- Click "Save Configuration"
- Wait for verification
- Check internet connection

---

## 🔄 Updating the Extension

When a new version is released:

1. Download the latest code
2. Go to `chrome://extensions`
3. Find CodeHub
4. Click the refresh icon 🔄
5. Your settings will be preserved!

---

## 🗑️ Uninstalling

To remove CodeHub:

1. Go to `chrome://extensions`
2. Find CodeHub
3. Click **"Remove"**
4. Confirm removal

Your GitHub repository and solutions will remain intact.

---

## 🛡️ Security & Privacy

### What CodeHub Can Access

- ✅ CodeChef pages (to capture solutions)
- ✅ GitHub API (to push solutions)
- ✅ Chrome storage (to save settings)

### What CodeHub Cannot Access

- ❌ Other websites
- ❌ Your GitHub password
- ❌ Other extensions' data
- ❌ Your browsing history

### Your Data

- Token is stored **locally** in your browser
- Never sent to any server except GitHub API
- Solutions pushed only to **your** repository
- No telemetry or analytics

---

## 📞 Need Help?

### Resources

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/codehub/issues)
- 💬 [Discussions](https://github.com/yourusername/codehub/discussions)

### Common Questions

**Q: Does this work with contests?**
A: Yes! Works on practice, contests, and challenges.

**Q: Can I use multiple repositories?**
A: Change settings anytime to switch repositories.

**Q: Does it work on other platforms?**
A: Currently only CodeChef. More platforms coming soon!

**Q: Is my token safe?**
A: Yes, stored locally and only used for GitHub API.

**Q: Can I customize folder structure?**
A: See [README.md](./README.md) for customization guide.

---

<div align="center">

**Happy Coding! 🚀**

*May all your submissions be green ✅*

[⬆ Back to Top](#-codehub-installation-guide)

</div>
