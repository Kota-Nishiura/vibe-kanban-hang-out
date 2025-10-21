import { useState, useEffect } from 'react';
import { Display } from './Display';
import { ButtonGrid } from './ButtonGrid';

/**
 * 電卓のメインコンポーネント
 * ヘッダー、ディスプレイエリア、ボタングリッドから構成される
 */
export function Calculator() {
  const [mode, setMode] = useState<'basic' | 'scientific'>('basic');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  const handleButtonClick = (value: string) => {
    // ボタンクリックのロジックは後のタスクで実装
    console.log('Button clicked:', value);
  };

  // キーボードナビゲーション対応
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      // 数字キー
      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        handleButtonClick(key);
        return;
      }

      // 演算子キー
      const operatorMap: { [key: string]: string } = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%',
        '.': '.',
        '=': '=',
        Enter: '=',
        Escape: 'C',
        Backspace: '⌫',
      };

      if (operatorMap[key]) {
        event.preventDefault();
        handleButtonClick(operatorMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-calculator-mobile sm:max-w-[400px] md:max-w-calculator mx-auto px-4 sm:px-0">
      {/* 電卓コンテナ */}
      <div
        className="bg-calculator-display rounded-2xl shadow-2xl overflow-hidden"
        role="application"
        aria-label="電卓アプリケーション"
      >
        {/* ヘッダーエリア */}
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-base sm:text-xl font-bold">電卓アプリ</h1>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setMode('basic')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[32px] ${
                  mode === 'basic'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-400 text-white hover:bg-blue-300'
                }`}
                aria-pressed={mode === 'basic'}
                aria-label="基本モード"
              >
                基本
              </button>
              <button
                onClick={() => setMode('scientific')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[32px] ${
                  mode === 'scientific'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-400 text-white hover:bg-purple-300'
                }`}
                aria-pressed={mode === 'scientific'}
                aria-label="科学モード"
              >
                科学
              </button>
            </div>
          </div>
        </header>

        {/* ディスプレイエリア */}
        <div className="bg-calculator-display p-4 sm:p-6">
          <Display expression={expression} result={result} />
        </div>

        {/* ボタングリッドエリア */}
        <div className="p-4 sm:p-6 pt-0">
          <ButtonGrid mode={mode} onButtonClick={handleButtonClick} />
        </div>
      </div>
    </div>
  );
}
