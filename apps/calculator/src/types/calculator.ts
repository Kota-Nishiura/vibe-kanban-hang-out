/**
 * 電卓の演算子タイプ
 */
export type Operator = '+' | '−' | '×' | '÷' | '%' | null;

/**
 * 電卓のモード
 */
export type CalculatorMode = 'basic' | 'scientific';

/**
 * 計算履歴のエントリ
 */
export interface HistoryEntry {
  /** 履歴ID */
  id: string;
  /** 計算式 */
  expression: string;
  /** 計算結果 */
  result: string;
  /** 作成日時 */
  timestamp: number;
}

/**
 * 電卓の状態
 */
export interface CalculatorState {
  /** 現在の表示値 */
  currentValue: string;
  /** 前の値（演算子が押されたときに保存） */
  previousValue: string | null;
  /** 現在選択されている演算子 */
  operator: Operator;
  /** 計算式の表示 */
  expression: string;
  /** エラー状態 */
  hasError: boolean;
  /** エラーメッセージ */
  errorMessage: string | null;
  /** 計算履歴 */
  history: HistoryEntry[];
  /** 電卓のモード */
  mode: CalculatorMode;
  /** 新しい数値入力の開始フラグ */
  shouldResetOnNextInput: boolean;
}

/**
 * 電卓の初期状態
 */
export const initialCalculatorState: CalculatorState = {
  currentValue: '0',
  previousValue: null,
  operator: null,
  expression: '',
  hasError: false,
  errorMessage: null,
  history: [],
  mode: 'basic',
  shouldResetOnNextInput: false,
};
