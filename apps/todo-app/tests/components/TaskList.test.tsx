import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../../src/components/TaskList';
import { Task } from '../../src/types/task';

const mockOnSelectTask = vi.fn();

describe('TaskList', () => {
  test('タスクがない場合は空メッセージを表示', () => {
    render(<TaskList tasks={[]} selectedTaskId={null} onSelectTask={mockOnSelectTask} />);

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

    render(<TaskList tasks={tasks} selectedTaskId={null} onSelectTask={mockOnSelectTask} />);

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

    render(<TaskList tasks={tasks} selectedTaskId={null} onSelectTask={mockOnSelectTask} />);

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

    render(<TaskList tasks={tasks} selectedTaskId={null} onSelectTask={mockOnSelectTask} />);

    expect(screen.getByText('タイトルのみ')).toBeInTheDocument();
    // 内容が空の場合はpタグ自体が表示されない
    const taskElement = screen.getByText('タイトルのみ').closest('div');
    const contentParagraph = taskElement?.querySelector('p');
    expect(contentParagraph).not.toBeInTheDocument();
  });

  test('タスクをクリックするとonSelectTaskが呼ばれる', async () => {
    const onSelect = vi.fn();
    const tasks: Task[] = [
      {
        id: '1',
        title: 'テストタスク',
        content: 'テスト内容',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    render(<TaskList tasks={tasks} selectedTaskId={null} onSelectTask={onSelect} />);

    const taskCard = screen.getByTestId('task-card');
    await userEvent.click(taskCard);

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  test('選択されたタスクはハイライト表示される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'テストタスク',
        content: 'テスト内容',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    render(<TaskList tasks={tasks} selectedTaskId="1" onSelectTask={mockOnSelectTask} />);

    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('border-blue-500');
    expect(taskCard).toHaveClass('ring-2');
  });

  test('選択されていないタスクは通常表示', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'テストタスク',
        content: 'テスト内容',
        createdAt: new Date('2025-10-14T12:00:00Z'),
        updatedAt: new Date('2025-10-14T12:00:00Z'),
      },
    ];

    render(<TaskList tasks={tasks} selectedTaskId={null} onSelectTask={mockOnSelectTask} />);

    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('border-gray-200');
    expect(taskCard).not.toHaveClass('ring-2');
  });
});
