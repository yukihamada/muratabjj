import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#13131a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="192" height="192" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="76" fill="#ea384c" opacity="0.15"/>
          <text x="96" y="96" fontSize="58" fontWeight="bold" fill="#ea384c" textAnchor="middle" dominantBaseline="middle">M</text>
          <circle cx="96" cy="58" r="10" fill="#ea384c"/>
          <path d="M58 115 Q96 77 134 115" fill="none" stroke="#ea384c" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  )
}