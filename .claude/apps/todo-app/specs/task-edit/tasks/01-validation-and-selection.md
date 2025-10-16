# タスク: バリデーション共通化 + タスク選択機能

> Phase 1: バリデーションロジックの共通化とタスク選択機能の実装

## 1. タスク概要 / Task Overview

### 1.1 目的
- タスク作成と編集で使用するバリデーションロジックを共通化する
- タスクをクリックして選択できる機能を実装する
- 選択されたタスクの状態管理を実装する

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-edit/overview.md`
- `.claude/apps/todo-app/specs/task-edit/design.md`

### 1.3 依存タスク
- 前提条件: タスク作成機能が完了している
- 後続タスク: 02-detail-and-edit-form.md

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `src/lib/validation.ts` - 新規作成
- [ ] `src/hooks/useTasks.ts` - 更新（選択状態管理追加）
- [ ] `src/components/TaskItem.tsx` - 更新（選択機能追加）
- [ ] `src/components/TaskInput.tsx` - 更新（共通バリデーション使用）
- [ ] `src/App.tsx` - 更新（選択状態管理）
- [ ] `tests/lib/validation.test.ts` - 新規作成

### 2.2 実装詳細

#### ステップ1: バリデーション共通化
**内容:**
- タスクのバリデーションロジックを独立した関数として実装
- Result型を定義

```typescript
// src/lib/validation.ts
import { TaskFormData } from '../types/task';

export interface ValidationError {
  field: 'title' | 'content';
  message: string;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * タスク入力のバリデーション
 *
 * @param data - タスクフォームデータ
 * @returns バリデーション結果
 */
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
  if (trimmedTitle.length > 100) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タイトルは100文字以内で入力してください',
      },
    };
  }

  // 内容文字数チェック
  if (data.content.length > 1000) {
    return {
      success: false,
      error: {
        field: 'content',
        message: '内容は1000文字以内で入力してください',
      },
    };
  }

  return {
    success: true,
    data: {
      title: trimmedTitle,
      content: data.content,
    },
  };
}
```

#### ステップ2: useTasks フックの更新
**内容:**
- 選択されたタスクIDの状態管理を追加
- タスク選択・選択解除の関数を追加

```typescript
// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../lib/storage';
import { generateId } from '../lib/utils';
import { validateTaskInput, ValidationError } from '../lib/validation';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);

  // 初回ロード
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // 選択されたタスクを取得
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  // タスク追加
  const addTask = (formData: TaskFormData) => {
    // バリデーション
    const validation = validateTaskInput(formData);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setError(null);

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
  };

  // タスク選択
  const selectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setError(null);
  };

  // タスク選択解除
  const clearSelection = () => {
    setSelectedTaskId(null);
    setError(null);
  };

  return {
    tasks,
    addTask,
    selectedTask,
    selectTask,
    clearSelection,
    error,
  };
}
```

#### ステップ3: TaskItem コンポーネントの更新
**内容:**
- クリック可能にする
- 選択状態のスタイリングを追加

```typescript
// src/components/TaskItem.tsx
import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onSelect: (taskId: string) => void;
}

