import { Task } from '../types/task';
import { formatDate } from '../lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {task.title}
      </h3>
      {task.content && (
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">
          {task.content}
        </p>
      )}
      <time className="text-sm text-gray-500">
        {formatDate(task.createdAt)}
      </time>
    </div>
  );
}
