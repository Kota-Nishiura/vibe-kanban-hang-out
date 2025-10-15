import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from '../../src/components/TaskInput';

describe('TaskInput', () => {
  test('タスクを作成できる', async () => {
    const onSubmit = vi.fn().mockReturnValue(true);
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

  test('Enterキーで作成できる', async () => {
    const onSubmit = vi.fn().mockReturnValue(true);
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');

    await userEvent.type(titleInput, 'テストタスク{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });

  test('エラーメッセージが表示される', () => {
    const error = {
      field: 'title' as const,
      message: 'タイトルを入力してください',
    };
    render(<TaskInput onSubmit={() => false} error={error} />);

    expect(screen.getByRole('alert')).toHaveTextContent('タイトルを入力してください');
  });

  test('エラー時は入力欄がハイライトされる', () => {
    const error = {
      field: 'title' as const,
      message: 'タイトルを入力してください',
    };
    render(<TaskInput onSubmit={() => false} error={error} />);

    const input = screen.getByLabelText('タスクのタイトル');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('文字数カウンターが表示される', async () => {
    render(<TaskInput onSubmit={() => false} />);

    const titleInput = screen.getByLabelText('タスクのタイトル');
    await userEvent.type(titleInput, 'テスト');

    expect(screen.getByText('3 / 100')).toBeInTheDocument();
  });

  test('成功時にフォームがクリアされる', async () => {
    const onSubmit = vi.fn().mockReturnValue(true);
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル') as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText('内容（任意）') as HTMLTextAreaElement;

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'テスト内容');
    await userEvent.click(screen.getByText('作成'));

    expect(titleInput.value).toBe('');
    expect(contentInput.value).toBe('');
  });

  test('失敗時にフォームがクリアされない', async () => {
    const onSubmit = vi.fn().mockReturnValue(false);
    render(<TaskInput onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル') as HTMLInputElement;

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.click(screen.getByText('作成'));

    expect(titleInput.value).toBe('テストタスク');
  });
});
