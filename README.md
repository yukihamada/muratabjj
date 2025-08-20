# Murata BJJ

ブラジリアン柔術（BJJ）を「連携（Flow）」中心で学ぶためのWebプラットフォーム。

## 実装済み機能

- 🎥 **動画カタログ** - 帯/カテゴリ別でフィルタリング可能な動画管理システム
- 🔄 **フローエディタ** - 技の連携を可視化・編集（データベース保存対応）
- 📊 **習得度トラッキング** - 5段階（理解→手順→再現→連携→実戦）での技術習得管理
- 📝 **スパーリングログ** - 練習記録と統計分析、イベント記録機能
- 👤 **ユーザープロファイル** - 帯・ストライプ管理と統計表示
- 🎬 **動画プレーヤー拡張** - 再生速度調整（0.5x-2.0x）、チャプター機能、安全警告表示
- 🔐 **認証システム** - メール/パスワードおよびGoogleログイン対応
- 🌍 **多言語対応** - 日本語、英語、ポルトガル語
- 🛡️ **管理者機能** - 動画の公開管理、安全情報の確認

## 今後実装予定

- 🧠 **アダプティブ復習** - 忘却曲線に基づく最適な復習間隔の提案
- 🥋 **コーチ/道場向け機能** - カリキュラム配信と生徒管理
- 🎙️ **Whisper API統合** - 動画の自動文字起こし
- 💳 **Stripe決済統合** - サブスクリプション管理

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **デプロイ**: Vercel
- **多言語対応**: 日本語、英語、ポルトガル語

## セットアップ

### 1. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 管理者設定
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

### 2. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/migrations/001_initial_schema.sql`をSQLエディタで実行
3. Storageで`videos`バケットを作成（公開設定）

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## Vercelへのデプロイ

1. Vercelでプロジェクトをインポート
2. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（管理機能用）
   - `NEXT_PUBLIC_ADMIN_EMAIL`
3. デプロイ

## 機能詳細

### 動画投稿（ユーザー向け）

- ログインユーザーは動画をアップロード可能
- 帯別推奨設定
- 安全注意事項の設定
- 管理者承認後に公開

### 管理者機能

- `/admin/videos`で全動画の管理
- 公開/非公開の切り替え
- 安全性に関する情報の確認
- 動画の削除

### 安全性への配慮

- 帯別の推奨レベル表示
- 競技禁止技術の明記
- 指導者監督推奨の表示
- 安全注意事項の複数選択

## 開発者向け

### ディレクトリ構造

```
src/
├── app/                # Next.js App Router
│   ├── [locale]/      # 多言語対応
│   ├── admin/         # 管理者向けページ
│   └── dashboard/     # ユーザーダッシュボード
├── components/        # Reactコンポーネント
├── contexts/         # Contextプロバイダー
├── hooks/           # カスタムフック
├── lib/             # ユーティリティ
├── locales/         # 翻訳ファイル
└── types/           # TypeScript型定義
```

### コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run lint       # ESLintチェック
npm run typecheck  # TypeScript型チェック
```

## ライセンス

Copyright (c) 2024 Murata BJJ. All rights reserved.

## 監修

村田 良蔵（Ryozo Murata）
- SJJIF Worlds Master 36 黒帯フェザー級 2018/2019 優勝
- スポーツ柔術日本連盟（SJJJF）会長
- YAWARA柔術アカデミー代表