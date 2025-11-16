/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Common CDNs and image hosting services
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'miro.medium.com' },
      { protocol: 'https', hostname: '*.medium.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      // For scraped bookmark images, allow external images
      // but validate URLs before storing in database
      { protocol: 'https', hostname: '*.blogspot.com' },
      { protocol: 'https', hostname: '*.wordpress.com' },
    ],
    // Set reasonable limits
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Disable dangerous features in production
    dangerouslyAllowSVG: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig
