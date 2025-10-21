import clsx from 'clsx';

export interface DisplayProps {
  /** 表示する数式 */
  expression: string;
  /** 計算結果 */
  result: string;
  /** エラー状態 */
  hasError?: boolean;
}

/**
 * 電卓のディスプレイエリアコンポーネント
 * 数式と計算結果を2行構造で表示
 */
export function Display({ expression, result, hasError = false }: DisplayProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] flex flex-col justify-end shadow-inner"
      role="region"
      aria-label="電卓ディスプレイ"
    >
      <div className="text-right overflow-x-auto">
        {/* 数式表示エリア */}
        <div
          className={clsx(
            'text-xs sm:text-sm mb-1 sm:mb-2 font-mono min-h-[1.25rem] sm:min-h-[1.5rem] whitespace-nowrap',
            hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}
          aria-label="入力された数式"
          aria-live="polite"
        >
          {expression || '\u00A0'}
        </div>

        {/* 結果表示エリア */}
        <div
          className={clsx(
            'text-3xl sm:text-4xl font-bold font-mono whitespace-nowrap',
            hasError
              ? 'text-red-600 dark:text-red-400'
              : 'text-calculator-display-text'
          )}
          aria-label="計算結果"
          aria-live="assertive"
        >
          {result || '0'}
        </div>
      </div>
    </div>
  );
}
