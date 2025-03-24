document.addEventListener('DOMContentLoaded', function() {
  const titleElement = document.getElementById('article-title');
  const sourceElement = document.getElementById('article-url');
  const typeSelect = document.getElementById('content-type');
  const tagsInput = document.getElementById('tags');
  const notesInput = document.getElementById('notes');
  const saveButton = document.getElementById('save-button');
  const saveForm = document.getElementById('save-form');
  const formFields = document.getElementById('form-fields');
  const spinner = document.getElementById('spinner');
  const statusElement = document.getElementById('status');

  // Check if user is logged in
  checkAuthStatus().then(isLoggedIn => {
    if (!isLoggedIn) {
      // User is not logged in, show login prompt
      titleElement.textContent = 'Sign in to ReadLtr';
      sourceElement.textContent = 'Login required to save articles';
      formFields.style.display = 'none';
      saveButton.textContent = 'Sign In';
      
      saveButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'openLogin' });
        window.close();
      });
      return;
    }
    
    // User is logged in, continue with normal flow
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      titleElement.textContent = currentTab.title;
      sourceElement.textContent = new URL(currentTab.url).hostname;
      
      // Get metadata from content script
      chrome.tabs.sendMessage(currentTab.id, {action: "getMetadata"}, function(response) {
        if (response && response.metadata) {
          const metadata = response.metadata;
          
          if (metadata.contentType) {
            typeSelect.value = metadata.contentType;
          }
          
          // Handle author tags if available
          if (metadata.author) {
            const authorTag = `author:${metadata.author.toLowerCase().replace(/\s+/g, '-')}`;
            tagsInput.value = authorTag;
          }
        }
      });
      
      saveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveArticle(currentTab);
      });
    });
  });
  
  function saveArticle(tab) {
    // Show spinner
    saveButton.disabled = true;
    spinner.style.display = 'inline-block';
    statusElement.textContent = 'Saving...';
    
    // Get current form values
    const articleData = {
      url: tab.url,
      title: tab.title,
      contentType: typeSelect.value,
      tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: notesInput.value
    };
    
    // Get metadata from content script
    chrome.tabs.sendMessage(tab.id, {action: "getMetadata"}, function(response) {
      if (response && response.metadata) {
        // Merge metadata with form data
        Object.assign(articleData, response.metadata);
      }
      
      // Send to API through background script
      chrome.runtime.sendMessage(
        { 
          action: "saveArticle", 
          article: articleData 
        }, 
        function(response) {
          spinner.style.display = 'none';
          
          if (response && response.success) {
            statusElement.textContent = 'Saved successfully!';
            statusElement.style.color = '#4CAF50';
            
            // Close popup after successful save
            setTimeout(() => window.close(), 1500);
          } else {
            saveButton.disabled = false;
            statusElement.textContent = response?.error || 'Failed to save. Please try again.';
            statusElement.style.color = '#F44336';
          }
        }
      );
    });
  }
  
  // Helper function to check if user is authenticated
  function checkAuthStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'checkAuth' }, function(response) {
        resolve(response && response.isAuthenticated);
      });
    });
  }
}); 