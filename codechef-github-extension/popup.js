// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - Popup Script
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ─── DOM Elements ─────────────────────────────────────────────────────────
  const usernameInput = document.getElementById('githubUsername');
  const repoCodeChefInput = document.getElementById('repoCodeChef');
  const repoLeetCodeInput = document.getElementById('repoLeetCode');
  const repoCodeforcesInput = document.getElementById('repoCodeforces');
  const tokenInput = document.getElementById('githubToken');
  const settingsForm = document.getElementById('settingsForm');
  const saveBtn = document.getElementById('saveBtn');
  const saveMsg = document.getElementById('saveMsg');
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  const historyContent = document.getElementById('historyContent');
  const togglePasswordBtn = document.getElementById('togglePassword');

  // ─── Load Configuration ───────────────────────────────────────────────────
  chrome.storage.local.get(
    ['githubToken', 'githubUsername', 'repoCodeChef', 'repoLeetCode', 'repoCodeforces', 'pushHistory'],
    (data) => {
      if (data.githubUsername) usernameInput.value = data.githubUsername;
      if (data.repoCodeChef) repoCodeChefInput.value = data.repoCodeChef;
      if (data.repoLeetCode) repoLeetCodeInput.value = data.repoLeetCode;
      if (data.repoCodeforces) repoCodeforcesInput.value = data.repoCodeforces;
      if (data.githubToken) tokenInput.value = data.githubToken;

      updateStatusBar(data);
      renderHistory(data.pushHistory || []);
    }
  );

  // ─── Update Status Bar ────────────────────────────────────────────────────
  function updateStatusBar(data) {
    if (data.githubToken && data.githubUsername && (data.repoCodeChef || data.repoLeetCode)) {
      statusBar.className = 'status-bar connected';
      const repos = [];
      if (data.repoCodeChef) repos.push(`CC:${data.repoCodeChef}`);
      if (data.repoLeetCode) repos.push(`LC:${data.repoLeetCode}`);
      statusText.textContent = `${data.githubUsername}/${repos.join(' | ')}`;
    } else {
      statusBar.className = 'status-bar not-connected';
      statusText.textContent = 'Configuration required';
    }
  }

  // ─── Password Toggle ──────────────────────────────────────────────────────
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = tokenInput.type === 'password';
    tokenInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.classList.toggle('active', !isPassword);
  });

  // ─── Save Configuration ───────────────────────────────────────────────────
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = tokenInput.value.trim();
    const username = usernameInput.value.trim();
    const repoCodeChef = repoCodeChefInput.value.trim();
    const repoLeetCode = repoLeetCodeInput.value.trim();

    // Validation
    if (!token || !username) {
      showMessage('Username and token are required', 'error');
      return;
    }

    if (!repoCodeChef && !repoLeetCode) {
      showMessage('At least one platform repository is required', 'error');
      return;
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      showMessage('Invalid token format. Should start with ghp_ or github_pat_', 'error');
      return;
    }

    // Disable button during verification
    saveBtn.disabled = true;
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
        <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <span>Verifying repositories...</span>
    `;

    try {
      // Verify each configured repository
      const reposToVerify = [];
      if (repoCodeChef) reposToVerify.push({ name: 'CodeChef', repo: repoCodeChef });
      if (repoLeetCode) reposToVerify.push({ name: 'LeetCode', repo: repoLeetCode });

      const verificationResults = [];
      for (const { name, repo } of reposToVerify) {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CodeHub-Extension/3.0'
          }
        });

        if (response.status === 200) {
          verificationResults.push({ name, repo, success: true });
        } else if (response.status === 404) {
          throw new Error(`${name} repository "${repo}" not found. Please create it on GitHub first.`);
        } else if (response.status === 401) {
          throw new Error('Invalid token. Please check your Personal Access Token.');
        } else if (response.status === 403) {
          throw new Error('Token doesn\'t have required permissions. Ensure "repo" scope is enabled.');
        } else {
          throw new Error(`GitHub API returned status ${response.status} for ${name} repo`);
        }
      }

      // Success - save configuration
      const configToSave = {
        githubToken: token,
        githubUsername: username,
        repoCodeChef: repoCodeChef || null,
        repoLeetCode: repoLeetCode || null
      };

      chrome.storage.local.set(configToSave, () => {
        const verifiedRepos = verificationResults.map(r => r.name).join(', ');
        showMessage(`✓ All configurations saved & verified! (${verifiedRepos})`, 'success');
        updateStatusBar(configToSave);
      });
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHTML;
    }
  });

  // ─── Show Message ─────────────────────────────────────────────────────────
  function showMessage(message, type) {
    saveMsg.textContent = message;
    saveMsg.className = `save-msg ${type} show`;
    setTimeout(() => {
      saveMsg.classList.remove('show');
    }, 4000);
  }

  // ─── Tab Switching ────────────────────────────────────────────────────────
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panel
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`panel-${targetTab}`).classList.add('active');

      // Reload history if switching to history tab
      if (targetTab === 'history') {
        chrome.storage.local.get(['pushHistory'], (data) => {
          renderHistory(data.pushHistory || []);
        });
      }
    });
  });

  // ─── Render History ───────────────────────────────────────────────────────
  function renderHistory(history) {
    if (!history || history.length === 0) {
      historyContent.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No solutions yet</h3>
          <p>Solve a problem on CodeChef, LeetCode, or Codeforces to see your history here</p>
        </div>
      `;
      return;
    }

    historyContent.innerHTML = history.map(entry => {
      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Platform badge color
      const platform = entry.platform || 'CodeChef';
      const platformColor = {
        'CodeChef': '#5B4638',
        'LeetCode': '#FFA116',
        'Codeforces': '#1F8ACB'
      }[platform] || '#5B4638';

      const repoName = entry.repoName || 'repo';

      const commitLink = entry.commitUrl
        ? `<a href="${entry.commitUrl}" target="_blank" class="history-link">
             View commit →
           </a>`
        : '';

      return `
        <div class="history-item">
          <div class="history-item-header">
            <span class="history-problem">${entry.problemCode}</span>
            <div style="display: flex; gap: 4px;">
              <span class="history-badge" style="background: ${platformColor};">${platform}</span>
              <span class="history-badge">AC</span>
            </div>
          </div>
          <div class="history-meta">${entry.language} · ${formattedDate}</div>
          <div class="history-path">${repoName}/${entry.filePath}</div>
          ${commitLink}
        </div>
      `;
    }).join('');
  }

});

// ─── CSS Animation for Spinner ────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
