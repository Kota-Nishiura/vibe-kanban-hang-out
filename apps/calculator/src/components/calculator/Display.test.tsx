import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Display } from './Display';

describe('Display', () => {
  it('初期状態で0を表示する', () => {
    render(<Display expression="" result="0" />);
    expect(screen.getByLabelText('計算結果')).toHaveTextContent('0');
  });

  it('数式を表示する', () => {
    render(<Display expression="1 + 2" result="3" />);
    expect(screen.getByLabelText('入力された数式')).toHaveTextContent('1 + 2');
  });

  it('計算結果を表示する', () => {
    render(<Display expression="1 + 2" result="3" />);
    expect(screen.getByLabelText('計算結果')).toHaveTextContent('3');
  });

  it('エラー時は赤色で表示する', () => {
    render(<Display expression="1 / 0" result="Error" hasError={true} />);
    const resultElement = screen.getByLabelText('計算結果');
    expect(resultElement).toHaveClass('text-red-600');
  });

  it('長い数式でもオーバーフローせず横スクロール可能', () => {
    const longExpression = '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12';
    render(<Display expression={longExpression} result="78" />);
    const expressionElement = screen.getByLabelText('入力された数式');
    // 親要素にoverflow-x-autoが適用されている
    expect(expressionElement.parentElement).toHaveClass('overflow-x-auto');
    expect(expressionElement).toHaveClass('whitespace-nowrap');
  });

  it('aria-liveでアクセシビリティ対応', () => {
    render(<Display expression="1 + 2" result="3" />);
    expect(screen.getByLabelText('入力された数式')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByLabelText('計算結果')).toHaveAttribute('aria-live', 'assertive');
  });

  it('数式が空の場合は非改行スペースを表示', () => {
    render(<Display expression="" result="0" />);
    const expressionElement = screen.getByLabelText('入力された数式');
    expect(expressionElement.textContent).toBe('\u00A0');
  });
});
