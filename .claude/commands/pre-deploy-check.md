---
description: Run pre-deploy checks and summarize blockers
allowed-tools: Bash(npm run build), Bash(node scripts/pre-deploy-check.js), Bash(git status:*), Edit, Write
---

1) !`npm run build --silent`
2) !`node scripts/pre-deploy-check.js`
3) 出力の警告/失敗を分類（パフォーマンス/アクセシビリティ/型/依存/API）
4) 直せるものを最小修正し、直せないものは TODO リスト化（パス・根拠を具体化）