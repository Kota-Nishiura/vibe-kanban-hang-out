import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { ValidationError } from '../types/validation';
import { loadTasks, saveTasks } from '../lib/storage';
import { generateId } from '../lib/utils';
import { validateTaskInput } from '../lib/validation';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);

  // 初回ロード
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // 選択されたタスクを取得
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  // タスク追加
  const addTask = (formData: TaskFormData): boolean => {
    // バリデーション
    const validation = validateTaskInput(formData);

    if (!validation.success) {
      setError(validation.error);
      return false;
    }

    // エラークリア
    setError(null);

    // タスク作成
    const newTask: Task = {
      id: generateId(),
      title: validation.data.title,
      content: validation.data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    return true;
  };

  // タスク選択
  const selectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setError(null);
  };

  // タスク選択解除
  const clearSelection = () => {
    setSelectedTaskId(null);
    setError(null);
  };

  return {
    tasks,
    addTask,
    selectedTask,
    selectTask,
    clearSelection,
    error,
  };
}
