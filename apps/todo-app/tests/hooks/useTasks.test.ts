import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../src/hooks/useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('初期状態では空の配列を返す', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
  });

  test('タスクを追加できる', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        title: 'テストタスク',
        content: 'テスト内容',
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('テストタスク');
    expect(result.current.tasks[0].content).toBe('テスト内容');
    expect(result.current.tasks[0].id).toBeDefined();
    expect(result.current.tasks[0].createdAt).toBeInstanceOf(Date);
    expect(result.current.tasks[0].updatedAt).toBeInstanceOf(Date);
  });

  test('タスクはローカルストレージに保存される', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        title: 'テストタスク',
        content: 'テスト内容',
      });
    });

    const saved = localStorage.getItem('todo-app:tasks');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('テストタスク');
  });

  test('複数のタスクを追加できる', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({ title: 'タスク1', content: '内容1' });
    });

    act(() => {
      result.current.addTask({ title: 'タスク2', content: '内容2' });
    });

    expect(result.current.tasks).toHaveLength(2);
    // 最新のタスクが先頭に来る
    expect(result.current.tasks[0].title).toBe('タスク2');
    expect(result.current.tasks[1].title).toBe('タスク1');
  });

  test('初回ロード時にローカルストレージからタスクを読み込む', () => {
    // 事前にタスクを保存
    const tasks = [
      {
        id: '1',
        title: '既存タスク',
        content: '既存内容',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('todo-app:tasks', JSON.stringify(tasks));

    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('既存タスク');
  });

  test('タイトルの前後空白はtrimされる', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        title: '  テストタスク  ',
        content: 'テスト内容',
      });
    });

    expect(result.current.tasks[0].title).toBe('テストタスク');
  });

  test('タスクを選択できる', () => {
    const { result } = renderHook(() => useTasks());

    // タスクを追加
    act(() => {
      result.current.addTask({
        title: 'テストタスク',
        content: 'テスト内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    // タスクを選択
    act(() => {
      result.current.selectTask(taskId);
    });

    expect(result.current.selectedTask).toBeDefined();
    expect(result.current.selectedTask?.id).toBe(taskId);
    expect(result.current.selectedTask?.title).toBe('テストタスク');
  });

  test('タスク選択を解除できる', () => {
    const { result } = renderHook(() => useTasks());

    // タスクを追加
    act(() => {
      result.current.addTask({
        title: 'テストタスク',
        content: 'テスト内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    // タスクを選択
    act(() => {
      result.current.selectTask(taskId);
    });

    expect(result.current.selectedTask).toBeDefined();

    // 選択を解除
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedTask).toBeNull();
  });

  test('存在しないタスクを選択した場合はnullを返す', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.selectTask('non-existent-id');
    });

    expect(result.current.selectedTask).toBeNull();
  });

  test('タスク選択時にエラーがクリアされる', () => {
    const { result } = renderHook(() => useTasks());

    // エラーを発生させる
    act(() => {
      result.current.addTask({
        title: '', // 空のタイトル
        content: '',
      });
    });

    expect(result.current.error).toBeDefined();

    // タスクを追加して選択
    act(() => {
      result.current.addTask({
        title: 'テストタスク',
        content: 'テスト内容',
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.selectTask(taskId);
    });

    expect(result.current.error).toBeNull();
  });
});
