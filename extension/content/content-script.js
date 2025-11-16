// Content script for extracting page metadata
// This runs on every page and can extract additional information

// Extract page metadata
function extractPageMetadata() {
  const metadata = {
    url: window.location.href,
    title: document.title,
    description: '',
    image: '',
    author: '',
  }

  // Get meta description
  const metaDescription = document.querySelector('meta[name="description"]') ||
                          document.querySelector('meta[property="og:description"]')
  if (metaDescription) {
    metadata.description = metaDescription.getAttribute('content')
  }

  // Get og:image
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage) {
    metadata.image = ogImage.getAttribute('content')
  }

  // Get author
  const authorMeta = document.querySelector('meta[name="author"]')
  if (authorMeta) {
    metadata.author = authorMeta.getAttribute('content')
  }

  return metadata
}

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMetadata') {
    const metadata = extractPageMetadata()
    sendResponse(metadata)
  }
  return true
})

// Optional: Add visual indicator when bookmark is saved
function showSavedIndicator() {
  const indicator = document.createElement('div')
  indicator.textContent = '✓ Bookmark Saved!'
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #000;
    color: #fff;
    padding: 12px 24px;
    border: 3px solid #000;
    box-shadow: 6px 6px 0px #000;
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 14px;
    z-index: 999999;
    text-transform: uppercase;
  `
  document.body.appendChild(indicator)

  setTimeout(() => {
    indicator.style.transition = 'opacity 0.3s ease'
    indicator.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(indicator)
    }, 300)
  }, 2000)
}

// Listen for save confirmation from background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'bookmarkSaved') {
    showSavedIndicator()
  }
})
