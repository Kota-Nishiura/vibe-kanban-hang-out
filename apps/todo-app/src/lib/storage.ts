import { Task } from '../types/task';

const STORAGE_KEY = 'todo-app:tasks';

interface SerializedTask {
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

    const tasks: SerializedTask[] = JSON.parse(data);
    return tasks.map((task: SerializedTask) => ({
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
    console.error('Failed to save tasks:', error);
    // QuotaExceededError の場合はユーザーに通知
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('ストレージの容量が不足しています。');
    }
  }
}
