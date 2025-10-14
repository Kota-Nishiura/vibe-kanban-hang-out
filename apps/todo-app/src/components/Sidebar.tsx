import { Task } from '../types/task';

interface SidebarProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function Sidebar({ tasks, selectedTaskId, onSelectTask }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* サイドバーヘッダー */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">TODO App</h2>
      </div>

      {/* タスク一覧 */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">
            タスクがありません
          </div>
        ) : (
          <div className="py-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-l-4 ${
                  selectedTaskId === task.id
                    ? 'bg-gray-800 border-blue-500'
                    : 'border-transparent'
                }`}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {task.content || '内容なし'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        {tasks.length} タスク
      </div>
    </aside>
  );
}
