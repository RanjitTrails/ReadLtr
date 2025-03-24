# ReadLtr Browser Extension

This browser extension enables one-click saving of articles to your ReadLtr reading list.

## Features

- Save articles directly from your browser with one click
- Extract article metadata (author, reading time, etc.)
- Add tags and notes to saved articles
- Right-click context menu for saving any page or link
- Works with Chrome, Firefox, and other Chromium-based browsers

## Installation

### Chrome/Edge/Brave

1. Download the extension files
2. Go to `chrome://extensions/` (or equivalent in your browser)
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked"
5. Select the `extension` folder containing these files
6. The ReadLtr extension should now appear in your browser toolbar

### Firefox

1. Download the extension files
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file in the `extension` folder
6. The ReadLtr extension should now appear in your browser toolbar

## Usage

### Login

1. Make sure you're logged in to ReadLtr on the website
2. The extension will automatically detect your logged-in status

### Saving Articles

**Option 1: Browser Toolbar**
- Click the ReadLtr icon in your browser toolbar
- The article details will be pre-filled
- Add any tags or notes
- Click "Save to ReadLtr"

**Option 2: Context Menu**
- Right-click on any page or link
- Select "Save to ReadLtr"
- This will open the ReadLtr save page with the URL pre-filled

## Development

To modify the extension:

1. Edit the files in the `extension` folder
2. Reload the extension in your browser's extension management page

### Project Structure

- `manifest.json` - Extension configuration
- `popup.html` / `popup.js` - UI for the toolbar popup
- `content.js` - Script that runs on web pages to extract metadata
- `background.js` - Background service worker for the extension

## API Integration

The extension integrates with the ReadLtr API to:
- Verify user authentication
- Save articles to the user's reading list
- Extract and process article metadata

## License

This extension is part of the ReadLtr project. 