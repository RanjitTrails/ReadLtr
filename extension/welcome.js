document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const welcomeMessage = document.getElementById('welcome-message');
  const startBrowsingButton = document.getElementById('start-browsing');
  
  // Check if user info exists
  chrome.storage.local.get(['user'], function(data) {
    if (data.user && data.user.name) {
      // Personalize welcome message with user's name
      welcomeMessage.textContent = `Welcome, ${data.user.name}! You're all set to start saving articles.`;
    }
  });
  
  // Start browsing button closes the page
  startBrowsingButton.addEventListener('click', function() {
    window.close();
  });
}); 