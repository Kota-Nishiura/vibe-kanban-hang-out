# タスク作成機能 - 設計書

> この機能はTODOアプリの最も基本的な機能です。

## 1. アーキテクチャ概要 / Architecture Overview

### 1.1 システム構成図
```
[ブラウザ]
    ↓
[React App]
    ├─ TaskInput (入力フォーム)
    ├─ TaskList (一覧表示)
    └─ LocalStorage (永続化)
```

### 1.2 主要コンポーネント
- **TaskInput**: タスク入力フォーム（タイトル、内容、バリデーション、エラー表示）
- **TaskList**: タスク一覧表示
- **TaskItem**: 個別のタスク表示
- **useLocalStorage**: ローカルストレージ管理カスタムフック
- **useTasks**: タスク管理カスタムフック

## 2. データモデル / Data Model

### 2.1 エンティティ

#### Task
```typescript
interface Task {
  id: string;           // UUID
  title: string;        // 必須、1-100文字
  content: string;      // 任意、0-1000文字
  createdAt: Date;      // 作成日時
  updatedAt: Date;      // 更新日時（将来の編集機能用）
}
```

#### TaskFormData
```typescript
interface TaskFormData {
  title: string;
  content: string;
}
```

#### ValidationError
```typescript
interface ValidationError {
  field: 'title' | 'content';
  message: string;
}
```

### 2.2 ローカルストレージスキーマ
```typescript
// Key: 'todo-app:tasks'
// Value: JSON.stringify(Task[])
localStorage.setItem('todo-app:tasks', JSON.stringify([
  {
    id: 'uuid-1',
    title: 'タスク1',
    content: '説明...',
    createdAt: '2025-10-14T12:00:00Z',
    updatedAt: '2025-10-14T12:00:00Z'
  }
]));
```

## 3. UI/UX設計 / UI/UX Design

### 3.1 画面レイアウト（ChatGPT風）

```
┌─────────────────────────────────────┐
│  TODO App                           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ タスク1                      │   │
│  │ 説明...                      │   │
│  │ 2025-10-14 12:00            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ タスク2                      │   │
│  │ 説明...                      │   │
│  │ 2025-10-14 13:00            │   │
│  └─────────────────────────────┘   │
│                                     │
│  (スクロール可能)                   │
│                                     │
├─────────────────────────────────────┤
│  [エラー表示エリア]                 │
│  ┌─────────────────────────────┐   │
│  │ タイトル                     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 内容（任意）                 │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  [作成] または Enter             │
└─────────────────────────────────────┘
```

### 3.2 コンポーネント構成
```tsx
<App>
  <div className="container">
    {/* ヘッダー */}
    <header>
      <h1>TODO App</h1>
    </header>

    {/* タスク一覧エリア（上部、スクロール） */}
    <main className="task-list-area">
      <TaskList tasks={tasks} />
    </main>

    {/* 入力フォームエリア（下部、固定） */}
    <footer className="input-area">
      <TaskInput
        onSubmit={handleCreateTask}
        error={error}
      />
    </footer>
  </div>
</App>

<TaskList>
  {tasks.map(task => (
    <TaskItem key={task.id} task={task} />
  ))}
</TaskList>

<TaskItem task={task}>
  <div className="task-card">
    <h3>{task.title}</h3>
    <p>{task.content}</p>
    <time>{formatDate(task.createdAt)}</time>
  </div>
</TaskItem>

<TaskInput>
  {error && (
    <div className="error-message">{error.message}</div>
  )}
  <input
    type="text"
    placeholder="タスクのタイトル"
    value={title}
    onChange={handleTitleChange}
  />
  <textarea
    placeholder="内容（任意）"
    value={content}
    onChange={handleContentChange}
  />
  <button type="submit">作成</button>
</TaskInput>
```

### 3.3 インタラクション
1. ユーザーがタイトルと内容を入力
2. Enterキーまたは作成ボタンをクリック
3. バリデーションチェック
   - エラーがあれば、エラーメッセージを表示して終了
   - エラーがなければ、次へ
4. タスクを作成（UUID生成、現在日時設定）
5. ローカルストレージに保存
6. 一覧の最上部に追加
7. 入力フォームをクリア
8. 一覧を最上部までスクロール

