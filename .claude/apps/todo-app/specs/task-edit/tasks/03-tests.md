# タスク: テスト実装

> Phase 3: タスク編集機能のテスト完成

## 1. タスク概要 / Task Overview

### 1.1 目的
タスク編集機能の包括的なテストを実装し、品質を保証する

### 1.2 関連ドキュメント
- `.claude/apps/todo-app/specs/task-edit/overview.md`
- `.claude/apps/todo-app/specs/task-edit/design.md`

### 1.3 依存タスク
- 前提条件: 01-validation-and-selection.md, 02-detail-and-edit-form.md が完了
- 後続タスク: なし（最終タスク）

## 2. 実装内容 / Implementation

### 2.1 変更対象ファイル
- [ ] `tests/components/TaskDetail.test.tsx` - 更新（追加テスト）
- [ ] `tests/components/TaskEditForm.test.tsx` - 更新（追加テスト）
- [ ] `tests/hooks/useTasks.test.ts` - 更新（編集機能のテスト追加）
- [ ] `tests/integration/task-edit.test.tsx` - 新規作成
- [ ] `vitest.config.ts` - 更新（必要に応じて）

### 2.2 実装詳細

#### ステップ1: useTasks フックのテスト
**内容:**
- タスク更新機能のテスト

```typescript
// tests/hooks/useTasks.test.ts に追加
import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../src/hooks/useTasks';

describe('useTasks - 編集機能', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを更新できる', () => {
    const { result } = renderHook(() => useTasks());

    // タスク作成
    act(() => {
      result.current.addTask({
        title: '元のタイトル',
        content: '元の内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    // タスク更新
    act(() => {
      result.current.updateTask(taskId, {
        title: '新しいタイトル',
        content: '新しい内容',
      });
    });

    // 更新されたことを確認
    expect(result.current.tasks[0].title).toBe('新しいタイトル');
    expect(result.current.tasks[0].content).toBe('新しい内容');
  });

  test('updatedAt が更新される', () => {
    const { result } = renderHook(() => useTasks());

    // タスク作成
    act(() => {
      result.current.addTask({
        title: 'タスク',
        content: '内容',
      });
    });

    const taskId = result.current.tasks[0].id;
    const originalUpdatedAt = result.current.tasks[0].updatedAt;

    // 少し待つ
    setTimeout(() => {
      // タスク更新
      act(() => {
        result.current.updateTask(taskId, {
          title: '新しいタイトル',
          content: '新しい内容',
        });
      });

      // updatedAt が更新されている
      expect(result.current.tasks[0].updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    }, 10);
  });

  test('バリデーションエラー時は更新されない', () => {
    const { result } = renderHook(() => useTasks());

    // タスク作成
    act(() => {
      result.current.addTask({
        title: '元のタイトル',
        content: '元の内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    // 空のタイトルで更新
    act(() => {
      result.current.updateTask(taskId, {
        title: '',
        content: '新しい内容',
      });
    });

    // 更新されていない
    expect(result.current.tasks[0].title).toBe('元のタイトル');
    // エラーが設定されている
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.field).toBe('title');
  });

  test('存在しないタスクIDで更新するとエラー', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.updateTask('non-existent-id', {
        title: 'タイトル',
        content: '内容',
      });
    });

    expect(result.current.error).not.toBeNull();
  });

  test('タスク選択と選択解除', () => {
    const { result } = renderHook(() => useTasks());

    // タスク作成
    act(() => {
      result.current.addTask({
        title: 'タスク',
        content: '内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    // タスク選択
    act(() => {
      result.current.selectTask(taskId);
    });

    expect(result.current.selectedTask).not.toBeNull();
    expect(result.current.selectedTask?.id).toBe(taskId);

    // 選択解除
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedTask).toBeNull();
  });

  test('編集モードの開始とキャンセル', () => {
    const { result } = renderHook(() => useTasks());

    // 編集開始
    act(() => {
      result.current.startEdit();
    });

    expect(result.current.isEditing).toBe(true);

    // 編集キャンセル
    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.isEditing).toBe(false);
  });
});
```

#### ステップ2: TaskDetail のテスト
**内容:**
- 追加のエッジケーステスト

