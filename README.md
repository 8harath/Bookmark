# 📚 Bookmark Reminder

A modern bookmark management system with intelligent email reminders. Save articles, blogs, and web content, then get regular reminders to actually read them!

## Features

- ✨ **One-Click Saving**: Browser extension for instant bookmarking
- 🤖 **Smart Content Extraction**: Automatically extracts titles, excerpts, images, and full text
- ⏰ **Customizable Reminders**: Daily, weekly, bi-weekly, or monthly email reminders
- 📧 **Beautiful Emails**: Neobrutalism-styled reminder emails with bookmark previews
- 🎨 **Unique Design**: Bold neobrutalism UI with high contrast and chunky shadows
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 📱 **Responsive**: Works on all devices

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (Neobrutalism theme)
- **React Hook Form** + **Zod** (Form validation)

### Backend
- **Supabase** (PostgreSQL + Authentication)
- **Resend** (Email service)
- **Cheerio** (Web scraping)

### Infrastructure
- **Vercel** (Hosting + Cron jobs)
- **Chrome Extension** (Manifest V3)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Resend account (3,000 free emails/month)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bookmark-reminder.git
cd bookmark-reminder
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:
   ```sql
   -- Copy and paste the contents of:
   database/migrations/001_initial_schema.sql
   ```
3. Get your credentials from **Settings → API**:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

### 3. Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain OR use `onboarding@resend.dev` for testing
3. Get your API key from the dashboard

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_your_api_key

# Cron Secret (generate a random string)
CRON_SECRET=your-random-secret-string

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Install the Browser Extension

See [extension/README.md](extension/README.md) for detailed instructions.

Quick start:
1. Create icons in `extension/icons/` folder (16px, 48px, 128px)
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder

## Project Structure

```
bookmark-reminder/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── bookmarks/    # CRUD endpoints
│   │   │   ├── scrape/       # Content extraction
│   │   │   ├── settings/     # User settings
│   │   │   └── send-reminders/ # Cron job
│   │   ├── auth/              # Auth pages (login/signup)
│   │   ├── dashboard/         # Main app interface
│   │   ├── settings/          # Settings page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── dashboard/         # Dashboard-specific components
│   ├── lib/
│   │   └── supabase/          # Supabase clients
│   ├── utils/                  # Helper functions
│   └── types/                  # TypeScript types
├── extension/                  # Browser extension
│   ├── manifest.json
│   ├── popup/                 # Extension popup
│   ├── background/            # Background scripts
│   └── content/               # Content scripts
├── database/
│   └── migrations/            # SQL migration files
└── public/                     # Static assets
```

## Key Features Explained

### Content Scraping

The app automatically extracts:
- Page title (from og:title, title tag, or h1)
- Excerpt (from meta description or first paragraph)
- Featured image (from og:image or first large image)
- Full text content (cleaned and truncated to 10k chars)
- Metadata (author, publish date, etc.)

### Email Reminders

Users can configure:
- **Frequency**: Daily, weekly, bi-weekly, or monthly
- **Time**: Specific hour in their timezone
- **Day**: Day of week (for weekly) or day of month (for monthly)
- **Batch Size**: How many bookmarks per email (1-10)
- **Content**: Include/exclude images and excerpts

Cron job runs **hourly** and checks which users should receive reminders.

### Database Schema

**Three main tables:**

1. **bookmarks**: Stores all saved content
2. **user_settings**: Per-user reminder preferences
3. **email_logs**: Tracks sent emails for monitoring

All tables have Row Level Security (RLS) enabled for data protection.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variables from `.env.local`
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Set up serverless functions
- Configure the cron job (runs hourly)

### Update Extension for Production

In `extension/popup/popup.js` and `extension/background/service-worker.js`:

```javascript
const API_BASE = 'https://your-app.vercel.app'
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

### Bookmarks
- `GET /api/bookmarks` - List bookmarks (with filters/sorting)
- `POST /api/bookmarks` - Create bookmark
- `PATCH /api/bookmarks/[id]` - Update bookmark
- `DELETE /api/bookmarks/[id]` - Delete bookmark

### Other
- `POST /api/scrape` - Extract content from URL
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings
- `GET /api/send-reminders` - Cron job (protected)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `CRON_SECRET` | Secret to protect cron endpoint | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Verify email
- [ ] Log in
- [ ] Log out

**Bookmarks:**
- [ ] Save bookmark via web dashboard
- [ ] Save bookmark via extension
- [ ] Edit bookmark
- [ ] Mark as read
- [ ] Archive bookmark
- [ ] Delete bookmark

**Settings:**
- [ ] Change reminder frequency
- [ ] Update email preferences
- [ ] Settings persist after logout

**Emails:**
- [ ] Receive welcome email
- [ ] Receive reminder email at scheduled time
- [ ] Unsubscribe works

### Testing Cron Job Locally

You can manually trigger the cron job:

```bash
curl http://localhost:3000/api/send-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## Troubleshooting

### Common Issues

**"Failed to fetch" errors in extension:**
- Make sure the Next.js dev server is running
- Check that API_BASE URL is correct
- Verify you're logged in to the web app

**Emails not sending:**
- Check Resend API key is valid
- Verify sender email is verified in Resend
- Check cron job is configured in `vercel.json`

**Database errors:**
- Ensure all migrations have been run
- Check RLS policies are enabled
- Verify service role key is correct

**Content scraping fails:**
- Some sites block scraping (anti-bot protection)
- Check URL is valid and accessible
- Try with different websites

## Security

- Passwords hashed with bcrypt (via Supabase)
- Row Level Security (RLS) enforced on all tables
- JWT tokens with 1-hour expiry
- HTTPS enforced in production
- No sensitive data in client-side code
- Cron endpoint protected with secret

## Performance

- Server-side rendering for fast page loads
- Lazy loading for images
- Database indexes on frequently queried columns
- Pagination for large bookmark lists
- 10-second timeout on scraping requests

## Future Enhancements

- [ ] AI-powered content summaries
- [ ] Full-text search
- [ ] Tag-based filtering
- [ ] Export bookmarks (JSON, CSV, HTML)
- [ ] Import from browser bookmarks
- [ ] Mobile apps (React Native)
- [ ] Dark mode
- [ ] Collaborative collections
- [ ] Browser sync across devices

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Open a new issue with details about your problem

## Acknowledgments

- Neobrutalism design inspired by [Hype4 Academy](https://hype4.academy/articles/design/neobrutalism-design)
- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Resend](https://resend.com/)
- Icons from [Emoji Favicons](https://favicon.io/emoji-favicons/)

---

**Built with ❤️ by [Your Name]**

🌟 If you find this project helpful, please star it on GitHub!
