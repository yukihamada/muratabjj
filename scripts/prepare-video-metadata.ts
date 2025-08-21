import * as fs from 'fs'
import * as path from 'path'

// Video metadata for manual upload
const videos = [
  {
    filePath: '/Users/yuki/Downloads/IMG_8194.MOV',
    title_ja: 'BJJテクニック動画 #1',
    title_en: 'BJJ Technique Video #1',
    title_pt: 'Vídeo de Técnica BJJ #1',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8455.MOV',
    title_ja: 'BJJテクニック動画 #2',
    title_en: 'BJJ Technique Video #2',
    title_pt: 'Vídeo de Técnica BJJ #2',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8107.MOV',
    title_ja: 'BJJテクニック動画 #3',
    title_en: 'BJJ Technique Video #3',
    title_pt: 'Vídeo de Técnica BJJ #3',
    description_ja: '実践的なBJJテクニックの解説動画',
    description_en: 'Practical BJJ technique demonstration',
    description_pt: 'Demonstração prática de técnica BJJ',
    category: 'technique',
    difficulty_level: 'advanced',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8482.MOV',
    title_ja: 'BJJフロー動画 #1',
    title_en: 'BJJ Flow Video #1',
    title_pt: 'Vídeo de Fluxo BJJ #1',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'advanced',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8159.MOV',
    title_ja: 'BJJフロー動画 #2',
    title_en: 'BJJ Flow Video #2',
    title_pt: 'Vídeo de Fluxo BJJ #2',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'intermediate',
    is_free: false,
  },
  {
    filePath: '/Users/yuki/Downloads/IMG_8158.MOV',
    title_ja: 'BJJフロー動画 #3',
    title_en: 'BJJ Flow Video #3',
    title_pt: 'Vídeo de Fluxo BJJ #3',
    description_ja: 'フロー重視のトレーニング動画',
    description_en: 'Flow-focused training video',
    description_pt: 'Vídeo de treinamento focado em fluxo',
    category: 'flow',
    difficulty_level: 'intermediate',
    is_free: false,
  }
]

function getFileSize(filePath: string): string {
  const stats = fs.statSync(filePath)
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
  return `${sizeInMB} MB`
}

console.log('\n=== 動画アップロード手順 ===\n')
console.log('1. Murata BJJサイトにログインしてください: https://muratabjj.vercel.app/')
console.log('2. ダッシュボード → 動画カタログ → 動画アップロード へ移動してください')
console.log('3. 以下の動画を1つずつアップロードしてください:\n')

videos.forEach((video, index) => {
  const fileName = path.basename(video.filePath)
  const fileSize = getFileSize(video.filePath)
  
  console.log(`\n--- 動画 ${index + 1} ---`)
  console.log(`ファイル: ${fileName}`)
  console.log(`パス: ${video.filePath}`)
  console.log(`サイズ: ${fileSize}`)
  console.log(`\n入力する情報:`)
  console.log(`タイトル（日本語）: ${video.title_ja}`)
  console.log(`タイトル（英語）: ${video.title_en}`)
  console.log(`タイトル（ポルトガル語）: ${video.title_pt}`)
  console.log(`説明（日本語）: ${video.description_ja}`)
  console.log(`説明（英語）: ${video.description_en}`)
  console.log(`説明（ポルトガル語）: ${video.description_pt}`)
  console.log(`カテゴリ: ${video.category === 'technique' ? 'テクニック' : 'フロー'}`)
  console.log(`難易度: ${video.difficulty_level === 'intermediate' ? '中級' : '上級'}`)
  console.log(`プレミアムコンテンツ: はい`)
  console.log(`AI自動分析を有効にする: はい`)
  console.log(`音声を自動文字起こし: はい`)
})

console.log('\n\n=== 注意事項 ===')
console.log('- 各動画のアップロードには時間がかかります')
console.log('- アップロード完了後、AI分析と音声文字起こしが自動的に開始されます')
console.log('- すべての動画をアップロードしたら、動画カタログで確認できます')

// Create a JSON file with metadata for easy copy-paste
const metadata = videos.map(v => ({
  fileName: path.basename(v.filePath),
  ...v
}))

fs.writeFileSync(
  path.join(process.cwd(), 'video-metadata.json'),
  JSON.stringify(metadata, null, 2)
)

console.log('\n✅ メタデータを video-metadata.json に保存しました')
