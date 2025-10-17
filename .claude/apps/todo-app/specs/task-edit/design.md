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

### 3.1 画面レイアウト（現在の実装）

現在のUIは、**左サイドバー + 右メインエリア** のレイアウトになっています。

#### 3.1.1 基本レイアウト（タスク未選択時）
```
┌──────────────┬──────────────────────────────────────────┐
│ TODO App     │                                          │
│──────────────│     タスクを選択してください              │
│              │     (空状態のメッセージ)                  │
│ □ タスク1    │                                          │
│   内容...    │                                          │
│              │                                          │
│ □ タスク2    │                                          │
│   内容...    │                                          │
│              │                                          │
│ □ タスク3    │                                          │
│   内容...    │                                          │
│              │                                          │
│──────────────│──────────────────────────────────────────│
│ 3 タスク     │ [タイトル] [内容] [+作成]                │
└──────────────┴──────────────────────────────────────────┘
  ← 256px      ← flex-1 (残りの幅)
```

#### 3.1.2 タスク選択後（詳細表示）
```
┌──────────────┬──────────────────────────────────────────┐
│ TODO App     │ タスク1 (大きく表示)                      │
│──────────────│ 🕐 作成: 2025-10-14 12:00                │
│              │──────────────────────────────────────────│
│ ■ タスク1    │                                          │ ← 選択中（青ボーダー+背景）
│   内容...    │ タスクの内容がここに全文表示される        │
│              │                                          │
│ □ タスク2    │                                          │
│   内容...    │                                          │
│              │                                          │
│ □ タスク3    │ 【ここに編集ボタンを追加】                │ ← 新規追加
│   内容...    │                                          │
│              │                                          │
│──────────────│──────────────────────────────────────────│
│ 3 タスク     │ [タイトル] [内容] [+作成]                │
└──────────────┴──────────────────────────────────────────┘
```

#### 3.1.3 編集モード（モーダル表示）
```
┌──────────────┬──────────────────────────────────────────┐
│ TODO App     │  ┌────────────────────────────────────┐  │
│──────────────│  │ タスクの編集              [×]     │  │
│              │  ├────────────────────────────────────┤  │
│ ■ タスク1    │  │ [エラー表示エリア]              │  │
│   内容...    │  │ ┌──────────────────────────────┐│  │
│              │  │ │ タイトル                     ││  │
│ □ タスク2    │  │ └──────────────────────────────┘│  │
│   内容...    │  │ ┌──────────────────────────────┐│  │
│              │  │ │ 内容（任意）                 ││  │
│ □ タスク3    │  │ │                              ││  │
│   内容...    │  │ └──────────────────────────────┘│  │
│              │  │                                  │  │
│──────────────│  │ [更新] [キャンセル]              │  │
│ 3 タスク     │  └────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────┘
                背景全体が暗くなる（モーダルオーバーレイ）
```

### 3.2 レイアウトの構成要素

#### 左サイドバー（Sidebar.tsx）
- **固定幅**: 256px (`w-64`)
- **背景色**: ダークグレー (`bg-gray-900`)
- **構成**:
  - ヘッダー: 「TODO App」タイトル
  - タスク一覧: クリック可能なボタン形式
    - 選択中: 左青ボーダー + 背景色変更 (`border-blue-500`, `bg-gray-800`)
    - ホバー: 背景色変更 (`hover:bg-gray-800`)
    - 表示内容: タイトル + 内容プレビュー（truncate）
  - フッター: タスク数カウント

#### 右メインエリア（flex-1）
**上部: タスク詳細表示エリア**（TaskDetail.tsx）
- **スクロール可能**: `overflow-y-auto`
- **未選択時**: 空状態メッセージ + アイコン
- **選択時**:
  - タスクタイトル（大きく表示）
  - メタ情報（作成日時）
  - タスク内容（全文、改行対応）
  - **編集ボタン**（ここに新規追加予定）

