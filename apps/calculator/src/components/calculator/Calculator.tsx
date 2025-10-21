import { useEffect } from 'react';
import { Display } from './Display';
import { ButtonGrid } from './ButtonGrid';
import { useCalculatorStore } from '../../store';

/**
 * 電卓のメインコンポーネント
 * ヘッダー、ディスプレイエリア、ボタングリッドから構成される
 */
export function Calculator() {
  const {
    currentValue,
    expression,
    hasError,
    mode,
    setMode,
    inputDigit,
    inputOperator,
    inputDecimal,
    clear,
    backspace,
    calculate,
  } = useCalculatorStore();

  const handleButtonClick = (value: string) => {
    // 数字入力
    if (/^[0-9]$/.test(value)) {
      inputDigit(value);
      return;
    }

    // 演算子入力
    if (['+', '−', '×', '÷', '%'].includes(value)) {
      inputOperator(value as any);
      return;
    }

    // その他のボタン
    switch (value) {
      case '.':
        inputDecimal();
        break;
      case 'C':
        clear();
        break;
      case '⌫':
        backspace();
        break;
      case '=':
        calculate();
        break;
    }
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
  }, [handleButtonClick]);

  return (
    <div className="w-full sm:w-[400px] md:w-[500px] mx-auto px-4 sm:px-0">
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
          <Display expression={expression} result={currentValue} hasError={hasError} />
        </div>

        {/* ボタングリッドエリア */}
        <div className="p-4 sm:p-6 pt-0">
          <ButtonGrid mode={mode} onButtonClick={handleButtonClick} />
        </div>
      </div>
    </div>
  );
}
