const API_BASE = 'http://localhost:3000' // Change to production URL when deployed

// Get DOM elements
const loadingDiv = document.getElementById('loading')
const notLoggedInDiv = document.getElementById('not-logged-in')
const saveFormDiv = document.getElementById('save-form')
const successDiv = document.getElementById('success')
const errorDiv = document.getElementById('error')

const pageTitleEl = document.getElementById('page-title')
const pageUrlEl = document.getElementById('page-url')
const tagsInput = document.getElementById('tags-input')
const saveButton = document.getElementById('save-button')
const retryButton = document.getElementById('retry-button')
const statusMessage = document.getElementById('status-message')
const errorMessage = document.getElementById('error-message')
const loginLink = document.getElementById('login-link')
const dashboardLink1 = document.getElementById('dashboard-link-1')
const dashboardLink2 = document.getElementById('dashboard-link-2')

let currentTab = null

// Set dynamic URLs
function setDynamicUrls() {
  if (loginLink) loginLink.href = `${API_BASE}/auth/login`
  if (dashboardLink1) dashboardLink1.href = `${API_BASE}/dashboard`
  if (dashboardLink2) dashboardLink2.href = `${API_BASE}/dashboard`
}

// Initialize
async function init() {
  try {
    // Set URLs
    setDynamicUrls()

    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    currentTab = tab

    // Check if user is logged in
    const { auth } = await chrome.storage.local.get(['auth'])

    if (!auth || !auth.access_token) {
      showNotLoggedIn()
      return
    }

    // Show save form
    showSaveForm()
  } catch (error) {
    console.error('Init error:', error)
    showError('Failed to initialize. Please try again.')
  }
}

function showNotLoggedIn() {
  hideAll()
  notLoggedInDiv.style.display = 'block'
}

function showSaveForm() {
  hideAll()
  saveFormDiv.style.display = 'block'

  // Populate page info
  pageTitleEl.textContent = currentTab.title
  pageUrlEl.textContent = currentTab.url
}

function showSuccess() {
  hideAll()
  successDiv.style.display = 'block'

  // Auto-close after 2 seconds
  setTimeout(() => {
    window.close()
  }, 2000)
}

function showError(message) {
  hideAll()
  errorDiv.style.display = 'block'
  errorMessage.textContent = message
}

function hideAll() {
  loadingDiv.style.display = 'none'
  notLoggedInDiv.style.display = 'none'
  saveFormDiv.style.display = 'none'
  successDiv.style.display = 'none'
  errorDiv.style.display = 'none'
}

// Save bookmark
async function saveBookmark() {
  saveButton.disabled = true
  saveButton.textContent = 'LOADING...'
  statusMessage.textContent = 'Extracting content from page...'

  try {
    // Get auth token
    const { auth } = await chrome.storage.local.get(['auth'])
    if (!auth || !auth.access_token) {
      showNotLoggedIn()
      return
    }

    // First, scrape the page
    const scrapeRes = await fetch(`${API_BASE}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentTab.url }),
    })

    const scrapeData = await scrapeRes.json()

    if (!scrapeData.success) {
      throw new Error(scrapeData.error || 'Failed to load page content')
    }

    statusMessage.textContent = 'Saving bookmark...'

    // Parse tags
    const tagsValue = tagsInput.value.trim()
    const tags = tagsValue ? tagsValue.split(',').map(t => t.trim()) : []

    // Create bookmark
    const createRes = await fetch(`${API_BASE}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.access_token}`,
      },
      body: JSON.stringify({
        url: currentTab.url,
        title: scrapeData.data.title,
        excerpt: scrapeData.data.excerpt,
        content: scrapeData.data.content,
        image_url: scrapeData.data.image_url,
        tags,
      }),
    })

    const createData = await createRes.json()

    if (!createData.success) {
      if (createRes.status === 409) {
        throw new Error('You have already saved this page')
      } else if (createRes.status === 401) {
        // Token expired, clear storage
        await chrome.storage.local.remove(['auth'])
        showNotLoggedIn()
        return
      }
      throw new Error(createData.error || 'Failed to save bookmark')
    }

    // Success!
    showSuccess()
  } catch (error) {
    console.error('Save error:', error)
    showError(error.message || 'Failed to save bookmark')
  } finally {
    saveButton.disabled = false
    saveButton.textContent = 'SAVE BOOKMARK'
    statusMessage.textContent = ''
  }
}

// Event listeners
saveButton.addEventListener('click', saveBookmark)
retryButton.addEventListener('click', init)

// Start
init()
