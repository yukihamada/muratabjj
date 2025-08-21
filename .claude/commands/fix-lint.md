---
description: Fix lint & types, run tests, and commit minimal changes
allowed-tools: Bash(npm run lint), Bash(npm run typecheck), Bash(npm run test:*), Bash(git add:*), Bash(git commit:*), Edit, MultiEdit, Write
argument-hint: [commit-message]
---

目的: Lint と型エラーを直し、関連箇所だけ最小修正してテストを通す。

手順:
1) !`npm run lint --silent` の結果を読み、機械的に直せる範囲を自動修正（--fix 相当の編集を提案して適用）
2) !`npm run typecheck --silent` を実行し、型エラー箇所だけピンポイント修正（仕様変更はしない）
3) !`npm run test --silent` を実行し、失敗テストがあれば原因箇所のみ最小修正
4) 変更差分を要約し、!`git add -A` → !`git commit -m "$ARGUMENTS"` を実行