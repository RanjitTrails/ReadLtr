# Publishing ReadLtr Extension to Chrome Web Store

This guide walks through the process of publishing the ReadLtr browser extension to the Chrome Web Store.

## Prerequisites

1. A Google Developer account (one-time $5 registration fee)
2. The extension files in a ZIP archive
3. Screenshots and promotional images
4. Extension description and metadata

## Prepare Required Assets

### 1. Create Extension ZIP File

```bash
# Navigate to extension directory
cd extension

# Create ZIP file with all extension files
zip -r readltr-extension.zip manifest.json popup.html popup.js background.js content.js login.html login.js welcome.html welcome.js icons/*
```

### 2. Prepare Images

You need the following images:

- **Icon**: Icon files are already in the `icons` directory (16px, 48px, 128px)
- **Screenshots**: At least one screenshot (1280x800 px) showing the extension in use
- **Promotional Images** (optional but recommended):
  - Small promotional image: 440x280 px
  - Large promotional image: 920x680 px
  - Marquee promotional image: 1400x560 px

### 3. Prepare Listing Information

Have the following information ready:

- **Extension Name**: "ReadLtr"
- **Short Description**: "Save articles to your ReadLtr reading list with one click"
- **Detailed Description**:

```
ReadLtr is a browser extension that lets you save any article, blog post, or web page to your personal reading list with just one click. Perfect for researchers, students, and avid readers who want to organize online content for later reading.

Features:
• One-click saving directly from your browser
• Right-click context menu for saving any page or link
• Add tags and notes to organize your reading list
• View your saved articles in a clean, distraction-free reader
• Full integration with ReadLtr web app
• Offline reading capabilities

Save interesting content now, read it when you have time, all in one place with ReadLtr.
```

- **Category**: Productivity
- **Language**: English (or add additional languages if supported)
- **Website**: https://readltr.app

## Publishing Process

1. **Sign in to Chrome Web Store Developer Dashboard**
   - Go to https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

2. **Create a New Item**
   - Click "New Item" button
   - Upload the ZIP file of your extension

3. **Fill in Store Listing Details**
   - Add the extension name, description, and category
   - Upload screenshots and promotional images
   - Add additional information like version notes, language, etc.

4. **Set Up Privacy Information**
   - Provide privacy information about data collection
   - Include a link to your privacy policy
   - Declare any permissions required and why they're needed

5. **Distribution Options**
   - Choose between publishing to the public or as an unlisted extension
   - Select which countries the extension should be available in

6. **Submit for Review**
   - Click "Submit for Review"
   - The review process typically takes a few business days

## After Submission

- Monitor the developer dashboard for any feedback from the Chrome Web Store team
- If there are issues, address them and resubmit
- Once approved, your extension will be published to the Chrome Web Store

## Updating Your Extension

To publish updates:

1. Increment the version number in `manifest.json`
2. Create a new ZIP file with the updated files
3. Go to your item in the Developer Dashboard
4. Click "Package" in the left sidebar
5. Upload the new ZIP file
6. Click "Submit for Review"

## Recommended Testing Before Submission

1. Load the extension as an unpacked extension in Chrome to test functionality
2. Test on various websites to ensure content script works correctly
3. Verify authentication flow works properly 
4. Check that offline functionality works as expected
5. Test permission requests to ensure users understand what they're approving

## Common Rejection Reasons

- Missing or inadequate privacy policy
- Requesting unnecessary permissions
- Deceptive functionality or description
- Poor user experience or non-functioning features
- Security vulnerabilities

Address these concerns before submission to avoid delays in the review process. 