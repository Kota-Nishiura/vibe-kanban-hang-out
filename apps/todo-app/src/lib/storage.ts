import { Task } from '../types/task';

const STORAGE_KEY = 'todo-app:tasks';

// JSONからパースされたタスクの型（日付は文字列）
interface StoredTask {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const tasks: StoredTask[] = JSON.parse(data);
    return tasks.map((task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('ストレージの容量が不足しています。不要なタスクを削除してください。');
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}
