import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { rateLimit, scrapeLimiter, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limit'

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per user/IP
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimit(request, clientId, 10, scrapeLimiter)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again in a minute.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const { url } = await request.json()

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Check URL length
    if (url.length > 2048) {
      return NextResponse.json(
        { success: false, error: 'URL too long (max 2048 characters)' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { success: false, error: 'Only HTTP/HTTPS URLs are supported' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if it's a file URL
    const fileExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.zip']
    const isFile = fileExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext))

    if (isFile) {
      return NextResponse.json({
        success: true,
        data: {
          url,
          title: parsedUrl.pathname.split('/').pop() || 'File',
          excerpt: 'Direct file link',
          content: '',
          image_url: parsedUrl.pathname.match(/\.(jpg|jpeg|png|gif)$/i) ? url : null,
          favicon_url: `${parsedUrl.origin}/favicon.ico`,
          author: null,
          published_at: null,
          word_count: 0,
        },
      })
    }

    // Fetch the page
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Page not found (404)' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: `Failed to fetch page (${response.status})` },
        { status: 500 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract title (priority: og:title, twitter:title, title tag, h1)
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      parsedUrl.hostname

    // Extract excerpt (priority: og:description, meta description, first paragraph)
    const excerpt =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('p').first().text().substring(0, 200) ||
      'No description available'

    // Extract image (priority: og:image, twitter:image, first large image)
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null

    if (!imageUrl) {
      const firstImg = $('img[src]').first().attr('src')
      if (firstImg) {
        imageUrl = new URL(firstImg, url).href
      }
    }

    // Extract favicon
    let faviconUrl =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      `${parsedUrl.origin}/favicon.ico`

    if (faviconUrl && !faviconUrl.startsWith('http')) {
      faviconUrl = new URL(faviconUrl, url).href
    }

    // Extract content from article, main, or body
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      'body',
    ]

    let content = ''
    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length) {
        // Remove unwanted elements
        element.find('script, style, nav, footer, header, aside, .ad, .advertisement').remove()
        content = element.text().trim()
        if (content.length > 100) break
      }
    }

    // Truncate content to 10,000 characters
    if (content.length > 10000) {
      content = content.substring(0, 10000)
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim()
    const cleanTitle = title.replace(/\s+/g, ' ').trim().substring(0, 500)
    const cleanExcerpt = excerpt.replace(/\s+/g, ' ').trim().substring(0, 1000)

    // Extract additional metadata
    const author = $('meta[name="author"]').attr('content') || null
    const published = $('meta[property="article:published_time"]').attr('content') || null
    const wordCount = content.split(/\s+/).length

    return NextResponse.json({
      success: true,
      data: {
        url,
        title: cleanTitle,
        excerpt: cleanExcerpt,
        content,
        image_url: imageUrl,
        favicon_url: faviconUrl,
        author,
        published_at: published,
        word_count: wordCount,
      },
    })
  } catch (error: any) {
    console.error('Scraping error:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timed out (10 seconds)' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scrape URL',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
