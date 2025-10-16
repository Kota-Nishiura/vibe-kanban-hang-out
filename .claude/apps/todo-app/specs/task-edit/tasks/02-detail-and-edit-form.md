# タスク: タスク詳細表示と編集フォーム

> Phase 2: タスク詳細表示と編集フォームの実装

## 1. タスク概要 / Task Overview

### 1.1 目的
- 選択されたタスクの詳細を表示するコンポーネントを実装する
- タスクを編集するフォームコンポーネントを実装する
- タスク更新機能を実装する

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-edit/overview.md`
- `.claude/apps/todo-app/specs/task-edit/design.md`

### 1.3 依存タスク
- 前提条件: 01-validation-and-selection.md が完了
- 後続タスク: 03-tests.md

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `src/components/TaskDetail.tsx` - 新規作成
- [ ] `src/components/TaskEditForm.tsx` - 新規作成
- [ ] `src/hooks/useTasks.ts` - 更新（編集機能追加）
- [ ] `src/App.tsx` - 更新（詳細表示・編集モード管理）
- [ ] `src/index.css` - 更新（モーダルスタイル追加）

### 2.2 実装詳細

#### ステップ1: TaskDetail コンポーネント
**内容:**
- 選択されたタスクの詳細を表示
- 編集ボタンと閉じるボタンを配置

```typescript
// src/components/TaskDetail.tsx
import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onClose: () => void;
}

export function TaskDetail({ task, onEdit, onClose }: TaskDetailProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2
            id="task-detail-title"
            className="text-xl font-bold text-gray-900"
          >
            タスク詳細
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 space-y-4">
          {/* タイトル */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              タイトル
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {task.title}
            </p>
          </div>

          {/* 内容 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">内容</h3>
            {task.content ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.content}
              </p>
            ) : (
              <p className="text-gray-400 italic">内容なし</p>
            )}
          </div>

          {/* メタデータ */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">作成日時:</span>
              <time className="text-gray-700">
                {formatDate(task.createdAt)}
              </time>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">更新日時:</span>
              <time className="text-gray-700">
                {formatDate(task.updatedAt)}
              </time>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            編集
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### ステップ2: TaskEditForm コンポーネント
**内容:**
- タスク編集フォーム
- バリデーションエラー表示
- 更新・キャンセルボタン

```typescript
// src/components/TaskEditForm.tsx
import { useState, FormEvent, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { ValidationError } from '../lib/validation';

interface TaskEditFormProps {
  task: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  error: ValidationError | null;
}

export function TaskEditForm({
  task,
  onSubmit,
  onCancel,
  error,
}: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);

  // Escapeキーでキャンセル
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        <form onSubmit={handleSubmit}>
          {/* ヘッダー */}
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2
              id="edit-task-title"
              className="text-xl font-bold text-gray-900"
            >
              タスクの編集
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4 space-y-4">
            {/* エラー表示 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                {error.message}
              </div>
            )}

            {/* タイトル */}
            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                  ${
                    error?.field === 'title'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }
                `}
                placeholder="タスクのタイトル"
                aria-required="true"
                aria-invalid={error?.field === 'title'}
              />
            </div>

            {/* 内容 */}
            <div>
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                内容（任意）
              </label>
              <textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none
                  ${
                    error?.field === 'content'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }
                `}
                placeholder="内容（任意）"
                aria-invalid={error?.field === 'content'}
              />
            </div>
          </div>

          {/* フッター */}
          <div className="bg-white border-t px-6 py-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              更新
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### ステップ3: useTasks フックの更新
**内容:**
- タスク更新機能を追加
- 編集モードの状態管理を追加

```typescript
// src/hooks/useTasks.ts に追加
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  // ... (既存のコード)

  // タスク更新
  const updateTask = (taskId: string, formData: TaskFormData) => {
    // バリデーション
    const validation = validateTaskInput(formData);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setError(null);

    // タスクを検索
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      setError({
        field: 'title',
        message: 'タスクが見つかりません',
      });
      return;
    }

    // タスクを更新
    const updatedTask: Task = {
      ...tasks[taskIndex],
      title: validation.data.title,
      content: validation.data.content,
      updatedAt: new Date(),
    };

    // タスク配列を更新
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // 編集モードを終了
    setIsEditing(false);
    setSelectedTaskId(null);
  };

  // 編集開始
  const startEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  return {
    tasks,
    addTask,
    updateTask,
    selectedTask,
    selectTask,
    clearSelection,
    isEditing,
    startEdit,
    cancelEdit,
    error,
  };
}
```

#### ステップ4: App コンポーネントの更新
**内容:**
- 詳細表示と編集フォームの表示制御

```typescript
// src/App.tsx
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { TaskEditForm } from './components/TaskEditForm';

