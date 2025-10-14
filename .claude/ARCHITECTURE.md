# アーキテクチャガイド / Architecture Guide

このドキュメントは、モノレポ構造でのプロジェクト管理とドキュメント駆動開発の指針を示します。

## 1. リポジトリ構造 / Repository Structure

### 1.1 基本構造

```
/
├── .claude/                       # ドキュメント・規約
│   ├── CLAUDE.md                  # コーディング規約（全体共通）
│   ├── ARCHITECTURE.md            # このファイル
│   ├── templates/                 # ドキュメントテンプレート
│   │   ├── spec-overview.md
│   │   ├── spec-design.md
│   │   └── task.md
│   └── apps/                      # アプリ毎のドキュメント
│       └── [app-name]/
│           ├── README.md          # アプリ固有の情報
│           └── specs/             # 機能仕様書
│               └── [feature-name]/
│                   ├── overview.md
│                   ├── design.md
│                   └── tasks/
│                       ├── 01-xxx.md
│                       └── 02-xxx.md
├── apps/                          # アプリケーション実装
│   └── [app-name]/
│       ├── src/
│       ├── tests/
│       └── README.md
├── packages/                      # 共通ライブラリ（任意）
│   └── [package-name]/
└── shared/                        # 共有リソース（任意）
```

### 1.2 単一アプリ構成の場合

モノレポでない場合は、以下のように簡略化：

```
/
├── .claude/
│   ├── CLAUDE.md
│   ├── ARCHITECTURE.md
│   ├── templates/
│   └── specs/                     # apps/配下を省略
│       └── [feature-name]/
│           ├── overview.md
│           ├── design.md
│           └── tasks/
├── src/
├── tests/
└── README.md
```

## 2. ドキュメント駆動開発 / Document-Driven Development

### 2.1 開発フロー

```
1. 計画フェーズ
   ├── overview.md を作成（何を作るか、なぜ必要か）
   ├── design.md を作成（どう作るか）
   └── tasks/*.md を作成（実装の分割）

2. 実装フェーズ（タスク毎に反復）
   ├── タスクドキュメントを読む
   ├── 実装 + テスト
   ├── コミット
   └── PR作成 → レビュー → マージ

3. 次のタスクへ
```

### 2.2 ドキュメント階層

| レベル | ファイル | 目的 | 粒度 | コミット |
|--------|----------|------|------|----------|
| 機能概要 | `overview.md` | WHY（なぜ必要か） | 機能全体 | ❌ |
| 設計 | `design.md` | HOW（どう作るか） | 機能全体 | ❌ |
| タスク | `tasks/01-xxx.md` | WHAT（何を作るか） | 1 PR | ✅ |

### 2.3 タスク分割の原則

**良いタスクの条件：**
- ✅ 独立してレビュー可能
- ✅ 独立してテスト可能
- ✅ 単独で価値を提供（または次タスクの基盤）
- ✅ 適切なサイズ（実装ファイル 3-10個、変更行数 100-500行程度）

**避けるべきタスク：**
- ❌ 大きすぎる（レビュー困難、1000行以上の変更）
- ❌ 小さすぎる（価値がない、typo修正のみなど）
- ❌ 中途半端（動作しない、テストがない）

### 2.4 タスク分割の例

#### 良い例：認証機能

```
tasks/
├── 01-data-models.md       # ユーザーモデル、DBスキーマ
├── 02-auth-core.md         # 認証ロジック（トークン生成・検証）
├── 03-api-endpoints.md     # ログイン/ログアウトAPI
├── 04-middleware.md        # 認証ミドルウェア
└── 05-integration.md       # 既存機能との統合

各タスクは独立して動作・テスト可能
```

#### 悪い例

```
tasks/
├── 01-everything.md        # ❌ 全部を一度に（大きすぎる）
└── 02-fix-typo.md          # ❌ typo修正（小さすぎる）
```

## 3. ブランチ戦略 / Branching Strategy

### 3.1 ブランチ命名規則

#### モノレポの場合
```
[app-name]/[type]/[short-description]

例:
- todo-app/feat/add-auth
- calculator/fix/division-by-zero
- blog/refactor/api-client
```

#### 単一アプリの場合
```
[type]/[short-description]

例:
- feat/add-auth
- fix/division-by-zero
- refactor/api-client
```

### 3.2 タイプ（type）

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメントのみ
- `test`: テストのみ
- `chore`: ビルド、設定変更など

## 4. PR（Pull Request）ガイドライン

### 4.1 PR タイトル

#### モノレポの場合
```
[app-name]: [type] [description]

例:
- [todo-app] feat: ユーザー認証機能を追加
- [calculator] fix: ゼロ除算エラーを修正
```

#### 単一アプリの場合
```
[type]: [description]

例:
- feat: ユーザー認証機能を追加
- fix: ゼロ除算エラーを修正
```

