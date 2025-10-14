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
    const contentInput = screen.getByPlaceholderText('内容（任意）') as HTMLTextAreaElement;
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'テスト内容');
    await userEvent.click(submitButton);

    expect(titleInput.value).toBe('');
    expect(contentInput.value).toBe('');
  });

  test('内容なしでもタスクを作成できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'タイトルのみ');
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'タイトルのみ',
      content: '',
    });
  });

  test('フォームが存在する', () => {
    render(<TaskInput onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText('タスクのタイトル')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('内容（任意）')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  test('Enterキーで送信できる', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, 'テストタスク{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });
});
