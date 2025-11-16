# Production Deployment Checklist

This checklist ensures your Bookmark Reminder application is production-ready before deployment.

## ✅ Pre-Deployment Checklist

### 1. Environment Setup

- [ ] **Supabase Production Database**
  - [ ] Create production Supabase project (separate from dev)
  - [ ] Run all database migrations
  - [ ] Verify RLS policies are enabled
  - [ ] Test database triggers
  - [ ] Set up database backups (automatic in Supabase)

- [ ] **Resend Email Service**
  - [ ] Verify custom domain (required for production)
  - [ ] Test email delivery to multiple providers (Gmail, Outlook, Yahoo)
  - [ ] Configure DKIM, SPF, and DMARC records
  - [ ] Set up email templates with correct sender address

- [ ] **Environment Variables (Vercel)**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
  RESEND_API_KEY=your-resend-api-key
  CRON_SECRET=generate-new-random-secret
  NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
  NODE_ENV=production
  ```

### 2. Security Checks

- [ ] **API Security**
  - [ ] Rate limiting enabled on all endpoints
  - [ ] All sensitive routes require authentication
  - [ ] CORS configured for your domain only
  - [ ] Service role key never exposed to client
  - [ ] CRON_SECRET is strong and random

- [ ] **Database Security**
  - [ ] RLS policies tested for all tables
  - [ ] No public access to sensitive data
  - [ ] Database password is strong
  - [ ] Service role key rotated from development

- [ ] **Extension Security**
  - [ ] host_permissions updated with production URL
  - [ ] No localhost URLs in production build
  - [ ] Content Security Policy configured

### 3. Code Quality

- [ ] **Testing**
  - [ ] Manual testing completed (see test checklist)
  - [ ] All critical flows work (signup, login, bookmark, email)
  - [ ] Error pages tested (404, 500)
  - [ ] Rate limiting tested

- [ ] **Performance**
  - [ ] Images optimized and lazy-loaded
  - [ ] Database queries optimized with indexes
  - [ ] API responses under 2 seconds
  - [ ] Lighthouse score >90

### 4. Extension Setup

- [ ] **Generate Icons**
  ```bash
  # Open scripts/create-extension-icons.html in browser
  # Download all three icons to extension/icons/
  ```

- [ ] **Update Configuration**
  - [ ] Change API_BASE in `popup/popup.js`
  - [ ] Change API_BASE in `background/service-worker.js`
  - [ ] Update `manifest.json` host_permissions
  - [ ] Test extension with production API

- [ ] **Build for Production**
  ```bash
  cd extension
  # Update API_BASE URLs manually or run build script
  ./build.sh production  # if on Mac/Linux
  # OR manually update popup.js and service-worker.js
  ```

### 5. Email Configuration

- [ ] **Resend Setup**
  - [ ] Domain verified
  - [ ] Update sender email in `src/app/api/send-reminders/route.ts`
  - [ ] Change from: `'Bookmark Reminder <reminders@yourdomain.com>'`
  - [ ] Test email with your email address
  - [ ] Check spam folder

- [ ] **Email Content**
  - [ ] Test email renders in Gmail
  - [ ] Test email renders in Outlook
  - [ ] Test email renders on mobile
  - [ ] All images load properly
  - [ ] Links work correctly

### 6. Vercel Deployment

- [ ] **Deploy Application**
  ```bash
  git push origin main
  # OR deploy via Vercel dashboard
  ```

- [ ] **Verify Deployment**
  - [ ] App loads at production URL
  - [ ] All pages work
  - [ ] Authentication works
  - [ ] API endpoints work
  - [ ] Cron job is configured

- [ ] **Check Cron Job**
  - [ ] Go to Vercel → Project → Cron
  - [ ] Verify schedule: `0 * * * *` (hourly)
  - [ ] Check logs after first run
  - [ ] Manually test: `curl https://your-app.vercel.app/api/send-reminders -H "Authorization: Bearer YOUR_CRON_SECRET"`

### 7. Post-Deployment Testing

- [ ] **Web Application**
  - [ ] Create new account
  - [ ] Verify email works
  - [ ] Log in successfully
  - [ ] Save a bookmark
  - [ ] Edit a bookmark
  - [ ] Delete a bookmark
  - [ ] Update settings
  - [ ] Test reminder scheduling

- [ ] **Browser Extension**
  - [ ] Install extension in Chrome
  - [ ] Log in via web app
  - [ ] Save bookmark from extension
  - [ ] Verify bookmark appears in dashboard
  - [ ] Test keyboard shortcut (Ctrl+Shift+S)
  - [ ] Test context menu

- [ ] **Email System**
  - [ ] Wait for scheduled reminder time
  - [ ] Verify email received
  - [ ] Check all links work
  - [ ] Test unsubscribe functionality

