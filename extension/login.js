document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const signinTab = document.getElementById('signin-tab');
  const signupTab = document.getElementById('signup-tab');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  
  // Get form elements
  const signinEmail = document.getElementById('signin-email');
  const signinPassword = document.getElementById('signin-password');
  const signinButton = document.getElementById('signin-button');
  const signinError = document.getElementById('signin-error');
  
  const signupName = document.getElementById('signup-name');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const signupButton = document.getElementById('signup-button');
  const signupError = document.getElementById('signup-error');
  
  const forgotPassword = document.getElementById('forgot-password');
  
  // Handle tab switching
  signinTab.addEventListener('click', function() {
    signinTab.classList.add('active');
    signupTab.classList.remove('active');
    signinForm.style.display = 'block';
    signupForm.style.display = 'none';
    clearErrors();
  });
  
  signupTab.addEventListener('click', function() {
    signupTab.classList.add('active');
    signinTab.classList.remove('active');
    signupForm.style.display = 'block';
    signinForm.style.display = 'none';
    clearErrors();
  });
  
  // Handle signin form submission
  signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    if (!signinEmail.value.trim()) {
      showError('signin-email-error', 'Email is required');
      return;
    }
    
    if (!signinPassword.value) {
      showError('signin-password-error', 'Password is required');
      return;
    }
    
    // Disable button during submission
    signinButton.disabled = true;
    signinButton.textContent = 'Signing in...';
    
    // Get API base URL or use default
    const apiBaseUrl = 'https://readltr.app/api';
    
    // Call login API
    fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: signinEmail.value.trim(),
        password: signinPassword.value
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Invalid credentials');
        });
      }
      return response.json();
    })
    .then(data => {
      // Store authentication token and user info
      chrome.storage.local.set({
        authToken: data.token,
        user: data.user,
        apiBaseUrl: apiBaseUrl
      }, function() {
        // Get redirect URL from query parameters or use default
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        
        if (redirect === 'popup') {
          // Redirect to popup
          chrome.tabs.update({ url: chrome.runtime.getURL('welcome.html') });
        } else {
          // Show welcome page
          window.location.href = 'welcome.html';
        }
      });
    })
    .catch(error => {
      showError('signin-error', error.message || 'Login failed. Please try again.');
      signinButton.disabled = false;
      signinButton.textContent = 'Sign In';
    });
  });
  
  // Handle signup form submission
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    if (!signupName.value.trim()) {
      showError('signup-name-error', 'Name is required');
      return;
    }
    
    if (!signupEmail.value.trim()) {
      showError('signup-email-error', 'Email is required');
      return;
    }
    
    if (!signupPassword.value) {
      showError('signup-password-error', 'Password is required');
      return;
    }
    
    if (signupPassword.value.length < 8) {
      showError('signup-password-error', 'Password must be at least 8 characters');
      return;
    }
    
    // Disable button during submission
    signupButton.disabled = true;
    signupButton.textContent = 'Creating account...';
    
    // Get API base URL or use default
    const apiBaseUrl = 'https://readltr.app/api';
    
    // Call signup API
    fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: signupName.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Registration failed');
        });
      }
      return response.json();
    })
    .then(data => {
      // Store authentication token and user info
      chrome.storage.local.set({
        authToken: data.token,
        user: data.user,
        apiBaseUrl: apiBaseUrl
      }, function() {
        // Show welcome page
        window.location.href = 'welcome.html';
      });
    })
    .catch(error => {
      showError('signup-error', error.message || 'Registration failed. Please try again.');
      signupButton.disabled = false;
      signupButton.textContent = 'Create Account';
    });
  });
  
  // Handle forgot password
  forgotPassword.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://readltr.app/reset-password' });
  });
  
  // Helper function to show error
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }
  
  // Helper function to clear all errors
  function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });
  }
});