import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../../src/components/TaskList';
import { Task } from '../../src/types/task';

describe('TaskList', () => {
  test('タスクがない場合は空メッセージを表示', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(screen.getByText('下のフォームから作成してください')).toBeInTheDocument();
  });

  test('タスクが1つの場合は表示される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'テストタスク',
        content: 'テスト内容',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    render(<TaskList tasks={tasks} />);

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('テスト内容')).toBeInTheDocument();
  });

  test('複数のタスクを表示できる', () => {
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

    render(<TaskList tasks={tasks} />);

    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  test('内容がないタスクも表示できる', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'タイトルのみ',
        content: '',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    render(<TaskList tasks={tasks} />);

    expect(screen.getByText('タイトルのみ')).toBeInTheDocument();
    // 内容が空の場合はpタグ自体が表示されない
    const taskElement = screen.getByText('タイトルのみ').closest('div');
    const contentParagraph = taskElement?.querySelector('p');
    expect(contentParagraph).not.toBeInTheDocument();
  });
});
