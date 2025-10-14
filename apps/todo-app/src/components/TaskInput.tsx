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
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        <input
          type="text"
          placeholder="タスクのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="タスクのタイトル"
        />
        <textarea
          placeholder="内容（任意）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          aria-label="タスクの内容"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          作成
        </button>
      </div>
    </form>
  );
}
