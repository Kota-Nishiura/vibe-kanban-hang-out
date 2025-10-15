import { describe, test, expect } from 'vitest';
import { validateTaskInput } from '../../src/lib/validation';

describe('validateTaskInput', () => {
  describe('正常系', () => {
    test('有効な入力', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: '説明',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('タスク');
        expect(result.data.content).toBe('説明');
      }
    });

    test('内容が空でもOK', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: '',
      });
      expect(result.success).toBe(true);
    });

    test('タイトルの前後空白はtrim', () => {
      const result = validateTaskInput({
        title: '  タスク  ',
        content: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('タスク');
      }
    });

    test('境界値: タイトル100文字', () => {
      const result = validateTaskInput({
        title: 'a'.repeat(100),
        content: '',
      });
      expect(result.success).toBe(true);
    });

    test('境界値: 内容1000文字', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('異常系', () => {
    test('タイトルが空', () => {
      const result = validateTaskInput({
        title: '',
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
        expect(result.error.message).toBe('タイトルを入力してください');
      }
    });

    test('タイトルが空白のみ', () => {
      const result = validateTaskInput({
        title: '   ',
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
        expect(result.error.message).toBe('タイトルを入力してください');
      }
    });

    test('タイトルが101文字', () => {
      const result = validateTaskInput({
        title: 'a'.repeat(101),
        content: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('title');
        expect(result.error.message).toContain('100文字以内');
      }
    });

    test('内容が1001文字', () => {
      const result = validateTaskInput({
        title: 'タスク',
        content: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.field).toBe('content');
        expect(result.error.message).toContain('1000文字以内');
      }
    });
  });
});
