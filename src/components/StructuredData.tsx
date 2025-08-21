export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Murata BJJ",
    "description": "ブラジリアン柔術を連携（Flow）中心で学ぶWebプラットフォーム",
    "url": "https://muratabjj.com",
    "logo": "https://muratabjj.com/favicon.svg",
    "image": "https://muratabjj.com/og-image.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "JP"
    },
    "sport": "Brazilian Jiu-Jitsu",
    "coach": {
      "@type": "Person",
      "name": "村田良蔵",
      "jobTitle": "ヘッドコーチ",
      "description": "SJJIF世界選手権マスター2黒帯フェザー級 2018・2019連覇"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "1200",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock",
        "url": "https://muratabjj.com/pricing",
        "description": "フル動画アクセス、フローエディタ全機能、アダプティブ復習システム"
      },
      {
        "@type": "Offer",
        "name": "Dojo Plan",
        "price": "6000",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock",
        "url": "https://muratabjj.com/pricing",
        "description": "Pro機能すべて＋カリキュラム配信、プライベートワークスペース"
      }
    ],
    "sameAs": [
      "https://twitter.com/muratabjj",
      "https://www.instagram.com/muratabjj",
      "https://www.youtube.com/muratabjj"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}