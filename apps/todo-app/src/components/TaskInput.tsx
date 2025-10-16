import { useState, FormEvent, useRef, KeyboardEvent } from 'react';
import { TaskFormData } from '../types/task';
import { ValidationError } from '../types/validation';

interface TaskInputProps {
  onSubmit: (data: TaskFormData) => boolean;
  error?: ValidationError | null;
}

export function TaskInput({ onSubmit, error }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onSubmit({ title, content });

    // 成功時にフォームをクリア
    if (success) {
      setTitle('');
      setContent('');
    }
  };

  // タイトル欄でEnterキーを押したら内容欄にフォーカス移動
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };

  // 内容欄でCmd/Ctrl+Enterを押したらタスク作成
  const handleContentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const success = onSubmit({ title, content });
      if (success) {
        setTitle('');
        setContent('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4 shadow-lg">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* エラーメッセージ表示 */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            role="alert"
            id={`${error.field}-error`}
          >
            <p className="text-sm font-medium">{error.message}</p>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="タスクのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              error?.field === 'title'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-label="タスクのタイトル"
            aria-required="true"
            aria-invalid={error?.field === 'title'}
            aria-describedby={error?.field === 'title' ? 'title-error' : undefined}
          />
          {/* 文字数カウンター */}
          <p className="text-xs text-gray-500 mt-1 text-right">
            {title.length} / 100
          </p>
        </div>

        <div>
          <textarea
            ref={contentRef}
            placeholder="内容（任意）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleContentKeyDown}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              error?.field === 'content'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-label="タスクの内容"
            aria-invalid={error?.field === 'content'}
            aria-describedby={error?.field === 'content' ? 'content-error' : undefined}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {content.length} / 1000
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          作成
        </button>
      </div>
    </form>
  );
}
