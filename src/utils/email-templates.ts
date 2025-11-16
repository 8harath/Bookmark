import type { Database } from '@/types/database'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface ReminderEmailData {
  bookmarks: Bookmark[]
  settings: UserSettings
  dashboardUrl: string
  settingsUrl: string
  unsubscribeUrl: string
}

export function generateReminderEmailHtml(data: ReminderEmailData): string {
  const { bookmarks, settings, dashboardUrl, settingsUrl, unsubscribeUrl } = data

  const bookmarkCards = bookmarks.map((bookmark) => {
    const domain = new URL(bookmark.url).hostname.replace('www.', '')
    const date = new Date(bookmark.created_at).toLocaleDateString()

    return `
      <div style="border: 4px solid #000; margin: 20px 0; background: #fff; box-shadow: 8px 8px 0px #000;">
        ${settings.include_images && bookmark.image_url ? `
          <img
            src="${bookmark.image_url}"
            alt="${bookmark.title}"
            style="width: 100%; height: 200px; object-fit: cover; border-bottom: 4px solid #000; display: block;"
          />
        ` : ''}

        <div style="padding: 20px;">
          <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; font-family: Arial, sans-serif;">
            ${bookmark.title}
          </h2>

          ${settings.include_excerpts && bookmark.excerpt ? `
            <p style="font-size: 14px; line-height: 1.6; margin: 10px 0; color: #333; font-family: 'Courier New', monospace;">
              ${bookmark.excerpt}
            </p>
          ` : ''}

          <p style="font-size: 12px; color: #666; margin: 10px 0; font-family: 'Courier New', monospace;">
            ${domain} • Saved on ${date}
          </p>

          <a
            href="${bookmark.url}"
            style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; border: 3px solid #000; margin-top: 10px; font-family: Arial, sans-serif;"
          >
            READ NOW →
          </a>
        </div>
      </div>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Bookmark Reminders</title>
</head>
<body style="font-family: 'Courier New', monospace; background: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- HEADER -->
    <div style="border: 4px solid #000; padding: 20px; background: #000; color: #fff; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; font-family: Arial, sans-serif;">
        📚 TIME TO REVISIT YOUR BOOKMARKS
      </h1>
    </div>

    <!-- INTRO -->
    <div style="padding: 20px 0;">
      <p style="font-size: 16px; margin: 0; font-family: 'Courier New', monospace;">
        You have <strong>${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'}</strong> waiting to be explored:
      </p>
    </div>

    <!-- BOOKMARK CARDS -->
    ${bookmarkCards}

    <!-- FOOTER -->
    <div style="border-top: 4px solid #000; margin-top: 40px; padding-top: 20px; font-size: 12px; text-align: center; color: #666; font-family: 'Courier New', monospace;">
      <p>
        <a href="${dashboardUrl}" style="color: #000; text-decoration: underline;">View all bookmarks</a> |
        <a href="${settingsUrl}" style="color: #000; text-decoration: underline;">Manage settings</a> |
        <a href="${unsubscribeUrl}" style="color: #000; text-decoration: underline;">Unsubscribe</a>
      </p>
      <p style="margin-top: 10px;">
        Bookmark Reminder © ${new Date().getFullYear()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateReminderEmailText(data: ReminderEmailData): string {
  const { bookmarks } = data

  const bookmarkList = bookmarks.map((bookmark, index) => {
    return `
${index + 1}. ${bookmark.title}
   ${bookmark.url}
   ${bookmark.excerpt || ''}
    `
  }).join('\n')

  return `
TIME TO REVISIT YOUR BOOKMARKS

You have ${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'} waiting to be explored:

${bookmarkList}

---

View all bookmarks: ${data.dashboardUrl}
Manage settings: ${data.settingsUrl}
Unsubscribe: ${data.unsubscribeUrl}

Bookmark Reminder © ${new Date().getFullYear()}
  `.trim()
}
