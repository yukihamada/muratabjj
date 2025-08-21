# CLAUDE.md — Murata BJJ (root)

> このファイルは Claude Code が Murata BJJ で作業する際の「行動規範・手順」です。
> ここに書いたルールを最優先し、いきなり大変更せず **計画 → 実装 → 検証 → コミット** で進めてください。

## 0) 役割 & 目的
- 役割: **フルスタックエンジニア / テックライター / QA**
- 目的: 「理解→再現→実戦」の学習体験を、動画・フロー・トラッキング・スパーログで最短化
- 原則:
  1. 小さく計画し、小さくコミット（1コミット=1目的）
  2. 型安全（TypeScript strict）/ アクセシビリティ（WCAG 2.1 AA）/ パフォーマンスを常に担保
  3. 個人データ（顔・声・スパーログ等）は最小権限・最小収集で扱う

## 1) プロジェクト構成（重要パス）
- ルート: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `.env.local`, `vercel.json`
- `/src/app` (Next.js App Router)
  - `layout.tsx`, `page.tsx`（ルート）
  - `/[locale]`（i18n ルート）
  - `/admin`（ユーザー/動画/AI 分析の管理）
  - `/dashboard`（ユーザ向け）
    - `dojo/` 道場管理
    - `videos/` 動画一覧・アップロード
    - `review/` アダプティブ復習
    - `sparring/` スパーログ
    - `progress/` 進捗管理
    - `profile/` プロフィール
    - `subscription/` サブスク管理
  - `/api`
    - `admin/` 管理 API
    - `ai/` AI（動画分析・フロー提案）
    - `stripe/` 決済
    - `dojos/` 道場 API
    - `transcribe/` 音声文字起こし
- `/components`
  - `AuthDialog.tsx`, `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `Features.tsx`
  - `FlowEditor.tsx`
  - `VideoPlayer.tsx`, `VideoUpload.tsx`
  - `DashboardNav.tsx`, `AppNav.tsx`
  - `ProgressTracker.tsx`, `PricingWithStripe.tsx`
- `/lib`
  - `supabase/`（クライアント）
  - `stripe/`
  - `whisper/`（OpenAI Whisper API 連携）
  - `adaptive-review.ts`（SRS）
- `/locales`：`ja.ts` / `en.ts` / `pt.ts`
- `/contexts`：`LanguageContext.tsx`
- `/hooks`：`useAuth.tsx`
- `/types`：`database.ts`
- `/public`：`manifest.json`（PWA）, `sw.js`, 各種アイコン
- `/scripts`：`setup-stripe.js`, `generate-icons.js`, `pre-deploy-check.js`

## 2) コーディング規約（抜粋）
- Server/Client Components を明示。入出力バリデーションは **Zod**（未導入の場合は手動検証）
- フォームは **react-hook-form + zodResolver**（未導入の場合は制御コンポーネント）
- ファイルは 1責務・短く保つ（目安 200–300行）
- 例外パスは `never` 到達で `exhaustiveCheck()`

## 3) セキュリティ & プライバシー
- Supabase: **RLS 必須**。全テーブルで認可ポリシーを定義
- ストレージ: 動画等は**プライベート**保管。署名付きURLで配信
- API: すべて Zod で入力検証 → 認可チェック → 実処理の順
- ログ: 個人特定情報は出力しない（ID参照のみ）
- `.env*` / `secrets/**` は読み取り禁止（設定で遮断・下記参照）

## 4) よく使う npm スクリプト
- `npm run dev` / `build` / `test` / `lint` / `typecheck`
- `npm run pre-deploy` - デプロイ前チェック
- `npm run setup-stripe` - Stripe初期設定
- `npm run seed` - シードデータ投入

## 5) タスク手順テンプレ（Claude 用）
### A) 動画追加 → 文字起こし → 章/キーポイント反映
1. `VideoUpload.tsx` でアップロード（R2/S3 直送なら署名URL方式）
2. `/src/app/api/transcribe/` 経由で Whisper を実行（非同期）
3. `videos` レコードへ `transcript/chapter/keypoints` を保存
4. プレイヤー連動（トランスクリプト→タイムスタンプシーク）を検証
5. `search` インデックス更新 & スナップショットテスト

### B) フロー編集（フローエディタ/連携/SRS）
1. ノード/エッジを追加（循環が出題をループさせないこと）
2. 失敗率の高い「ボトルネック遷移」に重み付け（SRS で優先復習）
3. 変更は最小差分コミット＋スクショを残す

### C) スパーログ可視化
1. `spar_events(t_sec, event_type, success)` を蓄積
2. 時系列チャート/ヒートマップ描画（Canvas/SVG）
3. フィルタ（帯/体勢/相手）と成功率を UI で検証

## 6) Definition of Done
- `typecheck` / `lint` / 必要テストがパス
- UI: キーボード操作・コントラスト OK（WCAG 2.1 AA）
- セキュリティ: RLS/認可/入力検証を実装・確認
- 文書: 使い方/既知の制約/移行手順を追記

## 7) 作業ルール（Permissions）
- 書き込み・依存追加・DBマイグレーションは **必ず計画を先に提示**（何を・どこに・なぜ）
- 危険操作（削除や大規模置換）は必ず diff とバックアップをセットで提示
- 自動化のために権限を緩める場合は、`.claude/settings.json` の allow/deny を編集してから実行

## 8) 参照（imports）
- @README.md
- @package.json
- @public/manifest.json
- @scripts/pre-deploy-check.js
- @src/app/layout.tsx
- @~/.claude/my-project-instructions.md   # 個人の追記（任意）
- @docs/SETUP_VALIDATION.md   # セットアップ検証ドキュメント