## 4. ビジネスロジック / Business Logic

### 4.1 主要な処理フロー

#### フロー1: タスクの作成
```typescript
function createTask(formData: TaskFormData): Result<Task, ValidationError> {
  // 1. バリデーション
  const validation = validateTaskInput(formData);
  if (!validation.success) {
    return validation;
  }

  // 2. タスクオブジェクト生成
  const task: Task = {
    id: crypto.randomUUID(),
    title: formData.title.trim(),
    content: formData.content,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 3. ローカルストレージに保存
  const tasks = loadTasksFromLocalStorage();
  tasks.unshift(task); // 最新を先頭に
  saveTasksToLocalStorage(tasks);

  // 4. 成功を返す
  return { success: true, data: task };
}
```

#### フロー2: タスクの読み込み
```typescript
function loadTasks(): Task[] {
  // 1. ローカルストレージから取得
  const data = localStorage.getItem('todo-app:tasks');

  // 2. パース
  if (!data) return [];

  try {
    const tasks = JSON.parse(data);
    // 3. 日付を Date オブジェクトに変換
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to parse tasks:', error);
    return [];
  }
}
```

### 4.2 バリデーションルール

| フィールド | ルール | エラーメッセージ |
|------------|--------|------------------|
| title | 必須 | タイトルを入力してください |
| title | 前後をtrim後、空でない | タイトルを入力してください |
| title | 100文字以内 | タイトルは100文字以内で入力してください |
| content | 任意 | - |
| content | 1000文字以内 | 内容は1000文字以内で入力してください |

```typescript
function validateTaskInput(data: TaskFormData): Result<TaskFormData, ValidationError> {
  const trimmedTitle = data.title.trim();

  // タイトル必須チェック
  if (!trimmedTitle) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タイトルを入力してください'
      }
    };
  }

  // タイトル文字数チェック
  if (trimmedTitle.length > 100) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タイトルは100文字以内で入力してください'
      }
    };
  }

  // 内容文字数チェック
  if (data.content.length > 1000) {
    return {
      success: false,
      error: {
        field: 'content',
        message: '内容は1000文字以内で入力してください'
      }
    };
  }

  return {
    success: true,
    data: {
      title: trimmedTitle,
      content: data.content
    }
  };
}
```

## 5. 技術選定 / Technology Stack

### 5.1 使用技術
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 5.x
- **フレームワーク**: React 18.x
- **UIライブラリ**: Tailwind CSS 3.x + shadcn/ui
- **テスト**: Vitest + React Testing Library
- **ユーティリティ**: date-fns（日付フォーマット）

### 5.2 選定理由
- **Vite**: 高速な開発サーバー、モダンなビルドツール
- **React**: コンポーネントベースの開発、豊富なエコシステム
- **Tailwind CSS**: ユーティリティファーストで高速開発
- **shadcn/ui**: 高品質なコンポーネント、カスタマイズ可能
- **Vitest**: Viteとの統合、高速なテスト実行

### 5.3 パッケージ構成
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
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## 6. テスト戦略 / Testing Strategy

### 6.1 テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| 単体テスト | ユーティリティ関数、フック | Vitest |
| コンポーネントテスト | React コンポーネント | Vitest + Testing Library |
| 統合テスト | ユーザーフロー | Vitest + Testing Library |

### 6.2 テストケース

#### バリデーションのテスト
```typescript
describe('validateTaskInput', () => {
  test('正常: 有効な入力', () => {
    const result = validateTaskInput({ title: 'タスク', content: '説明' });
    expect(result.success).toBe(true);
  });

  test('異常: タイトルが空', () => {
    const result = validateTaskInput({ title: '', content: '' });
    expect(result.success).toBe(false);
    expect(result.error.field).toBe('title');
  });

  test('異常: タイトルが空白のみ', () => {
    const result = validateTaskInput({ title: '   ', content: '' });
    expect(result.success).toBe(false);
  });

  test('異常: タイトルが101文字', () => {
    const result = validateTaskInput({ title: 'a'.repeat(101), content: '' });
    expect(result.success).toBe(false);
  });

  test('境界値: タイトルが100文字', () => {
    const result = validateTaskInput({ title: 'a'.repeat(100), content: '' });
    expect(result.success).toBe(true);
  });

  test('正常: タイトルの前後空白はtrim', () => {
    const result = validateTaskInput({ title: '  タスク  ', content: '' });
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('タスク');
  });
});
```

