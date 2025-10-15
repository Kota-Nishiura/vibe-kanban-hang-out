import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {task.title}
      </h3>
      {task.content && (
        <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">
          {task.content}
        </p>
      )}
      <time className="text-xs text-gray-500" dateTime={task.createdAt.toISOString()}>
        {formatDate(task.createdAt)}
      </time>
    </div>
  );
}