```typescript
// tests/components/TaskDetail.test.tsx に追加
describe('TaskDetail - 追加テスト', () => {
  test('内容が空の場合は「内容なし」と表示される', () => {
    const taskWithoutContent = {
      ...mockTask,
      content: '',
    };

    render(
      <TaskDetail
        task={taskWithoutContent}
        onEdit={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('内容なし')).toBeInTheDocument();
  });

  test('作成日時と更新日時が表示される', () => {
    render(
      <TaskDetail task={mockTask} onEdit={() => {}} onClose={() => {}} />
    );

    // 日付のフォーマットに応じて調整
    expect(screen.getByText(/作成日時/)).toBeInTheDocument();
    expect(screen.getByText(/更新日時/)).toBeInTheDocument();
  });

  test('×ボタンをクリックするとonCloseが呼ばれる', async () => {
    const onClose = vi.fn();
    render(
      <TaskDetail task={mockTask} onEdit={() => {}} onClose={onClose} />
    );

    const closeButton = screen.getByLabelText('閉じる');
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
```

#### ステップ3: TaskEditForm のテスト
**内容:**
- 追加のエッジケーステスト

```typescript
// tests/components/TaskEditForm.test.tsx に追加
describe('TaskEditForm - 追加テスト', () => {
  test('Enterキーで送信できない（textareaがあるため）', async () => {
    const onSubmit = vi.fn();
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={onSubmit}
        onCancel={() => {}}
        error={null}
      />
    );

    const titleInput = screen.getByLabelText(/タイトル/);
    await userEvent.type(titleInput, '{Enter}');

    // textareaがあるため、Enterで送信されない
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('×ボタンでキャンセルできる', async () => {
    const onCancel = vi.fn();
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={onCancel}
        error={null}
      />
    );

    const closeButton = screen.getByLabelText('閉じる');
    await userEvent.click(closeButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test('モーダルの背景をクリックするとキャンセルされる', async () => {
    const onCancel = vi.fn();
    const { container } = render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={onCancel}
        error={null}
      />
    );

    const backdrop = container.firstChild as HTMLElement;
    await userEvent.click(backdrop);

    expect(onCancel).toHaveBeenCalled();
  });

  test('フォーム内をクリックしてもキャンセルされない', async () => {
    const onCancel = vi.fn();
    render(
      <TaskEditForm
        task={mockTask}
        onSubmit={() => {}}
        onCancel={onCancel}
        error={null}
      />
    );

    const form = screen.getByRole('dialog');
    await userEvent.click(form);

    expect(onCancel).not.toHaveBeenCalled();
  });

  test('タイトルを空にするとエラーが表示される（統合）', async () => {
    const onSubmit = vi.fn();
    const error = { field: 'title' as const, message: 'タイトルを入力してください' };

    const { rerender } = render(
      <TaskEditForm
        task={mockTask}
        onSubmit={onSubmit}
        onCancel={() => {}}
        error={null}
      />
    );

    const titleInput = screen.getByLabelText(/タイトル/);
    await userEvent.clear(titleInput);

    const updateButton = screen.getByText('更新');
    await userEvent.click(updateButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: '',
      content: mockTask.content,
    });

    // 親がエラーを設定
    rerender(
      <TaskEditForm
        task={mockTask}
        onSubmit={onSubmit}
        onCancel={() => {}}
        error={error}
      />
    );

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
  });
});
```

#### ステップ4: 統合テスト
**内容:**
- タスク編集の完全なフローをテスト