export function TaskItem({ task, isSelected = false, onSelect }: TaskItemProps) {
  return (
    <div
      data-testid="task-card"
      className={`
        bg-white rounded-lg border p-4 transition-all cursor-pointer
        ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-gray-200 hover:shadow-md hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(task.id)}
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {task.title}
      </h3>
      {task.content && (
        <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
          {task.content}
        </p>
      )}
      <time className="text-sm text-gray-500">
        {formatDate(task.createdAt)}
      </time>
    </div>
  );
}
```

#### ステップ4: TaskList コンポーネントの更新
**内容:**
- 選択状態をTaskItemに渡す

```typescript
// src/components/TaskList.tsx
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function TaskList({ tasks, selectedTaskId, onSelectTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>タスクがありません</p>
        <p className="text-sm mt-2">下のフォームから作成してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          onSelect={onSelectTask}
        />
      ))}
    </div>
  );
}
```

#### ステップ5: TaskInput コンポーネントの更新
**内容:**
- 共通バリデーション関数を使用するように変更

```typescript
// src/components/TaskInput.tsx
import { useState, FormEvent } from 'react';
import { TaskFormData } from '../types/task';
import { ValidationError } from '../lib/validation';

interface TaskInputProps {
  onSubmit: (data: TaskFormData) => void;
  error: ValidationError | null;
}

export function TaskInput({ onSubmit, error }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit({ title, content });

    // エラーがなければフォームクリア（親コンポーネントでバリデーション）
    if (!error) {
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error.message}
          </div>
        )}
        <input
          type="text"
          placeholder="タスクのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${error?.field === 'title' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          `}
          aria-label="タスクのタイトル"
          aria-invalid={error?.field === 'title'}
        />
        <textarea
          placeholder="内容（任意）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none
            ${error?.field === 'content' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          `}
          aria-label="タスクの内容"
          aria-invalid={error?.field === 'content'}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          作成
        </button>
      </div>
    </form>
  );
}
```

#### ステップ6: App コンポーネントの更新
**内容:**
- 選択状態を管理
- TaskListに選択関連のpropsを渡す

```typescript
// src/App.tsx
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';

function App() {
  const { tasks, addTask, selectedTask, selectTask, clearSelection, error } = useTasks();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">TODO App</h1>
        </div>
      </header>

      {/* タスク一覧エリア */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTask?.id || null}
            onSelectTask={selectTask}
          />
        </div>
      </main>

      {/* 入力フォームエリア（固定） */}
      <footer className="sticky bottom-0">
        <TaskInput onSubmit={addTask} error={error} />
      </footer>
    </div>
  );
}

export default App;
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `tests/lib/validation.test.ts` - 新規作成
- [ ] `tests/components/TaskItem.test.tsx` - 更新（選択機能のテスト追加）
- [ ] `tests/hooks/useTasks.test.ts` - 更新（選択機能のテスト追加）

### 3.2 テストケース

#### バリデーションのテスト
```typescript
// tests/lib/validation.test.ts
import { describe, test, expect } from 'vitest';
import { validateTaskInput } from '../../src/lib/validation';

describe('validateTaskInput', () => {
  test('正常: 有効な入力', () => {
    const result = validateTaskInput({ title: 'タスク', content: '説明' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('タスク');
      expect(result.data.content).toBe('説明');
    }
  });

  test('異常: タイトルが空', () => {
    const result = validateTaskInput({ title: '', content: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.field).toBe('title');
      expect(result.error.message).toBe('タイトルを入力してください');
    }
  });

  test('異常: タイトルが空白のみ', () => {
    const result = validateTaskInput({ title: '   ', content: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.field).toBe('title');
    }
  });

  test('異常: タイトルが101文字', () => {
    const result = validateTaskInput({ title: 'a'.repeat(101), content: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.field).toBe('title');
      expect(result.error.message).toContain('100文字以内');
    }
  });

  test('境界値: タイトルが100文字', () => {
    const result = validateTaskInput({ title: 'a'.repeat(100), content: '' });
    expect(result.success).toBe(true);
  });

  test('正常: タイトルの前後空白はtrim', () => {
    const result = validateTaskInput({ title: '  タスク  ', content: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('タスク');
    }
  });

  test('異常: 内容が1001文字', () => {
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

  test('境界値: 内容が1000文字', () => {
    const result = validateTaskInput({
      title: 'タスク',
      content: 'a'.repeat(1000),
    });
    expect(result.success).toBe(true);
  });
});
```

#### タスク選択のテスト
```typescript
// tests/components/TaskItem.test.tsx (追加部分)
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../../src/components/TaskItem';

const mockTask = {
  id: '1',
  title: 'テストタスク',
  content: 'テスト内容',
  createdAt: new Date('2025-10-14T12:00:00'),
  updatedAt: new Date('2025-10-14T12:00:00'),
};

describe('TaskItem - 選択機能', () => {
  test('タスクをクリックするとonSelectが呼ばれる', async () => {
    const onSelect = vi.fn();
    render(<TaskItem task={mockTask} onSelect={onSelect} />);

    const taskCard = screen.getByTestId('task-card');
    await userEvent.click(taskCard);

    expect(onSelect).toHaveBeenCalledWith(mockTask.id);
  });

  test('選択されたタスクはハイライト表示される', () => {
    const onSelect = vi.fn();
    render(<TaskItem task={mockTask} isSelected={true} onSelect={onSelect} />);

    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('border-blue-500');
    expect(taskCard).toHaveClass('ring-2');
  });

  test('選択されていないタスクは通常表示', () => {
    const onSelect = vi.fn();
    render(<TaskItem task={mockTask} isSelected={false} onSelect={onSelect} />);

    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('border-gray-200');
    expect(taskCard).not.toHaveClass('ring-2');
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. `npm run dev` で開発サーバー起動
2. タスクを作成
3. 作成したタスクをクリック
4. タスクがハイライト表示されることを確認
5. 別のタスクをクリック
6. 選択が切り替わることを確認
7. バリデーションエラーを確認（タイトル空、文字数超過）

### 4.2 期待結果
- [ ] タスクをクリックすると選択状態になる
- [ ] 選択されたタスクがハイライト表示される
- [ ] 別のタスクをクリックすると選択が切り替わる
- [ ] バリデーションエラーが正しく表示される
- [ ] エラー時、該当フィールドが赤枠で表示される

### 4.3 確認コマンド
```bash
npm run dev
npm test
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- バリデーションロジックが正しく共通化されているか
- 選択状態の管理が適切か
- UIが直感的か（選択状態が分かりやすいか）

### 5.2 懸念事項
- なし

## 6. チェックリスト / Checklist

### 6.1 実装前
- [x] 設計書を理解した
- [x] 依存タスクが完了している
- [ ] 開発環境が正常に動作する

### 6.2 実装中
- [ ] コーディング規約に従っている
- [ ] 適切な命名を使用している
- [ ] 型安全性を保っている

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] 手動で動作確認した
- [ ] バリデーションが正しく動作する
- [ ] 選択機能が正しく動作する

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] テストが通る
- [ ] PR説明を記載

## 7. 想定される問題と対処法 / Potential Issues

| 問題 | 対処法 |
|------|--------|
| バリデーションの二重実装 | 共通関数を必ず使用する |
| 選択状態の不整合 | useTasksフックで一元管理 |
| スタイリングの不具合 | Tailwindのクラスを適切に使用 |

## 8. 参考情報 / References

### 8.1 公式ドキュメント
- React Hooks: https://react.dev/reference/react
- Tailwind CSS: https://tailwindcss.com/

## 9. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] バリデーションが共通化されている
- [ ] タスクを選択できる
- [ ] 選択状態が視覚的に分かる
- [ ] バリデーションエラーが正しく表示される
- [ ] テストが全て通る
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 10. 見積もり / Estimation

- **想定工数**: 2-3時間
- **実績工数**: _____時間（完了後に記入）
- **差異の理由**: （差異があれば記入）

---

**作成日**: 2025-10-16
**担当者**: Claude Code
**最終更新**: 2025-10-16
**ステータス**: Todo
