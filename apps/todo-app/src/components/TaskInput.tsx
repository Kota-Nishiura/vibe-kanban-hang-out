import { useState, FormEvent } from 'react';
import { TaskFormData } from '../types/task';

interface TaskInputProps {
  onSubmit: (data: TaskFormData) => void;
}

export function TaskInput({ onSubmit }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 次のフェーズでバリデーション追加
    onSubmit({ title, content });

    // フォームクリア
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="タスクのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="タスクのタイトル"
            />
            <textarea
              placeholder="内容（任意）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              aria-label="タスクの内容"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 h-[52px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            作成
          </button>
        </div>
      </div>
    </form>
  );
}
