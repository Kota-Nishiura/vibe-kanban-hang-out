# タスク: [タスク名]

> このドキュメントは1つのPRに対応する実装タスクを記述します。

## 1. タスク概要 / Task Overview

### 1.1 目的
このタスクで実現すること（1-2文）

### 1.2 関連ドキュメント
- `.claude/apps/[app-name]/specs/[feature]/overview.md`
- `.claude/apps/[app-name]/specs/[feature]/design.md`

### 1.3 依存タスク
- 前提条件: 完了している必要があるタスク
- 後続タスク: このタスクの後に実施するタスク

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `path/to/file1.ts` - 説明
- [ ] `path/to/file2.ts` - 説明
- [ ] `path/to/file3.test.ts` - 説明

### 2.2 実装詳細

#### ステップ1: [ステップ名]
**内容:**
- 実装する内容の説明

**コード例:**
```typescript
// 実装のイメージ（必要に応じて）
export function exampleFunction() {
  // ...
}
```

#### ステップ2: [ステップ名]
**内容:**
- 実装する内容の説明

**コード例:**
```typescript
// 実装のイメージ
```

### 2.3 インターフェース定義
```typescript
// 新しく追加する型やインターフェース
interface NewInterface {
  id: string;
  name: string;
}
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `path/to/test1.test.ts`
- [ ] `path/to/test2.test.ts`

### 3.2 テストケース

#### 正常系
- [ ] ケース1: 説明
- [ ] ケース2: 説明

#### 異常系
- [ ] ケース1: 説明（例: 無効な入力）
- [ ] ケース2: 説明（例: リソースが存在しない）

#### エッジケース
- [ ] ケース1: 説明（例: null、空文字）
- [ ] ケース2: 説明（例: 境界値）

### 3.3 テストコード例
```typescript
describe('ExampleFunction', () => {
  test('正常系: 正しい入力で成功する', () => {
    // Arrange
    const input = { name: 'test' };

    // Act
    const result = exampleFunction(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('test');
  });

  test('異常系: 無効な入力でエラーを返す', () => {
    // Arrange
    const input = { name: '' };

    // Act & Assert
    expect(() => exampleFunction(input)).toThrow(ValidationError);
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. 手順1: 説明
2. 手順2: 説明
3. 手順3: 説明

### 4.2 期待結果
- [ ] 結果1: 説明
- [ ] 結果2: 説明

### 4.3 確認コマンド
```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド確認
npm run build
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- ポイント1: 説明
- ポイント2: 説明

### 5.2 懸念事項
- 懸念1: 説明と対応方針
- 懸念2: 説明と対応方針

## 6. チェックリスト / Checklist

### 6.1 実装前
- [ ] 設計書を理解した
- [ ] 依存タスクが完了している
- [ ] 開発環境が正常に動作する

### 6.2 実装中
- [ ] コーディング規約に従っている
- [ ] 適切な命名を使用している
- [ ] エラーハンドリングを実装している
- [ ] 必要なコメントを追加している

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] 手動で動作確認した
- [ ] コードをセルフレビューした
- [ ] ドキュメントを更新した（必要に応じて）
- [ ] コミットメッセージが適切
- [ ] 不要なコメントアウトやデバッグコードを削除

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] コンフリクトを解消
- [ ] CI/CDが通る
- [ ] PR説明を記載

## 7. 想定される問題と対処法 / Potential Issues

| 問題 | 対処法 |
|------|--------|
| 問題1の説明 | 対処法の説明 |
| 問題2の説明 | 対処法の説明 |

## 8. 参考情報 / References

### 8.1 関連コード
- 既存の類似実装: `path/to/similar-code.ts`
- 参考にしたコード: 説明

### 8.2 外部リンク
- ライブラリドキュメント（必要に応じて）
- 技術記事（必要に応じて）

## 9. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] すべての実装が完了している
- [ ] すべてのテストが通る
- [ ] 手動テストで期待通り動作する
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 10. 見積もり / Estimation

- **想定工数**: X時間
- **実績工数**: Y時間（完了後に記入）
- **差異の理由**: 差異があれば記入

---

**作成日**: YYYY-MM-DD
**担当者**: 名前
**最終更新**: YYYY-MM-DD
**ステータス**: Todo / In Progress / In Review / Done
