import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('電卓アプリが表示される', () => {
    render(<App />);
    const heading = screen.getByText(/電卓アプリ/i);
    expect(heading).toBeInTheDocument();
  });

  it('電卓のディスプレイが表示される', () => {
    render(<App />);
    const display = screen.getByLabelText('電卓ディスプレイ');
    expect(display).toBeInTheDocument();
  });
});
