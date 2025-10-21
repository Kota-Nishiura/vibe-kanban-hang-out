# 電卓アプリ (Calculator App)

React + TypeScript + Vite + Zustandで構築されたモダンな電卓アプリケーション

## 特徴

- ✨ **モダンなUI**: Tailwind CSSによる美しいレスポンシブデザイン
- 🎯 **状態管理**: Zustandによる効率的な状態管理
- 📱 **レスポンシブ**: モバイルからデスクトップまで対応
- ⌨️ **キーボード対応**: キーボードショートカットで操作可能
- 💾 **履歴保存**: 計算履歴をローカルストレージに自動保存
- 🌓 **ダークモード**: ライト/ダークモード対応
- ♿ **アクセシビリティ**: WAI-ARIA対応

## 技術スタック

- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **状態管理**: Zustand (immer, persist, devtools middleware)
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest + React Testing Library
- **リンティング**: ESLint + Prettier

## 電卓の仕様

### 入力制限
- **最大桁数**: 15桁
- **動作**: 15桁を超える入力は無視される
- **理由**: JavaScriptのNumber型の精度限界(約15-17桁)に基づく

### 表示形式
- **15桁以内**: そのまま表示 (例: `123456789`)
- **15桁超**: 科学的記数法で表示 (例: `1.2345678900e+20`)
- **非常に小さい数値**: 科学的記数法で表示 (例: `1.2345678900e-10`)

### サポートする演算
- 四則演算: `+` (加算), `−` (減算), `×` (乗算), `÷` (除算)
- モジュロ演算: `%`
- 小数点演算: `.`
- エラーハンドリング: ゼロ除算エラー検出

### 計算履歴
- 最大20件まで自動保存
- ローカルストレージに永続化
- 履歴から結果を復元可能

## セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# テストを実行
npm test

# ビルド
npm run build

# プレビュー
npm run preview
```

## プロジェクト構造

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx        # 再利用可能なボタンコンポーネント
│   │   └── index.ts
│   └── calculator/
│       ├── Calculator.tsx     # メインコンポーネント
│       ├── Display.tsx        # ディスプレイコンポーネント
│       ├── ButtonGrid.tsx     # ボタングリッドコンポーネント
│       └── index.ts
├── store/
│   ├── calculatorStore.ts     # Zustand状態管理
│   └── index.ts
├── types/
│   ├── calculator.ts          # TypeScript型定義
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## キーボードショートカット

- **数字キー** (`0-9`): 数字入力
- **演算子** (`+`, `-`, `*`, `/`, `%`): 演算子入力
- **Enter** または `=`: 計算実行
- **Escape**: クリア
- **Backspace**: 1文字削除
- **`.`**: 小数点入力

## ライセンス

MIT
