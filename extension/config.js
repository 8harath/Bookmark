/**
 * Extension Configuration
 *
 * IMPORTANT: Before building for production:
 * 1. Update API_BASE_URL to your production URL
 * 2. Update manifest.json host_permissions with your domain
 * 3. Zip the extension folder
 * 4. Upload to Chrome Web Store
 */

// Development: Use localhost
// Production: Use your deployed URL
const API_BASE_URL = typeof chrome !== 'undefined' && chrome.runtime
  ? (chrome.runtime.getManifest().host_permissions?.[0]?.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://your-app.vercel.app') // CHANGE THIS TO YOUR PRODUCTION URL
  : 'http://localhost:3000'

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL }
}
