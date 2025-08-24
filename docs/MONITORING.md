# Murata BJJ - モニタリング設定ガイド

## 概要

Murata BJJでは、包括的なモニタリングシステムを実装しています。Grafana Cloud、Sentry、カスタムメトリクスを組み合わせて、アプリケーションの健全性とパフォーマンスを監視します。

## 1. Grafana Cloud設定

### 環境変数

```env
GRAFANA_INSTANCE_ID=your-instance-id
GRAFANA_API_KEY=your-api-key
METRICS_ACCESS_TOKEN=your-metrics-token  # Prometheusスクレイピング用
```

### Grafanaアカウントの作成

1. [Grafana Cloud](https://grafana.com/products/cloud/)にアクセス
2. 無料アカウントを作成（月間10,000シリーズまで無料）
3. スタックを作成し、Instance IDとAPI Keyを取得

### ダッシュボードの設定

1. Grafanaにログイン
2. 「Import Dashboard」を選択
3. 以下のダッシュボードテンプレートをインポート：
   - Node.js Application Dashboard (ID: 11159)
   - Web Application Dashboard (ID: 6669)

### カスタムダッシュボード

#### BJJ特有のメトリクス

```
# ビデオ視聴統計
sum(rate(business_video_watch_duration_seconds[5m])) by (title)

# 技術習得進捗
avg(business_technique_progress_level) by (technique_id)

# サブスクリプション統計  
sum(rate(subscription_events[1h])) by (event, plan)

# フロー使用状況
sum(rate(flow_interactions[1h])) by (action)
```

## 2. メトリクス収集

### 利用可能なメトリクス

#### システムメトリクス

- `http_request_duration_ms` - HTTPリクエスト応答時間
- `http_requests_total` - HTTPリクエスト総数
- `database_query_duration_ms` - データベースクエリ実行時間
- `database_queries_total` - データベースクエリ総数
- `nodejs_memory_usage_bytes` - Node.jsメモリ使用量

#### ビジネスメトリクス

- `video_views` - 動画視聴数
- `business_video_watch_duration_seconds` - 動画視聴時間
- `business_technique_progress_level` - 技術習得レベル
- `subscription_events` - サブスクリプションイベント
- `flow_interactions` - フロー操作統計
- `component_mounts` - コンポーネントマウント数
- `user_interactions` - ユーザーインタラクション

### Prometheusエンドポイント

```bash
# メトリクスの取得
curl -H "Authorization: Bearer $METRICS_ACCESS_TOKEN" \
     https://muratabjj.com/api/metrics
```

## 3. エラートラッキング（Sentry）

### 環境変数

```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### Sentryの機能

- エラー自動収集
- パフォーマンス監視
- セッションリプレイ
- リリーストラッキング

## 4. フロントエンドモニタリング

### useMonitoringフックの使用

```typescript
import { useMonitoring, usePageView, useBusinessMetrics } from '@/hooks/useMonitoring'

function VideoPlayer({ video }) {
  const { trackInteraction, trackError, measurePerformance } = useMonitoring('VideoPlayer')
  const { trackVideoView } = useBusinessMetrics()
  
  // ページビュートラッキング
  usePageView('video-player')
  
  // インタラクショントラッキング
  const handlePlay = () => {
    trackInteraction('play', { videoId: video.id })
  }
  
  // エラートラッキング
  const handleError = (error: Error) => {
    trackError(error, 'video-playback')
  }
  
  // パフォーマンス測定
  const loadVideo = async () => {
    await measurePerformance('load-video', async () => {
      // 動画読み込み処理
    })
  }
}
```

## 5. ログ管理（Grafana Loki）

### ログの構造化

```typescript
import { logToGrafana } from '@/lib/monitoring/grafana'

// 情報ログ
logToGrafana('info', 'User action', {
  userId: user.id,
  action: 'video_upload',
  videoId: video.id,
})

// エラーログ
logToGrafana('error', 'Payment failed', {
  userId: user.id,
  error: error.message,
  amount: amount,
})
```

### LogQLクエリ例

```logql
# エラーログの検索
{app="murata-bjj", level="error"} |= "Payment failed"

# 特定ユーザーのアクティビティ
{app="murata-bjj"} |= "userId" |= "specific-user-id"

# レート制限イベント
{app="murata-bjj", level="warn"} |= "Rate limit exceeded"
```

## 6. 分散トレーシング（Grafana Tempo）

### トレースの実装

```typescript
import { TraceSpan } from '@/lib/monitoring/grafana'

async function processVideoUpload(video: File) {
  const span = new TraceSpan('video-upload')
  
  try {
    // ファイルアップロード
    span.addMetadata('file_size', video.size)
    const uploadSpan = new TraceSpan('file-upload', span.spanId)
    const url = await uploadFile(video)
    await uploadSpan.end()
    
    // AI分析
    const analysisSpan = new TraceSpan('ai-analysis', span.spanId)
    const analysis = await analyzeVideo(url)
    await analysisSpan.end()
    
    span.addMetadata('success', true)
  } catch (error) {
    span.addMetadata('error', error.message)
  } finally {
    await span.end()
  }
}
```

## 7. アラート設定

### Grafanaアラートルール

```yaml
# 高レスポンスタイム
- alert: HighResponseTime
  expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High response time detected"

# エラー率
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"

# メモリ使用率
- alert: HighMemoryUsage
  expr: nodejs_memory_usage_bytes > 1073741824  # 1GB
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage detected"
```

## 8. パフォーマンス最適化

### メトリクスのバッチング

メトリクスは1分ごとにバッチで送信され、ネットワークオーバーヘッドを最小限に抑えます。

### データ保持期間

- メトリクス: 30日間
- ログ: 7日間  
- トレース: 7日間

## 9. トラブルシューティング

### メトリクスが表示されない

1. 環境変数を確認
2. `/api/metrics`エンドポイントにアクセス
3. Grafanaのデータソース設定を確認

### ログが送信されない

1. Loki URLとAPI Keyを確認
2. ネットワーク接続を確認
3. ログフォーマットを検証

### トレースが表示されない

1. Tempo設定を確認
2. トレースIDの形式を確認
3. タイムスタンプの精度を確認

## 10. ベストプラクティス

### メトリクス命名規則

- 小文字とアンダースコアを使用
- 単位をサフィックスに含める（_ms, _bytes, _total）
- 階層的な命名（http_request_duration_ms）

### ラベルの使用

- カーディナリティを低く保つ
- 動的な値（ユーザーIDなど）は避ける
- 事前定義された値を使用

### ログレベル

- `info`: 通常の操作
- `warn`: 潜在的な問題
- `error`: エラーと例外

### パフォーマンスへの影響

- クリティカルパスでは最小限のトラッキング
- 非同期でメトリクスを送信
- サンプリングレートの調整

## まとめ

この包括的なモニタリングシステムにより、Murata BJJアプリケーションの健全性、パフォーマンス、ユーザー体験を継続的に監視し、改善することができます。定期的にダッシュボードを確認し、アラートに対応することで、高品質なサービスを維持できます。