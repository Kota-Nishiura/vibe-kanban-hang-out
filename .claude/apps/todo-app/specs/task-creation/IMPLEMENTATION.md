# 実装の進め方

このドキュメントは、仕様書が完成した後、実際の実装フェーズに移行する方法を説明します。

## 前提条件

✅ 仕様書が完成している
- `overview.md`: 機能概要
- `design.md`: 設計書
- `tasks/*.md`: 実装タスク（3つ）

## 実装フェーズへの移行手順

### ステップ1: 新しいブランチを作成

```bash
# メインブランチに戻る
git checkout main  # または develop

# 最新の状態に更新
git pull origin main

# 新しい実装ブランチを作成
git checkout -b todo-app/feat/task-creation

# または、タスク毎にブランチを分ける場合
git checkout -b todo-app/feat/task-creation-01-setup
```

### ステップ2: Claude に実装を依頼

新しいブランチに移動したら、以下のように指示してください：

#### 方法1: タスクドキュメントを指定して実装

```
.claude/apps/todo-app/specs/task-creation/tasks/01-project-setup.md
に従って実装してください
```

Claude は以下を実行します：
1. タスクドキュメントを読み込む
2. 設計書を参照
3. 実装を開始
4. テストを作成・実行
5. 動作確認
6. 完了を報告

#### 方法2: フェーズを指定して実装

```
todo-app のタスク作成機能について、Phase 1（プロジェクトセットアップ）を実装してください

参照: .claude/apps/todo-app/specs/task-creation/
```

### ステップ3: 実装後の確認

Claude が実装を完了したら：

```bash
# 変更内容を確認
git status
git diff

# 動作確認
cd apps/todo-app
npm install
npm run dev
npm test

# 問題なければコミット
git add .
git commit -m "feat(todo-app): implement project setup

Refs: .claude/apps/todo-app/specs/task-creation/tasks/01-project-setup.md"
```

### ステップ4: PR作成

```bash
# プッシュ
git push origin todo-app/feat/task-creation-01-setup

# または Claude に PR 作成を依頼
```

Claude に PR 作成を依頼する場合：
```
このブランチの変更内容で PR を作成してください

ベースブランチ: main (または develop)
タイトル: [todo-app] feat: プロジェクトセットアップ
```

### ステップ5: 次のタスクへ

最初のタスクがマージされたら、次のタスクに進みます：

```bash
# 最新の main に更新
git checkout main
git pull origin main

# 次のタスク用ブランチ
git checkout -b todo-app/feat/task-creation-02-ui

# Claude に実装依頼
```

```
.claude/apps/todo-app/specs/task-creation/tasks/02-basic-ui-and-storage.md
に従って実装してください
```

## タスクの進行状況管理

### タスクドキュメントのステータス更新

各タスクの最後には以下のステータスがあります：

```markdown
**ステータス**: Todo
```

これを手動で更新してください：

- `Todo`: 未着手
- `In Progress`: 実装中
- `In Review`: レビュー中
- `Done`: 完了

### 実績工数の記録

各タスクの「見積もり」セクションに実績を記録：

```markdown
## 10. 見積もり / Estimation

- **想定工数**: 1-2時間
- **実績工数**: 1.5時間
- **差異の理由**: 予想通り
```

これにより、今後の見積もり精度が向上します。

## トラブルシューティング

### Q: 仕様書と異なる実装をしたい

A: まず仕様書を更新してください
```
.claude/apps/todo-app/specs/task-creation/design.md
の XX セクションを変更したいです。

変更内容: [説明]
理由: [理由]
```

Claude が設計書を更新 → 再度実装依頼

### Q: 実装中にエラーが発生した

A: Claude に報告
```
実装中に以下のエラーが発生しました:

[エラー内容]

対処方法を教えてください
```

### Q: タスクの順序を変更したい

A: design.md のタスク分割セクションを更新
```
.claude/apps/todo-app/specs/task-creation/design.md
のタスク分割を変更したいです

変更案: [新しい順序]
```

### Q: 複数のタスクを1つにまとめたい

A: 新しいタスクドキュメントを作成
```
タスク 01 と 02 を統合した新しいタスクドキュメントを作成してください

理由: [理由]
```

## ベストプラクティス

### ✅ DO（推奨）

- タスク毎に別のブランチを作成
- 1タスク = 1PR
- PR説明にタスクドキュメントへのリンクを含める
- 実装前に仕様書を必ず確認
- 完了後にステータスと実績工数を更新

### ❌ DON'T（非推奨）

- 複数タスクを1つのPRに含める
- 仕様書を読まずに実装開始
- タスクの途中で別のタスクに着手
- 動作確認せずにPR作成

## 実装コマンド（将来的な拡張案）

将来的には専用コマンドも検討できます：

```bash
# 案1: /implement コマンド
/implement todo-app/task-creation/01

# 案2: /start-task コマンド
/start-task .claude/apps/todo-app/specs/task-creation/tasks/01-project-setup.md
```

現時点では、上記の「方法1」でタスクドキュメントのパスを指定する方法を使用してください。

---

**作成日**: 2025-10-14
**最終更新**: 2025-10-14
