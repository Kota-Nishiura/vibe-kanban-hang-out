# コーディング規約 / Coding Standards

このドキュメントは、プロジェクト全体で一貫したコード品質を保つための標準的な規約を定義します。

## 1. 基本原則 / Basic Principles

### 1.1 可読性優先
- コードは書く時間より読む時間の方が長い
- 明確で理解しやすいコードを書く
- 適切な命名規則を使用する

### 1.2 シンプルさ
- YAGNI (You Aren't Gonna Need It) の原則に従う
- 過度な抽象化を避ける
- 必要最小限の実装から始める

### 1.3 保守性
- DRY (Don't Repeat Yourself) の原則に従う
- 単一責任の原則を守る
- 変更に強い設計を心がける

## 2. 命名規則 / Naming Conventions

### 2.1 一般的なルール
- 意味のある名前を使用する
- 略語は一般的なもの以外は避ける
- 文脈に応じた適切な長さにする

### 2.2 言語別の規約

#### TypeScript/JavaScript
```typescript
// 変数・関数: camelCase
const userName = 'John';
function getUserData() {}

// クラス・型: PascalCase
class UserService {}
interface UserData {}
type UserId = string;

// 定数: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// プライベートメンバー: _prefix (必要に応じて)
class User {
  private _internalId: string;
}

// ファイル名: kebab-case
// user-service.ts, api-client.ts
```

#### Python
```python
# 変数・関数: snake_case
user_name = 'John'
def get_user_data():
    pass

# クラス: PascalCase
class UserService:
    pass

# 定数: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_BASE_URL = 'https://api.example.com'

# プライベートメンバー: _prefix
class User:
    def __init__(self):
        self._internal_id = None

# ファイル名: snake_case
# user_service.py, api_client.py
```

## 3. コード構造 / Code Structure

### 3.1 ファイル構成
- 1ファイル1クラス/1主要機能を基本とする
- ファイルサイズは300行以内を目安とする
- 関連する機能はディレクトリで整理する

### 3.2 関数・メソッド
- 1つの関数は1つのことだけを行う
- 関数の長さは50行以内を目安とする
- 引数は3つ以下を推奨（それ以上の場合はオブジェクトにまとめる）
- 早期リターンを活用してネストを減らす

```typescript
// Good
function processUser(user: User): Result {
  if (!user.isValid()) {
    return Result.error('Invalid user');
  }

  if (!user.isActive()) {
    return Result.error('Inactive user');
  }

  return processActiveUser(user);
}

// Avoid
function processUser(user: User): Result {
  if (user.isValid()) {
    if (user.isActive()) {
      return processActiveUser(user);
    } else {
      return Result.error('Inactive user');
    }
  } else {
    return Result.error('Invalid user');
  }
}
```

### 3.3 インポート順序
1. 標準ライブラリ
2. サードパーティライブラリ
3. プロジェクト内部のモジュール

```typescript
// Standard library
import { readFile } from 'fs/promises';

// Third-party
import express from 'express';
import { z } from 'zod';

// Internal
import { UserService } from '@/services/user-service';
import { config } from '@/config';
```

## 4. エラーハンドリング / Error Handling

### 4.1 基本方針
- 予期されるエラーは適切に処理する
- 予期しないエラーは上位層に伝播させる
- エラーメッセージは具体的で理解しやすくする

### 4.2 実装例

```typescript
// 型安全なエラーハンドリング
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function parseUserData(json: string): Result<User> {
  try {
    const data = JSON.parse(json);
    const user = validateUser(data);
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

### 4.3 エラーの分類
- **ValidationError**: 入力値の検証エラー
- **NotFoundError**: リソースが見つからない
- **UnauthorizedError**: 認証エラー
- **ForbiddenError**: 権限エラー
- **InternalError**: 内部エラー

## 5. コメント / Comments

### 5.1 基本方針
- コードで表現できることはコードで表現する
- WHYを説明する（WHATではなく）
- 複雑なロジックには説明を追加する
- TODOコメントには日付と担当者を記載する

```typescript
// Good: WHYを説明
// ユーザーのタイムゾーンを考慮して、現地時間で比較する必要がある
const localTime = convertToUserTimezone(timestamp, user.timezone);

// Avoid: WHATを説明（コードを見ればわかる）
// ユーザーのタイムゾーンに変換する
const localTime = convertToUserTimezone(timestamp, user.timezone);

// TODO: [@username, 2025-10-14] パフォーマンス改善のためキャッシュを導入する
```

### 5.2 JSDoc/docstring
- 公開API、複雑な関数には必ず記載する
- パラメータ、戻り値、例外を明記する

```typescript
/**
 * ユーザーデータを取得する
 *
 * @param userId - ユーザーID
 * @param options - 取得オプション
 * @returns ユーザーデータ、または見つからない場合はnull
 * @throws {UnauthorizedError} 認証されていない場合
 *
 * @example
 * const user = await getUserData('user-123', { includeProfile: true });
 */
async function getUserData(
  userId: string,
  options: GetUserOptions = {}
): Promise<User | null> {
  // ...
}
```

## 6. テスト / Testing

### 6.1 テストの原則
- 各機能には対応するテストを書く
- テストは読みやすく、保守しやすくする
- テストコードも本番コードと同じ品質を保つ

### 6.2 テストの構造（AAA パターン）
```typescript
test('ユーザーが正常に作成される', async () => {
  // Arrange（準備）
  const userData = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  // Act（実行）
  const user = await createUser(userData);

  // Assert（検証）
  expect(user.name).toBe('John Doe');
  expect(user.email).toBe('john@example.com');
  expect(user.id).toBeDefined();
});
```

### 6.3 テストの命名
- 「何をテストするか」が明確にわかる名前にする
- 日本語での記述も可

```typescript
// Good
test('無効なメールアドレスの場合はエラーを返す', () => {});
test('returns error when email is invalid', () => {});

// Avoid
test('test1', () => {});
test('user test', () => {});
```

## 7. バージョン管理 / Version Control

### 7.1 コミットメッセージ
- 明確で具体的なメッセージを書く
- 変更の理由を含める
- Conventional Commits形式を推奨

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Examples
feat(auth): ユーザー認証機能を追加

Google OAuth2.0を使用した認証フローを実装。
セッション管理にはJWTを使用。

Closes #123

fix(api): ユーザー取得時のnullポインタエラーを修正

ユーザーが存在しない場合の処理を追加。
適切なエラーメッセージを返すように変更。

chore(deps): dependenciesを最新版に更新
```

### 7.2 ブランチ戦略
- `main`: 本番環境に対応する安定版
- `develop`: 開発中の最新版
- `feature/*`: 新機能開発
- `fix/*`: バグ修正
- `refactor/*`: リファクタリング

### 7.3 プルリクエスト
- 変更内容を明確に説明する
- レビューしやすい単位に分割する
- テストが通ることを確認する
- 自己レビューを実施してから提出する

## 8. パフォーマンス / Performance

### 8.1 基本方針
- 早すぎる最適化は避ける
- ボトルネックを計測してから最適化する
- 可読性を犠牲にしない

### 8.2 一般的な注意点
- 不要なループや処理を避ける
- 適切なデータ構造を選択する
- 大量データの処理にはページネーションを使用する
- 重い処理は非同期で実行する

```typescript
// Good: 効率的な検索
const userMap = new Map(users.map(u => [u.id, u]));
const user = userMap.get(userId); // O(1)

// Avoid: 非効率な検索
const user = users.find(u => u.id === userId); // O(n)
```

## 9. セキュリティ / Security

### 9.1 基本原則
- 入力値は常に検証する
- 機密情報をコードに直接書かない
- 最小権限の原則に従う

### 9.2 チェックリスト
- [ ] 環境変数で機密情報を管理
- [ ] ユーザー入力のサニタイズ
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] 適切な認証・認可の実装
- [ ] HTTPSの使用
- [ ] 依存関係の脆弱性チェック

```typescript
// Good: 環境変数の使用
const apiKey = process.env.API_KEY;

// Avoid: ハードコーディング
const apiKey = 'sk_live_abc123...'; // Never do this!
```

## 10. ドキュメント / Documentation

### 10.1 必須ドキュメント
- **README.md**: プロジェクト概要、セットアップ手順
- **CHANGELOG.md**: バージョンごとの変更履歴
- **API仕様書**: 公開APIの仕様
- **アーキテクチャ図**: システム構成の概要

### 10.2 コードドキュメント
- 複雑なアルゴリズムの説明
- 設計判断の理由
- 制限事項や既知の問題

## 11. コードレビュー / Code Review

### 11.1 レビュアーの視点
- [ ] コードは理解しやすいか
- [ ] テストは十分か
- [ ] エッジケースが考慮されているか
- [ ] パフォーマンスの問題はないか
- [ ] セキュリティの問題はないか
- [ ] 既存のコードスタイルに従っているか

### 11.2 レビュー時の態度
- 建設的なフィードバックを提供する
- 具体的な改善案を示す
- 良い点も積極的に伝える
- 質問形式で対話する

## 12. 継続的改善 / Continuous Improvement

### 12.1 定期的な見直し
- この規約は絶対的なものではない
- チームで定期的に見直し、更新する
- 新しい知見やツールを積極的に取り入れる

### 12.2 学習と成長
- コードレビューから学ぶ
- 技術記事や書籍で最新情報をキャッチアップする
- チーム内で知識を共有する

---

## 参考資料 / References

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
- [Effective TypeScript](https://effectivetypescript.com/)
- [Python PEP 8](https://peps.python.org/pep-0008/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**最終更新**: 2025-10-14
**バージョン**: 1.0.0
