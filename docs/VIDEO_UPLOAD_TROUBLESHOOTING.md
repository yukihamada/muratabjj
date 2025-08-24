# 動画アップロードのトラブルシューティング

## 問題: 「アップロードに失敗しました」エラー

### 1. ストレージバケットの確認

Supabaseダッシュボードで以下を確認：

1. **Storage** セクションに移動
2. 以下のバケットが存在することを確認：
   - `videos` (公開、500MB制限)
   - `thumbnails` (公開、5MB制限)
   - `avatars` (公開、2MB制限)

バケットが存在しない場合は、`/supabase/migrations/017_create_storage_buckets.sql`を実行してください。

### 2. RLS（行レベルセキュリティ）ポリシーの確認

各バケットに適切なRLSポリシーが設定されているか確認：

```sql
-- ポリシーの確認
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

### 3. ファイルサイズとタイプの確認

- **動画ファイル**: 最大5GB、MP4/MOV/AVI形式のみ
- **サムネイル**: 最大5MB、JPEG/PNG/WebP形式のみ

### 4. ユーザー権限の確認

```sql
-- ユーザーがauthenticatedロールを持っているか確認
SELECT auth.uid(), auth.role();
```

### 5. よくあるエラーと解決方法

| エラーメッセージ | 原因 | 解決方法 |
|-----------------|------|----------|
| "row-level security policy violation" | RLSポリシーが不適切 | ポリシーを再作成 |
| "Bucket not found" | バケットが存在しない | バケットを作成 |
| "File size exceeds limit" | ファイルが大きすぎる | ファイルサイズを確認 |
| "Invalid file type" | サポートされていない形式 | MP4/MOV/AVIに変換 |
| "Network error" | ネットワーク接続の問題 | 接続を確認して再試行 |

### 6. デバッグ手順

1. ブラウザの開発者ツールでコンソールログを確認
2. Network タブでアップロードリクエストの詳細を確認
3. Supabaseダッシュボードのログを確認

### 7. 管理者向け設定

#### Supabaseダッシュボードでの設定：

1. **Storage設定**
   - Settings → Storage
   - "Enable Storage" がオンになっていることを確認
   
2. **CORS設定**
   ```json
   {
     "allowed_origins": ["*"],
     "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
     "allowed_headers": ["*"],
     "exposed_headers": ["*"],
     "max_age_seconds": 3600
   }
   ```

3. **環境変数の確認**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 8. テスト用コマンド

```bash
# バケットの存在確認
curl -X GET \
  'https://YOUR_PROJECT.supabase.co/storage/v1/bucket' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# アップロードテスト
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/storage/v1/object/videos/test.mp4' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: video/mp4' \
  --data-binary @test.mp4
```

## 問題が解決しない場合

1. Supabaseのサポートに連絡
2. プロジェクトの管理者に連絡
3. GitHubのイシューに報告: https://github.com/yukihamada/muratabjj/issues