```typescript
// tests/integration/task-edit.test.tsx
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('タスク編集フロー', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを選択→編集→更新できる', async () => {
    render(<App />);

    // タスクを作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const contentInput = screen.getByPlaceholderText('内容（任意）');
    const createButton = screen.getByText('作成');

    await userEvent.type(titleInput, '元のタスク');
    await userEvent.type(contentInput, '元の内容');
    await userEvent.click(createButton);

    // タスクが作成されたことを確認
    expect(screen.getByText('元のタスク')).toBeInTheDocument();

    // タスクをクリックして選択
    const taskCard = screen.getByText('元のタスク').closest('div[data-testid="task-card"]');
    await userEvent.click(taskCard!);

    // 詳細表示が表示される
    expect(screen.getByText('タスク詳細')).toBeInTheDocument();

    // 編集ボタンをクリック
    const editButton = screen.getByText('編集');
    await userEvent.click(editButton);

    // 編集フォームが表示される
    expect(screen.getByText('タスクの編集')).toBeInTheDocument();

    // タイトルを変更
    const editTitleInput = screen.getByDisplayValue('元のタスク');
    await userEvent.clear(editTitleInput);
    await userEvent.type(editTitleInput, '更新されたタスク');

    // 更新ボタンをクリック
    const updateButton = screen.getByText('更新');
    await userEvent.click(updateButton);

    // 更新されたタスクが一覧に表示される
    expect(screen.getByText('更新されたタスク')).toBeInTheDocument();

    // 詳細表示が閉じている
    expect(screen.queryByText('タスク詳細')).not.toBeInTheDocument();
  });

  test('編集をキャンセルできる', async () => {
    render(<App />);

    // タスクを作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, '元のタスク');
    await userEvent.click(screen.getByText('作成'));

    // タスクを選択
    const taskCard = screen.getByText('元のタスク').closest('div[data-testid="task-card"]');
    await userEvent.click(taskCard!);

    // 編集ボタンをクリック
    await userEvent.click(screen.getByText('編集'));

    // タイトルを変更
    const editTitleInput = screen.getByDisplayValue('元のタスク');
    await userEvent.clear(editTitleInput);
    await userEvent.type(editTitleInput, '変更したタスク');

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    await userEvent.click(cancelButton);

    // 詳細表示に戻る
    expect(screen.getByText('タスク詳細')).toBeInTheDocument();

    // 元のタイトルが残っている
    expect(screen.getByText('元のタスク')).toBeInTheDocument();
    expect(screen.queryByText('変更したタスク')).not.toBeInTheDocument();
  });

  test('バリデーションエラーが表示される', async () => {
    render(<App />);

    // タスクを作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, '元のタスク');
    await userEvent.click(screen.getByText('作成'));

    // タスクを選択
    const taskCard = screen.getByText('元のタスク').closest('div[data-testid="task-card"]');
    await userEvent.click(taskCard!);

    // 編集ボタンをクリック
    await userEvent.click(screen.getByText('編集'));

    // タイトルを空にする
    const editTitleInput = screen.getByDisplayValue('元のタスク');
    await userEvent.clear(editTitleInput);

    // 更新ボタンをクリック
    await userEvent.click(screen.getByText('更新'));

    // エラーメッセージが表示される
    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();

    // タスクは更新されていない
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  test('詳細表示を閉じると選択が解除される', async () => {
    render(<App />);

    // タスクを作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, 'タスク');
    await userEvent.click(screen.getByText('作成'));

    // タスクを選択
    const taskCard = screen.getByText('タスク').closest('div[data-testid="task-card"]');
    await userEvent.click(taskCard!);

    // 詳細表示が表示される
    expect(screen.getByText('タスク詳細')).toBeInTheDocument();

    // 閉じるボタンをクリック
    const closeButton = screen.getByText('閉じる');
    await userEvent.click(closeButton);

    // 詳細表示が閉じる
    expect(screen.queryByText('タスク詳細')).not.toBeInTheDocument();

    // 作成フォームが再表示される
    expect(screen.getByPlaceholderText('タスクのタイトル')).toBeInTheDocument();
  });

  test('編集後もローカルストレージに保存される', async () => {
    const { unmount } = render(<App />);

    // タスクを作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, '元のタスク');
    await userEvent.click(screen.getByText('作成'));

    // タスクを選択して編集
    const taskCard = screen.getByText('元のタスク').closest('div[data-testid="task-card"]');
    await userEvent.click(taskCard!);
    await userEvent.click(screen.getByText('編集'));

    const editTitleInput = screen.getByDisplayValue('元のタスク');
    await userEvent.clear(editTitleInput);
    await userEvent.type(editTitleInput, '更新されたタスク');
    await userEvent.click(screen.getByText('更新'));

    // アンマウント
    unmount();

    // 再マウント
    render(<App />);

    // 更新されたタスクが表示される
    expect(screen.getByText('更新されたタスク')).toBeInTheDocument();
  });

  test('複数のタスクを編集できる', async () => {
    render(<App />);

    // タスク1を作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, 'タスク1');
    await userEvent.click(screen.getByText('作成'));

    // タスク2を作成
    await userEvent.type(titleInput, 'タスク2');
    await userEvent.click(screen.getByText('作成'));

    // タスク1を編集
    const task1Card = screen.getByText('タスク1').closest('div[data-testid="task-card"]');
    await userEvent.click(task1Card!);
    await userEvent.click(screen.getByText('編集'));

    const editTitleInput1 = screen.getByDisplayValue('タスク1');
    await userEvent.clear(editTitleInput1);
    await userEvent.type(editTitleInput1, 'タスク1更新');
    await userEvent.click(screen.getByText('更新'));

    // タスク2を編集
    const task2Card = screen.getByText('タスク2').closest('div[data-testid="task-card"]');
    await userEvent.click(task2Card!);
    await userEvent.click(screen.getByText('編集'));

    const editTitleInput2 = screen.getByDisplayValue('タスク2');
    await userEvent.clear(editTitleInput2);
    await userEvent.type(editTitleInput2, 'タスク2更新');
    await userEvent.click(screen.getByText('更新'));

    // 両方とも更新されている
    expect(screen.getByText('タスク1更新')).toBeInTheDocument();
    expect(screen.getByText('タスク2更新')).toBeInTheDocument();
  });
});
```

