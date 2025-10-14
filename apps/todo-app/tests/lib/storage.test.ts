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
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    saveTasks(tasks);
    const loaded = loadTasks();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('テストタスク');
    expect(loaded[0].content).toBe('テスト内容');
    expect(loaded[0].createdAt).toBeInstanceOf(Date);
    expect(loaded[0].updatedAt).toBeInstanceOf(Date);
  });

  test('空の場合は空配列を返す', () => {
    const loaded = loadTasks();
    expect(loaded).toEqual([]);
  });

  test('不正なJSONの場合は空配列を返す', () => {
    localStorage.setItem('todo-app:tasks', 'invalid json');
    const loaded = loadTasks();
    expect(loaded).toEqual([]);
  });

  test('複数のタスクを保存・読み込みできる', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'タスク1',
        content: '内容1',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
      {
        id: '2',
        title: 'タスク2',
        content: '内容2',
        createdAt: new Date('2025-10-14T13:00:00Z'),
        updatedAt: new Date('2025-10-14T13:00:00Z'),
      },
    ];

    saveTasks(tasks);
    const loaded = loadTasks();

    expect(loaded).toHaveLength(2);
    expect(loaded[0].title).toBe('タスク1');
    expect(loaded[1].title).toBe('タスク2');
  });
});
