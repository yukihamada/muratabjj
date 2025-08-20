const fs = require('fs');
const path = require('path');

// SVGアイコンのテンプレート
const createSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#13131a"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="#ea384c" opacity="0.15"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#ea384c" text-anchor="middle" dominant-baseline="middle">M</text>
  <circle cx="${size/2}" cy="${size * 0.3}" r="${size * 0.05}" fill="#ea384c"/>
  <path d="M${size * 0.3} ${size * 0.6} Q${size/2} ${size * 0.4} ${size * 0.7} ${size * 0.6}" fill="none" stroke="#ea384c" stroke-width="${size * 0.02}" stroke-linecap="round"/>
</svg>`;

// SVGファイルを作成
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(__dirname, `../public/icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

// Next.jsのビルド時に使用するアイコンも作成
const faviconSVG = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#13131a"/>
  <circle cx="16" cy="16" r="12" fill="#ea384c" opacity="0.15"/>
  <text x="16" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ea384c" text-anchor="middle" dominant-baseline="middle">M</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSVG);
console.log('Created favicon.svg');