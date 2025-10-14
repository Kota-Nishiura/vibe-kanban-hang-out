import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  test('タイトルが表示される', () => {
    render(<App />);
    expect(screen.getByText('TODO App')).toBeInTheDocument();
  });

  test('セットアップ完了メッセージが表示される', () => {
    render(<App />);
    expect(screen.getByText('セットアップ完了')).toBeInTheDocument();
  });
});
