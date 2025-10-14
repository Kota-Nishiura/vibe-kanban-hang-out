import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskDetailProps {
  task: Task | null;
}

export function TaskDetail({ task }: TaskDetailProps) {
  if (!task) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg">タスクを選択してください</p>
          <p className="text-sm mt-2">サイドバーからタスクを選ぶか、下から新規作成してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* タスクタイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {task.title}
        </h1>

        {/* メタ情報 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>作成: {formatDate(task.createdAt)}</span>
          </div>
        </div>

        {/* タスク内容 */}
        {task.content ? (
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {task.content}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic">
            内容が入力されていません
          </div>
        )}
      </div>
    </div>
  );
}