#### コンポーネントのテスト
```typescript
describe('TaskInput', () => {
  test('タスクを作成できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'テストタスク',
      content: ''
    });
  });

  test('Enterキーで作成できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');

    await userEvent.type(titleInput, 'テストタスク{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });

  test('エラーメッセージが表示される', () => {
    const error = { field: 'title', message: 'タイトルを入力してください' };
    render(<TaskInput onSubmit={() => {}} error={error} />);

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
  });
});
```

#### ローカルストレージのテスト
```typescript
describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを保存・読み込みできる', () => {
    const tasks = [
      {
        id: '1',
        title: 'タスク1',
        content: '説明1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    saveTasks(tasks);
    const loaded = loadTasks();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('タスク1');
  });
});
```

## 7. エラーハンドリング / Error Handling

### 7.1 エラー分類

| エラー | 表示方法 | 対応 |
|--------|----------|------|
| ValidationError | インラインエラー | ユーザーに修正を促す |
| LocalStorageQuotaExceeded | トースト通知 | タスク数の削減を促す |
| ParseError | コンソールログ | 空の配列を返す |

### 7.2 エラー表示例
```tsx
// インラインエラー表示
{error && (
  <div className="text-red-600 text-sm mb-2" role="alert">
    {error.message}
  </div>
)}

// ローカルストレージ容量不足
try {
  localStorage.setItem('todo-app:tasks', JSON.stringify(tasks));
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('ストレージの容量が不足しています。不要なタスクを削除してください。');
  }
}
```

## 8. パフォーマンス / Performance

### 8.1 想定負荷
- タスク数: 最大1000件
- 同時操作: 1ユーザー（ローカルのみ）

### 8.2 最適化戦略
- タスク一覧は仮想スクロール不要（1000件程度なら問題なし）
- ローカルストレージへの書き込みは debounce 不要（書き込み頻度が低い）
- React.memo でコンポーネントの再レンダリングを最適化

## 9. 実装タスク分割 / Task Breakdown

### 9.1 タスク一覧

| # | タスク名 | 説明 | 想定工数 | 依存 |
|---|----------|------|----------|------|
| 01 | プロジェクトセットアップ | Vite、React、Tailwind、テスト環境 | 1-2h | - |
| 02 | 基本UI実装 | レイアウト、入力フォーム、一覧表示（ダミーデータ） | 2-3h | 01 |
| 03 | ローカルストレージ連携 | 保存・読み込み、カスタムフック | 1-2h | 02 |
| 04 | バリデーション・エラー表示 | 入力検証、エラー表示 | 1-2h | 03 |
| 05 | テスト実装 | 単体テスト、コンポーネントテスト | 2-3h | 04 |

### 9.2 タスクの依存関係
```
01 (セットアップ)
  ↓
02 (基本UI)
  ↓
03 (ローカルストレージ)
  ↓
04 (バリデーション)
  ↓
05 (テスト)
```

### 9.3 実装順序
1. **Phase 1**: プロジェクトセットアップ + 基本UI（タスク 01, 02）
2. **Phase 2**: ローカルストレージ連携（タスク 03）
3. **Phase 3**: バリデーション + テスト（タスク 04, 05）

## 10. アクセシビリティ / Accessibility

### 10.1 対応項目
- [ ] キーボード操作（Tab、Enter）
- [ ] ARIA属性（role、aria-label、aria-describedby）
- [ ] エラーメッセージのスクリーンリーダー対応
- [ ] フォーカス管理

### 10.2 実装例
```tsx
<input
  type="text"
  aria-label="タスクのタイトル"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? 'title-error' : undefined}
/>
{error && (
  <div id="title-error" role="alert">
    {error.message}
  </div>
)}
```

---

**作成日**: 2025-10-14
**作成者**: Claude Code
**最終更新**: 2025-10-14
**レビュアー**: 未定
**ステータス**: Draft