**下部: タスク作成フォーム**（TaskInput.tsx）
- **固定位置**: `sticky bottom-0`
- **レイアウト**: 横並び配置
  - タイトル入力（flex-1）
  - 内容入力（flex-1）
  - 作成ボタン（固定幅、アイコン付き）

### 3.3 コンポーネント構成（実装ベース）
```tsx
<App>
  <div className="flex h-screen bg-white">
    {/* 左サイドバー */}
    <Sidebar
      tasks={tasks}
      selectedTaskId={selectedTaskId}
      onSelectTask={setSelectedTaskId}
    />

    {/* 右メインエリア */}
    <div className="flex-1 flex flex-col">
      {/* タスク詳細表示エリア（上部） */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <TaskDetail task={selectedTask} />
        {/* ここに編集ボタンを追加予定 */}
      </main>

      {/* タスク作成フォーム（下部、固定） */}
      <footer className="sticky bottom-0">
        <TaskInput onSubmit={handleAddTask} />
      </footer>
    </div>

    {/* 編集モーダル（条件付き表示） */}
    {selectedTask && isEditing && (
      <TaskEditForm
        task={selectedTask}
        onSubmit={handleUpdateTask}
        onCancel={handleCancelEdit}
        error={error}
      />
    )}
  </div>
</App>

<Sidebar>
  <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
    {/* ヘッダー */}
    <div className="p-4 border-b border-gray-700">
      <h2>TODO App</h2>
    </div>

    {/* タスク一覧 */}
    <div className="flex-1 overflow-y-auto">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task.id)}
          className={`w-full text-left px-4 py-3 hover:bg-gray-800
            transition-colors border-l-4 ${
            selectedTaskId === task.id
              ? 'bg-gray-800 border-blue-500'
              : 'border-transparent'
          }`}
        >
          <div className="font-medium truncate">{task.title}</div>
          <div className="text-xs text-gray-400 mt-1 truncate">
            {task.content || '内容なし'}
          </div>
        </button>
      ))}
    </div>

    {/* フッター */}
    <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
      {tasks.length} タスク
    </div>
  </aside>
</Sidebar>

<TaskDetail task={task}>
  {!task ? (
    {/* 空状態 */}
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <svg>...</svg>
        <p>タスクを選択してください</p>
      </div>
    </div>
  ) : (
    {/* タスク詳細 */}
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold">{task.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>作成: {formatDate(task.createdAt)}</span>
        </div>

        <div className="prose max-w-none">
          {task.content || '内容が入力されていません'}
        </div>

        {/* 【ここに編集ボタンを追加予定】 */}
      </div>
    </div>
  )}
</TaskDetail>

<TaskInput>
  <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <input placeholder="タスクのタイトル" />
          <textarea placeholder="内容（任意）" rows={1} />
        </div>
        <button type="submit">
          <svg>+</svg>
          作成
        </button>
      </div>
    </div>
  </form>
</TaskInput>

<TaskEditForm task={task}>
  {/* モーダルオーバーレイ */}
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
      <form onSubmit={handleSubmit}>
        {/* ヘッダー */}
        <div className="bg-white border-b px-6 py-4">
          <h2>タスクの編集</h2>
          <button onClick={onCancel}>×</button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 space-y-4">
          {error && <div className="text-red-600">{error.message}</div>}

          <input
            type="text"
            value={title}
            placeholder="タスクのタイトル"
          />

          <textarea
            value={content}
            placeholder="内容（任意）"
            rows={5}
          />
        </div>

        {/* フッター */}
        <div className="bg-white border-t px-6 py-4 flex gap-3">
          <button type="submit">更新</button>
          <button type="button" onClick={onCancel}>キャンセル</button>
        </div>
      </form>
    </div>
  </div>
</TaskEditForm>
```

### 3.4 インタラクション（現在の実装ベース）