### 8. Monitoring & Analytics

- [ ] **Vercel Analytics**
  - [ ] Enabled (already in layout.tsx)
  - [ ] Check dashboard for traffic

- [ ] **Error Monitoring** (Optional but Recommended)
  - [ ] Set up Sentry account
  - [ ] Add Sentry DSN to environment
  - [ ] Test error reporting

- [ ] **Database Monitoring**
  - [ ] Check Supabase dashboard
  - [ ] Monitor query performance
  - [ ] Set up alerts for downtime

### 9. Documentation

- [ ] **Update README**
  - [ ] Add production URL
  - [ ] Update setup instructions
  - [ ] Add deployment guide

- [ ] **User Guide** (Optional)
  - [ ] How to use the extension
  - [ ] How to set up reminders
  - [ ] FAQ section

### 10. Browser Extension Publishing

- [ ] **Chrome Web Store**
  - [ ] Create developer account ($5 fee)
  - [ ] Prepare store listing:
    - [ ] Extension name: "Bookmark Reminder"
    - [ ] Short description (132 chars)
    - [ ] Detailed description
    - [ ] 1280x800 screenshots (at least 1)
    - [ ] 128x128 icon
    - [ ] Privacy policy URL
    - [ ] Support URL/email
  - [ ] Zip extension folder: `zip -r extension.zip extension/`
  - [ ] Upload to Chrome Web Store
  - [ ] Submit for review (takes 1-3 business days)

- [ ] **Firefox Add-ons** (Optional)
  - [ ] Create Mozilla account
  - [ ] Same assets as Chrome
  - [ ] Submit source code
  - [ ] Review takes 1-2 weeks

## 🚨 Critical Production Changes

### Files That MUST Be Updated:

1. **extension/popup/popup.js** (Line 1)
   ```javascript
   const API_BASE = 'https://your-app.vercel.app'  // UPDATE THIS
   ```

2. **extension/background/service-worker.js** (Line 1)
   ```javascript
   const API_BASE = 'https://your-app.vercel.app'  // UPDATE THIS
   ```

3. **extension/manifest.json**
   ```json
   "host_permissions": [
     "https://your-app.vercel.app/*"  // UPDATE THIS
   ]
   ```

4. **src/app/api/send-reminders/route.ts** (Line ~118)
   ```typescript
   from: 'Bookmark Reminder <reminders@yourdomain.com>',  // UPDATE THIS
   ```

5. **next.config.js** (Optional - add your domain to image hosts)

## 📊 Performance Targets

- [ ] **Lighthouse Scores**
  - [ ] Performance: >90
  - [ ] Accessibility: >90
  - [ ] Best Practices: >90
  - [ ] SEO: >90

- [ ] **API Response Times**
  - [ ] GET /api/bookmarks: <500ms
  - [ ] POST /api/bookmarks: <2s (including scraping)
  - [ ] POST /api/scrape: <10s
  - [ ] GET /api/send-reminders: <30s

- [ ] **Database**
  - [ ] Query times: <100ms for most queries
  - [ ] Proper indexes on frequently queried columns

## 🔍 Troubleshooting

### Common Issues:

**Issue: "Failed to fetch" in extension**
- Check API_BASE URL is correct
- Verify host_permissions in manifest.json
- Check CORS settings on server

**Issue: Emails not sending**
- Verify Resend domain is verified
- Check Resend API key is correct
- Verify sender email domain matches verified domain
- Check Vercel cron logs

**Issue: Rate limiting too strict**
- Adjust limits in src/lib/rate-limit.ts
- For production, consider Redis-based rate limiting

**Issue: Images not loading**
- Add domain to next.config.js remotePatterns
- Verify URLs are HTTPS
- Check browser console for CORS errors

## ✨ Optional Enhancements

- [ ] Custom domain (e.g., bookmarkreminder.com)
- [ ] SSL certificate (automatic with Vercel)
- [ ] CDN for static assets (built-in with Vercel)
- [ ] Database connection pooling (already handled by Supabase)
- [ ] Redis for caching (for high traffic)
- [ ] Multiple region deployment (Vercel Enterprise)

## 📝 Final Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database migrations run
- [ ] Email domain verified
- [ ] Extension icons created
- [ ] Extension configuration updated
- [ ] Privacy policy page created
- [ ] Terms of service page created (if required)
- [ ] Support email/form set up
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Manual testing completed
- [ ] Documentation updated

## 🎉 You're Ready!

Once all items are checked:
1. Deploy to Vercel
2. Submit extension to Chrome Web Store
3. Monitor for issues in first 24 hours
4. Collect user feedback
5. Iterate and improve!

---

**Questions? Issues?** Check the main README or open a GitHub issue.
