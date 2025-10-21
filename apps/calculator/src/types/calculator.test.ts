import { describe, it, expect } from 'vitest';
import type { Operator, CalculatorState, CalculationHistory } from './calculator';

describe('Calculator Types', () => {
  it('should define valid Operator types', () => {
    const operators: Operator[] = ['+', '-', '*', '/', '%'];
    operators.forEach((op) => {
      expect(['+', '-', '*', '/', '%']).toContain(op);
    });
  });

  it('should create a valid CalculatorState object', () => {
    const state: CalculatorState = {
      display: '0',
      previousValue: null,
      currentOperator: null,
      shouldResetDisplay: false,
      memory: 0,
      mode: 'basic',
      theme: 'light',
    };

    expect(state.display).toBe('0');
    expect(state.mode).toBe('basic');
    expect(state.theme).toBe('light');
  });

  it('should create a valid CalculationHistory object', () => {
    const history: CalculationHistory = {
      id: '1',
      expression: '2 + 2',
      result: 4,
      timestamp: Date.now(),
    };

    expect(history.id).toBe('1');
    expect(history.expression).toBe('2 + 2');
    expect(history.result).toBe(4);
  });
});
