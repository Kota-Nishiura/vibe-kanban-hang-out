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
});