#### フロー1: タスク選択から編集まで
1. ユーザーが**左サイドバーのタスク**をクリック
2. サイドバーのタスクが選択状態になる（左青ボーダー + 背景色変更）
3. **右メインエリア**にタスク詳細が表示される（インライン表示）
4. 作成フォームは常に下部に表示されたまま
5. ユーザーがタスク詳細内の「編集」ボタンをクリック
6. **モーダル**で編集フォームが表示される（画面全体にオーバーレイ）
7. 現在のタイトルと内容が入力フォームに表示される
8. ユーザーがタイトルと内容を編集
9. 「更新」ボタンをクリック
10. バリデーションチェック
    - エラーがあれば、エラーメッセージを表示して終了
    - エラーがなければ、次へ
11. タスクを更新（updatedAt更新）
12. ローカルストレージに保存
13. サイドバーと詳細表示のタスク情報を更新
14. モーダルを閉じる
15. 更新されたタスク詳細が表示される

#### フロー2: 編集のキャンセル
1. 編集中にユーザーが「キャンセル」ボタンをクリック
2. **変更検知**:
   - 変更がない場合: そのままモーダルを閉じる
   - 変更がある場合: 確認ダイアログを表示
3. 確認ダイアログで「破棄」を選択
4. モーダルを閉じる
5. 元のタスク詳細表示に戻る

#### フロー3: 別のタスクを選択（編集中の場合）
1. タスク詳細表示中に、ユーザーがサイドバーの別のタスクをクリック
2. **変更検知**:
   - 編集モードでない場合: そのまま新しいタスクを選択
   - 編集モードで変更がない場合: モーダルを閉じて新しいタスクを選択
   - 編集モードで変更がある場合: 確認ダイアログを表示
3. 確認ダイアログで「破棄」を選択
4. モーダルを閉じる
5. 選択状態が新しいタスクに移動
6. 右メインエリアに新しいタスクの詳細が表示される

#### フロー4: Escapeキーでモーダルを閉じる
1. 編集モーダル表示中にEscapeキーを押す
2. **変更検知**（フロー2と同じ）:
   - 変更がない場合: そのままモーダルを閉じる
   - 変更がある場合: 確認ダイアログを表示
3. 確認ダイアログで「破棄」を選択
4. モーダルを閉じる

#### フロー5: モーダル背景クリックで閉じる
1. 編集モーダルの背景（オーバーレイ）をクリック
2. **変更検知**（フロー2と同じ）:
   - 変更がない場合: そのままモーダルを閉じる
   - 変更がある場合: 確認ダイアログを表示
3. 確認ダイアログで「破棄」を選択
4. モーダルを閉じる

## 4. ビジネスロジック / Business Logic

### 4.1 主要な処理フロー

#### フロー1: タスクの選択（変更検知付き）
```typescript
function selectTask(taskId: string): void {
  // 編集中で変更がある場合は確認
  if (isEditing && hasChanges) {
    const confirmed = window.confirm(
      '編集中の内容が保存されていません。破棄してもよろしいですか？'
    );
    if (!confirmed) return;
  }

  setSelectedTaskId(taskId);
  setIsEditing(false);
}

function closeDetail(): void {
  // 編集中で変更がある場合は確認
  if (isEditing && hasChanges) {
    const confirmed = window.confirm(
      '編集中の内容が保存されていません。破棄してもよろしいですか？'
    );
    if (!confirmed) return;
  }

  setSelectedTaskId(null);
  setIsEditing(false);
}
```

#### フロー2: 変更検知
```typescript
// TaskEditForm内で変更を検知
const [hasChanges, setHasChanges] = useState(false);

useEffect(() => {
  const changed =
    title.trim() !== task.title ||
    content !== task.content;
  setHasChanges(changed);
}, [title, content, task]);
```

#### フロー3: キャンセル処理（変更検知付き）
```typescript
function handleCancel(): void {
  // 変更がある場合のみ確認
  if (hasChanges) {
    const confirmed = window.confirm(
      '編集を破棄してもよろしいですか？'
    );
    if (!confirmed) return;
  }

  onCancel();
}
```

#### フロー4: タスクの編集
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
