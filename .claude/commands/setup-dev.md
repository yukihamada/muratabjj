---
description: Set up development environment with recommended libraries
allowed-tools: Bash(npm install*), Edit, Write
argument-hint: [all|validation|test]
---

開発環境に推奨ライブラリをセットアップします。

引数オプション:
- `all` - すべての推奨ライブラリをインストール
- `validation` - Zod/react-hook-formのみ
- `test` - テストフレームワークのみ
- 引数なし - 必要なものを対話的に選択

手順:
1) 引数に応じてインストールするライブラリを決定
2) !`npm install` で必要なパッケージをインストール
3) 必要に応じて設定ファイルを生成（jest.config.js等）
4) インストール結果とセットアップ手順を要約