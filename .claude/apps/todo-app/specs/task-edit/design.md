# タスク編集機能 - 設計書

> この機能は既存のタスク作成機能を補完し、タスクの編集を可能にします。

## 1. アーキテクチャ概要 / Architecture Overview

### 1.1 システム構成図
```
[ブラウザ]
    ↓
[React App]
    ├─ TaskInput (作成フォーム)
    ├─ TaskList (一覧表示)
    │   └─ TaskItem (個別表示 + 選択機能)
    ├─ TaskDetail (選択されたタスクの詳細表示)
    │   └─ EditButton (編集ボタン)
    ├─ TaskEditForm (編集フォーム)
    └─ LocalStorage (永続化)
```

### 1.2 主要コンポーネント
- **TaskDetail**: 選択されたタスクの詳細表示（新規）
- **TaskEditForm**: タスク編集フォーム（新規）
- **TaskItem**: 個別のタスク表示（更新：選択機能追加）
- **useTasks**: タスク管理カスタムフック（更新：編集機能追加）

## 2. データモデル / Data Model

### 2.1 エンティティ（既存）

#### Task（変更なし）
```typescript
interface Task {
  id: string;           // UUID
  title: string;        // 必須、1-100文字
  content: string;      // 任意、0-1000文字
  createdAt: Date;      // 作成日時
  updatedAt: Date;      // 更新日時
}
```

#### TaskFormData（変更なし）
```typescript
interface TaskFormData {
  title: string;
  content: string;
}
```

#### ValidationError（変更なし）
```typescript
interface ValidationError {
  field: 'title' | 'content';
  message: string;
}
```

### 2.2 新規エンティティ

#### EditMode
```typescript
interface EditMode {
  isEditing: boolean;
  taskId: string | null;
}
```

#### SelectedTask
```typescript
type SelectedTask = Task | null;
```

### 2.3 ローカルストレージスキーマ（変更なし）
```typescript
// Key: 'todo-app:tasks'
// Value: JSON.stringify(Task[])
// 既存の保存形式と同じ
```

## 3. UI/UX設計 / UI/UX Design

### 3.1 画面レイアウト

#### 3.1.1 タスク選択前（既存と同じ）
```
┌─────────────────────────────────────┐
│  TODO App                           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ タスク1                      │   │ ← クリック可能
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
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ タイトル                     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 内容（任意）                 │   │
│  └─────────────────────────────┘   │
│  [作成]                             │
└─────────────────────────────────────┘
```

#### 3.1.2 タスク選択後（詳細表示）
```
┌─────────────────────────────────────┐
│  TODO App                      [×]  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ タスク1                      │   │ ← 選択状態（ハイライト）
│  │ 説明...                      │   │
│  │ 2025-10-14 12:00            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌═════════════════════════════┐   │
│  ║ タスク1                      ║   │ ← 詳細表示（中央）
│  ║ 説明の全文がここに...        ║   │
│  ║                             ║   │
│  ║ 作成: 2025-10-14 12:00      ║   │
│  ║ 更新: 2025-10-14 12:00      ║   │
│  ║                             ║   │
│  ║ [編集] [閉じる]             ║   │
│  └═════════════════════════════┘   │
│                                     │
├─────────────────────────────────────┤
│  (入力フォームは非表示)             │
└─────────────────────────────────────┘
```

#### 3.1.3 編集モード
```
┌─────────────────────────────────────┐
│  TODO App                           │
├─────────────────────────────────────┤
│                                     │
│  ┌═════════════════════════════┐   │
│  ║ タスクの編集                 ║   │
│  ║                             ║   │
│  ║ [エラー表示エリア]           ║   │
│  ║ ┌─────────────────────────┐ ║   │
│  ║ │ タイトル                 │ ║   │
│  ║ └─────────────────────────┘ ║   │
│  ║ ┌─────────────────────────┐ ║   │
│  ║ │ 内容（任意）             │ ║   │
│  ║ │                         │ ║   │
│  ║ └─────────────────────────┘ ║   │
│  ║                             ║   │
│  ║ [更新] [キャンセル]         ║   │
│  └═════════════════════════════┘   │
│                                     │
├─────────────────────────────────────┤
│  (作成フォームは非表示)             │
└─────────────────────────────────────┘
```

