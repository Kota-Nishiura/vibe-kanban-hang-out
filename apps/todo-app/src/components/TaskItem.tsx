import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onSelect: (taskId: string) => void;
}

export function TaskItem({ task, isSelected = false, onSelect }: TaskItemProps) {
  return (
    <div
      data-testid="task-card"
      className={`
        bg-white rounded-lg border p-4 transition-all cursor-pointer
        ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-gray-200 hover:shadow-md hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(task.id)}
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {task.title}
      </h3>
      {task.content && (
        <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
          {task.content}
        </p>
      )}
      <time className="text-sm text-gray-500">
        {formatDate(task.createdAt)}
      </time>
    </div>
  );
}
