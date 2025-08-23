import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title') || 'Sample Video'
  
  // Create a simple SVG placeholder thumbnail
  const svg = `
    <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1a23" />
          <stop offset="100%" stop-color="#2a2a33" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      <circle cx="160" cy="90" r="30" fill="#ea384c" opacity="0.8" />
      <polygon points="150,75 150,105 175,90" fill="white" />
      <text x="160" y="130" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">
        ${title.substring(0, 25)}${title.length > 25 ? '...' : ''}
      </text>
    </svg>
  `.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}