### 3.2 コンポーネント構成
```tsx
<App>
  <div className="container">
    <header>
      <h1>TODO App</h1>
    </header>

    <main className="task-list-area">
      <TaskList
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
      />

      {/* 選択されたタスクの詳細表示 */}
      {selectedTask && !isEditing && (
        <TaskDetail
          task={selectedTask}
          onEdit={handleStartEdit}
          onClose={handleCloseDetail}
        />
      )}

      {/* 編集モード */}
      {selectedTask && isEditing && (
        <TaskEditForm
          task={selectedTask}
          onSubmit={handleUpdateTask}
          onCancel={handleCancelEdit}
          error={error}
        />
      )}
    </main>

    {/* 作成フォーム（詳細表示時は非表示） */}
    {!selectedTask && (
      <footer className="input-area">
        <TaskInput onSubmit={handleCreateTask} error={error} />
      </footer>
    )}
  </div>
</App>

<TaskItem task={task} isSelected={isSelected} onClick={onSelect}>
  <div className={`task-card ${isSelected ? 'selected' : ''}`}>
    <h3>{task.title}</h3>
    <p>{task.content}</p>
    <time>{formatDate(task.createdAt)}</time>
  </div>
</TaskItem>

<TaskDetail task={task}>
  <div className="task-detail-modal">
    <button className="close-button" onClick={onClose}>×</button>
    <h2>{task.title}</h2>
    <p className="content">{task.content}</p>
    <div className="metadata">
      <p>作成: {formatDate(task.createdAt)}</p>
      <p>更新: {formatDate(task.updatedAt)}</p>
    </div>
    <div className="actions">
      <button onClick={onEdit}>編集</button>
      <button onClick={onClose}>閉じる</button>
    </div>
  </div>
</TaskDetail>

<TaskEditForm task={task}>
  <div className="edit-form-modal">
    <h2>タスクの編集</h2>
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
    <div className="actions">
      <button type="submit">更新</button>
      <button type="button" onClick={onCancel}>キャンセル</button>
    </div>
  </div>
</TaskEditForm>
```

### 3.3 インタラクション

#### フロー1: タスク選択から編集まで
1. ユーザーがタスクをクリック
2. タスクが選択状態になる（ハイライト）
3. 画面中央にタスク詳細が表示される（モーダルまたはオーバーレイ）
4. 作成フォームが非表示になる
5. ユーザーが「編集」ボタンをクリック
6. 編集フォームが表示される
7. 現在のタイトルと内容が入力フォームに表示される
8. ユーザーがタイトルと内容を編集
9. 「更新」ボタンをクリック
10. バリデーションチェック
    - エラーがあれば、エラーメッセージを表示して終了
    - エラーがなければ、次へ
11. タスクを更新（updatedAt更新）
12. ローカルストレージに保存
13. 一覧を更新
14. 編集モードを終了
15. 詳細表示も閉じる

#### フロー2: 編集のキャンセル
1. 編集中にユーザーが「キャンセル」ボタンをクリック
2. 編集内容を破棄
3. 詳細表示に戻る

#### フロー3: 詳細表示を閉じる
1. ユーザーが「閉じる」ボタンまたは「×」ボタンをクリック
2. 詳細表示が閉じる
3. 選択状態が解除される
4. 作成フォームが再表示される

## 4. ビジネスロジック / Business Logic

### 4.1 主要な処理フロー

#### フロー1: タスクの選択
```typescript
function selectTask(taskId: string): void {
  setSelectedTaskId(taskId);
  setIsEditing(false);
}

function closeDetail(): void {
  setSelectedTaskId(null);
  setIsEditing(false);
}
```

