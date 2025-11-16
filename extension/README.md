# Bookmark Reminder - Browser Extension

## Installation

### For Development

1. **Create Extension Icons**
   - Create three icon files in the `extension/icons/` folder:
     - `icon-16.png` (16x16 pixels)
     - `icon-48.png` (48x48 pixels)
     - `icon-128.png` (128x128 pixels)
   - Use a simple bookmark icon (📚) or create your own design
   - Icons should have a transparent background

2. **Update API URLs**
   - In `popup/popup.js` and `background/service-worker.js`, update `API_BASE`:
   - Development: `http://localhost:3000`
   - Production: `https://your-app.vercel.app`

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` folder
   - The extension should now appear in your browser!

4. **Test the Extension**
   - Make sure your Next.js app is running (`npm run dev`)
   - Log in to the web app first
   - Click the extension icon to save the current page
   - Or use keyboard shortcut: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)

### For Production

1. Update `manifest.json` host_permissions with your production URL
2. Update API_BASE in JavaScript files
3. Zip the extension folder
4. Submit to Chrome Web Store

## Features

- ⚡ One-click bookmark saving
- ⌨️ Keyboard shortcut: Ctrl+Shift+S (Cmd+Shift+S on Mac)
- 🖱️ Right-click context menu
- 📋 Automatic content extraction (title, excerpt, image)
- 🔔 Save notifications
- 🎨 Neobrutalism UI design

## Files Structure

```
extension/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Neobrutalism styles
│   └── popup.js           # Popup logic
├── background/
│   └── service-worker.js  # Background tasks
├── content/
│   └── content-script.js  # Page interaction
└── icons/
    ├── icon-16.png        # Small icon
    ├── icon-48.png        # Medium icon
    └── icon-128.png       # Large icon
```

## Creating Icons

You can use online tools to create simple icons:

1. **Method 1: Use an emoji**
   - Go to https://favicon.io/emoji-favicons/
   - Search for "bookmark" or "books" emoji (📚)
   - Download and resize to 16px, 48px, and 128px

2. **Method 2: Use Figma/Canva**
   - Create a simple design with black borders
   - Export as PNG at different sizes

3. **Method 3: Use ImageMagick (command line)**
   ```bash
   # If you have a single large icon (icon.png):
   convert icon.png -resize 16x16 icon-16.png
   convert icon.png -resize 48x48 icon-48.png
   convert icon.png -resize 128x128 icon-128.png
   ```

## Permissions Explained

- `activeTab`: Read current tab URL and title
- `storage`: Store authentication token locally
- `contextMenus`: Add right-click menu item
- `host_permissions`: Make API requests to your app

## Troubleshooting

**Extension doesn't load:**
- Check that all files are in the correct folders
- Make sure icons exist in the `icons/` folder
- Check browser console for errors

**Can't save bookmarks:**
- Make sure you're logged in to the web app first
- Check that API_BASE URLs are correct
- Verify CORS settings on your API

**Authentication issues:**
- Log out and log back in to the web app
- Clear extension storage and re-authenticate

## Publishing to Chrome Web Store

1. Create a developer account ($5 one-time fee)
2. Prepare store listing assets:
   - 1280x800 screenshots (at least 1)
   - 128x128 icon
   - Detailed description
   - Privacy policy URL
3. Zip the extension folder
4. Upload to Chrome Web Store dashboard
5. Submit for review (takes 1-3 days)
