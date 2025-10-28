---
inclusion: always
---

# Git ワークフローガイドライン

## ブランチ戦略

### 禁止事項
- **main/developブランチへの直接コミット・プッシュは絶対禁止**
- すべての変更は機能ブランチで実施し、PRを経由してマージする

### ブランチ命名規則
```
<type>/<scope>-<description>
```

**例:**
- `feat/pomodoro-timer-implementation`
- `fix/timer-accuracy-issue`
- `docs/readme-update`

### ブランチタイプ
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `build`: ビルド関連
- `ci`: CI/CD設定
- `chore`: その他のメンテナンス

## コミットメッセージ規則

### フォーマット
```
<type>(<scope>): <説明>
```

### 例
```
feat(timer): implement pomodoro timer core functionality
fix(notifications): resolve audio notification playback issue
docs(readme): add installation and usage instructions
```

### ガイドライン
- **説明は変更の理由と影響を明確に記述**（英語推奨）
- **コミットは原子的で単一の変更に焦点**
- 50文字以内の簡潔な説明
- 必要に応じて詳細な説明を本文に追加

### スコープ例
- `timer`: タイマー機能
- `settings`: 設定機能
- `notifications`: 通知機能
- `storage`: データ永続化
- `ui`: ユーザーインターフェース
- `config`: 設定ファイル

## プルリクエスト要件

### 必須事項
- **変更内容を明確に説明**
- **レビューしやすい単位に分割**
- **すべてのテストが通ることを確認**
- **自己レビューを実施してから提出**

### PRテンプレート推奨項目
- 変更の概要
- 変更理由
- テスト方法
- 影響範囲
- スクリーンショット（UI変更の場合）

## ワークフロー

1. **developブランチから機能ブランチを作成**
2. **機能実装とテスト**
3. **自己レビューとコミット**
4. **PRを作成してレビュー依頼**
5. **レビュー完了後にdevelopにマージ**
6. **機能ブランチを削除**

## タスク完了時の自動PR作成ルール

### 必須実行手順
タスクが完了状態（completed）になった時、以下を自動実行する：

1. **ブランチ作成・切り替え**
   ```bash
   # タスク用ブランチが存在しない場合のみ作成
   git checkout -b feat/pomodoro-<task-scope>
   ```

2. **変更のコミット**
   ```bash
   git add .
   git commit -m "feat(<scope>): <task-title>"
   ```

3. **ブランチプッシュ**
   ```bash
   git push origin feat/pomodoro-<task-scope>
   ```

4. **PR自動作成**
   ```bash
   gh pr create --title "feat(<scope>): <task-title>" \
                --base develop \
                --body "## 概要\n<task-description>\n\n## 実装内容\n- <implementation-details>\n\n## テスト\n- TypeScript型チェック通過\n- 実装要件の確認完了"
   ```

### ブランチ命名規則（タスク用）
- `feat/pomodoro-types`: 型定義実装
- `feat/pomodoro-timer-logic`: タイマーロジック実装  
- `feat/pomodoro-ui-components`: UIコンポーネント実装
- `feat/pomodoro-settings`: 設定機能実装
- `feat/pomodoro-storage`: データ永続化実装

### コミットメッセージ例（タスク用）
- `feat(types): implement timer state and settings interfaces`
- `feat(timer): add core timer logic with validation`
- `feat(ui): create timer display and control components`
- `feat(settings): implement customizable timer configuration`
- `feat(storage): add session history persistence`

### PR作成時の必須情報
- **タイトル**: タスク名をそのまま使用
- **本文**: 実装したタスクの詳細と要件への対応状況
- **ラベル**: `feature`, `pomodoro-timer`を自動付与
- **レビュアー**: 自動アサイン（設定されている場合）

### 注意事項
- **1タスク = 1PR**の原則を厳守
- タスクが複数のサブタスクを持つ場合も、親タスク完了時に1つのPRを作成
- **PRのベースブランチは必ずdevelop**を指定（`--base develop`オプション必須）
- PR作成後は自動でタスクステータスを`completed`に更新
- GitHub CLIが必要（`gh`コマンド）

### ベースブランチ指定の重要性
```bash
# ❌ 悪い例：ベースブランチ未指定（mainになってしまう）
gh pr create --title "feat(timer): implement core functionality"

# ✅ 良い例：developブランチを明示的に指定
gh pr create --title "feat(timer): implement core functionality" --base develop
```