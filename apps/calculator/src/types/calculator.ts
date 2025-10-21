// Calculator type definitions

export type Operator = '+' | '-' | '*' | '/' | '%';

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  currentOperator: Operator | null;
  shouldResetDisplay: boolean;
  memory: number;
  mode: 'basic' | 'scientific';
  theme: 'light' | 'dark';
}

export interface CalculationHistory {
  id: string;
  expression: string;
  result: number | string;
  timestamp: number;
}
