const API_BASE = 'http://localhost:3000' // Change to production URL when deployed

// Install event
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: 'save-bookmark',
    title: 'Save to Bookmarks',
    contexts: ['page', 'selection', 'link'],
  })

  console.log('Bookmark Reminder extension installed')
})

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-bookmark') {
    await saveCurrentPage(tab)
  }
})

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-bookmark') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    await saveCurrentPage(tab)
  }
})

// Save current page
async function saveCurrentPage(tab) {
  try {
    // Check if user is logged in
    const { auth } = await chrome.storage.local.get(['auth'])

    if (!auth || !auth.access_token) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon-48.png',
        title: 'Login Required',
        message: 'Please log in to save bookmarks',
        priority: 2,
      })
      return
    }

    // Show loading notification
    const notificationId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon-48.png',
      title: 'Saving Bookmark...',
      message: 'Please wait',
      priority: 1,
    })

    // Scrape page
    const scrapeRes = await fetch(`${API_BASE}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: tab.url }),
    })

    const scrapeData = await scrapeRes.json()

    if (!scrapeData.success) {
      throw new Error(scrapeData.error || 'Failed to load page content')
    }

    // Create bookmark
    const createRes = await fetch(`${API_BASE}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.access_token}`,
      },
      body: JSON.stringify({
        url: tab.url,
        title: scrapeData.data.title,
        excerpt: scrapeData.data.excerpt,
        content: scrapeData.data.content,
        image_url: scrapeData.data.image_url,
      }),
    })

    const createData = await createRes.json()

    // Clear loading notification
    chrome.notifications.clear(notificationId)

    if (!createData.success) {
      if (createRes.status === 409) {
        throw new Error('Already saved')
      } else if (createRes.status === 401) {
        // Token expired
        await chrome.storage.local.remove(['auth'])
        throw new Error('Login expired. Please log in again.')
      }
      throw new Error(createData.error || 'Failed to save')
    }

    // Success notification
    const successId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon-48.png',
      title: 'Bookmark Saved',
      message: 'Added to your collection',
      priority: 1,
    })

    // Auto-clear after 3 seconds
    setTimeout(() => {
      chrome.notifications.clear(successId)
    }, 3000)
  } catch (error) {
    console.error('Save error:', error)

    // Error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon-48.png',
      title: 'Failed to Save',
      message: error.message || 'Please try again',
      priority: 2,
    })
  }
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveBookmark') {
    saveCurrentPage(sender.tab)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep channel open for async response
  }
})
