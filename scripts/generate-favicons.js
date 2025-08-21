const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateFavicons() {
  const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="64" fill="#1e40af"/>
    <text x="256" y="320" font-family="Arial, sans-serif" font-size="320" font-weight="bold" fill="white" text-anchor="middle">柔</text>
  </svg>`;

  const publicDir = path.join(__dirname, '..', 'public');
  
  // Generate PNG favicons
  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 512];
  
  for (const size of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    
    console.log(`Generated favicon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  
  console.log('Generated apple-touch-icon.png');

  // Generate android-chrome icons
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

  console.log('Generated android-chrome icons');

  // Generate OGP image with BJJ theme
  const ogpContent = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0f172a"/>
    <rect x="0" y="0" width="1200" height="315" fill="#1e40af" opacity="0.1"/>
    <text x="600" y="200" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#1e40af" text-anchor="middle">Murata BJJ</text>
    <text x="600" y="280" font-family="Arial, sans-serif" font-size="48" fill="#64748b" text-anchor="middle">フローと動画で強くなる柔術学習プラットフォーム</text>
    <text x="600" y="400" font-family="Arial, sans-serif" font-size="36" fill="#94a3b8" text-anchor="middle">監修：村田 良蔵</text>
    <text x="600" y="450" font-family="Arial, sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">SJJIF世界選手権マスター2黒帯フェザー級 2018・2019 連覇</text>
  </svg>`;

  await sharp(Buffer.from(ogpContent))
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Generated OGP image');

  // Create favicon.ico (multi-resolution)
  console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error);