#### フロー2: タスクの編集
```typescript
function updateTask(
  taskId: string,
  formData: TaskFormData
): Result<Task, ValidationError> {
  // 1. バリデーション
  const validation = validateTaskInput(formData);
  if (!validation.success) {
    return validation;
  }

  // 2. タスクを検索
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タスクが見つかりません'
      }
    };
  }

  // 3. タスクを更新
  const updatedTask: Task = {
    ...tasks[taskIndex],
    title: formData.title.trim(),
    content: formData.content,
    updatedAt: new Date()
  };

  // 4. タスク配列を更新
  const updatedTasks = [...tasks];
  updatedTasks[taskIndex] = updatedTask;

  // 5. ローカルストレージに保存
  saveTasksToLocalStorage(updatedTasks);

  // 6. 成功を返す
  return { success: true, data: updatedTask };
}
```

### 4.2 バリデーションルール（既存と同じ）

| フィールド | ルール | エラーメッセージ |
|------------|--------|------------------|
| title | 必須 | タイトルを入力してください |
| title | 前後をtrim後、空でない | タイトルを入力してください |
| title | 100文字以内 | タイトルは100文字以内で入力してください |
| content | 任意 | - |
| content | 1000文字以内 | 内容は1000文字以内で入力してください |

```typescript
// 既存のバリデーション関数を再利用
function validateTaskInput(data: TaskFormData): Result<TaskFormData, ValidationError> {
  // タスク作成時と同じバリデーションロジック
  // src/lib/validation.ts に共通化する
}
```

## 5. 技術選定 / Technology Stack

### 5.1 使用技術（既存と同じ）
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 5.x
- **フレームワーク**: React 18.x
- **UIライブラリ**: Tailwind CSS 3.x + shadcn/ui
- **テスト**: Vitest + React Testing Library
- **ユーティリティ**: date-fns（日付フォーマット）

### 5.2 新規依存関係
なし（既存の技術スタックで実装可能）

## 6. テスト戦略 / Testing Strategy

### 6.1 テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| 単体テスト | ユーティリティ関数、バリデーション | Vitest |
| コンポーネントテスト | React コンポーネント | Vitest + Testing Library |
| 統合テスト | ユーザーフロー（選択→編集→更新） | Vitest + Testing Library |

### 6.2 テストケース

#### タスク選択のテスト
```typescript
describe('TaskItem with selection', () => {
  test('タスクをクリックすると選択される', async () => {
    const onSelect = vi.fn();
    render(<TaskItem task={mockTask} onSelect={onSelect} />);

    const taskCard = screen.getByText(mockTask.title);
    await userEvent.click(taskCard);

    expect(onSelect).toHaveBeenCalledWith(mockTask.id);
  });

  test('選択されたタスクはハイライト表示される', () => {
    render(<TaskItem task={mockTask} isSelected={true} />);

    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('selected');
  });
});
```

#### タスク詳細表示のテスト
```typescript
describe('TaskDetail', () => {
  test('タスクの詳細が表示される', () => {
    render(<TaskDetail task={mockTask} />);

    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.content)).toBeInTheDocument();
  });

  test('編集ボタンをクリックすると編集モードになる', async () => {
    const onEdit = vi.fn();
    render(<TaskDetail task={mockTask} onEdit={onEdit} />);

    const editButton = screen.getByText('編集');
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  test('閉じるボタンをクリックすると詳細が閉じる', async () => {
    const onClose = vi.fn();
    render(<TaskDetail task={mockTask} onClose={onClose} />);

    const closeButton = screen.getByText('閉じる');
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
```

#### タスク編集フォームのテスト
```typescript
describe('TaskEditForm', () => {
  test('既存のタスク内容がフォームに表示される', () => {
    render(<TaskEditForm task={mockTask} onSubmit={() => {}} />);

    const titleInput = screen.getByDisplayValue(mockTask.title);
    const contentInput = screen.getByDisplayValue(mockTask.content);

    expect(titleInput).toBeInTheDocument();
    expect(contentInput).toBeInTheDocument();
  });

  test('タスクを更新できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskEditForm task={mockTask} onSubmit={onSubmit} />);

    const titleInput = screen.getByDisplayValue(mockTask.title);
    const submitButton = screen.getByText('更新');

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '更新されたタイトル');
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: '更新されたタイトル',
      content: mockTask.content
    });
  });

  test('キャンセルボタンで編集を中止できる', async () => {
    const onCancel = vi.fn();
    render(<TaskEditForm task={mockTask} onSubmit={() => {}} onCancel={onCancel} />);

    const cancelButton = screen.getByText('キャンセル');
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test('バリデーションエラーが表示される', async () => {
    const error = { field: 'title', message: 'タイトルを入力してください' };
    render(<TaskEditForm task={mockTask} onSubmit={() => {}} error={error} />);

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
  });
});
```

