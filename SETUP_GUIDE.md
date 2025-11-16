# Complete Setup Guide for Bookmark Reminder

This guide will walk you through setting up the entire Bookmark Reminder application from scratch.

## Step 1: Initial Setup

### 1.1 Install Node.js
Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be v18 or higher
npm --version
```

### 1.2 Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd bookmark-reminder
npm install
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Fill in details:
   - **Name**: bookmark-reminder
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for project to be created (takes ~2 minutes)

### 2.2 Run Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/migrations/001_initial_schema.sql`
4. Paste into the editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

### 2.3 Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see three tables:
   - `bookmarks`
   - `user_settings`
   - `email_logs`

### 2.4 Get API Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: Starts with `eyJ...`
   - **service_role key**: Starts with `eyJ...` (⚠️ Keep this secret!)

## Step 3: Resend Setup

### 3.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier includes 3,000 emails/month)
3. Verify your email

### 3.2 Get API Key

1. Go to **API Keys** in the Resend dashboard
2. Click "Create API Key"
3. Name it: "bookmark-reminder"
4. Copy the key (starts with `re_...`)

### 3.3 Set Up Email Sender (Optional for Testing)

**For Testing:**
- Use the default sender: `onboarding@resend.dev`
- No setup needed!

**For Production:**
1. Go to **Domains** in Resend
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides
5. Wait for verification (~5 minutes to 24 hours)

## Step 4: Environment Configuration

### 4.1 Create .env.local File

In the project root, create a file named `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

# Resend Email Service
RESEND_API_KEY=re_your_api_key

# Cron Secret (generate a random string)
CRON_SECRET=your-random-secret-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4.2 Generate Cron Secret

Generate a random secret:

**Mac/Linux:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Or use an online tool:**
Go to [randomkeygen.com](https://randomkeygen.com/) and use a "Fort Knox Password"

## Step 5: Run the Application

### 5.1 Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
- ready in X.Xs
```

### 5.2 Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "GET STARTED"
3. Create an account:
   - Enter your email
   - Create a password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - Click "CREATE ACCOUNT"
4. Check your email for verification link
5. Click the link to verify
6. Log in with your credentials
7. You should be redirected to the dashboard!

## Step 6: Browser Extension Setup

### 6.1 Create Extension Icons

You need three icon files in `extension/icons/`:

**Option 1: Use Emoji (Easiest)**
1. Go to [favicon.io/emoji-favicons/](https://favicon.io/emoji-favicons/)
2. Search for "books" emoji (📚)
3. Download the favicon
4. Unzip and find the PNG files
5. Rename and copy to `extension/icons/`:
   - `favicon-16x16.png` → `icon-16.png`
   - `android-chrome-192x192.png` → Resize to 48x48 → `icon-48.png`
   - `android-chrome-512x512.png` → Resize to 128x128 → `icon-128.png`

**Option 2: Create Your Own**
- Use Figma, Canva, or Photoshop
- Create a simple icon with a black border
- Export as PNG at 16px, 48px, and 128px

### 6.2 Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Navigate to your project folder
6. Select the `extension` folder
7. Click "Select Folder"
8. The extension should appear in your toolbar!

### 6.3 Test Extension

1. Make sure `npm run dev` is running
2. Make sure you're logged in to the web app
3. Go to any website (e.g., a blog article)
4. Click the Bookmark Reminder extension icon
5. Click "SAVE BOOKMARK"
6. You should see "Bookmark saved!" message
7. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
8. Your bookmark should appear!

**Keyboard Shortcut:**
- Windows/Linux: `Ctrl + Shift + S`
- Mac: `Cmd + Shift + S`

## Step 7: Configure Reminder Settings

1. Log in to the web app
2. Click "SETTINGS" in the header
3. Configure your preferences:
   - **Frequency**: How often you want reminders (daily/weekly/monthly)
   - **Time**: What time of day (in your timezone)
   - **Batch Size**: How many bookmarks per email
   - **Include Images**: Toggle image previews in emails
   - **Include Excerpts**: Toggle text excerpts in emails
4. Click "SAVE SETTINGS"

## Step 8: Test Email Reminders (Optional)

### 8.1 Manually Trigger Cron Job

Instead of waiting for the scheduled time, trigger manually:

```bash
curl http://localhost:3000/api/send-reminders \
  -H "Authorization: Bearer your-cron-secret-from-env"
```

Replace `your-cron-secret-from-env` with the value from your `.env.local`

### 8.2 Check Email

- If you have unread bookmarks and reminders are enabled, you should receive an email
- Check your inbox (and spam folder)
- Email subject: "📚 Your Bookmarks: X saved reads waiting"

## Step 9: Deploy to Production

### 9.1 Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bookmark-reminder.git
git push -u origin main
```

### 9.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Environment Variables**: Add all from `.env.local`
5. Click "Deploy"
6. Wait for deployment (takes ~2 minutes)
7. Get your production URL: `https://your-app.vercel.app`

### 9.3 Update Extension for Production

In `extension/popup/popup.js` and `extension/background/service-worker.js`:

Change:
```javascript
const API_BASE = 'http://localhost:3000'
```

To:
```javascript
const API_BASE = 'https://your-app.vercel.app'
```

Also update `manifest.json` host_permissions:
```json
"host_permissions": [
  "https://your-app.vercel.app/*"
]
```

Reload the extension in Chrome.

### 9.4 Verify Cron Job

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Cron"
3. You should see: `0 * * * *` (runs hourly)
4. Check "Logs" tab to see cron executions

## Step 10: Monitor & Maintain

### Check Email Logs

In Supabase:
1. Go to **Table Editor** → `email_logs`
2. View sent emails, failures, and errors

### Check Bookmark Stats

In Supabase:
1. Go to **SQL Editor**
2. Run queries like:
```sql
-- Total bookmarks
SELECT COUNT(*) FROM bookmarks;

-- Bookmarks per user
SELECT user_id, COUNT(*)
FROM bookmarks
GROUP BY user_id;

-- Recent emails
SELECT * FROM email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue: "Failed to fetch" in extension

**Solution:**
- Check that `npm run dev` is running
- Verify API_BASE URL in extension files
- Clear extension storage: `chrome://extensions/` → Extension details → "Clear storage"
- Reload extension

### Issue: "Unauthorized" errors

**Solution:**
- Log out and log back in
- Check Supabase credentials in `.env.local`
- Verify RLS policies are enabled

### Issue: Emails not sending

**Solution:**
- Check Resend API key is valid
- Verify `from` email in `src/app/api/send-reminders/route.ts`
- For production, use a verified domain
- Check Resend dashboard for error logs

### Issue: Database errors

**Solution:**
- Re-run the migration SQL
- Check that all tables exist in Supabase
- Verify RLS policies are enabled
- Check service role key is correct

## Next Steps

- Customize the neobrutalism theme colors
- Add your own branding and logo
- Set up a custom domain
- Publish extension to Chrome Web Store
- Add more features (search, tags, export, etc.)

## Support

If you get stuck:
1. Check the main [README.md](README.md)
2. Review error messages in browser console
3. Check Supabase and Resend dashboards
4. Open an issue on GitHub

---

**Congratulations! Your Bookmark Reminder app is now fully set up! 🎉**
