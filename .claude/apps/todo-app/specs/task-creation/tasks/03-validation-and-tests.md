# タスク: バリデーション + テスト完成

> Phase 3: 入力バリデーション、エラー表示、テスト完成

## 1. タスク概要 / Task Overview

### 1.1 目的
入力バリデーションとエラー表示を実装し、すべてのテストを完成させる

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-creation/overview.md`
- `.claude/apps/todo-app/specs/task-creation/design.md`

### 1.3 依存タスク
- 前提条件: 02-basic-ui-and-storage.md が完了
- 後続タスク: なし（最終タスク）

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `src/types/validation.ts` - 新規作成
- [ ] `src/lib/validation.ts` - 新規作成
- [ ] `src/components/TaskInput.tsx` - 更新
- [ ] `src/hooks/useTasks.ts` - 更新（バリデーション追加）
- [ ] `tests/lib/validation.test.ts` - 新規作成
- [ ] `tests/components/TaskInput.test.tsx` - 更新
- [ ] `tests/integration/task-creation.test.tsx` - 新規作成

### 2.2 実装詳細

#### ステップ1: バリデーション型定義
**内容:**
- バリデーションエラーの型を定義

```typescript
// src/types/validation.ts
export interface ValidationError {
  field: 'title' | 'content';
  message: string;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

#### ステップ2: バリデーションロジック
**内容:**
- 入力検証関数を実装

```typescript
// src/lib/validation.ts
import { TaskFormData } from '../types/task';
import { ValidationError, Result } from '../types/validation';

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;

export function validateTaskInput(
  data: TaskFormData
): Result<TaskFormData, ValidationError> {
  const trimmedTitle = data.title.trim();

  // タイトル必須チェック
  if (!trimmedTitle) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タイトルを入力してください',
      },
    };
  }

  // タイトル文字数チェック
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      success: false,
      error: {
        field: 'title',
        message: `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください`,
      },
    };
  }

  // 内容文字数チェック
  if (data.content.length > MAX_CONTENT_LENGTH) {
    return {
      success: false,
      error: {
        field: 'content',
        message: `内容は${MAX_CONTENT_LENGTH}文字以内で入力してください`,
      },
    };
  }

  // 成功
  return {
    success: true,
    data: {
      title: trimmedTitle,
      content: data.content,
    },
  };
}
```

#### ステップ3: TaskInput コンポーネント更新
**内容:**
- バリデーションとエラー表示を追加

```typescript
// src/components/TaskInput.tsx
import { useState, FormEvent } from 'react';
import { TaskFormData } from '../types/task';
import { ValidationError } from '../types/validation';

interface TaskInputProps {
  onSubmit: (data: TaskFormData) => void;
  error?: ValidationError | null;
}

export function TaskInput({ onSubmit, error }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
  };

  // 成功時にフォームクリア（親から呼ばれる想定）
  const clearForm = () => {
    setTitle('');
    setContent('');
  };

  // 外部から呼べるようにする（useImperativeHandle 使うか、別の方法）
  // 今回はシンプルに親が成功時に key を変更してリセットする方式

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4 shadow-lg">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* エラーメッセージ表示 */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            role="alert"
            id={`${error.field}-error`}
          >
            <p className="text-sm font-medium">{error.message}</p>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="タスクのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              error?.field === 'title'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-label="タスクのタイトル"
            aria-required="true"
            aria-invalid={error?.field === 'title'}
            aria-describedby={error?.field === 'title' ? 'title-error' : undefined}
          />
          {/* 文字数カウンター */}
          <p className="text-xs text-gray-500 mt-1 text-right">
            {title.length} / 100
          </p>
        </div>

        <div>
          <textarea
            placeholder="内容（任意）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              error?.field === 'content'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-label="タスクの内容"
            aria-invalid={error?.field === 'content'}
            aria-describedby={error?.field === 'content' ? 'content-error' : undefined}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {content.length} / 1000
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          作成
        </button>
      </div>
    </form>
  );
}
```

#### ステップ4: useTasks フック更新
**内容:**
- バリデーションを組み込む

```typescript
// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { ValidationError } from '../types/validation';
import { loadTasks, saveTasks } from '../lib/storage';
import { generateId } from '../lib/utils';
import { validateTaskInput } from '../lib/validation';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<ValidationError | null>(null);

  // 初回ロード
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // タスク追加
  const addTask = (formData: TaskFormData) => {
    // バリデーション
    const validation = validateTaskInput(formData);

    if (!validation.success) {
      setError(validation.error);
      return false;
    }

    // エラークリア
    setError(null);

    // タスク作成
    const newTask: Task = {
      id: generateId(),
      title: validation.data.title,
      content: validation.data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    return true;
  };

  return {
    tasks,
    addTask,
    error,
  };
}
```

#### ステップ5: App コンポーネント更新
**内容:**
- エラーを表示、成功時にフォームリセット

```typescript
// src/App.tsx
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { TaskFormData } from './types/task';

function App() {
  const { tasks, addTask, error } = useTasks();

  const handleSubmit = (data: TaskFormData) => {
    const success = addTask(data);
    // 成功時はフォームがクリアされる仕組みが必要
    // TaskInput を key でリセットするか、ref を使う
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">TODO App</h1>
        </div>
      </header>

      {/* タスク一覧エリア */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <TaskList tasks={tasks} />
        </div>
      </main>

      {/* 入力フォームエリア（固定） */}
      <footer className="sticky bottom-0">
        <TaskInput onSubmit={handleSubmit} error={error} />
      </footer>
    </div>
  );
}

export default App;
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `tests/lib/validation.test.ts` - 新規作成
- [ ] `tests/components/TaskInput.test.tsx` - 更新
- [ ] `tests/integration/task-creation.test.tsx` - 新規作成

### 3.2 テストケース

#### バリデーションのテスト
```typescript
// tests/lib/validation.test.ts
import { describe, test, expect } from 'vitest';
import { validateTaskInput } from '../../src/lib/validation';

describe('validateTaskInput', () => {
  describe('正常系', () => {
    test('有効な入力', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: '説明',
      });
      expect(result.success).toBe(true);
    });

    test('内容が空でもOK', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: '',
      });
      expect(result.success).toBe(true);
    });

    test('タイトルの前後空白はtrim', () => {
      const result = validateTaskInput({
        title: '  タスク  ',
        content: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('タスク');
      }
    });

    test('境界値: タイトル100文字', () => {
      const result = validateTaskInput({
        title: 'a'.repeat(100),
        content: '',
      });
      expect(result.success).toBe(true);
    });

    test('境界値: 内容1000文字', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('異常系', () => {
    test('タイトルが空', () => {
      const result = validateTaskInput({
        title: '',
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
        expect(result.error.message).toBe('タイトルを入力してください');
      }
    });

    test('タイトルが空白のみ', () => {
      const result = validateTaskInput({
        title: '   ',
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
      }
    });

    test('タイトルが101文字', () => {
      const result = validateTaskInput({
        title: 'a'.repeat(101),
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
        expect(result.error.message).toContain('100文字以内');
      }
    });

    test('内容が1001文字', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('content');
        expect(result.error.message).toContain('1000文字以内');
      }
    });
  });
});
```

#### コンポーネントのテスト
```typescript
// tests/components/TaskInput.test.tsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from '../../src/components/TaskInput';

describe('TaskInput', () => {
  test('エラーメッセージが表示される', () => {
    const error = {
      field: 'title' as const,
      message: 'タイトルを入力してください',
    };
    render(<TaskInput onSubmit={() => {}} error={error} />);

    expect(screen.getByRole('alert')).toHaveTextContent('タイトルを入力してください');
  });

  test('エラー時は入力欄がハイライトされる', () => {
    const error = {
      field: 'title' as const,
      message: 'タイトルを入力してください',
    };
    render(<TaskInput onSubmit={() => {}} error={error} />);

    const input = screen.getByLabelText('タスクのタイトル');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('文字数カウンターが表示される', async () => {
    render(<TaskInput onSubmit={() => {}} />);

    const titleInput = screen.getByLabelText('タスクのタイトル');
    await userEvent.type(titleInput, 'テスト');

    expect(screen.getByText('3 / 100')).toBeInTheDocument();
  });
});
```

#### 統合テスト
```typescript
// tests/integration/task-creation.test.tsx
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('タスク作成フロー', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを作成して一覧に表示される', async () => {
    render(<App />);

    // 初期状態
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();

    // タスク作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const contentInput = screen.getByPlaceholderText('内容（任意）');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'テスト内容');
    await userEvent.click(submitButton);

    // 一覧に表示される
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('テスト内容')).toBeInTheDocument();
  });

  test('バリデーションエラーが表示される', async () => {
    render(<App />);

    const submitButton = screen.getByText('作成');
    await userEvent.click(submitButton);

    // エラーメッセージ
    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
  });

  test('ページをリロードしてもタスクが残る', async () => {
    const { unmount } = render(<App />);

    // タスク作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.click(screen.getByText('作成'));

    // アンマウント
    unmount();

    // 再マウント
    render(<App />);

    // タスクが表示される
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. 空のタイトルで作成 → エラーメッセージ表示
2. 101文字のタイトルで作成 → エラーメッセージ表示
3. 正しい入力で作成 → タスクが一覧に表示
4. ページリロード → タスクが残っている
5. モバイル表示確認

### 4.2 期待結果
- [ ] バリデーションエラーが適切に表示される
- [ ] エラーメッセージが見やすい
- [ ] 文字数カウンターが表示される
- [ ] すべてのテストが通る

## 5. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] バリデーションが実装されている
- [ ] エラーメッセージが表示される
- [ ] 文字数カウンターが表示される
- [ ] すべてのテストが通る（単体、コンポーネント、統合）
- [ ] 手動テストで動作確認済み
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 6. 見積もり / Estimation

- **想定工数**: 3-4時間
- **実績工数**: _____時間（完了後に記入）

---

**作成日**: 2025-10-14
**担当者**: Claude Code
**最終更新**: 2025-10-14
**ステータス**: Todo