#### 統合テスト
```typescript
describe('タスク編集フロー', () => {
  test('タスクを選択→編集→更新できる', async () => {
    render(<App />);

    // タスクを選択
    const task = screen.getByText('既存のタスク');
    await userEvent.click(task);

    // 詳細表示を確認
    expect(screen.getByText('編集')).toBeInTheDocument();

    // 編集ボタンをクリック
    const editButton = screen.getByText('編集');
    await userEvent.click(editButton);

    // 編集フォームが表示される
    const titleInput = screen.getByDisplayValue('既存のタスク');
    expect(titleInput).toBeInTheDocument();

    // タイトルを変更
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '更新されたタスク');

    // 更新ボタンをクリック
    const updateButton = screen.getByText('更新');
    await userEvent.click(updateButton);

    // 更新されたタスクが一覧に表示される
    expect(screen.getByText('更新されたタスク')).toBeInTheDocument();
  });
});
```

## 7. エラーハンドリング / Error Handling

### 7.1 エラー分類

| エラー | 表示方法 | 対応 |
|--------|----------|------|
| ValidationError | インラインエラー | ユーザーに修正を促す |
| TaskNotFoundError | トースト通知 | エラーメッセージを表示 |
| LocalStorageQuotaExceeded | トースト通知 | タスク数の削減を促す |

### 7.2 エラー表示例
```tsx
// インラインエラー表示（既存と同じ）
{error && (
  <div className="text-red-600 text-sm mb-2" role="alert">
    {error.message}
  </div>
)}

// タスクが見つからない場合
if (!task) {
  alert('タスクが見つかりません');
  closeDetail();
  return;
}
```

## 8. パフォーマンス / Performance

### 8.1 想定負荷
- タスク数: 最大1000件
- 同時操作: 1ユーザー（ローカルのみ）

### 8.2 最適化戦略
- 選択状態は useState で管理（軽量）
- モーダル表示は条件付きレンダリング
- React.memo でコンポーネントの再レンダリングを最適化

## 9. 実装タスク分割 / Task Breakdown

### 9.1 タスク一覧

| # | タスク名 | 説明 | 想定工数 | 依存 |
|---|----------|------|----------|------|
| 01 | バリデーション共通化 + タスク選択機能 | バリデーションの共通化、TaskItemに選択機能追加 | 2-3h | - |
| 02 | タスク詳細表示と編集フォーム | TaskDetail、TaskEditForm コンポーネント実装 | 3-4h | 01 |
| 03 | テスト実装 | 単体テスト、統合テスト | 2-3h | 02 |

### 9.2 タスクの依存関係
```
01 (バリデーション共通化 + タスク選択)
  ↓
02 (詳細表示 + 編集フォーム)
  ↓
03 (テスト)
```

### 9.3 実装順序
1. **Phase 1**: バリデーション共通化 + タスク選択機能（タスク 01）
2. **Phase 2**: タスク詳細表示と編集フォーム（タスク 02）
3. **Phase 3**: テスト実装（タスク 03）

## 10. アクセシビリティ / Accessibility

### 10.1 対応項目
- [ ] キーボード操作（Tab、Enter、Escape）
- [ ] ARIA属性（role、aria-label、aria-describedby）
- [ ] モーダルのフォーカストラップ
- [ ] Escapeキーでモーダルを閉じる

### 10.2 実装例
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="edit-task-title"
>
  <h2 id="edit-task-title">タスクの編集</h2>
  {/* ... */}
</div>

// Escapeキーで閉じる
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

---

**作成日**: 2025-10-16
**作成者**: Claude Code
**最終更新**: 2025-10-16
**レビュアー**: 未定
**ステータス**: Draft
