// Background script for ReadLtr extension
// Handles the extension's background processes

// Create context menu item for saving articles
chrome.runtime.onInstalled.addListener(function(details) {
  chrome.contextMenus.create({
    id: "save-to-readltr",
    title: "Save to ReadLtr",
    contexts: ["page", "link"]
  });
  
  // Show welcome page if this is a new installation
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome.html")
    });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  // Check if user is logged in first
  chrome.storage.local.get(['authToken'], function(data) {
    const isLoggedIn = !!data.authToken;
    
    // Determine URL to save (either the link or the current page)
    const urlToSave = info.linkUrl || info.pageUrl;
    
    if (isLoggedIn) {
      // User is logged in, open save page
      chrome.tabs.create({
        url: `popup.html?url=${encodeURIComponent(urlToSave)}`
      });
    } else {
      // User is not logged in, open login page
      chrome.tabs.create({
        url: chrome.runtime.getURL("login.html?redirect=popup")
      });
    }
  });
});

// Handle clicks on the extension icon
chrome.action.onClicked.addListener(function(tab) {
  // This is a fallback in case the popup doesn't open
  chrome.storage.local.get(['authToken'], function(data) {
    const isLoggedIn = !!data.authToken;
    
    if (!isLoggedIn) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("login.html?redirect=popup")
      });
    }
  });
});

// Handle messages from popup.js and content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "saveArticle") {
    // Handle article saving
    saveArticle(request.article, sendResponse);
    return true; // Keep the messaging channel open for async response
  }
  
  if (request.action === "checkAuth") {
    // Check authentication status
    chrome.storage.local.get(['authToken'], function(data) {
      sendResponse({ isAuthenticated: !!data.authToken });
    });
    return true; // Keep the messaging channel open for async response
  }
  
  if (request.action === "openLogin") {
    // Open the login page
    chrome.tabs.create({
      url: chrome.runtime.getURL("login.html?redirect=popup")
    });
    sendResponse({ success: true });
    return false;
  }
  
  if (request.action === "logout") {
    // Handle logout
    chrome.storage.local.remove(['authToken', 'user'], function() {
      sendResponse({ success: true });
    });
    return true; // Keep the messaging channel open for async response
  }
});

// Function to save an article
function saveArticle(article, sendResponse) {
  chrome.storage.local.get(['authToken', 'apiBaseUrl'], function(data) {
    if (!data.authToken) {
      sendResponse({ success: false, error: "Not logged in" });
      return;
    }
    
    const apiBaseUrl = data.apiBaseUrl || 'https://readltr.app/api';
    
    fetch(`${apiBaseUrl}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.authToken}`
      },
      body: JSON.stringify(article)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to save article');
        });
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ success: true, article: data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
  });
} 