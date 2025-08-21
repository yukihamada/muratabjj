# Murata BJJ - セットアップ検証ドキュメント

## 推奨される追加ライブラリ

### 1. バリデーション関連
現在、CLAUDE.mdでZodの使用が推奨されていますが、まだインストールされていません。

```bash
npm install zod react-hook-form @hookform/resolvers
```

### 2. テストフレームワーク
テストスクリプトは追加しましたが、実際のテストフレームワークが必要です。

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### 3. 型定義
必要に応じて追加の型定義：

```bash
npm install --save-dev @types/jest
```

## セットアップ状況

### ✅ 完了済み
- CLAUDE.md（プロジェクト行動規範）
- .claude/settings.json（権限設定）
- .claude/commands/（スラッシュコマンド）
- .gitignore（Claude関連設定を追加）
- .env.example（環境変数テンプレート）
- package.json（testスクリプト追加）
- tsconfig.json（TypeScript strict mode確認）

### ⚠️ 検討事項
1. **Zod/react-hook-form未インストール**
   - CLAUDE.mdで推奨されているが、まだ導入されていない
   - APIルートでの入力検証に必要

2. **テストフレームワーク未設定**
   - Jest/Testing Libraryの設定が必要
   - E2Eテスト（Playwright等）も検討

3. **CI/CD設定**
   - GitHub Actions等の自動化設定
   - デプロイ前の自動チェック

4. **監視・ログ設定**
   - Sentry等のエラー監視
   - ログ集約サービスの検討

## 次のステップ

1. 必要なライブラリのインストール
2. テスト環境のセットアップ
3. 開発環境での動作確認
4. CI/CD パイプラインの構築