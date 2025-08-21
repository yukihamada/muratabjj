---
description: Add a new technique (video + metadata) and wire it into flow & SRS
allowed-tools: Edit, MultiEdit, Write, Bash(npm run build), Bash(git add:*), Bash(git commit:*)
argument-hint: [technique-slug]
---

ゴール: `$ARGUMENTS` という slug の技を追加し、
- 動画メタ（duration/chapters/keypoints）と transcript を保存
- フローにノード/エッジ追加（循環検出）
- SRS 出題対象へ登録（ボトルネック重み付け）

実施:
1) `/src/app/api/transcribe/` を用いた文字起こしの呼び出しコード/キューを用意（必要に応じて /lib/whisper を編集）
2) `/components/VideoPlayer.tsx` / `/components/VideoUpload.tsx` の該当箇所を拡張（キーポイント連動）
3) `/components/FlowEditor.tsx` と `SRS` ロジック(`/lib/adaptive-review.ts`)へ結線
4) 最小の e2e/UT を追加し、差分とテスト結果を要約 → コミット