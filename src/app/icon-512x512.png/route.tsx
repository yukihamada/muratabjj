import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#13131a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="512" height="512" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="204" fill="#ea384c" opacity="0.15"/>
          <text x="256" y="256" fontSize="154" fontWeight="bold" fill="#ea384c" textAnchor="middle" dominantBaseline="middle">M</text>
          <circle cx="256" cy="154" r="26" fill="#ea384c"/>
          <path d="M154 307 Q256 205 358 307" fill="none" stroke="#ea384c" strokeWidth="10" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}