# TODO App

## 概要
シンプルなタスク管理アプリケーション

## 技術スタック
- **言語**: TypeScript
- **フロントエンド**: React + Vite
- **UIライブラリ**: Tailwind CSS + shadcn/ui
- **データ保存**: ローカルストレージ
- **テスト**: Vitest + Testing Library

## ディレクトリ構造
```
apps/todo-app/
├── src/
│   ├── components/     # Reactコンポーネント
│   ├── hooks/          # カスタムフック
│   ├── lib/            # ユーティリティ、ヘルパー関数
│   ├── types/          # 型定義
│   ├── App.tsx         # メインアプリコンポーネント
│   └── main.tsx        # エントリーポイント
├── tests/              # テストファイル
├── public/             # 静的ファイル
└── package.json
```

## セットアップ
```bash
cd apps/todo-app
npm install
npm run dev
```

## 実行方法
```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build
```

## 機能一覧
- [x] タスク作成機能

---

**作成日**: 2025-10-14
**最終更新**: 2025-10-14
