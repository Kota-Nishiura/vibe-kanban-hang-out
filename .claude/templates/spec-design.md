# [機能名] - 設計書

> このドキュメントは機能の設計を記述します。overview.md を読んだ上で作成します。

## 1. アーキテクチャ概要 / Architecture Overview

### 1.1 システム構成図
```
[クライアント]
    ↓ HTTP
[API Layer]
    ↓
[Service Layer]
    ↓
[Data Layer / Database]
```

### 1.2 主要コンポーネント
- **コンポーネント1**: 役割の説明
- **コンポーネント2**: 役割の説明

## 2. データモデル / Data Model

### 2.1 エンティティ

#### Entity1
```typescript
interface Entity1 {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Entity2
```typescript
interface Entity2 {
  id: string;
  entity1Id: string;  // FK to Entity1
  value: number;
}
```

### 2.2 リレーション
```
Entity1 (1) --- (*) Entity2
```

### 2.3 データベーススキーマ
```sql
CREATE TABLE entity1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entity2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity1_id UUID REFERENCES entity1(id),
  value INTEGER NOT NULL
);
```

## 3. API設計 / API Design

### 3.1 エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/api/entity1` | Entity1を作成 | 必要 |
| GET | `/api/entity1/:id` | Entity1を取得 | 必要 |
| PUT | `/api/entity1/:id` | Entity1を更新 | 必要 |
| DELETE | `/api/entity1/:id` | Entity1を削除 | 必要 |

### 3.2 API詳細

#### POST /api/entity1
```typescript
// Request
{
  "name": "Example"
}

// Response (200 OK)
{
  "id": "uuid",
  "name": "Example",
  "createdAt": "2025-10-14T12:00:00Z",
  "updatedAt": "2025-10-14T12:00:00Z"
}

// Error (400 Bad Request)
{
  "error": "ValidationError",
  "message": "Name is required"
}
```

#### GET /api/entity1/:id
```typescript
// Response (200 OK)
{
  "id": "uuid",
  "name": "Example",
  "createdAt": "2025-10-14T12:00:00Z",
  "updatedAt": "2025-10-14T12:00:00Z"
}

// Error (404 Not Found)
{
  "error": "NotFoundError",
  "message": "Entity not found"
}
```

## 4. ビジネスロジック / Business Logic

### 4.1 主要な処理フロー

#### フロー1: Entity1の作成
```
1. リクエストを受信
2. 入力値を検証
   - nameが空でないこと
   - nameが255文字以下であること
3. データベースに保存
4. 作成されたエンティティを返却
```

#### フロー2: Entity1の更新
```
1. リクエストを受信
2. Entity1が存在することを確認
3. 入力値を検証
4. データベースを更新
5. 更新されたエンティティを返却
```

### 4.2 バリデーションルール

| フィールド | ルール |
|------------|--------|
| name | 必須、1-255文字 |
| value | 必須、0以上の整数 |

### 4.3 ビジネスルール
- ルール1: 説明
- ルール2: 説明

## 5. UI/UX設計 / UI/UX Design

### 5.1 画面一覧
- **画面1**: 一覧画面
- **画面2**: 詳細画面
- **画面3**: 作成/編集画面

### 5.2 画面フロー
```
[一覧画面] → [詳細画面]
              ↓
          [編集画面]
```

### 5.3 コンポーネント構成
```
<EntityListPage>
  <EntityListHeader>
    <CreateButton />
  </EntityListHeader>
  <EntityList>
    <EntityListItem />
    <EntityListItem />
  </EntityList>
</EntityListPage>
```

## 6. 技術選定 / Technology Stack

### 6.1 使用技術
- **言語**: TypeScript 5.x
- **フレームワーク**: Express / Next.js / etc.
- **データベース**: PostgreSQL 15.x
- **ORM**: Prisma / TypeORM / etc.
- **バリデーション**: Zod / Joi / etc.

### 6.2 選定理由
- 技術1: 選定理由
- 技術2: 選定理由

