import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('タイトルが表示される', () => {
    render(<App />);
    expect(screen.getByText('TODO App')).toBeInTheDocument();
  });

  test('空のタスク一覧メッセージが表示される', () => {
    render(<App />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(screen.getByText('下のフォームから作成してください')).toBeInTheDocument();
  });

  test('入力フォームが表示される', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('タスクのタイトル')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('内容（任意）')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });
});
