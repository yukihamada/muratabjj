# Supabase Database Setup

## 概要
このディレクトリには、Murata BJJのデータベーススキーマとセットアップファイルが含まれています。

## セットアップ手順

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAnon Keyを取得

### 2. 環境変数の設定
`.env.local`ファイルに以下を追加：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Whisper API用（オプション）
OPENAI_API_KEY=your_openai_api_key
```

### 3. データベースのセットアップ
Supabaseダッシュボードの「SQL Editor」で以下のファイルを順番に実行：

1. **schema.sql** - データベーステーブルの作成
2. **rls-policies.sql** - Row Level Securityポリシーの設定
3. **storage-setup.sql** - ストレージバケットの設定
4. **seed.sql** - 初期データの投入

### 4. Supabase CLIの使用（推奨）
```bash
# Supabase CLIのインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトのリンク
supabase link --project-ref your-project-ref

# マイグレーションの実行
supabase db push

# 型の生成
supabase gen types typescript --local > src/types/database.ts
```

## データベース構造

### 主要テーブル
- **users_profile** - ユーザープロファイル拡張
- **techniques** - 技術マスターデータ
- **videos** - 動画情報
- **video_chapters** - 動画チャプター
- **video_transcripts** - 文字起こしデータ
- **user_progress** - ユーザーの習得度
- **sparring_logs** - スパーリング記録
- **sparring_events** - スパーリングイベント
- **flows** - ユーザー作成のフロー
- **flow_nodes/edges** - フローの構成要素
- **dojos** - 道場情報
- **dojo_members** - 道場メンバー
- **curriculums** - カリキュラム
- **curriculum_items** - カリキュラム項目
- **subscriptions** - サブスクリプション
- **review_schedule** - 復習スケジュール

### セキュリティ
- Row Level Security (RLS) を全テーブルで有効化
- ユーザーは自分のデータのみアクセス可能
- コーチは生徒のデータを閲覧可能
- 道場管理者は道場内全データにアクセス可能

### 便利な関数
- `has_active_subscription(user_id, plans[])` - アクティブなサブスクリプションをチェック
- `get_user_dojo_role(user_id, dojo_id)` - ユーザーの道場での役割を取得

## 開発のヒント

### リアルタイムサブスクリプション
```typescript
// 例：ユーザーの進捗をリアルタイムで監視
const subscription = supabase
  .channel('user-progress')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'user_progress',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('Progress updated:', payload)
    }
  )
  .subscribe()
```

### 型安全なクエリ
```typescript
import { supabase } from '@/lib/supabase/client'

// 型が自動的に推論される
const { data, error } = await supabase
  .from('techniques')
  .select('*')
  .eq('category', 'submission')
```

## トラブルシューティング

### よくある問題
1. **権限エラー** - RLSポリシーを確認
2. **型エラー** - `supabase gen types`で型を再生成
3. **接続エラー** - 環境変数を確認

### デバッグ
Supabaseダッシュボードの「Logs」セクションでクエリログを確認できます。