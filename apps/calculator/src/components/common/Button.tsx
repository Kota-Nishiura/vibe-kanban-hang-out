import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'number' | 'operator' | 'equals' | 'clear';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンの種類 */
  variant?: ButtonVariant;
  /** グリッド上で2倍幅にする */
  wide?: boolean;
}

/**
 * 電卓のボタンコンポーネント
 * 種類に応じたスタイルを適用
 */
export function Button({
  variant = 'number',
  wide = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = clsx(
    // 基本スタイル
    'rounded-lg font-semibold text-base sm:text-lg transition-all duration-150',
    'active:scale-95',
    // フォーカススタイル（キーボードのみ）
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
    // タッチターゲットサイズ（最小44px、推奨48px以上）
    'min-h-[48px] sm:min-h-[60px] flex items-center justify-center',
    'min-w-[48px] sm:min-w-0',
    // variant別スタイル
    {
      'calculator-button-number': variant === 'number',
      'calculator-button-operator': variant === 'operator',
      'calculator-button-equals': variant === 'equals',
      'calculator-button-clear': variant === 'clear',
    },
    // グリッド幅
    {
      'col-span-2': wide,
    },
    className
  );

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
