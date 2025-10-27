---
inclusion: always
---

# コーディングルールとベストプラクティス

## 基本原則

### 必須ルール（MUST）
- **すべて日本語でコメントと説明を記述**
- **既存コードを削除してエラー解消してはならない**（型エラー等でも削除禁止）
- **目的達成に必要な最小限の変更に限定**（過剰な抽象化や不要な修正を避ける）
- **ボーイスカウトルール**: 実装箇所のコードは見つけた時よりも良い状態で残す

### 設定ファイル変更制限
以下のファイルは明示的な指示がある場合のみ変更可能：
- `package.json`
- `tsconfig.json`
- ESLint設定ファイル
- Docker関連ファイル
- `.env`ファイル

### 変更規模の制限
以下の場合は着手前に確認が必要：
- **既存ファイル50行超の変更**
- **5ファイル超の同時変更**
- **依存関係（dependencies/devDependencies）の追加・削除**

## エラーハンドリング

### 必須要件
- **エラーは抑制ではなく根本原因を修正**
  - `@ts-ignore`の使用禁止
  - `try-catch`でエラーを握りつぶすことを禁止
- **外部API/ネットワーク通信は必ず失敗を考慮**
- **早期リターン（early return）を活用してネストを減らす**

### 実装例
```typescript
// ❌ 悪い例
try {
  const data = await fetchData();
  // @ts-ignore
  return data.someProperty;
} catch {
  return null; // エラーを握りつぶし
}

// ✅ 良い例
const fetchDataSafely = async (): Promise<DataType | null> => {
  try {
    const data = await fetchData();
    if (!data?.someProperty) {
      console.warn('データの形式が不正です');
      return null;
    }
    return data;
  } catch (error) {
    console.error('データ取得に失敗しました:', error);
    throw new Error('データ取得エラー');
  }
};
```

## コード品質

### 必須要件
- **使用されていないコード（デッドコード）は削除**
- **重複を避け単一の信頼できる情報源を維持**（DRY原則）
- **意味のある変数名・関数名で意図を明確に伝える**
- **コメントは「なぜ（WHY）」を説明、「何を（WHAT）」はコードで表現**

### 命名規則
```typescript
// ❌ 悪い例
const d = new Date(); // 何の日付か不明
const calc = (x, y) => x * y; // 何を計算するか不明

// ✅ 良い例
const sessionStartTime = new Date();
const calculateRemainingTime = (totalSeconds: number, elapsedSeconds: number) => 
  totalSeconds - elapsedSeconds;
```

### コメント例
```typescript
// ❌ 悪い例：何をしているかの説明
// タイマーを開始する
const startTimer = () => { ... };

// ✅ 良い例：なぜそうするかの説明
// ブラウザのタブが非アクティブになると setInterval の精度が落ちるため
// requestAnimationFrame と組み合わせて高精度を維持
const startHighPrecisionTimer = () => { ... };
```

## セキュリティ

### 必須要件
- **個人情報/顧客情報/機密情報を外部送信しない**
- **APIキー・パスワード等は環境変数で管理**（ハードコード禁止）
- **すべての外部入力を検証（サニタイズ）**
- **生成物は必ず人間のレビューを経て採用**

### 実装例
```typescript
// ❌ 悪い例
const API_KEY = "sk-1234567890abcdef"; // ハードコード

// ✅ 良い例
const API_KEY = process.env.VITE_API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY環境変数が設定されていません');
}
```

## テスト

### 必須要件
- **テストをスキップせず、問題があれば修正**
- **テスト間の依存を避け任意の順序で実行可能**
- **AAAパターン（Arrange/Act/Assert）を推奨**

### テスト例
```typescript
describe('PomodoroTimer', () => {
  it('開始ボタンクリック時にタイマーが開始される', () => {
    // Arrange: テスト準備
    const { getByRole } = render(<PomodoroTimer />);
    const startButton = getByRole('button', { name: '開始' });
    
    // Act: 実行
    fireEvent.click(startButton);
    
    // Assert: 検証
    expect(startButton).toHaveTextContent('一時停止');
  });
});
```

## ツール要件

### 必須要件
- **lint/typecheck/testの最低実行コマンドを壊さない**
  - `npm run test`
  - `npm run lint`
  - `npm run type-check`

### 推奨事項
- ESLint/Prettierルールに従う
- TypeScriptの型安全性を最優先
- 関数は50行以内に収める
- カバレッジ80%以上を維持

## タスク完了時の自動化ルール

### 必須実行事項（MUST）
タスクを完了状態にする際は、以下を自動実行する：

1. **適切なブランチでの作業確認**
   - mainブランチでの作業は禁止
   - タスク専用ブランチ（feat/pomodoro-*）で実装

2. **コミット・プッシュ・PR作成の自動実行**
   ```bash
   # 変更をステージング
   git add .
   
   # 規約に従ったコミット
   git commit -m "feat(<scope>): <task-title>"
   
   # リモートにプッシュ  
   git push origin <current-branch>
   
   # PR自動作成
   gh pr create --title "feat(<scope>): <task-title>" --body "<task-details>"
   ```

3. **PR作成時の品質チェック**
   - TypeScript型チェック通過確認
   - ESLintエラーゼロ確認
   - 実装要件との整合性確認

### タスク完了の定義
- 要件で指定された機能がすべて実装済み
- TypeScript型エラーなし
- 基本的な動作確認完了
- 適切な日本語コメント追加済み