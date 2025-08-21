# Supabase セットアップガイド

## 1. プロジェクト作成

1. https://app.supabase.com にアクセス
2. 「New Project」をクリック
3. 以下の情報を入力：
   - **Organization**: 既存の組織または新規作成
   - **Project name**: `muratabjj-production`
   - **Database Password**: 強力なパスワード（生成ボタンを使用推奨）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: Free tier でOK

## 2. データベーススキーマの実行

プロジェクトが作成されたら：

1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `/supabase/migrations/000_complete_schema.sql` の内容を全てコピー＆ペースト
4. 「Run」ボタンをクリック（実行に1-2分かかります）
5. 成功メッセージが表示されることを確認

## 3. Storageバケットの作成

1. 左メニューから「Storage」を選択
2. 「Create a new bucket」をクリック

### videosバケット
- **Name**: `videos`
- **Public bucket**: ✅ ON
- **File size limit**: `500`
- **Allowed MIME types**: `video/*`
- 「Create bucket」をクリック

### profile-imagesバケット
- 再度「Create a new bucket」をクリック
- **Name**: `profile-images`
- **Public bucket**: ✅ ON
- **File size limit**: `5`
- **Allowed MIME types**: `image/*`
- 「Create bucket」をクリック

## 4. 環境変数の取得

1. 左メニューから「Settings」→「API」を選択
2. 以下の3つの値をコピー：

```
NEXT_PUBLIC_SUPABASE_URL=https://vyddhllzjjpqxbouqivf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（長い文字列）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（長い文字列、secretの方）
```

## 5. 認証設定の確認

1. 左メニューから「Authentication」→「Providers」を選択
2. 「Email」が有効になっていることを確認
3. 「Google」を有効にする場合：
   - Toggle をONに
   - Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
   - Client IDとClient Secretを入力

## 6. RLSの確認

1. 左メニューから「Database」→「Tables」を選択
2. 各テーブルの「RLS」列が「Enabled」になっていることを確認
3. もし無効なテーブルがあれば、テーブル名をクリック→「Enable RLS」

## トラブルシューティング

### スキーマ実行エラー
- エラーメッセージをコピーして確認
- 多くの場合、既存のテーブルとの競合が原因
- 必要に応じてテーブルを削除してから再実行

### Storage作成エラー
- バケット名が既に使用されている場合は別名を使用
- CORS設定が必要な場合は、Settings → Storage → CORS で設定

### 環境変数が見つからない
- プロジェクトの作成が完了するまで数分待つ
- ページをリロードして再確認