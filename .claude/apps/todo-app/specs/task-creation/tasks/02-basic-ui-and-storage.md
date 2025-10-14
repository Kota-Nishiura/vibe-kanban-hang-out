# タスク: 基本UI + ローカルストレージ連携

> Phase 2: 基本的なUIとローカルストレージ連携（バリデーションなし）

## 1. タスク概要 / Task Overview

### 1.1 目的
タスク作成フォームと一覧表示の基本UIを実装し、ローカルストレージでデータを永続化する

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-creation/overview.md`
- `.claude/apps/todo-app/specs/task-creation/design.md`

### 1.3 依存タスク
- 前提条件: 01-project-setup.md が完了
- 後続タスク: 03-validation-and-tests.md

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `src/types/task.ts` - 新規作成
- [ ] `src/lib/storage.ts` - 新規作成
- [ ] `src/lib/utils.ts` - 新規作成
- [ ] `src/hooks/useTasks.ts` - 新規作成
- [ ] `src/components/TaskInput.tsx` - 新規作成
- [ ] `src/components/TaskList.tsx` - 新規作成
- [ ] `src/components/TaskItem.tsx` - 新規作成
- [ ] `src/App.tsx` - 更新
- [ ] `tests/lib/storage.test.ts` - 新規作成
- [ ] `tests/hooks/useTasks.test.ts` - 新規作成

### 2.2 実装詳細

#### ステップ1: 型定義
**内容:**
- Task 型を定義

```typescript
// src/types/task.ts
export interface Task {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  content: string;
}
```

#### ステップ2: ローカルストレージ操作
**内容:**
- ローカルストレージの読み書き関数を実装

```typescript
// src/lib/storage.ts
import { Task } from '../types/task';

const STORAGE_KEY = 'todo-app:tasks';

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const tasks = JSON.parse(data);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
    // QuotaExceededError の場合はユーザーに通知
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('ストレージの容量が不足しています。');
    }
  }
}
```

#### ステップ3: ユーティリティ関数
**内容:**
- UUID生成、日付フォーマット関数

```typescript
// src/lib/utils.ts
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
}
```

#### ステップ4: タスク管理フック
**内容:**
- タスクの追加・一覧取得を管理するカスタムフック

```typescript
// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../lib/storage';
import { generateId } from '../lib/utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 初回ロード
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // タスク追加
  const addTask = (formData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: formData.title.trim(),
      content: formData.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return {
    tasks,
    addTask,
  };
}
```

#### ステップ5: 入力フォームコンポーネント
**内容:**
- タスク作成フォーム

```typescript
// src/components/TaskInput.tsx
import { useState, FormEvent } from 'react';
import { TaskFormData } from '../types/task';

interface TaskInputProps {
  onSubmit: (data: TaskFormData) => void;
}

export function TaskInput({ onSubmit }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 次のフェーズでバリデーション追加
    onSubmit({ title, content });

    // フォームクリア
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        <input
          type="text"
          placeholder="タスクのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="タスクのタイトル"
        />
        <textarea
          placeholder="内容（任意）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          aria-label="タスクの内容"
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

#### ステップ6: タスクアイテムコンポーネント
**内容:**
- 個別のタスク表示

```typescript
// src/components/TaskItem.tsx
import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {task.title}
      </h3>
      {task.content && (
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">
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

#### ステップ7: タスク一覧コンポーネント
**内容:**
- タスクの一覧表示

```typescript
// src/components/TaskList.tsx
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
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
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

#### ステップ8: App コンポーネント統合
**内容:**
- 全コンポーネントを統合

```typescript
// src/App.tsx
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';

function App() {
  const { tasks, addTask } = useTasks();

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
          <TaskList tasks={tasks} />
        </div>
      </main>

      {/* 入力フォームエリア（固定） */}
      <footer className="sticky bottom-0">
        <TaskInput onSubmit={addTask} />
      </footer>
    </div>
  );
}

export default App;
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `tests/lib/storage.test.ts`
- [ ] `tests/hooks/useTasks.test.ts`
- [ ] `tests/components/TaskInput.test.tsx`
- [ ] `tests/components/TaskList.test.tsx`

### 3.2 テストケース

#### ローカルストレージのテスト
```typescript
// tests/lib/storage.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { loadTasks, saveTasks } from '../../src/lib/storage';
import { Task } from '../../src/types/task';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを保存・読み込みできる', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'テストタスク',
        content: 'テスト内容',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    saveTasks(tasks);
    const loaded = loadTasks();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('テストタスク');
    expect(loaded[0].content).toBe('テスト内容');
  });

  test('空の場合は空配列を返す', () => {
    const loaded = loadTasks();
    expect(loaded).toEqual([]);
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
  test('タスクを作成できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const contentInput = screen.getByPlaceholderText('内容（任意）');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'テスト内容');
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'テストタスク',
      content: 'テスト内容',
    });
  });

  test('作成後フォームがクリアされる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル') as HTMLInputElement;
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.click(submitButton);

    expect(titleInput.value).toBe('');
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. `npm run dev` で開発サーバー起動
2. タイトルと内容を入力
3. 作成ボタンをクリック
4. タスクが一覧に表示されることを確認
5. ページをリロード
6. タスクが残っていることを確認

### 4.2 期待結果
- [ ] タスクを作成できる
- [ ] 作成したタスクが一覧の最上部に表示される
- [ ] フォームがクリアされる
- [ ] ページをリロードしてもタスクが表示される
- [ ] レスポンシブデザインが機能する

### 4.3 確認コマンド
```bash
npm run dev
npm test
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- ローカルストレージの読み書きが正しく動作するか
- 日付が正しくシリアライズ・デシリアライズされるか
- UI/UXがChatGPT風のレイアウトになっているか

### 5.2 懸念事項
- バリデーションは次のフェーズで実装
- エラーハンドリングは最小限

## 6. チェックリスト / Checklist

### 6.1 実装前
- [x] 設計書を理解した
- [x] 依存タスク（01）が完了している
- [ ] 開発環境が正常に動作する

### 6.2 実装中
- [ ] コーディング規約に従っている
- [ ] 適切な命名を使用している
- [ ] 型安全性を保っている

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] 手動で動作確認した
- [ ] ローカルストレージが正しく動作する
- [ ] レスポンシブデザインが機能する

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] テストが通る
- [ ] PR説明を記載

## 7. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] 基本UIが実装されている
- [ ] タスクを作成できる
- [ ] タスクが一覧に表示される
- [ ] ローカルストレージに保存される
- [ ] ページをリロードしても保持される
- [ ] テストが全て通る
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 8. 見積もり / Estimation

- **想定工数**: 3-4時間
- **実績工数**: _____時間（完了後に記入）
- **差異の理由**: （差異があれば記入）

---

**作成日**: 2025-10-14
**担当者**: Claude Code
**最終更新**: 2025-10-14
**ステータス**: Todo
