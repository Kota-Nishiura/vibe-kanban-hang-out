import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('タスク作成フロー', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タスクを作成して一覧に表示される', async () => {
    render(<App />);

    // 初期状態
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();

    // タスク作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const contentInput = screen.getByPlaceholderText('内容（任意）');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'テスト内容');
    await userEvent.click(submitButton);

    // 一覧に表示される
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('テスト内容')).toBeInTheDocument();
    expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
  });

  test('バリデーションエラーが表示される', async () => {
    render(<App />);

    const submitButton = screen.getByText('作成');
    await userEvent.click(submitButton);

    // エラーメッセージ
    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
    // タスクは作成されない
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('タイトルが101文字でエラー', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'a'.repeat(101));
    await userEvent.click(submitButton);

    expect(screen.getByText(/100文字以内/)).toBeInTheDocument();
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('内容が1001文字でエラー', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const contentInput = screen.getByPlaceholderText('内容（任意）');
    const submitButton = screen.getByText('作成');

    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.type(contentInput, 'a'.repeat(1001));
    await userEvent.click(submitButton);

    expect(screen.getByText(/1000文字以内/)).toBeInTheDocument();
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('ページをリロードしてもタスクが残る', async () => {
    const { unmount } = render(<App />);

    // タスク作成
    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, 'テストタスク');
    await userEvent.click(screen.getByText('作成'));

    // タスクが表示される
    expect(screen.getByText('テストタスク')).toBeInTheDocument();

    // アンマウント
    unmount();

    // 再マウント
    render(<App />);

    // タスクが表示される
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  test('複数のタスクを作成できる', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    const submitButton = screen.getByText('作成');

    // 1つ目のタスク
    await userEvent.type(titleInput, 'タスク1');
    await userEvent.click(submitButton);

    // 2つ目のタスク
    await userEvent.type(titleInput, 'タスク2');
    await userEvent.click(submitButton);

    // 3つ目のタスク
    await userEvent.type(titleInput, 'タスク3');
    await userEvent.click(submitButton);

    // すべて表示される
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.getByText('タスク3')).toBeInTheDocument();
  });

  test('タイトルの前後の空白はtrimされる', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, '  テストタスク  ');
    await userEvent.click(screen.getByText('作成'));

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  test('空白のみのタイトルはエラー', async () => {
    render(<App />);

    const titleInput = screen.getByPlaceholderText('タスクのタイトル');
    await userEvent.type(titleInput, '   ');
    await userEvent.click(screen.getByText('作成'));

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
});
