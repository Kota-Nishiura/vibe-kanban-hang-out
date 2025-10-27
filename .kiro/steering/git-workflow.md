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