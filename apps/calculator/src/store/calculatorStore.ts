import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CalculatorState, Operator, CalculatorMode, HistoryEntry } from '../types';
import { initialCalculatorState } from '../types';

/**
 * 電卓ストアのアクション
 */
interface CalculatorActions {
  /** 数字入力 */
  inputDigit: (digit: string) => void;
  /** 演算子入力 */
  inputOperator: (operator: Operator) => void;
  /** 小数点入力 */
  inputDecimal: () => void;
  /** クリア */
  clear: () => void;
  /** バックスペース */
  backspace: () => void;
  /** 計算実行 */
  calculate: () => void;
  /** モード切り替え */
  setMode: (mode: CalculatorMode) => void;
  /** 履歴をクリア */
  clearHistory: () => void;
  /** 履歴から復元 */
  restoreFromHistory: (entry: HistoryEntry) => void;
}

/**
 * 電卓ストア
 */
export type CalculatorStore = CalculatorState & CalculatorActions;

/**
 * Zustand電卓ストア
 */
export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    persist(
      immer((set) => ({
        // 初期状態
        ...initialCalculatorState,

        // アクション
        inputDigit: (digit: string) =>
          set((state) => {
            if (state.hasError) {
              // エラー状態の場合はクリア
              state.currentValue = digit;
              state.expression = '';
              state.hasError = false;
              state.errorMessage = null;
              state.shouldResetOnNextInput = false;
              return;
            }

            if (state.shouldResetOnNextInput) {
              // 新しい計算開始
              state.currentValue = digit;
              state.shouldResetOnNextInput = false;
              return;
            }

            // 0の場合は上書き、それ以外は追加
            if (state.currentValue === '0') {
              state.currentValue = digit;
            } else {
              state.currentValue += digit;
            }
          }),

        inputOperator: (operator: Operator) =>
          set((state) => {
            if (state.hasError) return;

            // 演算子が既に選択されている場合は計算を実行
            if (state.previousValue !== null && state.operator !== null && !state.shouldResetOnNextInput) {
              const prev = parseFloat(state.previousValue);
              const curr = parseFloat(state.currentValue);
              let result = 0;

              switch (state.operator) {
                case '+':
                  result = prev + curr;
                  break;
                case '−':
                  result = prev - curr;
                  break;
                case '×':
                  result = prev * curr;
                  break;
                case '÷':
                  if (curr === 0) {
                    state.hasError = true;
                    state.errorMessage = '0で割ることはできません';
                    state.currentValue = 'Error';
                    return;
                  }
                  result = prev / curr;
                  break;
                case '%':
                  result = prev % curr;
                  break;
              }

              state.currentValue = String(result);
            }

            state.previousValue = state.currentValue;
            state.operator = operator;
            state.expression = `${state.currentValue} ${operator || ''}`;
            state.shouldResetOnNextInput = true;
          }),

        inputDecimal: () =>
          set((state) => {
            if (state.hasError) return;

            if (state.shouldResetOnNextInput) {
              state.currentValue = '0.';
              state.shouldResetOnNextInput = false;
              return;
            }

            // 既に小数点がある場合は何もしない
            if (!state.currentValue.includes('.')) {
              state.currentValue += '.';
            }
          }),

        clear: () =>
          set((state) => {
            state.currentValue = '0';
            state.previousValue = null;
            state.operator = null;
            state.expression = '';
            state.hasError = false;
            state.errorMessage = null;
            state.shouldResetOnNextInput = false;
          }),

        backspace: () =>
          set((state) => {
            if (state.hasError || state.shouldResetOnNextInput) return;

            if (state.currentValue.length > 1) {
              state.currentValue = state.currentValue.slice(0, -1);
            } else {
              state.currentValue = '0';
            }
          }),

        calculate: () =>
          set((state) => {
            if (state.hasError || state.previousValue === null || state.operator === null) return;

            const prev = parseFloat(state.previousValue);
            const curr = parseFloat(state.currentValue);
            let result = 0;

            switch (state.operator) {
              case '+':
                result = prev + curr;
                break;
              case '−':
                result = prev - curr;
                break;
              case '×':
                result = prev * curr;
                break;
              case '÷':
                if (curr === 0) {
                  state.hasError = true;
                  state.errorMessage = '0で割ることはできません';
                  state.currentValue = 'Error';
                  return;
                }
                result = prev / curr;
                break;
              case '%':
                result = prev % curr;
                break;
            }

            const expression = `${state.previousValue} ${state.operator} ${state.currentValue}`;
            const resultStr = String(result);

            // 履歴に追加
            state.history.unshift({
              id: `${Date.now()}`,
              expression,
              result: resultStr,
              timestamp: Date.now(),
            });

            // 履歴は最大20件まで保持
            if (state.history.length > 20) {
              state.history = state.history.slice(0, 20);
            }

            state.currentValue = resultStr;
            state.expression = expression;
            state.previousValue = null;
            state.operator = null;
            state.shouldResetOnNextInput = true;
          }),

        setMode: (mode: CalculatorMode) =>
          set((state) => {
            state.mode = mode;
          }),

        clearHistory: () =>
          set((state) => {
            state.history = [];
          }),

        restoreFromHistory: (entry: HistoryEntry) =>
          set((state) => {
            state.currentValue = entry.result;
            state.expression = entry.expression;
            state.previousValue = null;
            state.operator = null;
            state.shouldResetOnNextInput = true;
            state.hasError = false;
            state.errorMessage = null;
          }),
      })),
      {
        name: 'calculator-storage',
        // 履歴のみをローカルストレージに保存
        partialize: (state) => ({
          history: state.history,
          mode: state.mode,
        }),
      }
    ),
    {
      name: 'CalculatorStore',
    }
  )
);
