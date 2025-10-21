import { Button } from '../common/Button';

export interface ButtonGridProps {
  /** 電卓のモード */
  mode: 'basic' | 'scientific';
  /** ボタンクリック時のハンドラー */
  onButtonClick?: (value: string) => void;
}

/**
 * 電卓のボタングリッドコンポーネント
 * 基本モード4列×5行、科学モード5列×7行に対応
 */
export function ButtonGrid({ mode, onButtonClick }: ButtonGridProps) {
  const handleClick = (value: string) => {
    onButtonClick?.(value);
  };

  // 基本モードのボタン配列
  const basicButtons = [
    { value: 'C', variant: 'clear' as const, label: 'クリア' },
    { value: '⌫', variant: 'operator' as const, label: 'バックスペース' },
    { value: '%', variant: 'operator' as const, label: 'パーセント' },
    { value: '÷', variant: 'operator' as const, label: '割る' },

    { value: '7', variant: 'number' as const, label: '7' },
    { value: '8', variant: 'number' as const, label: '8' },
    { value: '9', variant: 'number' as const, label: '9' },
    { value: '×', variant: 'operator' as const, label: '掛ける' },

    { value: '4', variant: 'number' as const, label: '4' },
    { value: '5', variant: 'number' as const, label: '5' },
    { value: '6', variant: 'number' as const, label: '6' },
    { value: '−', variant: 'operator' as const, label: '引く' },

    { value: '1', variant: 'number' as const, label: '1' },
    { value: '2', variant: 'number' as const, label: '2' },
    { value: '3', variant: 'number' as const, label: '3' },
    { value: '+', variant: 'operator' as const, label: '足す' },

    { value: '0', variant: 'number' as const, label: '0', wide: true },
    { value: '.', variant: 'number' as const, label: '小数点' },
    { value: '=', variant: 'equals' as const, label: 'イコール' },
  ];

  // 科学モードのボタン配列（基本モード + 追加機能）
  const scientificButtons = [
    { value: 'C', variant: 'clear' as const, label: 'クリア' },
    { value: '⌫', variant: 'operator' as const, label: 'バックスペース' },
    { value: '%', variant: 'operator' as const, label: 'パーセント' },
    { value: '÷', variant: 'operator' as const, label: '割る' },
    { value: '(', variant: 'operator' as const, label: '左括弧' },

    { value: 'sin', variant: 'operator' as const, label: 'サイン' },
    { value: '7', variant: 'number' as const, label: '7' },
    { value: '8', variant: 'number' as const, label: '8' },
    { value: '9', variant: 'number' as const, label: '9' },
    { value: '×', variant: 'operator' as const, label: '掛ける' },

    { value: 'cos', variant: 'operator' as const, label: 'コサイン' },
    { value: '4', variant: 'number' as const, label: '4' },
    { value: '5', variant: 'number' as const, label: '5' },
    { value: '6', variant: 'number' as const, label: '6' },
    { value: '−', variant: 'operator' as const, label: '引く' },

    { value: 'tan', variant: 'operator' as const, label: 'タンジェント' },
    { value: '1', variant: 'number' as const, label: '1' },
    { value: '2', variant: 'number' as const, label: '2' },
    { value: '3', variant: 'number' as const, label: '3' },
    { value: '+', variant: 'operator' as const, label: '足す' },

    { value: '√', variant: 'operator' as const, label: '平方根' },
    { value: '0', variant: 'number' as const, label: '0' },
    { value: '.', variant: 'number' as const, label: '小数点' },
    { value: ')', variant: 'operator' as const, label: '右括弧' },
    { value: '=', variant: 'equals' as const, label: 'イコール' },
  ];

  const buttons = mode === 'basic' ? basicButtons : scientificButtons;
  const gridCols = mode === 'basic' ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <div
      className={`grid ${gridCols} gap-2 sm:gap-button-gap`}
      role="grid"
      aria-label="電卓ボタン"
    >
      {buttons.map((button, index) => (
        <Button
          key={`${button.value}-${index}`}
          variant={button.variant}
          wide={button.wide}
          onClick={() => handleClick(button.value)}
          aria-label={button.label}
        >
          {button.value}
        </Button>
      ))}
    </div>
  );
}
