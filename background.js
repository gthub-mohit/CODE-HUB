// ═══════════════════════════════════════════════════════════════════════════
// CodeHub - Background Service Worker
// ═══════════════════════════════════════════════════════════════════════════
// Handles GitHub API integration with date-wise folder structure and dynamic
// README.md generation/updates for each date folder
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ─── Message Listener ───────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ACCEPTED_SOLUTION') {
    handleAcceptedSolution(message.payload)
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => {
        console.error('[CodeHub] Error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});

// ─── Main Solution Handler ──────────────────────────────────────────────────
async function handleAcceptedSolution(payload) {
  const { problemCode, language, code, url, timestamp } = payload;

  // Get user configuration
  const config = await getConfig();

  if (!config.githubToken) {
    throw new Error('GitHub token not configured. Please open CodeHub popup to set up.');
  }
  if (!config.repoName) {
    throw new Error('Repository name not configured. Please open CodeHub popup to set up.');
  }

  // Build date-wise folder structure: DD-MM-YY/PROBLEM.ext
  const date = new Date(timestamp);
  const dateFolder = formatDateFolder(date); // e.g., "29-06-26"
  const extension = getFileExtension(language);
  const fileName = `${problemCode}${extension}`;
  const filePath = `${dateFolder}/${fileName}`;

  console.log('[CodeHub] Processing:', problemCode, '→', filePath);

  // Build commit message
  const commitMessage = `Solved ${problemCode} [${language}]`;

  // Push solution file to GitHub
  const solutionResult = await pushSolutionFile({
    token: config.githubToken,
    username: config.githubUsername,
    repo: config.repoName,
    filePath,
    content: code,
    commitMessage,
    problemCode,
    language,
    sourceUrl: url,
    date
  });

  // Update or create README.md for this date folder
  await updateDateReadme({
    token: config.githubToken,
    username: config.githubUsername,
    repo: config.repoName,
    dateFolder,
    problemCode,
    language,
    sourceUrl: url,
    fileName
  });

  // Save to push history
  await savePushHistory({
    problemCode,
    language,
    filePath,
    timestamp,
    commitUrl: solutionResult.commitUrl
  });

  // Show success notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Pushed to GitHub!',
    message: `${problemCode} → ${config.repoName}/${filePath}`,
    priority: 2
  });

  console.log('[CodeHub] Success:', filePath);

  return {
    filePath,
    commitUrl: solutionResult.commitUrl,
    dateFolder
  };
}

// ─── Format Date for Folder Name ────────────────────────────────────────────
function formatDateFolder(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits
  return `${day}-${month}-${year}`; // DD-MM-YY
}

// ─── Push Solution File to GitHub ───────────────────────────────────────────
async function pushSolutionFile(options) {
  const { token, username, repo, filePath, content, commitMessage, 
          problemCode, language, sourceUrl, date } = options;

  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
  const headers = buildGitHubHeaders(token);

  // Check if file already exists
  let existingSha = null;
  try {
    const checkRes = await fetch(apiUrl, { headers });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
      console.log('[CodeHub] File exists, will update. SHA:', existingSha);
    }
  } catch (e) {
    // File doesn't exist - that's fine
  }

  // Build solution file with header comment
  const solutionWithHeader = buildSolutionHeader(
    content,
    problemCode,
    language,
    sourceUrl,
    date
  );

  // Encode to base64
  const base64Content = btoa(unescape(encodeURIComponent(solutionWithHeader)));

  const body = {
    message: commitMessage,
    content: base64Content,
    ...(existingSha && { sha: existingSha })
  };

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub API error ${res.status}: ${err.message || 'Unknown error'}`);
  }

  const data = await res.json();
  return {
    commitUrl: data.commit?.html_url || '',
    fileUrl: data.content?.html_url || '',
    sha: data.content?.sha || ''
  };
}

// ─── Update or Create Date-Specific README ───────────────────────────────────
async function updateDateReadme(options) {
  const { token, username, repo, dateFolder, problemCode, language, sourceUrl, fileName } = options;

  const readmePath = `${dateFolder}/README.md`;
  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${readmePath}`;
  const headers = buildGitHubHeaders(token);

  let existingSha = null;
  let existingContent = '';

  // Check if README already exists for this date
  try {
    const checkRes = await fetch(apiUrl, { headers });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
      // Decode existing Base64 content
      existingContent = decodeURIComponent(escape(atob(existing.content)));
      console.log('[CodeHub] README exists for', dateFolder, '- will append');
    }
  } catch (e) {
    console.log('[CodeHub] No existing README for', dateFolder, '- will create new');
  }

  let newReadmeContent;

  if (existingContent) {
    // Append new entry to existing README
    newReadmeContent = appendToReadme(existingContent, {
      problemCode,
      language,
      sourceUrl,
      fileName
    });
  } else {
    // Create new README for this date
    newReadmeContent = createNewReadme(dateFolder, {
      problemCode,
      language,
      sourceUrl,
      fileName
    });
  }

  // Encode to base64
  const base64Content = btoa(unescape(encodeURIComponent(newReadmeContent)));

  const body = {
    message: existingSha 
      ? `📝 Update README - Add ${problemCode}` 
      : `📝 Create README for ${dateFolder}`,
    content: base64Content,
    ...(existingSha && { sha: existingSha })
  };

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to update README: ${err.message || 'Unknown error'}`);
  }

  console.log('[CodeHub] README updated:', readmePath);
}

// ─── Create New README for Date Folder ──────────────────────────────────────
function createNewReadme(dateFolder, problem) {
  const { problemCode, language, sourceUrl, fileName } = problem;
  
  // Parse date for nice display
  const [day, month, year] = dateFolder.split('-');
  const dateObj = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `# CodeChef Solutions - ${formattedDate}