function App() {
  const {
    tasks,
    addTask,
    updateTask,
    selectedTask,
    selectTask,
    clearSelection,
    isEditing,
    startEdit,
    cancelEdit,
    error,
  } = useTasks();

  const handleUpdateTask = (formData: TaskFormData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, formData);
    }
  };

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

      {/* 詳細表示モーダル */}
      {selectedTask && !isEditing && (
        <TaskDetail
          task={selectedTask}
          onEdit={startEdit}
          onClose={clearSelection}
        />
      )}

      {/* 編集フォームモーダル */}
      {selectedTask && isEditing && (
        <TaskEditForm
          task={selectedTask}
          onSubmit={handleUpdateTask}
          onCancel={cancelEdit}
          error={error}
        />
      )}

      {/* 入力フォームエリア（詳細表示時は非表示） */}
      {!selectedTask && (
        <footer className="sticky bottom-0">
          <TaskInput onSubmit={addTask} error={error} />
        </footer>
      )}
    </div>
  );
}

export default App;
```

#### ステップ5: モーダルスタイルの追加
**内容:**
- 必要に応じてグローバルスタイルを追加

```css
/* src/index.css に追加（必要であれば） */

/* モーダルのスクロール防止 */
body.modal-open {
  overflow: hidden;
}

/* テキストの行数制限 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## 3. テスト / Testing

### 3.1 テストファイル
- [ ] `tests/components/TaskDetail.test.tsx` - 新規作成
- [ ] `tests/components/TaskEditForm.test.tsx` - 新規作成
- [ ] `tests/hooks/useTasks.test.ts` - 更新（編集機能のテスト追加）

### 3.2 テストケース

#### TaskDetail のテスト
```typescript
// tests/components/TaskDetail.test.tsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetail } from '../../src/components/TaskDetail';

const mockTask = {
  id: '1',
  title: 'テストタスク',
  content: 'テスト内容',
  createdAt: new Date('2025-10-14T12:00:00'),
  updatedAt: new Date('2025-10-14T13:00:00'),
};

describe('TaskDetail', () => {
  test('タスクの詳細が表示される', () => {
    render(
      <TaskDetail task={mockTask} onEdit={() => {}} onClose={() => {}} />
    );

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('テスト内容')).toBeInTheDocument();
  });

  test('編集ボタンをクリックするとonEditが呼ばれる', async () => {
    const onEdit = vi.fn();
    render(
      <TaskDetail task={mockTask} onEdit={onEdit} onClose={() => {}} />
    );

    const editButton = screen.getByText('編集');
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    const onClose = vi.fn();
    render(
      <TaskDetail task={mockTask} onEdit={() => {}} onClose={onClose} />
    );

    const closeButton = screen.getByText('閉じる');
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('背景をクリックするとonCloseが呼ばれる', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <TaskDetail task={mockTask} onEdit={() => {}} onClose={onClose} />
    );

    const backdrop = container.firstChild as HTMLElement;
    await userEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });
});
```

#### TaskEditForm のテスト
```typescript
// tests/components/TaskEditForm.test.tsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskEditForm } from '../../src/components/TaskEditForm';

const mockTask = {
  id: '1',
  title: 'テストタスク',
  content: 'テスト内容',
  createdAt: new Date('2025-10-14T12:00:00'),
  updatedAt: new Date('2025-10-14T12:00:00'),
};

describe('TaskEditForm', () => {
  test('既存のタスク内容がフォームに表示される', () => {
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={() => {}}
        error={null}
      />
    );

    expect(screen.getByDisplayValue('テストタスク')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト内容')).toBeInTheDocument();
  });

  test('タスクを更新できる', async () => {
    const onSubmit = vi.fn();
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={onSubmit}
        onCancel={() => {}}
        error={null}
      />
    );

    const titleInput = screen.getByDisplayValue('テストタスク');
    const updateButton = screen.getByText('更新');

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '更新されたタスク');
    await userEvent.click(updateButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: '更新されたタスク',
      content: 'テスト内容',
    });
  });

  test('キャンセルボタンで編集を中止できる', async () => {
    const onCancel = vi.fn();
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={onCancel}
        error={null}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test('バリデーションエラーが表示される', () => {
    const error = { field: 'title' as const, message: 'タイトルを入力してください' };
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={() => {}}
        error={error}
      />
    );

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
  });
});
```

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. `npm run dev` で開発サーバー起動
2. タスクを作成
3. タスクをクリックして選択
4. 詳細表示が表示されることを確認
5. 「編集」ボタンをクリック
6. 編集フォームが表示されることを確認
7. タイトルと内容を変更
8. 「更新」ボタンをクリック
9. タスクが更新されることを確認
10. updatedAt が更新されることを確認

### 4.2 期待結果
- [ ] タスク詳細が表示される
- [ ] 編集ボタンをクリックすると編集フォームが表示される
- [ ] 既存のタスク内容がフォームに表示される
- [ ] タスクを更新できる
- [ ] updatedAt が更新される
- [ ] キャンセルボタンで編集を中止できる
- [ ] Escapeキーでモーダルを閉じられる
- [ ] バリデーションエラーが表示される

### 4.3 確認コマンド
```bash
npm run dev
npm test
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- モーダルUIが使いやすいか
- 編集フローが直感的か
- バリデーションが正しく動作するか
- updatedAt が正しく更新されるか

### 5.2 懸念事項
- なし

## 6. チェックリスト / Checklist

### 6.1 実装前
- [x] 設計書を理解した
- [x] 依存タスク（01）が完了している
- [ ] 開発環境が正常に動作する

### 6.2 実装中
- [ ] コーディング規約に従っている
- [ ] 適切な命名を使用している
- [ ] 型安全性を保っている
- [ ] アクセシビリティを考慮している

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] 手動で動作確認した
- [ ] タスク更新が正しく動作する
- [ ] モーダルが正しく動作する

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] テストが通る
- [ ] PR説明を記載

## 7. 想定される問題と対処法 / Potential Issues

| 問題 | 対処法 |
|------|--------|
| モーダルの背景スクロール | body要素のoverflowを制御 |
| フォーカストラップ | useEffectでフォーカス管理 |
| Escapeキーの競合 | イベントリスナーのクリーンアップ |

## 8. 参考情報 / References

### 8.1 公式ドキュメント
- React: https://react.dev/
- ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

## 9. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] タスク詳細が表示される
- [ ] 編集フォームが表示される
- [ ] タスクを更新できる
- [ ] updatedAt が更新される
- [ ] キャンセル機能が動作する
- [ ] テストが全て通る
- [ ] コードレビューで承認される
- [ ] PRがマージされる

## 10. 見積もり / Estimation

- **想定工数**: 3-4時間
- **実績工数**: _____時間（完了後に記入）
- **差異の理由**: （差異があれば記入）

---

**作成日**: 2025-10-16
**担当者**: Claude Code
**最終更新**: 2025-10-16
**ステータス**: Todo