#### ステップ5: カバレッジの確認
**内容:**
- テストカバレッジを確認し、不足している部分を追加

```bash
# カバレッジレポート生成
npm run test:coverage

# カバレッジ目標
# - ステートメント: 80%以上
# - ブランチ: 75%以上
# - 関数: 80%以上
# - ライン: 80%以上
```

## 3. テスト / Testing

### 3.1 テストファイル
- [x] `tests/lib/validation.test.ts` - Phase 1で作成済み
- [x] `tests/components/TaskItem.test.tsx` - Phase 1で更新済み
- [ ] `tests/components/TaskDetail.test.tsx` - 追加テスト
- [ ] `tests/components/TaskEditForm.test.tsx` - 追加テスト
- [ ] `tests/hooks/useTasks.test.ts` - 追加テスト
- [ ] `tests/integration/task-edit.test.tsx` - 新規作成

### 3.2 テストケース一覧

#### 単体テスト
- [x] バリデーション関数のテスト
- [ ] タスク更新のテスト
- [ ] 選択状態管理のテスト
- [ ] 編集モード管理のテスト

#### コンポーネントテスト
- [ ] TaskDetail の表示テスト
- [ ] TaskDetail のイベントハンドリング
- [ ] TaskEditForm の表示テスト
- [ ] TaskEditForm のバリデーション
- [ ] TaskEditForm のキャンセル

#### 統合テスト
- [ ] タスク選択→編集→更新フロー
- [ ] 編集キャンセルフロー
- [ ] バリデーションエラーフロー
- [ ] ローカルストレージ永続化
- [ ] 複数タスクの編集

## 4. 動作確認 / Manual Testing

### 4.1 確認手順
1. すべての自動テストを実行
2. カバレッジレポートを確認
3. 手動でフローを確認
   - タスク作成→選択→編集→更新
   - バリデーションエラーの確認
   - キャンセル操作の確認
   - ページリロード後の確認

### 4.2 期待結果
- [ ] すべてのテストが通る
- [ ] カバレッジが80%以上
- [ ] 手動テストで問題なし
- [ ] パフォーマンスに問題なし

### 4.3 確認コマンド
```bash
# すべてのテストを実行
npm test

# カバレッジレポート生成
npm run test:coverage

# UIモードでテスト
npm run test:ui
```

## 5. レビューポイント / Review Points

### 5.1 重点的に確認してほしい箇所
- テストカバレッジが十分か
- エッジケースが網羅されているか
- 統合テストがユーザーフローを正しくテストしているか

### 5.2 懸念事項
- なし

## 6. チェックリスト / Checklist

### 6.1 実装前
- [x] 設計書を理解した
- [x] 依存タスク（01, 02）が完了している
- [ ] 開発環境が正常に動作する

### 6.2 実装中
- [ ] すべてのテストケースを実装している
- [ ] 適切なアサーションを使用している
- [ ] テストが読みやすい

### 6.3 実装後
- [ ] すべてのテストが通る
- [ ] カバレッジが目標値を達成している
- [ ] テストが安定している（flaky testがない）

### 6.4 PR作成前
- [ ] リベースして最新のmainに追従
- [ ] すべてのテストが通る
- [ ] PR説明を記載

## 7. 想定される問題と対処法 / Potential Issues

| 問題 | 対処法 |
|------|--------|
| 非同期処理のテストが不安定 | waitForを使用、タイムアウトを適切に設定 |
| モーダルのテストが難しい | testing-libraryのガイドラインに従う |
| ローカルストレージのテスト | beforeEachでクリア |

## 8. 参考情報 / References

### 8.1 公式ドキュメント
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Testing Library User Guide: https://testing-library.com/docs/user-event/intro

## 9. 完了条件 / Definition of Done

このタスクは以下を満たした時に完了とする：
- [ ] すべてのテストが実装されている
- [ ] すべてのテストが通る
- [ ] カバレッジが80%以上
- [ ] 統合テストがユーザーフローを網羅している
- [ ] flaky testがない
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
