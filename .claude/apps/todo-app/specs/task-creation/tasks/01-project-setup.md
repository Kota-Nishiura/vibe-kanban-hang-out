# タスク: プロジェクトセットアップ

> Phase 1: プロジェクトの初期セットアップとテスト環境構築

## 1. タスク概要 / Task Overview

### 1.1 目的
TODO Appの開発環境をセットアップし、React + Vite + Tailwind CSS + テスト環境を構築する

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-creation/overview.md`
- `.claude/apps/todo-app/specs/task-creation/design.md`

### 1.3 依存タスク
- 前提条件: なし（最初のタスク）
- 後続タスク: 02-basic-ui.md

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `apps/todo-app/` - 新規作成
- [ ] `apps/todo-app/package.json` - 新規作成
- [ ] `apps/todo-app/vite.config.ts` - 新規作成
- [ ] `apps/todo-app/tsconfig.json` - 新規作成
- [ ] `apps/todo-app/tailwind.config.js` - 新規作成
- [ ] `apps/todo-app/postcss.config.js` - 新規作成
- [ ] `apps/todo-app/vitest.config.ts` - 新規作成
- [ ] `apps/todo-app/src/main.tsx` - 新規作成
- [ ] `apps/todo-app/src/App.tsx` - 新規作成
- [ ] `apps/todo-app/src/index.css` - 新規作成
- [ ] `apps/todo-app/index.html` - 新規作成
- [ ] `apps/todo-app/.gitignore` - 新規作成

### 2.2 実装詳細

#### ステップ1: プロジェクト構造作成
**内容:**
- `apps/todo-app/` ディレクトリ作成
- 基本的なディレクトリ構造を作成

```bash
apps/todo-app/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   └── setup.ts
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

#### ステップ2: package.json 作成
**内容:**
- 必要な依存関係を定義
- スクリプトを定義

```json
{
  "name": "todo-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.3",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/ui": "^2.1.0",
    "jsdom": "^25.0.0",
    "tailwindcss": "^3.4.11",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

#### ステップ3: TypeScript 設定
**内容:**
- `tsconfig.json` を作成
- React + Vite 用の設定

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### ステップ4: Vite 設定
**内容:**
- `vite.config.ts` を作成

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

#### ステップ5: Vitest 設定
**内容:**
- `vitest.config.ts` を作成
- テスト環境のセットアップファイルを作成

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
```

#### ステップ6: Tailwind CSS 設定
**内容:**
- Tailwind CSS の設定ファイルを作成

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### ステップ7: 基本ファイル作成
**内容:**
- エントリーポイント、HTML、CSS、App コンポーネントを作成

```html
<!-- index.html -->
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TODO App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```typescript
// src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center p-4">
        TODO App
      </h1>
      <p className="text-center text-gray-600">
        セットアップ完了
      </p>
    </div>
  );
}

export default App;
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### ステップ8: .gitignore 作成
**内容:**
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Test coverage
coverage
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `tests/App.test.tsx` - 基本的な動作確認

### 3.2 テストケース

#### 正常系
- [ ] アプリが正常に起動する
- [ ] タイトルが表示される

### 3.3 テストコード例
```typescript
// tests/App.test.tsx
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  test('タイトルが表示される', () => {
    render(<App />);
    expect(screen.getByText('TODO App')).toBeInTheDocument();
  });

  test('セットアップ完了メッセージが表示される', () => {
    render(<App />);
    expect(screen.getByText('セットアップ完了')).toBeInTheDocument();
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. `cd apps/todo-app`
2. `npm install`
3. `npm run dev`
4. ブラウザで `http://localhost:5173` を開く
5. `npm test` を実行

### 4.2 期待結果
- [ ] 開発サーバーが起動する
- [ ] ブラウザに「TODO App」と表示される
- [ ] Tailwind CSS のスタイルが適用されている
- [ ] テストが全て通る

### 4.3 確認コマンド
```bash
# インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド確認
npm run build
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- package.json の依存関係が適切か
- TypeScript の設定が適切か
- Tailwind CSS が正しく動作するか
- テスト環境が正しくセットアップされているか

### 5.2 懸念事項
- バージョンの互換性（最新の安定版を使用）

## 6. チェックリスト / Checklist

### 6.1 実装前
- [x] 設計書を理解した
- [x] 依存タスクが完了している（なし）
- [ ] Node.js がインストールされている

### 6.2 実装中
- [ ] コーディング規約に従っている
- [ ] 適切な命名を使用している
- [ ] 必要なコメントを追加している

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] 手動で動作確認した
- [ ] 不要なファイルがない
- [ ] package.json のバージョンが適切

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] コンフリクトを解消
- [ ] ビルドが通る
- [ ] PR説明を記載

## 7. 想定される問題と対処法 / Potential Issues

| 問題 | 対処法 |
|------|--------|
| npm install でエラー | Node.js のバージョンを確認（18.x 以上推奨） |
| Tailwind CSS が効かない | ビルドツールを再起動 |
| テストが動かない | jsdom のインストールを確認 |

## 8. 参考情報 / References

### 8.1 公式ドキュメント
- Vite: https://vitejs.dev/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- Vitest: https://vitest.dev/

## 9. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] プロジェクトが作成されている
- [ ] 依存関係がインストールされている
- [ ] 開発サーバーが起動する
- [ ] Tailwind CSS が動作する
- [ ] テストが実行できる
- [ ] 基本的なテストが通る
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 10. 見積もり / Estimation

- **想定工数**: 1-2時間
- **実績工数**: _____時間（完了後に記入）
- **差異の理由**: （差異があれば記入）

---

**作成日**: 2025-10-14
**担当者**: Claude Code
**最終更新**: 2025-10-14
**ステータス**: Todo
