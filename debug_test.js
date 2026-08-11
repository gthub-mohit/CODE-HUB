// ══════════════════════════════════════════════════════════
// CC→GH DEBUG TOOL
// Paste this in CodeChef page console to manually test push
// ══════════════════════════════════════════════════════════

chrome.runtime.sendMessage({
  type: 'ACCEPTED_SOLUTION',
  payload: {
    problemCode: 'TEST_PROBLEM',
    language:    'C++17',
    code:        '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  cout << "Hello GitHub!" << endl;\n  return 0;\n}',
    url:         window.location.href,
    timestamp:   new Date().toISOString()
  }
}, (response) => {
  if (chrome.runtime.lastError) {
    console.error('[DEBUG] Error:', chrome.runtime.lastError.message);
  } else {
    console.log('[DEBUG] Response:', JSON.stringify(response, null, 2));
  }
});