### 6.3 外部ライブラリ
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "zod": "^3.22.0"
  }
}
```

## 7. セキュリティ / Security

### 7.1 認証・認可
- **認証方式**: JWT / OAuth2.0 / etc.
- **権限管理**: ロールベースアクセス制御

### 7.2 セキュリティ対策
- [ ] 入力値のサニタイズ
- [ ] SQLインジェクション対策（ORMのパラメータ化クエリ使用）
- [ ] XSS対策（適切なエスケープ）
- [ ] CSRF対策（トークン検証）
- [ ] レート制限

## 8. パフォーマンス / Performance

### 8.1 想定負荷
- 同時接続ユーザー数: 100人
- 1秒あたりのリクエスト数: 10 req/sec

### 8.2 パフォーマンス要件
- API レスポンスタイム: 200ms以内
- ページ読み込み時間: 2秒以内

### 8.3 最適化戦略
- データベースインデックスの活用
- クエリの最適化
- キャッシュの利用（必要に応じて）

## 9. テスト戦略 / Testing Strategy

### 9.1 テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| 単体テスト | 関数、メソッド | Jest / Vitest |
| 統合テスト | API エンドポイント | Supertest |
| E2Eテスト | ユーザーフロー | Playwright / Cypress |

### 9.2 テストケース
- [ ] 正常系: 正しい入力で成功
- [ ] 異常系: 無効な入力でエラー
- [ ] 境界値: 最小値・最大値での動作
- [ ] エッジケース: null、空文字、特殊文字

## 10. エラーハンドリング / Error Handling

### 10.1 エラー分類

| エラー | HTTPステータス | 対応 |
|--------|----------------|------|
| ValidationError | 400 | 入力値エラーメッセージを返す |
| NotFoundError | 404 | リソースが見つからない |
| UnauthorizedError | 401 | 認証が必要 |
| ForbiddenError | 403 | 権限がない |
| InternalError | 500 | ログに記録し、汎用エラーメッセージ |

### 10.2 エラーレスポンス形式
```typescript
{
  "error": "ErrorType",
  "message": "Human-readable message",
  "details": {
    // 追加情報（任意）
  }
}
```

## 11. 実装タスク分割 / Task Breakdown

### 11.1 タスク一覧

| # | タスク名 | 説明 | 想定工数 | 依存 |
|---|----------|------|----------|------|
| 01 | データモデル定義 | Entity、スキーマ定義 | 2h | - |
| 02 | バリデーション実装 | Zodスキーマ作成 | 2h | - |
| 03 | API実装（CRUD） | エンドポイント実装 | 4h | 01, 02 |
| 04 | テスト実装 | 単体・統合テスト | 3h | 03 |
| 05 | UI実装 | コンポーネント作成 | 4h | 03 |

### 11.2 タスクの依存関係
```
01 (データモデル)
  ↓
03 (API実装) ← 02 (バリデーション)
  ↓
04 (テスト) + 05 (UI実装)
```

### 11.3 実装順序
1. **Phase 1**: バックエンド基盤（タスク 01, 02）
2. **Phase 2**: API実装（タスク 03）
3. **Phase 3**: テスト＋UI（タスク 04, 05）

## 12. マイグレーション / Migration

### 12.1 データベースマイグレーション
```sql
-- up.sql
CREATE TABLE entity1 (...);

-- down.sql
DROP TABLE entity1;
```

### 12.2 既存データへの影響
- 影響の有無と対応策

## 13. デプロイ / Deployment

### 13.1 デプロイ手順
1. ステップ1
2. ステップ2

### 13.2 ロールバック手順
1. ステップ1
2. ステップ2

## 14. モニタリング / Monitoring

### 14.1 監視項目
- API レスポンスタイム
- エラー発生率
- データベース接続数

### 14.2 アラート設定
- エラー率が5%を超えたらアラート
- レスポンスタイムが500msを超えたらアラート

## 15. 今後の拡張 / Future Enhancements

### 15.1 将来的に追加したい機能
- 機能A: 説明
- 機能B: 説明

### 15.2 技術的負債
- 負債1: 説明と解消方針
- 負債2: 説明と解消方針

---

**作成日**: YYYY-MM-DD
**作成者**: 名前
**最終更新**: YYYY-MM-DD
**レビュアー**: 名前
**ステータス**: Draft / In Review / Approved
