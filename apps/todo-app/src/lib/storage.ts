import { Task } from '../types/task';

const STORAGE_KEY = 'todo-app:tasks';

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const tasks = JSON.parse(data);
    return tasks.map((task: Task) => ({
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
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('ストレージの容量が不足しています。不要なタスクを削除してください。');
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}