### 4.2 PR 説明テンプレート

```markdown
## 概要
このPRが解決する問題と変更内容

## 変更内容
- 変更点1
- 変更点2

## テスト
- [ ] 単体テストを追加・更新
- [ ] 手動テストを実施

## 関連ドキュメント
- `.claude/apps/[app-name]/specs/[feature]/tasks/01-xxx.md`

## レビューポイント
レビュアーに特に見てほしい箇所
```

## 5. アプリ追加手順 / Adding New App

### 5.1 新しいアプリを追加する場合

```bash
# 1. ドキュメントディレクトリを作成
mkdir -p .claude/apps/[app-name]

# 2. アプリのREADMEを作成
# .claude/apps/[app-name]/README.md

# 3. 実装ディレクトリを作成
mkdir -p apps/[app-name]

# 4. 必要に応じて初期設定（package.json等）
```

### 5.2 アプリのREADME構成

```markdown
# [App Name]

## 概要
このアプリの目的と概要

## 技術スタック
- 言語: TypeScript / Python / etc.
- フレームワーク: React / Express / etc.
- データベース: PostgreSQL / etc.

## ディレクトリ構造
apps/[app-name]/
├── src/
├── tests/
└── README.md

## セットアップ
開発環境のセットアップ手順

## 実行方法
アプリの起動方法
```

## 6. AIエージェント（Claude）との協働

### 6.1 指示の出し方

#### モノレポの場合
```
"todo-appにユーザー認証機能を追加したいです"
→ Claudeは .claude/apps/todo-app/ を参照
→ apps/todo-app/ 配下を編集
```

#### 単一アプリの場合
```
"ユーザー認証機能を追加したいです"
→ Claudeは .claude/specs/ を参照
→ src/ 配下を編集
```

### 6.2 Claudeの動作

1. **ドキュメント参照**: `.claude/CLAUDE.md` を常に参照してコーディング規約を遵守
2. **仕様書確認**: 該当する `specs/` 配下のドキュメントを読み込み
3. **実装**: タスクドキュメントに従って実装
4. **絶対パス**: すべてのファイル操作はroot基準の絶対パスで実行可能

### 6.3 作業開始前の確認事項

Claudeが作業を開始する前に以下を確認：
- [ ] 該当する仕様書が存在するか？
- [ ] タスクが適切に分割されているか？
- [ ] どのアプリ/ディレクトリに対する変更か？

## 7. テンプレートの使い方

### 7.1 新機能を追加する場合

```bash
# 1. テンプレートをコピー
cp .claude/templates/spec-overview.md .claude/apps/[app-name]/specs/[feature-name]/overview.md
cp .claude/templates/spec-design.md .claude/apps/[app-name]/specs/[feature-name]/design.md

# 2. ドキュメントを埋める
# overview.md → 機能の目的、背景
# design.md → 設計、タスク分割

# 3. タスクを作成
cp .claude/templates/task.md .claude/apps/[app-name]/specs/[feature-name]/tasks/01-xxx.md

# 4. 実装開始
```

### 7.2 Claudeへの指示例

```
"todo-appの認証機能について、.claude/apps/todo-app/specs/auth/tasks/01-setup.md
に従って実装してください"
```

## 8. ベストプラクティス

### 8.1 DO（推奨）

- ✅ ドキュメントを先に書く（計画 → 実装）
- ✅ タスクを適切な粒度に分割
- ✅ 1タスク = 1PR
- ✅ 各PRは独立してレビュー・マージ可能
- ✅ コミットメッセージは明確に
- ✅ テストを必ず書く

### 8.2 DON'T（非推奨）

- ❌ ドキュメントなしでいきなり実装
- ❌ 大きすぎる変更を1つのPRに
- ❌ 動作しない中途半端な変更をコミット
- ❌ テストなしでマージ
- ❌ 曖昧なコミットメッセージ

## 9. トラブルシューティング

### 9.1 よくある問題

**Q: タスクが大きすぎてレビューが大変**
→ A: design.mdを見直し、タスクをさらに分割

**Q: タスクが小さすぎて価値がない**
→ A: 関連タスクを統合、または他のタスクに含める

**Q: PRが衝突する**
→ A: タスクの依存関係を見直し、順序を調整

**Q: Claudeが正しいディレクトリを参照しない**
→ A: 明示的にアプリ名とパスを指示

## 10. 継続的改善

### 10.1 定期的な見直し

- プロジェクトの成長に応じて構造を見直す
- チームのフィードバックを反映
- 新しいツールやベストプラクティスを取り入れる

### 10.2 このドキュメントの更新

- プロジェクト固有の情報は各アプリのREADMEに記載
- 汎用的な改善はこのドキュメントに反映
- バージョン管理でドキュメントの履歴を追跡

---

**最終更新**: 2025-10-14
**バージョン**: 1.0.0