## Problems Solved

| # | Problem | Language | Solution |
|---|---------|----------|----------|
| 1 | [${problemCode}](${sourceUrl}) | ${language} | [${fileName}](./${fileName}) |
`;
}

// ─── Append Entry to Existing README ─────────────────────────────────────────
function appendToReadme(existingContent, problem) {
  const { problemCode, language, sourceUrl, fileName } = problem;

  // Find the table section
  const tableHeaderRegex = /\|\s*#\s*\|\s*Problem\s*\|\s*Language\s*\|\s*Solution\s*\|/i;
  
  if (!tableHeaderRegex.test(existingContent)) {
    // If table structure is broken, recreate the README
    console.warn('[CodeHub] README table structure invalid - will recreate');
    return existingContent + `\n| ? | [${problemCode}](${sourceUrl}) | ${language} | [${fileName}](./${fileName}) |\n`;
  }

  // Count existing rows to get next number
  const rowCount = (existingContent.match(/\|\s*\d+\s*\|/g) || []).length;
  const nextNumber = rowCount + 1;

  // Find the last row of the table and insert after it
  const lines = existingContent.split('\n');
  let insertIndex = -1;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('|') && lines[i].includes('](')) {
      insertIndex = i + 1;
      break;
    }
  }

  if (insertIndex === -1) {
    // Fallback: append at end of file
    return existingContent + `\n| ${nextNumber} | [${problemCode}](${sourceUrl}) | ${language} | [${fileName}](./${fileName}) |\n`;
  }

  // Insert new row
  const newRow = `| ${nextNumber} | [${problemCode}](${sourceUrl}) | ${language} | [${fileName}](./${fileName}) |`;
  lines.splice(insertIndex, 0, newRow);
  
  return lines.join('\n');
}

// ─── Build Solution File Header ─────────────────────────────────────────────
function buildSolutionHeader(code, problemCode, language, sourceUrl, date) {
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const commentStyle = getCommentStyle(language);

  const header = `${commentStyle.start}
 ╔═══════════════════════════════════════════════════════════════════════╗
 ║  Problem  : ${problemCode.padEnd(60, ' ')}║
 ║  Platform : CodeChef                                                  ║
 ║  Status   : Accepted                                                    ║
 ║  Date     : ${formattedDate.padEnd(60, ' ')}║
 ║  URL      : ${sourceUrl.padEnd(60, ' ')}║
 ╚═══════════════════════════════════════════════════════════════════════╝
${commentStyle.end}

${code}`;

  return header;
}

// ─── Get Comment Style for Language ─────────────────────────────────────────
function getCommentStyle(language) {
  const lang = (language || '').toLowerCase();
  
  if (lang.includes('python')) {
    return {
      start: '"""',
      end: '"""'
    };
  }
  
  // Default: C-style comments for C++, Java, JavaScript, C#, etc.
  return {
    start: '/*',
    end: ' */'
  };
}

// ─── Map Language to File Extension ─────────────────────────────────────────
function getFileExtension(language) {
  const lang = (language || '').toLowerCase();
  
  if (lang.includes('c++') || lang.includes('cpp')) return '.cpp';
  if (lang.includes('python') || lang.includes('py')) return '.py';
  if (lang.includes('java')) return '.java';
  if (lang.includes('javascript') || lang.includes('js')) return '.js';
  if (lang.includes('c#') || lang.includes('csharp')) return '.cs';
  if (lang.includes('ruby')) return '.rb';
  if (lang.includes('go')) return '.go';
  if (lang.includes('rust')) return '.rs';
  if (lang.includes('kotlin')) return '.kt';
  if (lang.includes('swift')) return '.swift';
  if (lang === 'c' || lang.includes(' c ')) return '.c';
  
  return '.cpp'; // Default
}

// ─── Build GitHub API Headers ───────────────────────────────────────────────
function buildGitHubHeaders(token) {
  return {
    'Authorization': `token ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CodeHub-Extension/2.0'
  };
}

// ─── Storage Helpers ────────────────────────────────────────────────────────
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['githubToken', 'githubUsername', 'repoName'],
      resolve
    );
  });
}

async function savePushHistory(entry) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pushHistory'], (data) => {
      const history = data.pushHistory || [];
      history.unshift(entry); // Newest first
      const trimmed = history.slice(0, 100); // Keep last 100
      chrome.storage.local.set({ pushHistory: trimmed }, resolve);
    });
  });
}

console.log('[CodeHub] Background service worker initialized ✨');
